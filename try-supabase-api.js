require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase API capabilities...\n');

// Try to call a SQL query endpoint if available
const testQuery = 'SELECT version()';

fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: testQuery })
})
.then(res => {
  console.log('Status:', res.status);
  return res.text();
})
.then(data => {
  console.log('Response:', data.substring(0, 200));
  
  console.log('\n❌ SQL execution via API not available.');
  console.log('\n🔧 SOLUTION: Setup database using Supabase client SDK');
  console.log('   Creating tables programmatically...\n');
  
  // We'll create a migration-style setup
  runMigration();
})
.catch(err => {
  console.error('Error:', err.message);
  runMigration();
});

async function runMigration() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  
  console.log('📦 Using Supabase SDK to verify setup...\n');
  
  // Test if tables exist
  const tables = ['profiles', 'articles', 'subscriptions', 'usage'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST204') {
      console.log(`⚠️  Table '${table}' not found`);
    } else if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists`);
    }
  }
  
  console.log('\n📋 FINAL VERDICT:');
  console.log('   SQL execution requires one of:');
  console.log('   1. Supabase Dashboard SQL Editor (recommended)');
  console.log('   2. psql + DB password');
  console.log('   3. Supabase CLI with auth\n');
  
  console.log('📄 SQL file ready at: QUICK_SETUP.sql');
  console.log('   Copy contents to: https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql\n');
  
  console.log('💡 TIP: After SQL executed, run: node test-db.js');
}
