import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware bypasses test-processing endpoint
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/test-processing|_next/static|_next/image|favicon.ico).*)',
  ]
}
