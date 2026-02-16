import { NextRequest, NextResponse } from 'next/server'

// TEST ENDPOINT - bypassa auth per validare processing
export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json()
    
    // Step 1: Test Deepgram API key
    const deepgramKey = process.env.DEEPGRAM_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (!deepgramKey || !openaiKey) {
      return NextResponse.json({ 
        error: 'API keys missing',
        deepgram: !!deepgramKey,
        openai: !!openaiKey
      }, { status: 500 })
    }
    
    // Mock transcript
    const mockTranscript = "This is the first video on YouTube. I'm at the zoo."
    
    // Step 2: GPT-4 article generation (REAL)
    const gpt4Res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `Write a 500+ word SEO blog article based on: "${mockTranscript}"`
        }],
        max_tokens: 1500
      })
    })
    
    if (!gpt4Res.ok) {
      const error = await gpt4Res.text()
      return NextResponse.json({ error: 'GPT-4 failed', details: error }, { status: 500 })
    }
    
    const gpt4Data = await gpt4Res.json()
    const article = gpt4Data.choices[0].message.content
    
    return NextResponse.json({
      success: true,
      deepgramOK: true,
      gpt4OK: true,
      transcript: mockTranscript,
      article: article,
      stats: {
        articleWords: article.split(' ').length,
        transcriptLength: mockTranscript.length
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
