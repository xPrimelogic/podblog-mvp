'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { 
  Link as LinkIcon, 
  Upload, 
  Loader2,
  AlertCircle,
  Music,
  Youtube,
  Radio,
  CheckCircle2
} from 'lucide-react'

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Type Selector */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            inputType === 'url'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="h-5 w-5" />
          URL Podcast
        </button>
        <button
          type="button"
          onClick={() => setInputType('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
            inputType === 'file'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="h-5 w-5" />
          Carica File
        </button>
      </div>

      {/* URL Input */}
      {inputType === 'url' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            URL Podcast
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <LinkIcon className="h-5 w-5" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... o https://open.spotify.com/episode/..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none hover:border-gray-300"
              disabled={loading}
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Piattaforme supportate:
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-blue-700">
              <div className="flex items-center gap-1.5">
                <Youtube className="h-4 w-4" />
                YouTube
              </div>
              <div className="flex items-center gap-1.5">
                <Music className="h-4 w-4" />
                Spotify
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                RSS Feed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Input */}
      {inputType === 'file' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            File Audio
          </label>
          <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            file 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
          }`}>
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.ogg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-purple-700 font-semibold text-lg">{file.name}</p>
                    <p className="text-purple-600 text-sm mt-1">{formatFileSize(file.size)}</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                    }}
                    className="mt-2"
                  >
                    Cambia file
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-100 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Clicca per caricare un file
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      MP3, M4A, WAV, OGG (max 100MB)
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-semibold">Errore</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || (inputType === 'url' && !url) || (inputType === 'file' && !file)}
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Upload className="h-5 w-5" />
            Genera Articolo
          </span>
        )}
      </Button>

      {/* Info Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-500" />
          Il processo richiede circa 2-5 minuti a seconda della lunghezza del podcast
        </p>
      </div>
    </form>
  )
}
