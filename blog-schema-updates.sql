-- Add blog-related columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blog_visibility TEXT DEFAULT 'public' CHECK (blog_visibility IN ('public', 'private'));

-- Add slug column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(user_id, slug);

-- Add index for username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add RLS policy for public blog access
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles" ON public.articles 
FOR SELECT 
USING (
  status = 'completed' 
  AND user_id IN (
    SELECT id FROM public.profiles WHERE blog_visibility = 'public'
  )
);

-- Add RLS policy for public profile access (blog authors)
DROP POLICY IF EXISTS "Public can view blog profiles" ON public.profiles;
CREATE POLICY "Public can view blog profiles" ON public.profiles 
FOR SELECT 
USING (blog_visibility = 'public' AND username IS NOT NULL);
