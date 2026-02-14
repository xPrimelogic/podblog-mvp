import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { ArticleViewer } from '@/components/article-viewer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !article) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ArticleViewer article={article} />
    </div>
  )
}
