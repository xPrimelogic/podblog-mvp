import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  
  const redirectUrl = new URL('/login', request.url)
  return NextResponse.redirect(redirectUrl)
}
