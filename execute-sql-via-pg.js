require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)[1];

// Connection string for Supabase Postgres
// Format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
// We need the DB password which is NOT in env vars

console.log('🔍 Attempting SQL execution via pg client...\n');
console.log('⚠️  Database password required (not in env vars)');
console.log('\nAlternative: Use Supabase Management API\n');

// Try using Management API instead
const sqlContent = fs.readFileSync('QUICK_SETUP.sql', 'utf8');

console.log('📝 SQL file loaded: QUICK_SETUP.sql');
console.log(`   Lines: ${sqlContent.split('\n').length}`);
console.log(`   Size: ${sqlContent.length} bytes\n`);

console.log('💡 Attempting execution via Supabase Management API...');

const https = require('https');

// Supabase Management API endpoint
const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
};

// Try creating a custom RPC function first
const createExecRpc = `
CREATE OR REPLACE FUNCTION exec(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
`;

console.log('Step 1: Creating exec RPC function...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response:', data.substring(0, 200));
    
    if (res.statusCode === 404) {
      console.log('\n❌ RPC endpoint not available');
      console.log('⚠️  Direct SQL execution requires:');
      console.log('   1. Database password (not available in env)');
      console.log('   2. Supabase CLI with login');
      console.log('   3. Or manual execution in dashboard\n');
      
      console.log('📋 WORKAROUND OPTIONS:');
      console.log('   A) Install psql and get DB password from Supabase settings');
      console.log('   B) Use Supabase Studio (web UI)');
      console.log('   C) Enable PostgREST RPC function for SQL execution\n');
      
      console.log('📄 SQL ready at: QUICK_SETUP.sql');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(JSON.stringify({ sql: createExecRpc }));
req.end();
