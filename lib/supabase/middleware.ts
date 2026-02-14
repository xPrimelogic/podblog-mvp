import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, just pass through - auth checks happen in layouts
  // Future: Add session refresh logic here if needed
  return NextResponse.next()
}
