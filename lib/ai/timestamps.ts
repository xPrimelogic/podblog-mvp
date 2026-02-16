import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Timestamp {
  time: string; // Format: HH:MM:SS
  title: string;
  description: string;
}

export interface TimestampsResult {
  chapters: Timestamp[];
  youtubeFormat: string;
}

export async function extractTimestamps(
  transcript: string
): Promise<TimestampsResult> {
  const prompt = `You are a video editor expert. Analyze this podcast transcript and create chapter timestamps.

TRANSCRIPT:
${transcript.substring(0, 8000)}

Instructions:
1. Identify 5-10 key topics/chapters
2. Estimate timestamps assuming natural speaking pace (150 words per minute)
3. Create engaging chapter titles (40-60 chars)
4. Add brief descriptions (1 sentence)
5. Format time as HH:MM:SS

Return ONLY a JSON object:
{
  "chapters": [
    {
      "time": "00:00:00",
      "title": "Introduction",
      "description": "Brief description"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a video editor. Return ONLY valid JSON.',
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
    
    // Generate YouTube-ready format
    const youtubeFormat = parsed.chapters
      .map((ch: Timestamp) => `${ch.time} - ${ch.title}`)
      .join('\n');

    return {
      chapters: parsed.chapters,
      youtubeFormat,
    };
  } catch (error) {
    console.error('Error extracting timestamps:', error);
    throw error;
  }
}
