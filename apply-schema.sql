-- Schema update per MVP complete features
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS social_content JSONB,
ADD COLUMN IF NOT EXISTS newsletter_html TEXT,
ADD COLUMN IF NOT EXISTS timestamps JSONB,
ADD COLUMN IF NOT EXISTS quote_cards JSONB,
ADD COLUMN IF NOT EXISTS wordpress_post_id INTEGER,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_wordpress ON articles(wordpress_post_id);
