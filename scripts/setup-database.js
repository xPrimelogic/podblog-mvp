#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...\n')

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'SUPABASE_SETUP.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Execute SQL
    console.log('📝 Executing SUPABASE_SETUP.sql...')
    const { error: setupError } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    // If exec_sql doesn't exist, we need to run SQL manually
    console.log('⚠️  Please run SUPABASE_SETUP.sql manually in Supabase SQL Editor')
    console.log('   Dashboard → SQL Editor → New Query → Paste & Run\n')

    // Read additional setup
    const setupCompletePath = path.join(__dirname, '..', 'SETUP_COMPLETE.sql')
    const setupCompleteSql = fs.readFileSync(setupCompletePath, 'utf8')
    
    console.log('📝 Also run SETUP_COMPLETE.sql for additional functions...')
    console.log('   Dashboard → SQL Editor → New Query → Paste & Run\n')

    // Create storage bucket
    console.log('📦 Creating storage bucket "podcasts"...')
    const { data: buckets } = await supabase.storage.listBuckets()
    const podcastsBucket = buckets?.find(b => b.name === 'podcasts')
    
    if (!podcastsBucket) {
      const { error: bucketError } = await supabase.storage.createBucket('podcasts', {
        public: false,
      })
      
      if (bucketError) {
        console.error('❌ Error creating bucket:', bucketError.message)
        console.log('   Please create manually: Dashboard → Storage → New Bucket → "podcasts"\n')
      } else {
        console.log('✅ Bucket "podcasts" created!\n')
      }
    } else {
      console.log('✅ Bucket "podcasts" already exists!\n')
    }

    console.log('✅ Database setup complete!')
    console.log('\n📋 Next steps:')
    console.log('   1. Run SUPABASE_SETUP.sql in SQL Editor')
    console.log('   2. Run SETUP_COMPLETE.sql in SQL Editor')
    console.log('   3. Verify storage bucket exists')
    console.log('   4. Test signup flow\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setupDatabase()
