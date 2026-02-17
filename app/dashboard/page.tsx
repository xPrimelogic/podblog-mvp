import { createServerClient } from '@/lib/supabase/client'
import { UploadForm } from '@/components/upload-form'
import { ArticlesList } from '@/components/articles-list'
import { cookies } from 'next/headers'
import { 
  FileText, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  Upload
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Auth temporarily disabled for MVP testing
  // if (!user) {
  //   redirect('/login')
  // }

  // Mock data for testing without auth
  const profile = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    .then(r => r.data) : null

  const subscription = user ? await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
    .then(r => r.data) : null

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const usage = user ? await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user.id)
    .eq('period_start', currentMonth)
    .single()
    .then(r => r.data) : null

  const articles = user ? await supabase
    .from('articles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .then(r => r.data) : []

  const hasReachedLimit = usage && usage.articles_generated >= usage.articles_limit
  const isFreeUser = subscription?.status === 'trialing' && usage?.articles_generated >= 1
  const articlesUsed = usage?.articles_generated || 0
  const articlesLimit = subscription?.status === 'trialing' ? 1 : (usage?.articles_limit || 12)
  const articlesRemaining = Math.max(0, articlesLimit - articlesUsed)
  const usagePercentage = (articlesUsed / articlesLimit) * 100

  return (
    <div className="space-y-8">
      {/* Testing Mode Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Testing Mode Active
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Authentication temporarily disabled. All features accessible for testing.
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
            Benvenuto, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Tester'}!
          </h1>
          <Sparkles className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-gray-600">
          Trasforma i tuoi podcast in articoli SEO-optimized con l'intelligenza artificiale
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Plan Card */}
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant={subscription?.status === 'trialing' ? 'secondary' : 'default'} className="font-medium">
                {subscription?.status === 'trialing' ? 'Trial' : 'Active'}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Piano Attuale</h3>
            <p className="text-2xl font-bold capitalize mb-2">
              {subscription?.plan_name || 'Starter'}
            </p>
            <p className="text-sm text-gray-500">
              {subscription?.status === 'trialing' ? '🎁 Trial Gratuito' : '✅ Abbonamento attivo'}
            </p>
          </div>
        </div>

        {/* Usage Card */}
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <Badge 
                variant={articlesRemaining === 0 ? 'destructive' : articlesRemaining <= 2 ? 'secondary' : 'outline'}
                className="font-medium"
              >
                {articlesRemaining} rimanenti
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Conversioni Disponibili</h3>
            <p className="text-2xl font-bold mb-2">
              {articlesUsed} / {articlesLimit}
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage >= 100 ? 'bg-red-500' : 
                  usagePercentage >= 80 ? 'bg-amber-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Renewal/Trial End Card */}
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {subscription?.status === 'trialing' ? 'Trial disponibile fino al' : 'Prossimo rinnovo'}
            </h3>
            <p className="text-xl font-semibold">
              {subscription?.trial_end 
                ? new Date(subscription.trial_end).toLocaleDateString('it-IT', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })
                : subscription?.current_period_end 
                  ? new Date(subscription.current_period_end).toLocaleDateString('it-IT', {
                      day: 'numeric', 
                      month: 'long'
                    })
                  : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Carica un Podcast</h2>
              <p className="text-purple-100 text-sm mt-1">
                Trasforma audio in articoli professionali in pochi minuti
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {isFreeUser ? (
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8 rounded-xl border-2 border-purple-200 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Hai usato la tua conversione gratuita!
              </h3>
              <p className="text-gray-700 mb-8 max-w-md mx-auto">
                Passa al piano Pro per sbloccare 12 conversioni al mese e funzionalità avanzate.
              </p>
              <div className="bg-white p-8 rounded-xl inline-block shadow-lg border border-gray-200 max-w-sm">
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  €19<span className="text-xl text-gray-500">/mese</span>
                </p>
                <ul className="text-left space-y-3 mb-6 mt-6">
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">12 articoli al mese</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Trascrizione illimitata</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">SEO avanzato</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Supporto prioritario</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Upgrade a Pro
                </Button>
              </div>
            </div>
          ) : hasReachedLimit ? (
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-amber-900 font-semibold text-lg">
                  Limite mensile raggiunto
                </p>
                <p className="text-amber-700 mt-2">
                  Il tuo limite si resetterà il prossimo mese. Considera l'upgrade per aumentare il limite.
                </p>
              </div>
            </div>
          ) : (
            <UploadForm userId={user?.id || 'test-user'} />
          )}
        </div>
      </div>

      {/* Articles Section */}
      {articles && articles.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">I Tuoi Articoli</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {articles.length} {articles.length === 1 ? 'articolo' : 'articoli'} creati
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <ArticlesList articles={articles} />
          </div>
        </div>
      ) : (
        // Empty State
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessun articolo ancora
            </h3>
            <p className="text-gray-600 mb-6">
              Inizia caricando il tuo primo podcast e trasformalo in un articolo professionale
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <a href="#upload">
                <Upload className="mr-2 h-4 w-4" />
                Carica il tuo primo podcast
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
