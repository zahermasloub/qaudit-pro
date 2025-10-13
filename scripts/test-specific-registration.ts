// Test registration API directly
async function testSpecificRegistration() {
  const userData = {
    email: 'crc.qa2222@gmail.com',
    name: 'Test User CRC',
    password: '~Zaher@@2865052',
  };

  console.log('🧪 Testing Registration API');
  console.log('Data to send:', {
    email: userData.email,
    name: userData.name,
    passwordLength: userData.password.length,
  });

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`\n📡 Response Status: ${response.status}`);

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📋 Response Body:', result);

    if (result.ok) {
      console.log('✅ Registration successful!');
      console.log('👤 User created:', result.user);
    } else {
      console.log('❌ Registration failed!');
      console.log('🚨 Error:', result.error);

      // Explain common error codes
      switch (result.error) {
        case 'email/password required':
          console.log('💡 Solution: Make sure both email and password are provided');
          break;
        case 'invalid_email_format':
          console.log('💡 Solution: Check email format');
          break;
        case 'password_too_short':
          console.log('💡 Solution: Password must be at least 6 characters');
          break;
        case 'user_exists':
          console.log('💡 Solution: User with this email already exists');
          break;
        default:
          console.log('💡 Solution: Check server logs for detailed error');
      }
    }
  } catch (error) {
    console.error('🚫 Network/Connection Error:', error);
    console.log('💡 Make sure the development server is running on localhost:3001');
  }
}

// Run the test
testSpecificRegistration();
