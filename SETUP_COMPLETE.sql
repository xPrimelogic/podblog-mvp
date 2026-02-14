-- Additional SQL functions for PodBlog MVP

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_period_start DATE
)
RETURNS void AS $$
BEGIN
  -- Try to insert new record
  INSERT INTO public.usage (user_id, period_start, period_end, articles_generated, articles_limit)
  VALUES (
    p_user_id,
    p_period_start,
    (p_period_start + INTERVAL '1 month - 1 day')::DATE,
    1,
    12
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    articles_generated = usage.articles_generated + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for podcasts (run this in Supabase dashboard if not exists)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('podcasts', 'podcasts', false);

-- Storage policies for podcasts bucket
CREATE POLICY "Users can upload own podcasts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'podcasts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own podcasts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'podcasts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own podcasts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'podcasts' AND (storage.foldername(name))[1] = auth.uid()::text);
