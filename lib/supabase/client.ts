import { createBrowserClient, createServerClient as createServerClientSSR } from '@supabase/ssr'
import { createClient as createClientJS } from '@supabase/supabase-js'
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

// Server-side Supabase client factory (for server components & API routes)
// This is a factory function, not a singleton, because it needs cookie context
export const createServerClient = (cookieStore: any): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set!')
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClientSSR(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore?.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        cookieStore?.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })
}

// Utility function to get the current singleton instance (for debugging)
export const getSupabaseInstance = () => supabaseBrowserInstance
