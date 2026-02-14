export { middleware } from './lib/supabase/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    // Exclude static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
