import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PodBlog AI
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Trasforma i tuoi podcast in articoli SEO-optimized
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Carica un podcast, ottieni un articolo professionale pronto per il tuo blog.
            Automatico, veloce, ottimizzato per i motori di ricerca.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Inizia Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Accedi
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-xl font-bold mb-2">Carica il Podcast</h3>
              <p className="text-gray-600">
                Supportiamo tutti i formati audio principali. Basta un URL o un file.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Genera l&apos;Articolo</h3>
              <p className="text-gray-600">
                La nostra AI trascrive e trasforma il contenuto in un articolo SEO.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Pubblica e Vola</h3>
              <p className="text-gray-600">
                Articolo pronto, formattato e ottimizzato per il tuo blog.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Piano Starter</h2>
            <p className="text-5xl font-bold text-purple-600 mb-2">€19<span className="text-lg text-gray-500">/mese</span></p>
            <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 12 articoli al mese
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Trascrizione automatica
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> SEO ottimizzato
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 7 giorni di trial gratuito
              </li>
            </ul>
            <Link href="/signup">
              <Button size="lg" className="text-lg">
                Prova Gratis per 7 Giorni
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center py-8 text-gray-600">
        <p>&copy; 2026 PodBlog AI. Trasforma l&apos;audio in contenuto.</p>
      </footer>
    </div>
  )
}
