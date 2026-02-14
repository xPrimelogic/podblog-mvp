import { createServerClient } from '@/lib/supabase/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
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

  const { data: usage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', user?.id)
    .eq('period_start', new Date().toISOString().slice(0, 7) + '-01')
    .single()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Benvenuto, {profile?.full_name || user?.email}!
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">Piano</h3>
          <p className="text-2xl font-bold capitalize">{subscription?.plan_name || 'Starter'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {subscription?.status === 'trialing' ? 'Trial attivo' : 'Abbonamento attivo'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">Articoli questo mese</h3>
          <p className="text-2xl font-bold">
            {usage?.articles_generated || 0} / {usage?.articles_limit || 12}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm text-gray-600 mb-2">Trial scade</h3>
          <p className="text-lg font-semibold">
            {subscription?.trial_end 
              ? new Date(subscription.trial_end).toLocaleDateString('it-IT')
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-bold mb-2">🚀 Prossimo step:</h2>
        <p className="text-gray-700">Upload del tuo primo podcast! (Coming soon...)</p>
      </div>

      {/* Debug info - rimuovi in produzione */}
      <div className="mt-8 bg-gray-100 p-4 rounded text-xs">
        <p className="font-mono">User ID: {user?.id}</p>
        <p className="font-mono">Email: {user?.email}</p>
      </div>
    </div>
  )
}
