import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  await supabase.auth.signOut()
  
  const redirectUrl = new URL('/login', request.url)
  return NextResponse.redirect(redirectUrl)
}
