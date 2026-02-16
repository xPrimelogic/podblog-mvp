import { createServerClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_start', currentMonth)
      .single()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check if user has reached limit
    const isFreeUser = subscription?.status === 'trialing'
    const freeLimit = 1
    const paidLimit = usage?.articles_limit || 12

    if (isFreeUser && usage && usage.articles_generated >= freeLimit) {
      return NextResponse.json(
        { error: 'Hai raggiunto il limite gratuito. Passa al piano Pro per continuare.' },
        { status: 403 }
      )
    }

    if (!isFreeUser && usage && usage.articles_generated >= paidLimit) {
      return NextResponse.json(
        { error: 'Hai raggiunto il limite mensile di conversioni.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const type = formData.get('type') as string
    const url = formData.get('url') as string
    const file = formData.get('file') as File

    // Create article record
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        user_id: user.id,
        title: type === 'url' ? url : file?.name || 'Untitled',
        podcast_url: type === 'url' ? url : null,
        status: 'pending',
      })
      .select()
      .single()

    if (articleError) {
      throw new Error('Errore nella creazione dell\'articolo')
    }

    // If file upload, save to Supabase Storage
    let filePath = null
    if (type === 'file' && file) {
      const fileExt = file.name.split('.').pop()
      filePath = `${user.id}/${article.id}.${fileExt}`
      
      const fileBuffer = await file.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        // Clean up article if upload fails
        await supabase.from('articles').delete().eq('id', article.id)
        throw new Error('Errore nel caricamento del file')
      }

      // Update article with file path
      await supabase
        .from('articles')
        .update({ podcast_file_path: filePath })
        .eq('id', article.id)
    }

    // Trigger background processing
    const processingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/process`
    fetch(processingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: article.id,
        userId: user.id,
        type,
        url: type === 'url' ? url : null,
        filePath: type === 'file' ? filePath : null,
      }),
    }).catch(console.error) // Fire and forget

    return NextResponse.json({
      success: true,
      articleId: article.id,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Errore del server' },
      { status: 500 }
    )
  }
}
