import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createServerClient()
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('✅ Email confirmation successful, session created for:', data.user?.email)
        
        // Create response with redirect
        const response = NextResponse.redirect(`${requestUrl.origin}${next}`)
        
        // Set session cookies
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })

        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })

        return response
      }
    } catch (err) {
      console.error('❌ Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // No code present, redirect to login
  console.warn('⚠️ No code in callback URL')
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
