interface WordPressConfig {
  siteUrl: string;
  username: string;
  password: string; // Application Password
}

interface WordPressPost {
  title: string;
  content: string;
  status?: 'publish' | 'draft' | 'pending';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

interface WordPressResponse {
  id: number;
  link: string;
  status: string;
}

export class WordPressClient {
  private config: WordPressConfig;
  private baseUrl: string;

  constructor(config: WordPressConfig) {
    this.config = config;
    this.baseUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2`;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.config.username}:${this.config.password}`
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  async publishPost(post: WordPressPost): Promise<WordPressResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          status: post.status || 'draft',
          categories: post.categories || [],
          tags: post.tags || [],
          featured_media: post.featured_media,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`WordPress API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        link: data.link,
        status: data.status,
      };
    } catch (error) {
      console.error('Error publishing to WordPress:', error);
      throw error;
    }
  }

  async uploadFeaturedImage(
    imageBuffer: Buffer,
    filename: string
  ): Promise<number> {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('file', blob, filename);

      const response = await fetch(`${this.baseUrl}/media`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `WordPress media upload error: ${response.status} - ${error}`
        );
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error uploading image to WordPress:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }
}

export async function publishToWordPress(
  config: WordPressConfig,
  article: {
    title: string;
    content: string;
    featuredImage?: Buffer;
  }
): Promise<WordPressResponse> {
  const client = new WordPressClient(config);

  // Test connection first
  const isConnected = await client.testConnection();
  if (!isConnected) {
    throw new Error('Failed to connect to WordPress. Check credentials.');
  }

  // Upload featured image if provided
  let featuredMediaId: number | undefined;
  if (article.featuredImage) {
    featuredMediaId = await client.uploadFeaturedImage(
      article.featuredImage,
      `${article.title.toLowerCase().replace(/\s+/g, '-')}.png`
    );
  }

  // Publish post
  const result = await client.publishPost({
    title: article.title,
    content: article.content,
    status: 'draft', // Default to draft for safety
    featured_media: featuredMediaId,
  });

  return result;
}
