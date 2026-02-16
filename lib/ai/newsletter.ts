import OpenAI from 'openai';
import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { render } from '@react-email/components';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsletterContent {
  subject: string;
  intro: string;
  highlights: string[];
  mainContent: string;
  cta: {
    text: string;
    url: string;
  };
  closing: string;
}

export async function generateNewsletter(
  article: string,
  articleTitle: string
): Promise<string> {
  // First, generate content structure
  const prompt = `You are a newsletter writer. Create an engaging email newsletter from this article.

ARTICLE TITLE: ${articleTitle}

ARTICLE CONTENT:
${article.substring(0, 4000)}

Generate a newsletter with:
1. Catchy subject line (50-60 chars)
2. Personal intro (2-3 sentences)
3. 3-5 key highlights (bullet points)
4. Main content (200-300 words, conversational)
5. Call-to-action
6. Friendly closing

Return ONLY a JSON object:
{
  "subject": "subject line",
  "intro": "intro text",
  "highlights": ["highlight1", "highlight2", ...],
  "mainContent": "main content",
  "cta": {
    "text": "CTA text",
    "url": "https://example.com"
  },
  "closing": "closing text"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a newsletter writer. Return ONLY valid JSON.',
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

    const parsed: NewsletterContent = JSON.parse(content);

    // Generate HTML using template
    const html = generateNewsletterHTML(parsed);
    return html;
  } catch (error) {
    console.error('Error generating newsletter:', error);
    throw error;
  }
}

function generateNewsletterHTML(content: NewsletterContent): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2563eb;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .intro {
      font-size: 16px;
      margin-bottom: 30px;
      color: #555555;
    }
    .highlights {
      background-color: #f8fafc;
      padding: 20px;
      border-left: 4px solid #2563eb;
      margin: 30px 0;
    }
    .highlights h2 {
      font-size: 18px;
      color: #1e40af;
      margin-top: 0;
    }
    .highlights ul {
      margin: 15px 0;
      padding-left: 20px;
    }
    .highlights li {
      margin-bottom: 10px;
      color: #374151;
    }
    .main-content {
      font-size: 15px;
      line-height: 1.8;
      color: #374151;
      margin: 30px 0;
    }
    .cta {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .cta-button:hover {
      background-color: #1e40af;
    }
    .closing {
      font-size: 15px;
      color: #555555;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${content.subject}</h1>
    
    <div class="intro">
      ${content.intro}
    </div>

    <div class="highlights">
      <h2>📌 Key Takeaways</h2>
      <ul>
        ${content.highlights.map(h => `<li>${h}</li>`).join('\n        ')}
      </ul>
    </div>

    <div class="main-content">
      ${content.mainContent.split('\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <div class="cta">
      <a href="${content.cta.url}" class="cta-button">${content.cta.text}</a>
    </div>

    <div class="closing">
      ${content.closing}
    </div>

    <div class="footer">
      <p>You're receiving this because you subscribed to our newsletter.</p>
      <p><a href="#" style="color: #9ca3af;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}
