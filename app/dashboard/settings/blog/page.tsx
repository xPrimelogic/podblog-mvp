'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { checkUsernameAvailability, updateUserProfile } from '@/app/actions/auth'

export default function BlogSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [blogVisibility, setBlogVisibility] = useState<'public' | 'private'>('public')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, blog_visibility')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatar_url || '')
      setBlogVisibility(profile.blog_visibility || 'public')
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError('Errore nel caricamento del profilo')
      setLoading(false)
    }
  }

  async function checkUsername(username: string) {
    if (!username || username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    const available = await checkUsernameAvailability(username)
    setUsernameAvailable(available)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Validate username
      if (!username || username.length < 3) {
        throw new Error('Username deve essere almeno 3 caratteri')
      }

      if (!/^[a-z0-9-]+$/.test(username)) {
        throw new Error('Username può contenere solo lettere minuscole, numeri e trattini')
      }

      // Check username availability (if changed)
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      if (currentProfile && currentProfile.username !== username) {
        const available = await checkUsernameAvailability(username)
        if (!available) {
          throw new Error('Username non disponibile')
        }
      }

      // Update profile
      const result = await updateUserProfile(userId, {
        username,
        bio,
        avatar_url: avatarUrl,
        blog_visibility: blogVisibility,
      })

      if (!result.success) {
        throw new Error(result.error || 'Errore nel salvataggio')
      }

      setSuccess('✅ Impostazioni salvate con successo!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Caricamento...</p>
      </div>
    )
  }

  const blogUrl = username 
    ? `${window.location.origin}/blog/${username}`
    : 'Imposta un username per ottenere il tuo URL'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni Blog</h1>
        <p className="text-gray-600 mt-2">
          Personalizza il tuo blog pubblico
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-6">
          {/* Username */}
          <div>
            <Label htmlFor="username">Username *</Label>
            <div className="mt-1 space-y-2">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                  setUsername(value)
                  checkUsername(value)
                }}
                placeholder="il-tuo-username"
                disabled={saving}
                className={
                  usernameAvailable === false 
                    ? 'border-red-500' 
                    : usernameAvailable === true 
                    ? 'border-green-500' 
                    : ''
                }
              />
              {usernameAvailable === false && (
                <p className="text-sm text-red-600">❌ Username non disponibile</p>
              )}
              {usernameAvailable === true && username !== '' && (
                <p className="text-sm text-green-600">✅ Username disponibile</p>
              )}
              <p className="text-xs text-gray-500">
                Solo lettere minuscole, numeri e trattini. Minimo 3 caratteri.
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Racconta qualcosa su di te..."
              disabled={saving}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Apparirà sul tuo blog e negli articoli
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://esempio.com/avatar.jpg"
              disabled={saving}
            />
            {avatarUrl && (
              <div className="mt-2">
                <img 
                  src={avatarUrl} 
                  alt="Avatar preview" 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'
                  }}
                />
              </div>
            )}
          </div>

          {/* Blog Visibility */}
          <div>
            <Label>Visibilità Blog</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="public"
                  checked={blogVisibility === 'public'}
                  onChange={(e) => setBlogVisibility(e.target.value as 'public')}
                  disabled={saving}
                />
                <span>🌍 Pubblico - Chiunque può vedere i tuoi articoli</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="private"
                  checked={blogVisibility === 'private'}
                  onChange={(e) => setBlogVisibility(e.target.value as 'private')}
                  disabled={saving}
                />
                <span>🔒 Privato - Solo tu puoi vedere i tuoi articoli</span>
              </label>
            </div>
          </div>

          {/* Blog URL */}
          <div>
            <Label>URL del tuo blog</Label>
            <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <a 
                href={username ? `/blog/${username}` : '#'} 
                target="_blank"
                rel="noopener noreferrer"
                className={username ? 'text-blue-600 hover:underline' : 'text-gray-400'}
              >
                {blogUrl}
              </a>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={saving || !username || usernameAvailable === false}
              className="flex-1"
            >
              {saving ? '⏳ Salvataggio...' : '💾 Salva Impostazioni'}
            </Button>
            
            {username && blogVisibility === 'public' && (
              <Button
                variant="outline"
                onClick={() => window.open(`/blog/${username}`, '_blank')}
                disabled={!username}
              >
                👁️ Vedi Blog
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informazioni</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Il tuo blog è incluso in tutti i piani (Free, Pro, Business)</li>
          <li>• Gli articoli completati appaiono automaticamente sul tuo blog</li>
          <li>• Puoi condividere il link del blog con chiunque</li>
          <li>• SEO ottimizzato per Google, Twitter, LinkedIn</li>
        </ul>
      </Card>
    </div>
  )
}
