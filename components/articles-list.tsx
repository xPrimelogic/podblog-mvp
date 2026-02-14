'use client'

import Link from 'next/link'

interface Article {
  id: string
  title: string
  status: string
  created_at: string
  word_count?: number
}

interface ArticlesListProps {
  articles: Article[]
}

export function ArticlesList({ articles }: ArticlesListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">✓ Completato</span>
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">⏳ In Elaborazione</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">✗ Fallito</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">⏱️ In Attesa</span>
    }
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link key={article.id} href={`/dashboard/article/${article.id}`}>
          <div className="border rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{article.title || 'Senza titolo'}</h3>
              {getStatusBadge(article.status)}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Creato il {new Date(article.created_at).toLocaleDateString('it-IT')}</span>
              {article.word_count && <span>{article.word_count} parole</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
