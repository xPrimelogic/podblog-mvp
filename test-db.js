require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection...\n');
  
  const tests = [
    { name: 'profiles', table: 'profiles' },
    { name: 'articles', table: 'articles' },
    { name: 'subscriptions', table: 'subscriptions' },
    { name: 'usage', table: 'usage' },
  ];
  
  for (const test of tests) {
    const { data, error } = await supabase
      .from(test.table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${test.name} table: ${error.message}`);
    } else {
      console.log(`✅ ${test.name} table: OK`);
    }
  }
  
  console.log('\n📊 Database check complete');
}

testDatabase().catch(console.error);
