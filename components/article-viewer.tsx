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
  social_content?: any
  newsletter_html?: string | null
  timestamps?: any
  quote_cards?: any[]
}

interface ArticleViewerProps {
  article: Article
}

type Tab = 'article' | 'transcript' | 'social' | 'newsletter' | 'quotes' | 'publish'

export function ArticleViewer({ article: initialArticle }: ArticleViewerProps) {
  const router = useRouter()
  const [article, setArticle] = useState(initialArticle)
  const [activeTab, setActiveTab] = useState<Tab>('article')
  const [loading, setLoading] = useState<string | null>(null)
  const [wpConfig, setWpConfig] = useState({
    siteUrl: '',
    username: '',
    password: '',
  })
  const [publishResult, setPublishResult] = useState<any>(null)

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
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [article.status, article.id, router])

  const generateSocial = async () => {
    setLoading('social')
    try {
      const response = await fetch('/api/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      })
      const data = await response.json()
      if (data.success) {
        setArticle({ ...article, social_content: data.data })
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error generating social content')
    } finally {
      setLoading(null)
    }
  }

  const generateNewsletter = async () => {
    setLoading('newsletter')
    try {
      const response = await fetch('/api/generate-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      })
      const data = await response.json()
      if (data.success) {
        setArticle({ ...article, newsletter_html: data.data.html })
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error generating newsletter')
    } finally {
      setLoading(null)
    }
  }

  const generateQuotes = async () => {
    setLoading('quotes')
    try {
      const response = await fetch('/api/generate-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      })
      const data = await response.json()
      if (data.success) {
        setArticle({ ...article, quote_cards: data.data })
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error generating quote cards')
    } finally {
      setLoading(null)
    }
  }

  const publishToWordPress = async () => {
    setLoading('publish')
    try {
      const response = await fetch('/api/publish-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId: article.id,
          wordpressConfig: wpConfig,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPublishResult(data.data)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error publishing to WordPress')
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${base64}`
    link.download = filename
    link.click()
  }

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
  </style>
</head>
<body>
${article.content.split('\n').map(line => {
  if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`
  if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`
  if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`
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

  // Processing/Failed states remain the same
  if (article.status === 'pending' || article.status === 'processing') {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6 animate-bounce">🎙️</div>
        <h2 className="text-3xl font-bold mb-4">Elaborazione in corso...</h2>
        <p className="text-gray-600 mb-8">
          Stiamo trascrivendo e generando il tuo articolo.
        </p>
      </div>
    )
  }

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
      <div className="flex gap-2 border-b mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('article')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'article' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          📝 Articolo
        </button>
        <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'transcript' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          🎙️ Trascrizione
        </button>
        <button onClick={() => setActiveTab('social')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'social' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          📱 Social Posts
        </button>
        <button onClick={() => setActiveTab('newsletter')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'newsletter' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          📧 Newsletter
        </button>
        <button onClick={() => setActiveTab('quotes')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'quotes' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          🖼️ Quote Cards
        </button>
        <button onClick={() => setActiveTab('publish')} className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'publish' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}>
          🚀 Publish
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border shadow-sm p-8">
        {activeTab === 'article' && article.content && (
          <div className="prose prose-lg max-w-none whitespace-pre-wrap">{article.content}</div>
        )}

        {activeTab === 'transcript' && article.transcript && (
          <div className="text-gray-700 whitespace-pre-wrap font-mono text-sm">{article.transcript}</div>
        )}

        {activeTab === 'social' && (
          <div>
            {!article.social_content ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Generate social media content for 5 platforms</p>
                <Button onClick={generateSocial} disabled={loading === 'social'}>
                  {loading === 'social' ? '⏳ Generating...' : '✨ Generate Social Content'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Twitter */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    🐦 Twitter Thread
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(article.social_content.twitter.thread.join('\n\n'))}>Copy</Button>
                  </h3>
                  {article.social_content.twitter.thread.map((tweet: string, i: number) => (
                    <p key={i} className="mb-2 text-sm border-l-2 pl-3">{i + 1}. {tweet}</p>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">{article.social_content.twitter.hashtags.join(' ')}</p>
                </div>

                {/* LinkedIn */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    💼 LinkedIn Post
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(article.social_content.linkedin.post)}>Copy</Button>
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{article.social_content.linkedin.post}</p>
                  <p className="text-xs text-gray-500 mt-2">{article.social_content.linkedin.hashtags.join(' ')}</p>
                </div>

                {/* Instagram */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    📸 Instagram Caption
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(article.social_content.instagram.caption)}>Copy</Button>
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{article.social_content.instagram.caption}</p>
                  <p className="text-xs text-gray-500 mt-2">{article.social_content.instagram.hashtags.join(' ')}</p>
                </div>

                {/* TikTok */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    🎬 TikTok Script
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(article.social_content.tiktok.script)}>Copy</Button>
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{article.social_content.tiktok.script}</p>
                  <p className="text-xs text-gray-500 mt-2">Hooks: {article.social_content.tiktok.hooks.join(' | ')}</p>
                </div>

                {/* YouTube */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    📺 YouTube Description
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(article.social_content.youtube.description)}>Copy</Button>
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{article.social_content.youtube.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{article.social_content.youtube.tags.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div>
            {!article.newsletter_html ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Generate an email newsletter from your article</p>
                <Button onClick={generateNewsletter} disabled={loading === 'newsletter'}>
                  {loading === 'newsletter' ? '⏳ Generating...' : '✨ Generate Newsletter'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => copyToClipboard(article.newsletter_html!)}>📋 Copy HTML</Button>
                </div>
                <div className="border rounded-lg p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: article.newsletter_html }} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div>
            {!article.quote_cards || article.quote_cards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Generate shareable quote cards from your transcript</p>
                <Button onClick={generateQuotes} disabled={loading === 'quotes'}>
                  {loading === 'quotes' ? '⏳ Generating...' : '✨ Generate Quote Cards'}
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {article.quote_cards.map((card: any, i: number) => (
                  <div key={i} className="border rounded-lg p-4">
                    <img src={`data:image/png;base64,${card.image}`} alt={`Quote ${i + 1}`} className="w-full rounded mb-2" />
                    <p className="text-sm mb-2">{card.quote.text}</p>
                    <p className="text-xs text-gray-500 mb-2">{card.format}</p>
                    <Button size="sm" onClick={() => downloadImage(card.image, `quote-${i + 1}-${card.format}.png`)}>
                      ⬇️ Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">🚀 Publish to WordPress</h3>
            {!publishResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Site URL</label>
                  <input
                    type="text"
                    placeholder="https://yoursite.com"
                    value={wpConfig.siteUrl}
                    onChange={(e) => setWpConfig({ ...wpConfig, siteUrl: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={wpConfig.username}
                    onChange={(e) => setWpConfig({ ...wpConfig, username: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Application Password</label>
                  <input
                    type="password"
                    value={wpConfig.password}
                    onChange={(e) => setWpConfig({ ...wpConfig, password: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Generate at: WP Admin → Users → Profile → Application Passwords
                  </p>
                </div>
                <Button 
                  onClick={publishToWordPress} 
                  disabled={loading === 'publish' || !wpConfig.siteUrl || !wpConfig.username || !wpConfig.password}
                  className="w-full"
                >
                  {loading === 'publish' ? '⏳ Publishing...' : '📤 Publish to WordPress'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h4 className="text-lg font-bold mb-2">Published Successfully!</h4>
                <p className="text-sm text-gray-600 mb-4">Status: {publishResult.status}</p>
                <a href={publishResult.wordpressLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  View on WordPress →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
