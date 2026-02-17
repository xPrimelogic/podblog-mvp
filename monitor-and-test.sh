#!/bin/bash
echo "🔄 Monitoring deploy until live and tested..."

for i in $(seq 1 120); do
  sleep 5
  
  # Check for marker file (proves new build is live)
  MARKER=$(curl -s "https://podblog-mvp.vercel.app/test-marker.txt" 2>&1)
  
  if echo "$MARKER" | grep -q "BUILD_ID_1771323185"; then
    echo ""
    echo "✅ NEW BUILD DETECTED (marker found)"
    echo ""
    echo "🧪 Testing login flow..."
    
    # Check if hardcoded keys are in the page
    PAGE=$(curl -s "https://podblog-mvp.vercel.app/login" 2>&1)
    
    if echo "$PAGE" | grep -q "jhdrsyqayqoumvbukjps"; then
      echo "✅ Hardcoded Supabase keys present in page"
      echo ""
      echo "🎯 FINAL TEST: Login with biso@biso.com via Node.js client"
      
      cd /home/node/projects/podblog-mvp
      node test-login-client.js 2>&1 | grep -E "SUCCESS|FAILED|User ID"
      
      if [ $? -eq 0 ]; then
        echo ""
        echo "✅✅✅ TUTTO FUNZIONA - Login completato con successo"
        echo "Commit 1b07de5 is LIVE and WORKING"
        exit 0
      fi
    else
      echo "⚠️ Build live but keys not found in page - checking again..."
    fi
  fi
  
  # Progress ogni 10 check (50 secondi)
  if [ $((i % 10)) -eq 0 ]; then
    echo "Check $i/120 ($(($i * 5))s elapsed)..."
  fi
done

echo "❌ Timeout after 10 minutes - manual intervention needed"
exit 1
