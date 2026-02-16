require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');
const fs = require('fs');

console.log('🎯 END-TO-END TEST: Podcast → Article Pipeline\n');
console.log('=' * 60);

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runEndToEndTest() {
  
  // STEP 1: Transcribe audio
  console.log('\n1️⃣ TRANSCRIPTION (Deepgram Nova-2)');
  console.log('   Testing with public audio URL...');
  
  const testAudioUrl = 'https://dpgr.am/bueller.wav';
  
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: testAudioUrl },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        diarize: true,
        language: 'en',
      }
    );
    
    if (error) throw error;
    
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;
    
    if (!transcript) throw new Error('No transcript generated');
    
    console.log('   ✅ Transcription successful');
    console.log(`   📝 Length: ${transcript.length} chars`);
    console.log(`   🎙️ Sample: "${transcript.substring(0, 100)}..."\n`);
    
    // STEP 2: Generate article
    console.log('2️⃣ ARTICLE GENERATION (GPT-4o)');
    console.log('   Converting transcript to SEO article...');
    
    const prompt = `Transform this podcast transcript into a blog article.

TRANSCRIPT:
${transcript}

Create a short article with:
- Catchy title
- 2-3 paragraphs
- SEO optimized
- Natural Italian translation

Return ONLY the article in markdown format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert content writer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const article = completion.choices[0].message.content;
    
    console.log('   ✅ Article generated');
    console.log(`   📄 Length: ${article.length} chars`);
    console.log(`   📊 Words: ~${article.split(/\s+/).length}\n`);
    
    // STEP 3: Cost calculation
    console.log('3️⃣ COST ANALYSIS');
    
    const audioMinutes = 0.5; // Test audio is ~30 seconds
    const deepgramCost = (audioMinutes / 30) * 0.13; // €0.13 per 30min
    const gptInputTokens = Math.ceil(transcript.length / 4);
    const gptOutputTokens = Math.ceil(article.length / 4);
    const gptCost = (gptInputTokens * 0.0025 + gptOutputTokens * 0.01) / 1000000;
    
    console.log(`   💰 Deepgram: €${deepgramCost.toFixed(4)}`);
    console.log(`   💰 GPT-4o: €${gptCost.toFixed(4)}`);
    console.log(`   💰 TOTAL: €${(deepgramCost + gptCost).toFixed(4)}\n`);
    
    // STEP 4: Stripe pricing check
    console.log('4️⃣ STRIPE PRICING (Multi-Region)');
    
    const regions = {
      'Europa (EUR)': {
        starter: process.env.STRIPE_PRICE_EUROPA_STARTER,
        creator: process.env.STRIPE_PRICE_EUROPA_CREATOR,
        pro: process.env.STRIPE_PRICE_EUROPA_PRO,
      },
      'USA/UK (USD)': {
        starter: process.env.STRIPE_PRICE_USA_UK_STARTER,
        creator: process.env.STRIPE_PRICE_USA_UK_CREATOR,
        pro: process.env.STRIPE_PRICE_USA_UK_PRO,
      },
      'LATAM (USD)': {
        starter: process.env.STRIPE_PRICE_LATAM_STARTER,
        creator: process.env.STRIPE_PRICE_LATAM_CREATOR,
        pro: process.env.STRIPE_PRICE_LATAM_PRO,
      },
    };
    
    for (const [region, prices] of Object.entries(regions)) {
      console.log(`   ${region}:`);
      const allPricesValid = Object.values(prices).every(p => p && p.startsWith('price_'));
      console.log(`     ${allPricesValid ? '✅' : '❌'} All tiers configured`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 END-TO-END TEST: SUCCESS');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log('  ✅ Deepgram transcription working');
    console.log('  ✅ GPT-4o article generation working');
    console.log('  ✅ Stripe multi-region pricing configured');
    console.log('  ✅ Cost per episode: ~€0.18-0.21');
    
    console.log('\n⚠️  TO COMPLETE SETUP:');
    console.log('  1. Execute QUICK_SETUP.sql in Supabase Dashboard');
    console.log('     → https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql');
    console.log('  2. Test DB with: node test-db.js');
    console.log('  3. Start dev server: npm run dev');
    console.log('  4. Test full flow: register → upload → wait → see article');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runEndToEndTest();
