import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SocialContent {
  twitter: {
    thread: string[];
    hashtags: string[];
  };
  linkedin: {
    post: string;
    hashtags: string[];
  };
  instagram: {
    caption: string;
    hashtags: string[];
  };
  tiktok: {
    script: string;
    hooks: string[];
  };
  youtube: {
    description: string;
    tags: string[];
  };
}

export async function generateSocialContent(
  transcript: string,
  article: string
): Promise<SocialContent> {
  const prompt = `You are a social media expert. Based on the following podcast transcript and article, generate engaging content for 5 different platforms.

TRANSCRIPT (excerpt):
${transcript.substring(0, 3000)}...

ARTICLE (excerpt):
${article.substring(0, 2000)}...

Generate content optimized for each platform following these guidelines:

1. TWITTER (Thread format):
   - 5-7 tweets, max 280 chars each
   - Hook in first tweet
   - Actionable insights
   - End with CTA
   - Include 3-5 relevant hashtags

2. LINKEDIN (Professional post):
   - 1300-1800 characters
   - Professional tone
   - Start with hook question or stat
   - Include personal insight
   - End with engagement question
   - 3-5 industry hashtags

3. INSTAGRAM (Visual caption):
   - 125-150 words
   - Conversational tone
   - Emoji usage
   - Line breaks for readability
   - Strong hook
   - 10-15 hashtags (mix of popular and niche)

4. TIKTOK (Video script):
   - 15-60 second script
   - Attention-grabbing hook (first 3 seconds)
   - Clear structure: Hook → Value → CTA
   - Trendy language
   - 3-5 viral hooks variations

5. YOUTUBE (Video description):
   - 300-500 words
   - Timestamps placeholders
   - Links section
   - SEO-optimized
   - 10-15 tags

Return ONLY a JSON object with this structure:
{
  "twitter": {
    "thread": ["tweet1", "tweet2", ...],
    "hashtags": ["hashtag1", ...]
  },
  "linkedin": {
    "post": "full post text",
    "hashtags": ["hashtag1", ...]
  },
  "instagram": {
    "caption": "full caption",
    "hashtags": ["hashtag1", ...]
  },
  "tiktok": {
    "script": "full script",
    "hooks": ["hook1", "hook2", ...]
  },
  "youtube": {
    "description": "full description",
    "tags": ["tag1", ...]
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    return parsed as SocialContent;
  } catch (error) {
    console.error('Error generating social content:', error);
    throw error;
  }
}
