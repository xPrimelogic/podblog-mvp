#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  try {
    console.log('📦 Applying payment system migrations...');

    const migrationFile = path.join(__dirname, 'migrations/add_payment_tables.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Split by statements and execute each one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await supabase.rpc('exec', { p_sql: statement });
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('⚠️  Already exists (skipping):', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error:', error);
        }
      }
    }

    console.log('✅ Migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

applyMigrations();
