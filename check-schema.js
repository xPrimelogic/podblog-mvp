const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jhdrsyqayqoumvbukjps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2ODQ1MCwiZXhwIjoyMDg2NjQ0NDUwfQ.UBApqn13u-IkxCVzv0OdI23djjR44oBnnC4oA9dus7c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking articles table structure...\n');
  
  // Try to get one row to see column structure
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Found existing articles');
    console.log('📋 Current columns:');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}`);
    });
  } else {
    console.log('⚠️  No articles in table yet');
    console.log('Trying to insert test row to discover schema...');
  }
}

checkSchema();
