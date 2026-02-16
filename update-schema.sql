-- Add columns for new features
ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_content JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS newsletter_html TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS timestamps JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS quote_cards JSONB;
