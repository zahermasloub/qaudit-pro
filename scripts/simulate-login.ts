// Complete login simulation test
async function simulateLogin() {
  const loginData = {
    email: 'crc.qa2222@gmail.com',
    password: '~Zaher@@2865052',
  };

  console.log('🔐 Simulating Complete Login Flow');
  console.log('='.repeat(50));
  console.log(`Email: ${loginData.email}`);
  console.log(
    `Password: ${'*'.repeat(loginData.password.length)} (${loginData.password.length} chars)`,
  );
  console.log('');

  try {
    // Step 1: Test NextAuth API directly
    console.log('1️⃣ Testing NextAuth API endpoint...');

    const authResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: loginData.email,
        password: loginData.password,
        csrfToken: 'test', // We'll use a test token
        callbackUrl: '/shell',
        json: 'true',
      }),
    });

    console.log(`   Response Status: ${authResponse.status}`);
    console.log(`   Response OK: ${authResponse.ok}`);

    if (authResponse.ok) {
      const authResult = await authResponse.json();
      console.log('   ✅ NextAuth API Response:', authResult);
    } else {
      const errorText = await authResponse.text();
      console.log('   ❌ NextAuth API Error:', errorText.substring(0, 200));
    }
  } catch (error) {
    console.error('🚫 Login simulation error:', error);
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Make sure the development server is running: npm run dev');
    console.log('2. Check database connection');
    console.log('3. Verify user exists in database');
    console.log('4. Check NextAuth configuration');
  }

  console.log('\n' + '='.repeat(50));
}

// Wait a bit for server to be ready, then run
setTimeout(simulateLogin, 2000);
