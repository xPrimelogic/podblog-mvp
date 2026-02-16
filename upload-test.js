const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jhdrsyqayqoumvbukjps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2ODQ1MCwiZXhwIjoyMDg2NjQ0NDUwfQ.UBApqn13u-IkxCVzv0OdI23djjR44oBnnC4oA9dus7c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('🎬 Testing YouTube Upload...\n');
  
  const testYouTubeUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  
  // Test 1: Insert test article
  console.log('📝 Step 1: Creating test article entry...');
  const { data: article, error: insertError } = await supabase
    .from('articles')
    .insert({
      title: 'E2E Test - 19sec Video',
      youtube_url: testYouTubeUrl,
      status: 'processing',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Insert error:', insertError);
    return;
  }
  
  console.log('✅ Article created:', article.id);
  console.log('   Title:', article.title);
  console.log('   Status:', article.status);
  console.log('   YouTube URL:', article.youtube_url);
  
  // Check if new columns exist
  console.log('\n🔍 Step 2: Checking schema columns...');
  const columns = [
    'social_content',
    'newsletter_html', 
    'timestamps',
    'quote_cards',
    'wordpress_post_id',
    'published_at'
  ];
  
  columns.forEach(col => {
    const exists = article.hasOwnProperty(col);
    console.log(`   ${exists ? '✅' : '❌'} ${col}: ${exists ? 'exists' : 'MISSING'}`);
  });
  
  console.log('\n⏳ Article ID for monitoring:', article.id);
  console.log('   Use this to check processing status');
  
  return article.id;
}

testUpload().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
