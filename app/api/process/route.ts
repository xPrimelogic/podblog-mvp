import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import YTDlpWrap from 'yt-dlp-wrap'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  const { articleId, userId, type, url, filePath } = await request.json()

  try {
    // Update status to processing
    await supabase
      .from('articles')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    // Step 1: Get audio file
    const tmpDir = '/tmp/podblog'
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true })
    }

    let audioPath: string

    if (type === 'url') {
      // Download from URL (YouTube, etc)
      audioPath = await downloadAudio(url, tmpDir, articleId)
    } else {
      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('podcasts')
        .download(filePath)
      
      if (error) throw new Error('Errore nel download del file')
      
      audioPath = path.join(tmpDir, `${articleId}.audio`)
      const buffer = await data.arrayBuffer()
      await writeFile(audioPath, Buffer.from(buffer))
    }

    // Step 2: Transcribe with Whisper
    console.log('Transcribing with Whisper...')
    const transcript = await transcribeAudio(audioPath)

    // Step 3: Generate SEO article
    console.log('Generating article...')
    const article = await generateArticle(transcript)

    // Step 4: Update database
    await supabase
      .from('articles')
      .update({
        status: 'completed',
        transcript,
        title: article.title,
        content: article.content,
        word_count: article.content.split(/\s+/).length,
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    // Update usage counter
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_period_start: currentMonth,
    })

    // Cleanup
    try {
      await unlink(audioPath)
    } catch (e) {
      console.error('Cleanup error:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Processing error:', error)
    
    await supabase
      .from('articles')
      .update({
        status: 'failed',
        error_message: error.message,
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function downloadAudio(url: string, tmpDir: string, articleId: string): Promise<string> {
  const outputPath = path.join(tmpDir, `${articleId}.mp3`)

  try {
    // Try yt-dlp-wrap first (handles YouTube, Spotify URLs)
    const ytDlp = new YTDlpWrap()
    await ytDlp.execPromise([
      url,
      '-x',
      '--audio-format', 'mp3',
      '-o', outputPath
    ])
    return outputPath
  } catch (ytdlpError) {
    // Fallback: try direct download for RSS feeds
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      
      const buffer = await response.arrayBuffer()
      await writeFile(outputPath, Buffer.from(buffer))
      return outputPath
    } catch (downloadError) {
      throw new Error('Impossibile scaricare l\'audio. Verifica che l\'URL sia corretto.')
    }
  }
}

async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const audioFile = await import('fs').then(fs => fs.createReadStream(audioPath))
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'it',
      response_format: 'text',
    })

    return transcription
  } catch (error: any) {
    throw new Error(`Errore trascrizione: ${error.message}`)
  }
}

async function generateArticle(transcript: string): Promise<{ title: string; content: string }> {
  try {
    const prompt = `Sei un esperto copywriter SEO. Trasforma la seguente trascrizione di podcast in un articolo ottimizzato per blog.

TRASCRIZIONE:
${transcript.substring(0, 10000)} ${transcript.length > 10000 ? '...' : ''}

ISTRUZIONI:
1. Crea un titolo accattivante e ottimizzato SEO (H1)
2. Suddividi il contenuto in sezioni con sottotitoli (H2, H3)
3. Scrivi paragrafi chiari e ben strutturati
4. Includi:
   - Meta description (max 160 caratteri)
   - Keywords principali
   - CTA finale
5. Lunghezza target: 800-1500 parole
6. Tono professionale ma accessibile
7. Focus su valore per il lettore

FORMATO OUTPUT:
# [Titolo principale]

**Meta Description:** [description]

**Keywords:** keyword1, keyword2, keyword3

## Introduzione
[contenuto]

## [Sezione 1]
[contenuto]

## [Sezione 2]
[contenuto]

## Conclusione
[contenuto + CTA]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto copywriter SEO specializzato in contenuti per blog.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = response.choices[0].message.content || ''
    
    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : 'Articolo dal Podcast'

    return { title, content }
  } catch (error: any) {
    throw new Error(`Errore generazione articolo: ${error.message}`)
  }
}

// Helper function for usage increment (will be created as SQL function)
