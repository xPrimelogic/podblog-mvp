import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NO-OP middleware - auth is layout-based
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// EMPTY matcher = middleware never runs (complete bypass)
export const config = {
  matcher: []
}
