export { middleware } from './lib/supabase/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
  ]
}
