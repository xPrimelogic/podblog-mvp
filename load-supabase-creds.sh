#!/bin/bash
# Quick script to load Supabase credentials from secrets file

SECRETS_FILE="/home/node/.openclaw-secrets"

if [ ! -f "$SECRETS_FILE" ]; then
    echo "❌ File $SECRETS_FILE not found"
    exit 1
fi

# Read and export credentials
export $(grep -E '^SUPABASE_' "$SECRETS_FILE" | xargs)

# Update .env.local with actual credentials
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    cat > .env.local <<EOF
# Supabase - Auto-configured $(date)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# OpenAI (per dopo)
OPENAI_API_KEY=

# Stripe (per dopo)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Site URL per auth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
    echo "✅ Credentials loaded into .env.local"
    echo ""
    echo "SUPABASE_URL: $SUPABASE_URL"
    echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."
    echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
else
    echo "❌ Missing credentials in secrets file"
    exit 1
fi
