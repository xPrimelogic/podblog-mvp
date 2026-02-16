#!/bin/bash
# Test MVP Complete Features

echo "🧪 Testing PodBlog MVP Complete Features..."

BASE_URL="http://localhost:3000"

# Test 1: Social Content Generation
echo "1️⃣ Testing social content..."
curl -s -X POST $BASE_URL/api/generate-social \
  -H "Content-Type: application/json" \
  -d '{"articleId":"test","transcript":"test"}' | jq .

# Test 2: Quote Cards
echo "2️⃣ Testing quote cards..."
curl -s -X POST $BASE_URL/api/generate-quotes \
  -H "Content-Type: application/json" \
  -d '{"transcript":"This is a great quote"}' | jq .

# Test 3: Newsletter
echo "3️⃣ Testing newsletter..."
curl -s -X POST $BASE_URL/api/generate-newsletter \
  -H "Content-Type: application/json" \
  -d '{"articleId":"test"}' | jq .

echo "✅ Tests complete"
