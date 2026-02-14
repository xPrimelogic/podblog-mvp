import { createServerClient } from '@/lib/supabase/client'
import { UploadForm } from '@/components/upload-form'
import { ArticlesList } from '@/components/articles-list'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const { data: usage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user?.id)
    .eq('period_start', currentMonth)
    .single()

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const hasReachedLimit = usage && usage.articles_generated >= usage.articles_limit
  const isFreeUser = subscription?.status === 'trialing' && usage?.articles_generated >= 1

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Benvenuto, {profile?.full_name || user?.email}!
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">Piano</h3>
          <p className="text-2xl font-bold capitalize">{subscription?.plan_name || 'Starter'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {subscription?.status === 'trialing' ? '🎁 Trial Gratuito' : '✅ Abbonamento attivo'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">Conversioni disponibili</h3>
          <p className="text-2xl font-bold">
            {subscription?.status === 'trialing' 
              ? `${Math.max(0, 1 - (usage?.articles_generated || 0))} / 1`
              : `${usage?.articles_generated || 0} / ${usage?.articles_limit || 12}`
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {subscription?.status === 'trialing' ? 'Versione gratuita' : 'Questo mese'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">
            {subscription?.status === 'trialing' ? 'Trial disponibile fino al' : 'Prossimo rinnovo'}
          </h3>
          <p className="text-lg font-semibold">
            {subscription?.trial_end 
              ? new Date(subscription.trial_end).toLocaleDateString('it-IT')
              : subscription?.current_period_end 
                ? new Date(subscription.current_period_end).toLocaleDateString('it-IT')
                : 'N/A'}
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-8 rounded-lg border shadow-sm mb-8">
        <h2 className="text-2xl font-bold mb-4">🎙️ Carica un Podcast</h2>
        
        {isFreeUser ? (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg border-2 border-purple-200 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-3">Hai usato la tua conversione gratuita!</h3>
            <p className="text-gray-700 mb-6">
              Passa al piano Pro per sbloccare 12 conversioni al mese e funzionalità avanzate.
            </p>
            <div className="bg-white p-6 rounded-lg inline-block shadow-md">
              <p className="text-4xl font-bold text-purple-600 mb-2">€19<span className="text-lg text-gray-500">/mese</span></p>
              <ul className="text-left space-y-2 mb-4">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 12 articoli al mese</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Trascrizione illimitata</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> SEO avanzato</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Supporto prioritario</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 transition">
                Upgrade a Pro
              </button>
            </div>
          </div>
        ) : hasReachedLimit ? (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-semibold">⚠️ Hai raggiunto il limite mensile di conversioni.</p>
            <p className="text-sm text-gray-600 mt-2">Il tuo limite si resetterà il prossimo mese.</p>
          </div>
        ) : (
          <UploadForm userId={user.id} />
        )}
      </div>

      {/* Articles List */}
      {articles && articles.length > 0 && (
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-bold mb-4">📝 I Tuoi Articoli</h2>
          <ArticlesList articles={articles} />
        </div>
      )}
    </div>
  )
}
