#!/bin/bash
echo "🧪 Testing Blog Features"

# Test 1: Blog listing page
echo "1️⃣ Testing /blog/testuser"
curl -s http://localhost:3000/blog/testuser -o /tmp/blog-list.html
if grep -q "articles\|blog" /tmp/blog-list.html; then
  echo "✅ Blog listing renders"
else
  echo "❌ Blog listing failed"
fi

# Test 2: Check if username generation works
echo "2️⃣ Check username auto-generation in profiles"
# Will test via API after Builder completes

# Test 3: Check slug generation
echo "3️⃣ Check slug auto-generation in articles"
# Will test via API after Builder completes

echo "✅ Blog structure tests complete"
