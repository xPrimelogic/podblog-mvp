import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client-side Supabase client (for use in client components)
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not set!')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Server-side Supabase client (for use in server components and API routes)
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not set!')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseKey)
}
