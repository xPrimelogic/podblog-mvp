const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jhdrsyqayqoumvbukjps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2ODQ1MCwiZXhwIjoyMDg2NjQ0NDUwfQ.UBApqn13u-IkxCVzv0OdI23djjR44oBnnC4oA9dus7c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
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

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('✅ Schema updated successfully');
    console.log('Data:', data);
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

updateSchema();
