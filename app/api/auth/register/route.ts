import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { generateUsername } from '@/app/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Sign up user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        // This bypasses email confirmation if Supabase settings allow
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });
    
    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    // Generate username from email
    const username = await generateUsername(email);
    
    // Update profile with username (RLS will allow this for new user)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        username, 
        full_name: name 
      })
      .eq('id', authData.user.id);
    
    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the request, profile can be updated later
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully. You can now login.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
