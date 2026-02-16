// Test processing API direttamente (bypassa login frontend)
require('dotenv').config({ path: '.env.local' });

async function testProcessing() {
  console.log('🧪 Test Processing API Diretto\n');
  
  const videoUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  console.log('📹 Video:', videoUrl);
  
  // Step 1: Upload
  console.log('\n1️⃣ Uploading...');
  const uploadRes = await fetch('https://podblog-mvp.vercel.app/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: videoUrl, userId: 'test-mvp@podblog.ai' })
  });
  
  if (!uploadRes.ok) {
    console.error('❌ Upload failed:', uploadRes.status, await uploadRes.text());
    return;
  }
  
  const uploadData = await uploadRes.json();
  console.log('✅ Upload OK:', uploadData);
  
  // Step 2: Process
  console.log('\n2️⃣ Processing (Deepgram + GPT-4)...');
  const processRes = await fetch('https://podblog-mvp.vercel.app/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileUrl: uploadData.fileUrl || videoUrl,
      userId: 'test-mvp@podblog.ai'
    })
  });
  
  if (!processRes.ok) {
    console.error('❌ Process failed:', processRes.status, await processRes.text());
    return;
  }
  
  const processData = await processRes.json();
  console.log('✅ Processing OK!');
  console.log('   Transcript length:', processData.transcript?.length || 0);
  console.log('   Article length:', processData.article?.length || 0);
  console.log('   Title:', processData.title?.substring(0, 50));
  
  console.log('\n🎉 MVP FEATURE CORE FUNZIONANO!');
  console.log('   - Upload: ✅');
  console.log('   - Deepgram: ✅');
  console.log('   - GPT-4: ✅');
}

testProcessing().catch(err => {
  console.error('\n💥 Error:', err.message);
  process.exit(1);
});
