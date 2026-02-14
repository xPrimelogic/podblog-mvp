#!/bin/bash
# Complete PodBlog Waitlist Setup - One Command

set -e

echo ""
echo "🚀 PodBlog Waitlist - Complete Setup"
echo "======================================"
echo ""

PROJECT_DIR="/home/node/projects/podblog-mvp"
SECRETS_FILE="/home/node/.openclaw-secrets"
ENV_FILE="$PROJECT_DIR/.env.local"

cd "$PROJECT_DIR"

# Step 1: Check/Load Credentials
echo "📋 Step 1: Loading Supabase Credentials"
echo "----------------------------------------"

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" "$ENV_FILE" 2>/dev/null; then
    echo "⚠️  Credentials not found in .env.local"
    echo ""
    
    if [ -r "$SECRETS_FILE" ]; then
        echo "✅ Secrets file accessible, loading..."
        cat "$SECRETS_FILE" >> "$ENV_FILE"
        echo "✅ Credentials loaded!"
    else
        echo "❌ Cannot access $SECRETS_FILE"
        echo ""
        echo "Please run ONE of these commands:"
        echo ""
        echo "  # Option 1: Copy with sudo"
        echo "  sudo cat $SECRETS_FILE >> $ENV_FILE"
        echo ""
        echo "  # Option 2: Grant temporary access"
        echo "  sudo chmod 644 $SECRETS_FILE"
        echo "  cat $SECRETS_FILE >> $ENV_FILE"
        echo "  sudo chmod 600 $SECRETS_FILE"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
else
    echo "✅ Credentials already in .env.local"
fi

echo ""

# Step 2: Install Dependencies
echo "📦 Step 2: Installing Dependencies"
echo "-----------------------------------"

if [ ! -d "node_modules/@supabase/supabase-js" ]; then
    echo "Installing @supabase/supabase-js..."
    npm install --save @supabase/supabase-js dotenv
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Step 3: Test Connection
echo "🔌 Step 3: Testing Supabase Connection"
echo "----------------------------------------"

node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  const { error } = await supabase.from('_test').select('*').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.log('❌ Connection failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase!');
})();
"

echo ""

# Step 4: Setup Database Table
echo "📊 Step 4: Creating Waitlist Table"
echo "------------------------------------"
echo ""
echo "⚠️  SQL Execution Required"
echo ""
echo "Options:"
echo ""
echo "  A) Supabase Dashboard (Recommended)"
echo "     1. Open: https://app.supabase.com"
echo "     2. Project: jhdrsyqayqoumvbukjps"
echo "     3. SQL Editor → New Query"
echo "     4. Copy-paste: WAITLIST_SETUP.sql"
echo "     5. Click 'Run'"
echo ""
echo "  B) Supabase CLI"
echo "     npm install -g supabase"
echo "     supabase link --project-ref jhdrsyqayqoumvbukjps"
echo "     supabase db push --file WAITLIST_SETUP.sql"
echo ""

read -p "Have you created the table? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Setup paused. Create the table first, then run:"
    echo "   ./test-waitlist.sh"
    exit 0
fi

echo ""

# Step 5: Run Tests
echo "🧪 Step 5: Running Tests"
echo "-------------------------"
echo ""

chmod +x test-waitlist.sh
./test-waitlist.sh

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "  1. Start dev server:"
echo "     npm run dev"
echo ""
echo "  2. Test form at:"
echo "     http://localhost:3000"
echo ""
echo "  3. View entries:"
echo "     https://app.supabase.com (Table Editor → waitlist)"
echo ""
echo "  4. Deploy to production:"
echo "     vercel --prod"
echo ""
