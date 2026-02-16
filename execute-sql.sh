#!/bin/bash

SQL_FILE="SUPABASE_SETUP.sql"
SUPABASE_URL="https://jhdrsyqayqoumvbukjps.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2ODQ1MCwiZXhwIjoyMDg2NjQ0NDUwfQ.UBApqn13u-IkxCVzv0OdI23djjR44oBnnC4oA9dus7c"

echo "🚀 Executing Supabase SQL schema..."
echo ""

# Read SQL file and execute via REST API
SQL_CONTENT=$(cat "$SQL_FILE")

# Use psql if available, fallback to manual
if command -v psql &> /dev/null; then
    echo "✅ psql found, executing directly..."
    
    # Extract connection from Supabase URL
    PGHOST="db.jhdrsyqayqoumvbukjps.supabase.co"
    PGDATABASE="postgres"
    PGUSER="postgres"
    
    echo "📝 Connect with:"
    echo "  psql postgresql://postgres:[PASSWORD]@$PGHOST:5432/$PGDATABASE"
    echo ""
    echo "❌ Password needed. Please execute SQL manually:"
    echo "  https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql/new"
else
    echo "❌ psql not available"
    echo ""
    echo "📝 Please execute SQL manually in Supabase Dashboard:"
    echo "  https://supabase.com/dashboard/project/jhdrsyqayqoumvbukjps/sql/new"
    echo ""
    echo "SQL file: $SQL_FILE"
fi
