require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Minimal schema for testing (full schema needs SQL Editor)
const MINIMAL_SCHEMA = `
-- Test table creation
CREATE TABLE IF NOT EXISTS public.test_connection (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

console.log('🔍 Testing Supabase connection via REST API...\n');

// Try to query existing tables
const options = {
  hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
  path: '/rest/v1/?apikey=' + SERVICE_KEY,
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('✅ Supabase REST API reachable');
    console.log('Status:', res.statusCode);
    
    console.log('\n⚠️  Schema creation requires SQL Editor access.');
    console.log('\n📋 SETUP INSTRUCTIONS:');
    console.log('1. Open: https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql/new');
    console.log('2. Copy & paste SQL from: SUPABASE_SETUP.sql');
    console.log('3. Click "Run"');
    console.log('\n4. After schema created, test with: node test-db.js');
  });
}).on('error', (e) => {
  console.error('❌ Connection error:', e.message);
});
