'use client'

import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const supabase = createClient(
  'https://jhdrsyqayqoumvbukjps.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjg0NTAsImV4cCI6MjA4NjY0NDQ1MH0.AXiK6YLZ7Z26L_8p4deiDMBI-r5s2c2jspcda3O58mQ'
)

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login - PodBlog AI</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
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
