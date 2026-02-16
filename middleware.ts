import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware disabled - auth now handled in dashboard layout
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []  // No routes intercepted
}
