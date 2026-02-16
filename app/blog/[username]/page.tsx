import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateBlogMetadata, generateBlogSchema, extractExcerpt } from '@/lib/blog/seo';

interface BlogPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { username } = await params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, bio')
    .eq('username', username)
    .eq('blog_visibility', 'public')
    .single();
  
  if (!profile) return {};
  
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'completed');
  
  return generateBlogMetadata({
    username,
    authorName: profile.full_name || username,
    bio: profile.bio,
    articlesCount: count || 0,
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { username } = await params;
  const supabase = await createClient();
  
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
  
  // Get articles
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug, content, created_at')
    .eq('user_id', profile.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });
  
  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
  }
  
  const schema = generateBlogSchema({
    username,
    authorName: profile.full_name || username,
    bio: profile.bio || undefined,
    articlesCount: articles?.length || 0,
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {profile.avatar_url && (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || username}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.full_name || username}
              </h1>
              {profile.bio && (
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {articles?.length || 0} {articles?.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Articles */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article 
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <Link 
                  href={`/blog/${username}/${article.slug}`}
                  className="group"
                >
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {extractExcerpt(article.content || '')}
                  </p>
                  <time className="mt-4 block text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </Link>
              </article>
            ))}
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
