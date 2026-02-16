import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // For API routes, use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Get auth token from cookies
  const authToken = cookieStore.get('sb-access-token')?.value
  
  if (authToken) {
    // Set the auth token for this request
    supabase.auth.setSession({
      access_token: authToken,
      refresh_token: cookieStore.get('sb-refresh-token')?.value || ''
    })
  }

  return supabase
}

// Alias for consistency with imports
export const createServerClient = createClient;
