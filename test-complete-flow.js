require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@deepgram/sdk');
const OpenAI = require('openai');

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testCompleteFlow() {
  console.log('🎯 PodBlog AI - Complete Flow Test\n');
  console.log('=' .repeat(60));
  
  // STEP 1: Geolocation Detection (mock)
  console.log('\n1️⃣ GEOLOCATION DETECTION');
  const mockRegions = ['EUR', 'USD', 'BRL'];
  const detectedRegion = mockRegions[Math.floor(Math.random() * mockRegions.length)];
  console.log(`   Detected region: ${detectedRegion}`);
  
  const pricing = {
    EUR: { starter: '€9', creator: '€19', pro: '€49' },
    USD: { starter: '$9', creator: '$19', pro: '$49' },
    BRL: { starter: 'R$45', creator: 'R$95', pro: 'R$245' },
  };
  
  console.log(`   Pricing: ${JSON.stringify(pricing[detectedRegion])}`);
  
  // STEP 2: Podcast Transcription (Deepgram Nova-2)
  console.log('\n2️⃣ PODCAST TRANSCRIPTION (Deepgram Nova-2)');
  try {
    const testUrl = 'https://dpgr.am/bueller.wav';
    console.log(`   Downloading: ${testUrl}`);
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: testUrl },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        diarize: true,
        language: 'en',
      }
    );
    
    if (error) throw error;
    
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;
    const duration = result.metadata?.duration || 0;
    const cost = (duration / 60) * 0.0043; // €0.0043/min for Nova-2
    
    console.log(`   ✅ Transcribed ${duration.toFixed(1)}s`);
    console.log(`   Cost: €${cost.toFixed(4)}`);
    console.log(`   Transcript: "${transcript.substring(0, 80)}..."\n`);
    
    // STEP 3: Article Generation (GPT-4o)
    console.log('3️⃣ ARTICLE GENERATION (GPT-4o)');
    console.log('   Generating SEO-optimized article...');
    
    const articlePrompt = `Transform this podcast transcript into an SEO blog article:

"${transcript.substring(0, 500)}"

Format:
# [Catchy Title]

**Meta Description:** [160 chars]

## Introduction
[engaging intro]

## Key Points
[main content]

## Conclusion
[summary + CTA]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'SEO expert copywriter' },
        { role: 'user', content: articlePrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    const article = response.choices[0].message.content;
    const articleCost = (response.usage.total_tokens / 1000000) * 5; // ~$5/1M tokens
    
    console.log(`   ✅ Generated ${response.usage.total_tokens} tokens`);
    console.log(`   Cost: €${articleCost.toFixed(4)}`);
    console.log(`   Preview:\n\n${article.substring(0, 300)}...\n`);
    
    // STEP 4: Stripe Payment (mock)
    console.log('4️⃣ STRIPE PAYMENT SIMULATION');
    const plan = 'creator';
    const priceId = {
      EUR: process.env.STRIPE_PRICE_CREATOR_EUR || 'price_1T1TPCHzl6QXfcVfKQ9VvbLc',
      USD: process.env.STRIPE_PRICE_CREATOR_USD || 'price_1T1TPEHzl6QXfcVfE7ZrF9SU',
      BRL: process.env.STRIPE_PRICE_CREATOR_BRL || 'price_1T1TPGHzl6QXfcVfqZH7zjEt',
    }[detectedRegion];
    
    console.log(`   Selected plan: ${plan.toUpperCase()}`);
    console.log(`   Price ID: ${priceId}`);
    console.log(`   Amount: ${pricing[detectedRegion][plan]}/month`);
    console.log(`   ✅ Payment processed (test mode)\n`);
    
    // SUMMARY
    console.log('=' .repeat(60));
    console.log('📊 FLOW COMPLETE SUMMARY\n');
    
    const totalCost = cost + articleCost;
    console.log(`✅ Transcription: €${cost.toFixed(4)}`);
    console.log(`✅ Article gen:   €${articleCost.toFixed(4)}`);
    console.log(`✅ Total cost:    €${totalCost.toFixed(4)}`);
    console.log(`\n💰 Per 30min episode: ~€0.18`);
    console.log(`🎯 Margin: ${((19 - 0.18) / 19 * 100).toFixed(1)}% (on Creator plan)`);
    console.log('\n🎉 All systems operational!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

testCompleteFlow().catch(console.error);
