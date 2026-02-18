-- Add stripe customer id to profiles
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_plan TEXT DEFAULT 'free';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  price_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON public.subscriptions
  USING (auth.role() = 'service_role');

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriptions.user_id = $1
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user plan
CREATE OR REPLACE FUNCTION get_user_plan(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  plan TEXT;
BEGIN
  SELECT subscription_plan INTO plan FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
