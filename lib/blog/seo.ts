import { Metadata } from 'next';

export interface ArticleSEO {
  title: string;
  content: string;
  username: string;
  authorName: string;
  createdAt: string;
  url: string;
}

export interface BlogSEO {
  username: string;
  authorName: string;
  bio?: string;
  articlesCount: number;
}

/**
 * Generate SEO metadata for article page
 */
export function generateArticleMetadata(article: ArticleSEO): Metadata {
  const description = article.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const ogImage = `https://og-image-generator.vercel.app/${encodeURIComponent(article.title)}.png?theme=light&md=1&fontSize=100px`;
  
  return {
    title: `${article.title} | ${article.authorName}`,
    description,
    authors: [{ name: article.authorName }],
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.createdAt,
      authors: [article.authorName],
      url: article.url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate SEO metadata for blog listing page
 */
export function generateBlogMetadata(blog: BlogSEO): Metadata {
  const description = blog.bio || `Read articles by ${blog.authorName}`;
  
  return {
    title: `${blog.authorName}'s Blog`,
    description,
    authors: [{ name: blog.authorName }],
    openGraph: {
      title: `${blog.authorName}'s Blog`,
      description,
      type: 'website',
      url: `/blog/${blog.username}`,
    },
    twitter: {
      card: 'summary',
      title: `${blog.authorName}'s Blog`,
      description,
    },
  };
}

/**
 * Generate JSON-LD structured data for article
 */
export function generateArticleSchema(article: ArticleSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    articleBody: article.content.replace(/<[^>]*>/g, ''),
    author: {
      '@type': 'Person',
      name: article.authorName,
      url: `/blog/${article.username}`,
    },
    datePublished: article.createdAt,
    url: article.url,
  };
}

/**
 * Generate JSON-LD structured data for blog
 */
export function generateBlogSchema(blog: BlogSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${blog.authorName}'s Blog`,
    description: blog.bio || `Articles by ${blog.authorName}`,
    author: {
      '@type': 'Person',
      name: blog.authorName,
      url: `/blog/${blog.username}`,
    },
  };
}

/**
 * Extract plain text excerpt from HTML content
 */
export function extractExcerpt(html: string, maxLength: number = 200): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
