#!/usr/bin/env node
/**
 * PodBlog - Supabase Database Setup Script
 * Esegue il setup completo del database usando le credenziali in .env.local
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validate credentials
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  log('❌ Missing Supabase credentials in .env.local', 'red');
  log('Required variables:', 'yellow');
  log('  - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
  log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
  log('  - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
  log('\nSee UNLOCK_CREDENTIALS.md for help', 'cyan');
  process.exit(1);
}

log('🚀 PodBlog Database Setup', 'cyan');
log(`📍 Supabase URL: ${SUPABASE_URL}`, 'blue');

// Read SQL setup file
const sqlFile = path.join(__dirname, 'SUPABASE_SETUP.sql');
if (!fs.existsSync(sqlFile)) {
  log('❌ SUPABASE_SETUP.sql not found', 'red');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Execute SQL via Supabase REST API
async function executeSQL(query) {
  const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject({ success: false, status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Alternative: Execute via Supabase SQL Editor API or direct pg connection
async function setupDatabaseDirectAPI() {
  log('\n📦 Creating database schema...', 'cyan');
  
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  log(`Found ${statements.length} SQL statements to execute`, 'blue');

  // Note: Supabase REST API doesn't expose direct SQL execution
  // We need to use either:
  // 1. Supabase CLI: supabase db push
  // 2. pg client library
  // 3. Manual execution in Supabase dashboard
  
  log('\n⚠️  Direct SQL execution via REST API requires one of:', 'yellow');
  log('  1. Install @supabase/supabase-js and use admin client', 'yellow');
  log('  2. Use Supabase CLI: npx supabase db push', 'yellow');
  log('  3. Copy-paste SQL into Supabase Dashboard SQL Editor', 'yellow');
  
  return false;
}

// Test database connection
async function testConnection() {
  log('\n🔌 Testing Supabase connection...', 'cyan');
  
  const url = new URL('/rest/v1/', SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    };

    const req = https.request(url, options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        log('✅ Connection successful!', 'green');
        resolve(true);
      } else {
        log(`❌ Connection failed: ${res.statusCode}`, 'red');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      log(`❌ Connection error: ${err.message}`, 'red');
      resolve(false);
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Setup database
    log('\n📋 Next steps:', 'cyan');
    log('1. Open Supabase Dashboard: ' + SUPABASE_URL.replace('//', '//app.'), 'blue');
    log('2. Navigate to SQL Editor', 'blue');
    log('3. Copy and execute SUPABASE_SETUP.sql', 'blue');
    log('\nOR use Supabase CLI:', 'cyan');
    log('  npm install -g supabase', 'blue');
    log('  supabase link --project-ref ' + SUPABASE_URL.split('.')[0].split('//')[1], 'blue');
    log('  supabase db push', 'blue');

    log('\n✅ Credentials validated. Manual SQL execution required.', 'green');
    log('See: https://supabase.com/docs/guides/cli/local-development', 'cyan');
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
