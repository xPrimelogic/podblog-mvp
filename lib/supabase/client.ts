import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instance for browser client
let supabaseBrowserInstance: SupabaseClient | null = null

// Client-side Supabase client (for use in client components)
// Uses singleton pattern to prevent "Multiple GoTrueClient instances" error
export const createClient = (): SupabaseClient => {
  // Return existing instance if available
  if (supabaseBrowserInstance) {
    return supabaseBrowserInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set!')
    throw new Error('Missing Supabase environment variables')
  }
  
  // Create and cache the instance
  supabaseBrowserInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  })

  console.log('✅ Supabase singleton client created')
  
  return supabaseBrowserInstance
}

// Server-side Supabase client (for use in server components and API routes)
// Note: Server clients don't have the same singleton requirements as browser clients
export const createServerClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set!')
    throw new Error('Missing Supabase environment variables')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  })
}

// Utility function to get the current singleton instance (for debugging)
export const getSupabaseInstance = () => supabaseBrowserInstance
