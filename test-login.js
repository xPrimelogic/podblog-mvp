const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testLogin() {
  console.log('Testing login with biso@biso.com...');
  
  // Test API route
  const res = await fetch(`${SUPABASE_URL.replace('supabase.co', 'vercel.app')}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'biso@biso.com',
      password: '123456'
    })
  });
  
  const data = await res.json();
  console.log('Response:', data);
  console.log('Status:', res.status);
  console.log('Cookies:', res.headers.get('set-cookie'));
  
  if (data.user) {
    console.log('✅ LOGIN SUCCESS');
    return true;
  } else {
    console.log('❌ LOGIN FAILED:', data.error);
    return false;
  }
}

testLogin();
