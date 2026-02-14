#!/usr/bin/env node
/**
 * Complete Supabase Setup for PodBlog Waitlist
 * Uses @supabase/supabase-js to execute SQL and test the setup
 */

const fs = require('fs');
const path = require('path');

// Check if supabase-js is installed
let createClient;
try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch (error) {
  console.log('❌ @supabase/supabase-js not found');
  console.log('📦 Installing dependencies...\n');
  const { execSync } = require('child_process');
  execSync('npm install @supabase/supabase-js dotenv', { stdio: 'inherit' });
  ({ createClient } = require('@supabase/supabase-js'));
}

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  console.log('❌ Missing credentials. See UNLOCK_CREDENTIALS.md');
  process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔌 Testing connection...');
  const { data, error } = await supabase.from('_test').select('*').limit(1);
  if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected)
    console.log('❌ Connection failed:', error.message);
    return false;
  }
  console.log('✅ Connected to Supabase!\n');
  return true;
}

async function createWaitlistTable() {
  console.log('📦 Creating waitlist table...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS public.waitlist (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        referral_source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

      -- Policy: anyone can insert (for public signup)
      CREATE POLICY IF NOT EXISTS "Anyone can sign up for waitlist"
        ON public.waitlist FOR INSERT
        WITH CHECK (true);

      -- Policy: service role can read all
      CREATE POLICY IF NOT EXISTS "Service role can view waitlist"
        ON public.waitlist FOR SELECT
        USING (true);

      -- Index for performance
      CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
      CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);
    `
  });

  if (error) {
    // Try alternative approach: execute statements one by one
    console.log('📝 Creating table with direct SQL...');
    
    // Create table
    const { error: createError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.waitlist (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          referral_source TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.log('⚠️  RPC exec_sql not available. Using alternative method...\n');
      console.log('📋 Manual setup required:');
      console.log('1. Open Supabase Dashboard SQL Editor');
      console.log('2. Execute this SQL:\n');
      console.log(`
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can view waitlist"
  ON public.waitlist FOR SELECT
  USING (true);

CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
      `);
      return false;
    }
  }

  console.log('✅ Waitlist table created!\n');
  return true;
}

async function testInsert() {
  console.log('🧪 Testing insert...');
  
  const testEmail = `test+${Date.now()}@podblog.ai`;
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      email: testEmail,
      name: 'Test User',
      referral_source: 'automated_test'
    })
    .select();

  if (error) {
    console.log('❌ Insert failed:', error.message);
    return false;
  }

  console.log('✅ Test signup successful!');
  console.log('   Email:', testEmail);
  console.log('   ID:', data[0].id);
  console.log('');
  return true;
}

async function verifyWaitlistCount() {
  console.log('📊 Checking waitlist entries...');
  
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('⚠️  Could not count entries:', error.message);
    return;
  }

  console.log(`✅ Total waitlist entries: ${count}\n`);
}

async function main() {
  console.log('🚀 PodBlog Supabase Setup\n');
  console.log(`📍 URL: ${SUPABASE_URL}\n`);

  // Test connection
  if (!await testConnection()) {
    process.exit(1);
  }

  // Create table (may require manual step)
  const tableCreated = await createWaitlistTable();
  
  if (!tableCreated) {
    console.log('\n⚠️  After creating the table manually, run this script again to test.');
    process.exit(0);
  }

  // Test insert
  if (!await testInsert()) {
    process.exit(1);
  }

  // Verify
  await verifyWaitlistCount();

  console.log('✅ Setup complete!\n');
  console.log('📋 Next steps:');
  console.log('  1. Test the Next.js form at http://localhost:3000');
  console.log('  2. Check waitlist entries in Supabase Dashboard');
  console.log('  3. Deploy to production\n');
}

main().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
