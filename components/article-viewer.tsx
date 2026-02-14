'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Article {
  id: string
  title: string
  content: string | null
  transcript: string | null
  status: string
  error_message: string | null
  word_count: number | null
  created_at: string
  processing_started_at: string | null
  processing_completed_at: string | null
}

interface ArticleViewerProps {
  article: Article
}

export function ArticleViewer({ article: initialArticle }: ArticleViewerProps) {
  const router = useRouter()
  const [article, setArticle] = useState(initialArticle)
  const [activeTab, setActiveTab] = useState<'article' | 'transcript'>('article')

  // Poll for updates if processing
  useEffect(() => {
    if (article.status === 'processing' || article.status === 'pending') {
      const interval = setInterval(async () => {
        const response = await fetch(`/api/article/${article.id}`)
        const data = await response.json()
        setArticle(data)
        
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
          router.refresh()
        }
      }, 3000) // Poll every 3 seconds

      return () => clearInterval(interval)
    }
  }, [article.status, article.id, router])

  const downloadMarkdown = () => {
    if (!article.content) return
    
    const blob = new Blob([article.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadHTML = () => {
    if (!article.content) return
    
    // Convert markdown to simple HTML
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3 { color: #1a202c; margin-top: 1.5em; }
    h1 { font-size: 2.5em; }
    h2 { font-size: 2em; }
    h3 { font-size: 1.5em; }
    p { margin: 1em 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
${article.content.split('\n').map(line => {
  if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`
  if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`
  if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`
  if (line.startsWith('**') && line.endsWith('**')) return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`
  if (line.trim() === '') return '<br>'
  return `<p>${line}</p>`
}).join('\n')}
</body>
</html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Processing state
  if (article.status === 'pending' || article.status === 'processing') {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 animate-bounce">🎙️</div>
        <h2 className="text-3xl font-bold mb-4">Elaborazione in corso...</h2>
        <p className="text-gray-600 mb-8">
          Stiamo trascrivendo e generando il tuo articolo. Questo può richiedere alcuni minuti.
        </p>
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animation-delay-200"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animation-delay-400"></div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Status: {article.status === 'pending' ? 'In attesa' : 'Processing...'}
        </p>
      </div>
    )
  }

  // Failed state
  if (article.status === 'failed') {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">😞</div>
        <h2 className="text-3xl font-bold mb-4">Elaborazione fallita</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto mb-6">
          {article.error_message || 'Errore sconosciuto'}
        </div>
        <Link href="/dashboard">
          <Button>← Torna alla Dashboard</Button>
        </Link>
      </div>
    )
  }

  // Completed state
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/dashboard">
          <Button variant="outline">← Dashboard</Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={downloadMarkdown} variant="outline">
            📄 Download MD
          </Button>
          <Button onClick={downloadHTML} variant="outline">
            🌐 Download HTML
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('article')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'article'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📝 Articolo
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'transcript'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🎙️ Trascrizione
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border shadow-sm p-8">
        {activeTab === 'article' && article.content && (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap">{article.content}</div>
          </div>
        )}

        {activeTab === 'transcript' && article.transcript && (
          <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm">
            {article.transcript}
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 mb-1">Parole</p>
          <p className="font-bold text-lg">{article.word_count?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 mb-1">Creato il</p>
          <p className="font-bold">{new Date(article.created_at).toLocaleDateString('it-IT')}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 mb-1">Tempo di elaborazione</p>
          <p className="font-bold">
            {article.processing_started_at && article.processing_completed_at
              ? `${Math.round((new Date(article.processing_completed_at).getTime() - new Date(article.processing_started_at).getTime()) / 1000)}s`
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
