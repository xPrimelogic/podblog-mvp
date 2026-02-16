import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateArticleMetadata, generateArticleSchema } from '@/lib/blog/seo';

interface ArticlePageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { username, slug } = await params;
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('username', username)
    .eq('blog_visibility', 'public')
    .single();
  
  if (!profile) return {};
  
  const { data: article } = await supabase
    .from('articles')
    .select('title, content, created_at')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .eq('status', 'completed')
    .single();
  
  if (!article) return {};
  
  return generateArticleMetadata({
    title: article.title,
    content: article.content || '',
    username,
    authorName: profile.full_name || username,
    createdAt: article.created_at,
    url: `/blog/${username}/${slug}`,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { username, slug } = await params;
  const supabase = createClient();
  
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, bio, avatar_url')
    .eq('username', username)
    .eq('blog_visibility', 'public')
    .single();
  
  if (profileError || !profile) {
    notFound();
  }
  
  // Get article
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('id, title, content, created_at, updated_at')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .eq('status', 'completed')
    .single();
  
  if (articleError || !article) {
    notFound();
  }
  
  // Get related articles (same author, different slug)
  const { data: relatedArticles } = await supabase
    .from('articles')
    .select('title, slug')
    .eq('user_id', profile.id)
    .eq('status', 'completed')
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(3);
  
  const schema = generateArticleSchema({
    title: article.title,
    content: article.content || '',
    username,
    authorName: profile.full_name || username,
    createdAt: article.created_at,
    url: `/blog/${username}/${slug}`,
  });
  
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${username}/${slug}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href={`/blog/${username}`}
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <span>←</span> Back to {profile.full_name || username}'s blog
          </Link>
        </div>
      </header>
      
      {/* Article */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <div className="flex items-center gap-3">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {profile.full_name || username}
                </p>
                <time className="text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />
          
          {/* Share buttons */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Share this article</h3>
            <div className="flex gap-3">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Share on Twitter
              </a>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Share on LinkedIn
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Copy link
              </button>
            </div>
          </div>
        </article>
        
        {/* Author bio */}
        {profile.bio && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  About {profile.full_name || username}
                </h3>
                <p className="text-gray-600">{profile.bio}</p>
                <Link 
                  href={`/blog/${username}`}
                  className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                >
                  View all articles →
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">More from this author</h2>
            <div className="grid gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${username}/${related.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-20 py-8 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a 
              href="https://podblog.ai" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              PodBlog
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
