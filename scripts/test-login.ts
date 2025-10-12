import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function testLoginFunctionality() {
  console.log("🔐 Testing Login Functionality\n");

  try {
    // Test password verification
    console.log("1. Testing password verification...");

    const user = await prisma.user.findUnique({
      where: { email: "test@test.com" }
    });

    if (user) {
      // Test correct password
      const correctPassword = await bcrypt.compare("Passw0rd!", user.password);
      console.log(`   ✅ Correct password verification: ${correctPassword ? "PASS" : "FAIL"}`);

      // Test incorrect password
      const incorrectPassword = await bcrypt.compare("wrongpassword", user.password);
      console.log(`   ✅ Incorrect password rejection: ${!incorrectPassword ? "PASS" : "FAIL"}`);

      console.log("\n2. User login data:");
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Locale: ${user.locale}`);

      console.log("\n✅ Login functionality test completed!");
      console.log("\n📌 To test complete login flow:");
      console.log("   1. Open http://localhost:3001/auth/login");
      console.log("   2. Use email: test@test.com");
      console.log("   3. Use password: Passw0rd!");
      console.log("   4. Should redirect to /shell after successful login");

    } else {
      console.log("   ❌ Test user not found");
    }

  } catch (error) {
    console.error("\n❌ Login test failed:", error);
  }
}

testLoginFunctionality().finally(() => process.exit(0));
