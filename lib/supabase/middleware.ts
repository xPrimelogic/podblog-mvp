import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Verify user authentication - recommended over getSession()
  const { data: { user }, error } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') ||
                     request.nextUrl.pathname.startsWith('/auth/callback')
  
  // Exclude public API routes from protection
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/auth/') ||
                           request.nextUrl.pathname === '/api/protected' ||
                           request.nextUrl.pathname.startsWith('/api/waitlist') ||
                           request.nextUrl.pathname.startsWith('/api/test-processing') // ✅ FIX: Allow test endpoint
  
  const isProtectedPage = (request.nextUrl.pathname.startsWith('/dashboard') ||
                         (request.nextUrl.pathname.startsWith('/api') && !isPublicApiRoute))

  // Redirect logic
  if (isProtectedPage && !user) {
    // Protected page without user -> redirect to login
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthPage && user && request.nextUrl.pathname !== '/auth/callback') {
    // Already logged in, trying to access login/signup -> redirect to dashboard
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
