require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up PodBlog AI database...\n');
  
  const schema = `
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Profiles table
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Subscriptions table
  CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'trialing',
    plan_name TEXT NOT NULL DEFAULT 'starter',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Articles table
  CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    podcast_url TEXT,
    podcast_file_path TEXT,
    transcript TEXT,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    word_count INTEGER,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Usage table
  CREATE TABLE IF NOT EXISTS public.usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    articles_generated INTEGER DEFAULT 0,
    articles_limit INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start)
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
  CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_usage_user_period ON public.usage(user_id, period_start);

  -- RLS policies
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can view own articles" ON public.articles;
  CREATE POLICY "Users can view own articles" ON public.articles
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can create articles" ON public.articles;
  CREATE POLICY "Users can create articles" ON public.articles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
  CREATE POLICY "Users can update own articles" ON public.articles
    FOR UPDATE USING (auth.uid() = user_id);

  -- Storage bucket for podcast files
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('podcasts', 'podcasts', false)
  ON CONFLICT (id) DO NOTHING;

  -- Storage policy
  DROP POLICY IF EXISTS "Users can upload own podcasts" ON storage.objects;
  CREATE POLICY "Users can upload own podcasts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'podcasts' AND auth.uid()::text = (storage.foldername(name))[1]);

  DROP POLICY IF EXISTS "Users can read own podcasts" ON storage.objects;
  CREATE POLICY "Users can read own podcasts" ON storage.objects
    FOR SELECT USING (bucket_id = 'podcasts' AND auth.uid()::text = (storage.foldername(name))[1]);
  `;

  try {
    // Execute schema via REST API (Supabase Management API)
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      // Fallback: execute via direct query (if exec_sql function doesn't exist)
      console.log('⚠️  exec_sql RPC not available, using alternative method...');
      console.log('\n📝 Please execute this SQL manually in Supabase SQL Editor:');
      console.log('\nhttps://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql/new\n');
      console.log('--- COPY AND PASTE THIS SQL ---\n');
      console.log(schema);
      console.log('\n--- END SQL ---\n');
      return;
    }
    
    console.log('✅ Database schema created successfully!');
    console.log('\n🎯 Testing tables...');
    
    // Verify tables exist
    const tables = ['profiles', 'articles', 'subscriptions', 'usage'];
    for (const table of tables) {
      const { error: testError } = await supabase.from(table).select('*').limit(1);
      console.log(`  ${table}: ${testError ? '❌' : '✅'}`);
    }
    
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    console.log('\n📝 Please run the SQL manually in Supabase Dashboard');
  }
}

setupDatabase();
