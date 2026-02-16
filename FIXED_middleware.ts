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
          // Set cookie in the request for subsequent middleware/page reads
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Create new response with updated cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Set cookie in the response to be sent to browser
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Remove from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Create new response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Remove from response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get session - this will refresh token if needed
  const { data: { session }, error } = await supabase.auth.getSession()

  // Log for debugging (remove in production or use conditional logging)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${request.nextUrl.pathname} | Session: ${session ? '✅' : '❌'} | User: ${session?.user?.email || 'none'}`)
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') ||
                     request.nextUrl.pathname.startsWith('/auth/callback')
  
  // Exclude public API routes from protection
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/auth/') ||
                           request.nextUrl.pathname === '/api/protected' ||
                           request.nextUrl.pathname.startsWith('/api/waitlist')
  
  const isProtectedPage = (request.nextUrl.pathname.startsWith('/dashboard') ||
                         (request.nextUrl.pathname.startsWith('/api') && !isPublicApiRoute))

  // Redirect logic
  if (isProtectedPage && !session) {
    // Protected page without session -> redirect to login
    console.log(`[Middleware] Redirecting to /login (no session for protected route: ${request.nextUrl.pathname})`)
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthPage && session && request.nextUrl.pathname !== '/auth/callback') {
    // Already logged in, trying to access login/signup -> redirect to dashboard
    console.log(`[Middleware] Redirecting to /dashboard (already logged in)`)
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
