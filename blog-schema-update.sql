-- Blog hosting features
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, created_at);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blog_enabled BOOLEAN DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
