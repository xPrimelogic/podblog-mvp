#!/bin/bash
# Test Waitlist Setup - PodBlog MVP

set -e

echo "🧪 Testing PodBlog Waitlist Setup"
echo "================================="
echo ""

# Check if .env.local has Supabase credentials
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local 2>/dev/null; then
    echo "❌ Supabase credentials not found in .env.local"
    echo ""
    echo "📋 Please run one of these commands first:"
    echo "   1. sudo cat /home/node/.openclaw-secrets >> .env.local"
    echo "   2. Manually copy credentials to .env.local"
    echo ""
    echo "See UNLOCK_CREDENTIALS.md for details"
    exit 1
fi

echo "✅ Credentials found in .env.local"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules/@supabase" ]; then
    echo "📦 Installing @supabase/supabase-js..."
    npm install @supabase/supabase-js dotenv
    echo ""
fi

# Test 1: Connection test
echo "🔌 Test 1: Supabase Connection"
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.from('_health').select('*').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.log('❌ Connection failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Connected successfully!');
})();
" 2>&1 | grep -E "(✅|❌)"

echo ""

# Test 2: Check if waitlist table exists
echo "📊 Test 2: Waitlist Table Exists"
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase.from('waitlist').select('id').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Table does not exist');
      console.log('');
      console.log('📋 Run this SQL in Supabase Dashboard:');
      console.log('   See WAITLIST_SETUP.sql');
      process.exit(1);
    }
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Table exists!');
})();
" 2>&1

echo ""

# Test 3: Insert dummy record
echo "🧪 Test 3: Insert Dummy Record"
TEST_EMAIL="test-$(date +%s)@podblog.ai"

node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      email: '${TEST_EMAIL}',
      name: 'Test User',
      referral_source: 'automated_test'
    })
    .select()
    .single();
  
  if (error) {
    console.log('❌ Insert failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Insert successful!');
  console.log('   Email:', data.email);
  console.log('   ID:', data.id);
})();
" 2>&1

echo ""

# Test 4: Count waitlist entries
echo "📈 Test 4: Count Waitlist Entries"
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.log('❌ Count failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Total entries:', count);
})();
" 2>&1

echo ""
echo "================================="
echo "🎉 All tests passed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Visit: http://localhost:3000"
echo "  3. Test waitlist form"
echo "  4. Check Supabase Dashboard for entries"
echo ""
