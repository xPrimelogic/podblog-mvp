'use server'

import { createClient } from '@/lib/supabase/server';
import { generateUniqueUsername } from '@/lib/blog/slugify';

export async function generateUsername(email: string): Promise<string> {
  const supabase = await createClient();
  
  const checkExists = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    return !error && data !== null;
  };
  
  return generateUniqueUsername(email, checkExists);
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  
  return !!error || data === null;
}

export async function updateUserProfile(userId: string, updates: {
  username?: string;
  bio?: string;
  avatar_url?: string;
  blog_visibility?: 'public' | 'private';
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function loginAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true };
}

export async function signupAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  const supabase = await createClient();
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });
  
  if (authError) {
    return { error: authError.message };
  }
  
  if (!authData.user) {
    return { error: 'Failed to create user' };
  }
  
  const username = await generateUsername(email);
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username, full_name: name })
    .eq('id', authData.user.id);
  
  if (profileError) {
    console.error('Profile update failed:', profileError);
  }
  
  return { success: true };
}
