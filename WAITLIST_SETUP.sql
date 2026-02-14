-- PodBlog - Waitlist Table Setup
-- Minimal setup per la landing page waitlist

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can sign up (for public signup form)
CREATE POLICY "Anyone can sign up for waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Policy: service role can view all entries
CREATE POLICY "Service role can view waitlist"
  ON public.waitlist FOR SELECT
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- View to check waitlist stats (accessible by service role)
CREATE OR REPLACE VIEW public.waitlist_stats AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as signups_last_24h,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as signups_last_7d,
  MAX(created_at) as latest_signup
FROM public.waitlist;

-- Grant access to stats view
GRANT SELECT ON public.waitlist_stats TO authenticated, service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Waitlist table created successfully!';
  RAISE NOTICE 'Test with: INSERT INTO public.waitlist (email, name) VALUES (''test@example.com'', ''Test User'');';
END $$;
