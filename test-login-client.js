// Simula esattamente cosa fa il browser quando fai login
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jhdrsyqayqoumvbukjps.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZHJzeXFheXFvdW12YnVranBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjg0NTAsImV4cCI6MjA4NjY0NDQ1MH0.AXiK6YLZ7Z26L_8p4deiDMBI-r5s2c2jspcda3O58mQ'
);

async function testLogin() {
  console.log('🔐 Testing login with biso@biso.com...\n');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'biso@biso.com',
    password: '123456'
  });

  if (error) {
    console.log('❌ LOGIN FAILED');
    console.log('Error:', error.message);
    return false;
  }

  if (data.user) {
    console.log('✅ LOGIN SUCCESS!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('Session token:', data.session?.access_token?.substring(0, 50) + '...');
    return true;
  }

  console.log('❌ Unknown response');
  return false;
}

testLogin();
