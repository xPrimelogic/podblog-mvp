const { Pool } = require('pg');

// Construct connection string from Supabase URL
const host = 'db.jhdrsyqayqoumvbukjps.supabase.co';
const database = 'postgres';
const user = 'postgres';
const password = 'Monitortraffic125!';
const port = 5432;

const pool = new Pool({
  host,
  database,
  user,
  password,
  port,
  ssl: { rejectUnauthorized: false }
});

const sql = `
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS social_content JSONB,
ADD COLUMN IF NOT EXISTS newsletter_html TEXT,
ADD COLUMN IF NOT EXISTS timestamps JSONB,
ADD COLUMN IF NOT EXISTS quote_cards JSONB,
ADD COLUMN IF NOT EXISTS wordpress_post_id INTEGER,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_wordpress ON articles(wordpress_post_id);
`;

async function runMigration() {
  try {
    console.log('🔄 Connecting to Supabase database...');
    const result = await pool.query(sql);
    console.log('✅ Schema migration completed successfully!');
    console.log('Result:', result);
    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
