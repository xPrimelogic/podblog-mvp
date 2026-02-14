#!/bin/bash

echo "🚀 Deploying PodBlog MVP to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build and deploy
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🌐 Deploying to Vercel..."

# Deploy to production
vercel --prod --token=$VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "   1. Update Supabase Auth URLs in dashboard"
    echo "   2. Test signup/login flow"
    echo "   3. Test podcast upload"
    echo "   4. Verify limits are working"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi
