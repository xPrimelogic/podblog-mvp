require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const { readFile } = require('fs/promises');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testPipeline() {
  console.log('🎯 Testing AI Pipeline (Deepgram + GPT-4)\n');
  
  // Test 1: Deepgram connection
  console.log('1️⃣ Testing Deepgram API...');
  try {
    // Use a public test audio URL
    const testUrl = 'https://dpgr.am/bueller.wav';
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: testUrl },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        language: 'en', // test audio is English
      }
    );
    
    if (error) throw error;
    
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;
    console.log(`✅ Deepgram OK - Transcript: "${transcript.substring(0, 100)}..."\n`);
    
  } catch (error) {
    console.error('❌ Deepgram error:', error.message);
    return;
  }
  
  // Test 2: OpenAI GPT-4
  console.log('2️⃣ Testing OpenAI GPT-4...');
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Test successful" in Italian.' }
      ],
      max_tokens: 50,
    });
    
    const result = response.choices[0].message.content;
    console.log(`✅ OpenAI OK - Response: "${result}"\n`);
    
  } catch (error) {
    console.error('❌ OpenAI error:', error.message);
    return;
  }
  
  // Test 3: Stripe
  console.log('3️⃣ Testing Stripe API...');
  try {
    const response = await fetch('https://api.stripe.com/v1/products?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });
    
    if (!response.ok) throw new Error('Stripe API failed');
    
    const data = await response.json();
    console.log(`✅ Stripe OK - Found ${data.data.length} products\n`);
    
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    return;
  }
  
  console.log('🎉 ALL APIs WORKING! Ready for end-to-end test.');
  console.log('\n📊 Cost Summary (30min podcast):');
  console.log('  - Deepgram Nova-2: €0.13');
  console.log('  - GPT-4o: ~€0.05');
  console.log('  - DALL-E 3 (optional): €0.08');
  console.log('  - TOTAL: ~€0.21/episode');
}

testPipeline().catch(console.error);
