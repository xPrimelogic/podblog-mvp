import OpenAI from 'openai';
import sharp from 'sharp';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Quote {
  text: string;
  author?: string;
  context?: string;
}

export interface QuoteCard {
  quote: Quote;
  imageBuffer: Buffer;
  format: 'instagram' | 'twitter';
}

const gradients = [
  ['#667eea', '#764ba2'], // Purple
  ['#f093fb', '#f5576c'], // Pink
  ['#4facfe', '#00f2fe'], // Blue
  ['#43e97b', '#38f9d7'], // Green
  ['#fa709a', '#fee140'], // Orange-Pink
];

export async function generateQuoteCards(
  transcript: string
): Promise<QuoteCard[]> {
  // Extract quotes using GPT
  const quotes = await extractQuotes(transcript);

  // Generate images for each quote
  const cards: QuoteCard[] = [];

  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i];
    const gradient = gradients[i % gradients.length];

    // Generate Instagram version (1080x1080)
    const igBuffer = await generateQuoteImage(quote, gradient, 1080, 1080);
    cards.push({
      quote,
      imageBuffer: igBuffer,
      format: 'instagram',
    });

    // Generate Twitter version (1200x628)
    const twitterBuffer = await generateQuoteImage(quote, gradient, 1200, 628);
    cards.push({
      quote,
      imageBuffer: twitterBuffer,
      format: 'twitter',
    });
  }

  return cards;
}

async function extractQuotes(transcript: string): Promise<Quote[]> {
  const prompt = `Extract 3-5 most impactful, shareable quotes from this podcast transcript.

TRANSCRIPT:
${transcript.substring(0, 5000)}

Requirements:
- Quotes should be 15-50 words
- Self-contained (make sense without context)
- Inspiring, actionable, or thought-provoking
- Include speaker if identifiable

Return ONLY a JSON object:
{
  "quotes": [
    {
      "text": "The quote text",
      "author": "Speaker name (optional)",
      "context": "Brief context (optional, 1 sentence)"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a quote curator. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    return parsed.quotes || [];
  } catch (error) {
    console.error('Error extracting quotes:', error);
    throw error;
  }
}

async function generateQuoteImage(
  quote: Quote,
  gradient: string[],
  width: number,
  height: number
): Promise<Buffer> {
  // Create SVG with gradient background and text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      
      <!-- Quote marks -->
      <text x="${width * 0.1}" y="${height * 0.2}" 
            font-family="Georgia, serif" 
            font-size="120" 
            fill="rgba(255,255,255,0.3)" 
            font-weight="bold">"</text>
      
      <!-- Quote text -->
      <foreignObject x="${width * 0.1}" y="${height * 0.3}" width="${width * 0.8}" height="${height * 0.5}">
        <div xmlns="http://www.w3.org/1999/xhtml" 
             style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    font-size: ${width > 1000 ? '42' : '32'}px; 
                    color: white; 
                    line-height: 1.4;
                    font-weight: 600;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 20px;">
          ${quote.text}
        </div>
      </foreignObject>
      
      <!-- Author -->
      ${
        quote.author
          ? `<text x="${width / 2}" y="${height * 0.85}" 
               font-family="Arial, sans-serif" 
               font-size="28" 
               fill="rgba(255,255,255,0.9)" 
               text-anchor="middle"
               font-weight="500">— ${quote.author}</text>`
          : ''
      }
      
      <!-- Watermark -->
      <text x="${width * 0.9}" y="${height * 0.95}" 
            font-family="Arial, sans-serif" 
            font-size="20" 
            fill="rgba(255,255,255,0.6)" 
            text-anchor="end">PodBlog</text>
    </svg>
  `;

  try {
    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    return buffer;
  } catch (error) {
    console.error('Error generating quote image:', error);
    throw error;
  }
}
