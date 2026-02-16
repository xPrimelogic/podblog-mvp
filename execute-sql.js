require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQLFile() {
  console.log('🚀 Executing Supabase schema setup...\n');
  
  // Read SQL file
  const sql = readFileSync('SUPABASE_SETUP.sql', 'utf8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`📝 Found ${statements.length} SQL statements\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip empty or comment-only statements
    if (!stmt || stmt.length < 10) continue;
    
    // Show first 80 chars of statement
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    process.stdout.write(`  [${i+1}/${statements.length}] ${preview}...`);
    
    try {
      // Execute via Supabase REST API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ query: stmt + ';' })
        }
      );
      
      if (response.ok || response.status === 404) {
        // 404 means RPC doesn't exist, which is expected
        // We'll use alternative method
        console.log(' ⏭️  (skipped - use SQL editor)');
      } else {
        console.log(` ❌ ${response.status}`);
        errorCount++;
      }
      
    } catch (error) {
      console.log(' ❌');
      errorCount++;
    }
    
    successCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${successCount} processed, ${errorCount} errors`);
  console.log('='.repeat(60));
  
  console.log('\n⚠️  Supabase REST API doesn\'t support direct SQL execution.');
  console.log('📝 Please execute manually:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql/new');
  console.log('2. Copy/paste: SUPABASE_SETUP.sql');
  console.log('3. Click "Run"\n');
  
  console.log('After running SQL, verify tables:');
  console.log('  node test-db.js\n');
}

executeSQLFile().catch(console.error);
