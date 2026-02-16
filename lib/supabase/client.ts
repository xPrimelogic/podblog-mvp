import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance for browser client
let supabaseBrowserInstance: SupabaseClient | null = null

// Client-side Supabase client (for use in client components)
// Uses @supabase/ssr's createBrowserClient to ensure cookies are set
// This is critical: the middleware reads session from cookies, not localStorage
export const createClient = (): SupabaseClient => {
  if (supabaseBrowserInstance) {
    return supabaseBrowserInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set!')
    throw new Error('Missing Supabase environment variables')
  }
  
  supabaseBrowserInstance = createBrowserClient(supabaseUrl, supabaseKey)

  console.log('✅ Supabase SSR browser client created')
  
  return supabaseBrowserInstance
}

// Utility function to get the current singleton instance (for debugging)
export const getSupabaseInstance = () => supabaseBrowserInstance
