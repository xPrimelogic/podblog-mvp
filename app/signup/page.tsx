'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const supabase = createClient(
  'https://jhdrsyqayqoumvbukjps.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjg0NTAsImV4cCI6MjA4NjY0NDQ1MH0.AXiK6YLZ7Z26L_8p4deiDMBI-r5s2c2jspcda3O58mQ'
)

// Simple username generator (client-side, no server calls)
function generateUsernameFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9]/g, '').toLowerCase()
  const timestamp = Date.now().toString().slice(-4)
  return `${base}${timestamp}`
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    console.log('📝 Attempting signup for:', email)

    try {
      // Generate unique username (client-side)
      const username = generateUsernameFromEmail(email)
      console.log('✨ Generated username:', username)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) {
        console.error('❌ Signup error:', signUpError.message)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.warn('⚠️ User already exists')
        setError('Un account con questa email esiste già. Prova a fare login.')
        setLoading(false)
      } else if (data.session) {
        // Auto-signed in (email confirmation disabled in Supabase settings)
        console.log('✅ Auto-signed in (no email confirmation required)')

        // Create/update profile with username
        if (data.user) {
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              username: username,
              blog_visibility: 'public',
            })
            .eq('id', data.user.id)
        }

        window.location.href = '/dashboard'
      } else {
        // Email confirmation required - update profile after confirmation
        console.log('✅ Signup successful, email confirmation required')

        if (data.user) {
          // Create profile with username (will be completed after email confirmation)
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              username: username,
              blog_visibility: 'public',
            })
            .eq('id', data.user.id)
        }

        setSuccess(true)
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Unexpected error during signup:', err)
      setError('Errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-green-600">Registrazione completata!</h1>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-2">
              <strong>Controlla la tua email:</strong> {email}
            </p>
            <p className="text-sm text-gray-600">
              Ti abbiamo inviato un link di conferma. Clicca sul link nell&apos;email per attivare il tuo account.
            </p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full">
            Vai al Login
          </Button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Non hai ricevuto l&apos;email? Controlla la cartella spam.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Registrati - PodBlog AI</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>
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
              minLength={6}
              disabled={loading}
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">Minimo 6 caratteri</p>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '🔄 Registrazione...' : '📝 Registrati'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Hai già un account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Accedi
          </a>
        </p>
      </Card>
    </div>
  )
}
