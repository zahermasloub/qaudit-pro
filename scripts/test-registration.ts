// Simple test script for the registration API
console.log("Testing registration API...");

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        name: 'Test User',
        password: 'Passw0rd!'
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (result.ok) {
      console.log('✓ Registration successful!');
      console.log('User created:', result.user);
    } else {
      console.log('✗ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Run after a short delay to ensure server is up
setTimeout(testRegistration, 2000);
