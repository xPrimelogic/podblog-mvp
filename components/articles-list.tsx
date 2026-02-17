'use client'

import Link from 'next/link'
import { 
  FileText, 
  Clock, 
  Calendar,
  CheckCircle2,
  Loader2,
  XCircle,
  Timer,
  ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Completato
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            In Elaborazione
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="default" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1.5">
            <XCircle className="h-3 w-3" />
            Fallito
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 gap-1.5">
            <Timer className="h-3 w-3" />
            In Attesa
          </Badge>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-200'
      case 'processing':
        return 'from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-200'
      case 'failed':
        return 'from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 border-red-200'
      default:
        return 'from-gray-500/10 to-slate-500/10 hover:from-gray-500/20 hover:to-slate-500/20 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link key={article.id} href={`/dashboard/article/${article.id}`}>
          <div 
            className={`group relative bg-gradient-to-br ${getStatusColor(article.status)} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer overflow-hidden`}
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {article.title || 'Senza titolo'}
                    </h3>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(article.status)}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {new Date(article.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {article.word_count && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{article.word_count.toLocaleString('it-IT')} parole</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {article.word_count 
                      ? `~${Math.ceil(article.word_count / 200)} min lettura`
                      : 'Tempo non disponibile'
                    }
                  </span>
                </div>
              </div>

              {/* View Article CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                <span className="text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">
                  Visualizza articolo
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
