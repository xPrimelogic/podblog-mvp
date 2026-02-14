#!/bin/bash

# Set VERCEL_TOKEN environment variable before running this script
# export VERCEL_TOKEN=your_token_here

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN not set"
  echo "Run: export VERCEL_TOKEN=your_token_here"
  exit 1
fi

echo "🔧 Setting up Vercel environment variables..."

# Function to add env var
add_env() {
  local name=$1
  local value=$2
  echo "$value" | npx vercel env add "$name" production --token=$VERCEL_TOKEN --yes 2>&1 | grep -v "Vercel CLI"
}

# Load environment variables from .env.local
if [ -f ".env.local" ]; then
  source .env.local
fi

# Add all environment variables
add_env "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL}"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
add_env "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY}"
add_env "OPENAI_API_KEY" "${OPENAI_API_KEY}"
add_env "NEXT_PUBLIC_SITE_URL" "https://podblog-mvp.vercel.app"

echo "✅ Environment variables configured!"
echo ""
echo "🚀 Now deploying..."
