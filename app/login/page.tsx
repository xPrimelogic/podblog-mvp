'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for errors from callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('✅ User already logged in, redirecting to dashboard')
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 Attempting login for:', email)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ Login error:', signInError.message)
        
        // User-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email o password non corretti. Riprova.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email non confermata. Controlla la tua casella di posta.')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      if (data.session) {
        console.log('✅ Login successful for:', data.user?.email)
        console.log('🔑 Session:', {
          userId: data.user?.id,
          email: data.user?.email,
          expiresAt: new Date(data.session.expires_at! * 1000).toISOString()
        })
        
        // Force a hard navigation to dashboard
        window.location.href = '/dashboard'
      } else {
        console.warn('⚠️ Login succeeded but no session returned')
        setError('Login riuscito ma sessione non creata. Contatta il supporto.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error during login:', err)
      setError('Errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login - PodBlog AI</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '🔄 Login in corso...' : '🔐 Accedi'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Non hai un account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Registrati
          </a>
        </p>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
