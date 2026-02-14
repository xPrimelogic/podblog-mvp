'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UploadFormProps {
  userId: string
}

export function UploadForm({ userId }: UploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputType, setInputType] = useState<'url' | 'file'>('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('userId', userId)

      if (inputType === 'url') {
        if (!url) {
          setError('Inserisci un URL valido')
          setLoading(false)
          return
        }
        formData.append('type', 'url')
        formData.append('url', url)
      } else {
        if (!file) {
          setError('Seleziona un file audio')
          setLoading(false)
          return
        }
        formData.append('type', 'file')
        formData.append('file', file)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento')
      }

      // Redirect to processing page
      router.push(`/dashboard/article/${data.articleId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Type Selector */}
      <div className="flex gap-4 border-b pb-4">
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            inputType === 'url'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🔗 URL Podcast
        </button>
        <button
          type="button"
          onClick={() => setInputType('file')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            inputType === 'file'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📁 Carica File
        </button>
      </div>

      {/* URL Input */}
      {inputType === 'url' && (
        <div>
          <label className="block text-sm font-medium mb-2">URL Podcast</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... o https://open.spotify.com/episode/..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-2">
            Supportiamo: YouTube, Spotify, RSS feed diretti
          </p>
        </div>
      )}

      {/* File Input */}
      {inputType === 'file' && (
        <div>
          <label className="block text-sm font-medium mb-2">File Audio</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition cursor-pointer">
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.ogg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📎</div>
              {file ? (
                <p className="text-purple-600 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="font-medium">Clicca per caricare un file</p>
                  <p className="text-sm text-gray-500 mt-1">MP3, M4A, WAV, OGG (max 100MB)</p>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || (inputType === 'url' && !url) || (inputType === 'file' && !file)}
        className="w-full py-6 text-lg"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Processing...
          </>
        ) : (
          '🚀 Genera Articolo'
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Il processo richiede circa 2-5 minuti a seconda della lunghezza del podcast.
      </p>
    </form>
  )
}
