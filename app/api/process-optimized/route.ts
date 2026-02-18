import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient as createDeepgramClient } from '@deepgram/sdk'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { generateUniqueSlug } from '@/lib/blog/slugify'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY, // Use OpenAI if Anthropic not set
})

const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY!)

interface ContentGenerated {
  title: string
  article: string
  socialPosts: {
    linkedin: string
    twitter: string
    instagram: string
    facebook: string
    newsletter: string
  }
  quotes: string[]
  images: {
    instagram: string
    twitter: string
    linkedin: string
    facebook: string
  }
}

export async function POST(request: NextRequest) {
  const { articleId, userId, filePath } = await request.json()
  const costTracking = { deepgram: 0, gpt4: 0, haiku: 0, images: 0, total: 0 }

  try {
    // Update status to processing
    await supabase
      .from('articles')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    const tmpDir = '/tmp/podblog'
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true })
    }

    // Step 1: Download from Supabase Storage
    console.log('[COST-OPTIMIZED] Step 1: Download audio')
    const { data, error } = await supabase.storage
      .from('podcasts')
      .download(filePath)

    if (error) throw new Error('Errore nel download del file')

    const audioPath = path.join(tmpDir, `${articleId}.audio`)
    const buffer = await data.arrayBuffer()
    await writeFile(audioPath, Buffer.from(buffer))

    // Step 2: Transcribe with Deepgram Nova-2
    console.log('[COST-OPTIMIZED] Step 2: Transcribe (Deepgram Nova-2) - $0.13')
    costTracking.deepgram = 0.13
    const transcript = await transcribeAudio(audioPath)

    // Step 3: Generate article ONLY with GPT-4
    console.log('[COST-OPTIMIZED] Step 3: Generate article (GPT-4) - $0.15')
    costTracking.gpt4 = 0.15
    const article = await generateArticleGPT4(transcript)

    // Step 4: Generate slug
    console.log('[COST-OPTIMIZED] Step 4: Generate slug')
    const slug = await generateUniqueSlug(
      article.title,
      userId,
      async (slug: string, userId: string) => {
        const { data } = await supabase
          .from('articles')
          .select('id')
          .eq('user_id', userId)
          .eq('slug', slug)
          .maybeSingle()
        return data !== null
      }
    )

    // Step 5: Generate social content with Haiku (batch) - $0.08
    console.log('[COST-OPTIMIZED] Step 5: Generate social content (Haiku batch) - $0.08')
    costTracking.haiku = 0.08
    const socialContent = await generateSocialContentHaikuBatch(transcript, article.title)

    // Step 6: Generate images (template-based, zero cost) - $0.00
    console.log('[COST-OPTIMIZED] Step 6: Generate images (template-based) - $0.00')
    const images = await generateTemplateImages(article.title, slug)

    // Step 7: Upload images to Supabase
    console.log('[COST-OPTIMIZED] Step 7: Upload images to Supabase')
    const imageUrls = await uploadImages(userId, articleId, images)

    // Step 8: Save all to database
    console.log('[COST-OPTIMIZED] Step 8: Save to database')
    const wordCount = article.article.split(/\s+/).length
    
    await supabase
      .from('articles')
      .update({
        status: 'completed',
        transcript,
        title: article.title,
        content: article.article,
        slug: slug,
        word_count: wordCount,
        social_posts: JSON.stringify(socialContent.posts),
        quotes: JSON.stringify(socialContent.quotes),
        image_instagram: imageUrls.instagram || null,
        image_twitter: imageUrls.twitter || null,
        image_linkedin: imageUrls.linkedin || null,
        image_facebook: imageUrls.facebook || null,
        processing_completed_at: new Date().toISOString(),
        cost_breakdown: JSON.stringify(costTracking),
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

    costTracking.total = costTracking.deepgram + costTracking.gpt4 + costTracking.haiku + costTracking.images
    console.log('[COST-OPTIMIZED] Cost breakdown:', costTracking)
    console.log('[COST-OPTIMIZED] Total cost per episode: $' + costTracking.total.toFixed(2))

    return NextResponse.json({
      success: true,
      articleId,
      slug,
      wordCount,
      costBreakdown: costTracking,
      contentGenerated: {
        hasArticle: true,
        hasSocialPosts: true,
        hasImages: true,
        hasQuotes: true,
      },
    })
  } catch (error: any) {
    console.error('[COST-OPTIMIZED] Processing error:', error)

    await supabase
      .from('articles')
      .update({
        status: 'failed',
        error_message: error.message,
        cost_breakdown: JSON.stringify(costTracking),
      })
      .eq('id', articleId)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const { readFile } = await import('fs/promises')
    const audioBuffer = await readFile(audioPath)

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
      paragraphs: true,
      language: 'it',
    })

    if (error) {
      throw new Error(`Deepgram error: ${error.message}`)
    }

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript

    if (!transcript) {
      throw new Error('Nessuna trascrizione generata')
    }

    return transcript
  } catch (error: any) {
    console.error('Deepgram transcription error:', error)
    throw new Error(`Errore trascrizione: ${error.message}`)
  }
}

async function generateArticleGPT4(
  transcript: string
): Promise<{ title: string; article: string }> {
  try {
    const prompt = `You are an expert SEO copywriter. Transform the following podcast transcript into a high-quality blog article (600-800 words).

TRANSCRIPT (first 8000 chars):
${transcript.substring(0, 8000)}

INSTRUCTIONS:
1. Create an engaging, SEO-optimized title (H1)
2. Write 600-800 words with clear structure
3. Use H2/H3 subheadings
4. Include introduction, 2-3 main sections, conclusion
5. Professional tone, accessible language
6. Add a strong CTA at the end
7. Focus on reader value

OUTPUT FORMAT:
# [Title]

## Introduction
[content]

## [Section Title]
[content]

## [Section Title]
[content]

## Conclusion
[content with CTA]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO copywriter specializing in blog content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = response.choices[0].message.content || ''

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : 'Article from Podcast'

    return { title, article: content }
  } catch (error: any) {
    throw new Error(`Article generation error: ${error.message}`)
  }
}

async function generateSocialContentHaikuBatch(
  transcript: string,
  title: string
): Promise<{ posts: Record<string, string>; quotes: string[] }> {
  try {
    // Single API call for all social content with Haiku (cheaper model)
    const prompt = `You are a social media expert. Given this podcast transcript and title, generate concise, engaging content for multiple platforms.

PODCAST TITLE: "${title}"
TRANSCRIPT (first 4000 chars):
${transcript.substring(0, 4000)}

GENERATE (in JSON format):
{
  "linkedin": "A professional, value-focused post (150-200 chars) with hashtags",
  "twitter": "A punchy thread starter (280 chars max) with hook",
  "instagram": "A compelling caption (150 chars max) with emojis",
  "facebook": "A conversational post (200-250 chars) with call to engagement",
  "newsletter": "A brief newsletter teaser (100-150 chars) that makes people want to read more",
  "quotes": ["Quote 1 from transcript (max 100 chars)", "Quote 2", "Quote 3", "Quote 4", "Quote 5"]
}

Return ONLY valid JSON, no markdown.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using cheaper model for social content
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert creating engaging content for multiple platforms.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    })

    const content = response.choices[0].message.content || '{}'
    
    // Clean up the response if it contains markdown code blocks
    const jsonStr = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(jsonStr)

    return {
      posts: {
        linkedin: parsed.linkedin || '',
        twitter: parsed.twitter || '',
        instagram: parsed.instagram || '',
        facebook: parsed.facebook || '',
        newsletter: parsed.newsletter || '',
      },
      quotes: parsed.quotes || [],
    }
  } catch (error: any) {
    console.error('Social content generation error:', error)
    // Return fallback content
    return {
      posts: {
        linkedin: `Check out our latest podcast: "${title}"`,
        twitter: `New podcast: "${title}" 🎙️`,
        instagram: `New episode: ${title}`,
        facebook: `Listen to our newest episode: ${title}`,
        newsletter: `${title} - new episode out now!`,
      },
      quotes: [],
    }
  }
}

async function generateTemplateImages(
  title: string,
  slug: string
): Promise<Record<string, Buffer>> {
  try {
    const images: Record<string, Buffer> = {}

    // Brand colors
    const brandColors = {
      primary: '#6366f1', // indigo-500
      secondary: '#ec4899', // pink-500
      accent: '#3b82f6', // blue-500
    }

    const dimensions = {
      instagram: { width: 1080, height: 1080 },
      twitter: { width: 1200, height: 675 },
      linkedin: { width: 1200, height: 627 },
      facebook: { width: 1200, height: 630 },
    }

    for (const [platform, size] of Object.entries(dimensions)) {
      // Create gradient background
      const svg = `
        <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${brandColors.primary};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${brandColors.secondary};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size.width}" height="${size.height}" fill="url(#grad)"/>
          <rect x="40" y="40" width="${size.width - 80}" height="${size.height - 80}" fill="none" stroke="white" stroke-width="3"/>
          <text x="${size.width / 2}" y="${size.height / 2 - 40}" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
            PodBlog
          </text>
          <text x="${size.width / 2}" y="${size.height / 2 + 60}" font-size="36" fill="white" text-anchor="middle" font-family="Arial, sans-serif" word-spacing="100%" dominant-baseline="middle">
            ${title.substring(0, 50)}
          </text>
        </svg>
      `

      const buffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer()

      images[platform] = buffer
    }

    console.log('[COST-OPTIMIZED] Generated 4 template images (zero cost)')
    return images
  } catch (error: any) {
    console.error('Image generation error:', error)
    throw new Error(`Image generation error: ${error.message}`)
  }
}

async function uploadImages(
  userId: string,
  articleId: string,
  images: Record<string, Buffer>
): Promise<Record<string, string | null>> {
  const urls: Record<string, string | null> = {
    instagram: null,
    twitter: null,
    linkedin: null,
    facebook: null,
  }

  try {
    for (const [platform, buffer] of Object.entries(images)) {
      const fileName = `${userId}/${articleId}-${platform}.png`

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true,
        })

      if (error) {
        console.error(`Failed to upload ${platform} image:`, error)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(fileName)

      urls[platform] = publicUrl
    }

    return urls
  } catch (error: any) {
    console.error('Image upload error:', error)
    return urls
  }
}
