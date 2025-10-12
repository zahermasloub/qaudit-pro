import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function testAuthentication() {
  const email = "crc.qa2222@gmail.com";
  const password = "~Zaher@@2865052";
  
  console.log("🔐 Testing Authentication Flow\n");
  console.log(`Testing login for: ${email}`);
  
  try {
    // 1. Find user in database
    console.log("1️⃣ Looking up user in database...");
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log("❌ User not found in database");
      return;
    }
    
    console.log("✅ User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Password Hash: ${user.password.substring(0, 30)}...`);
    
    // 2. Test password comparison
    console.log("\n2️⃣ Testing password verification...");
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(`   Input password: "${password}"`);
    console.log(`   Password length: ${password.length} characters`);
    console.log(`   Hash comparison result: ${passwordMatch ? "✅ MATCH" : "❌ NO MATCH"}`);
    
    // 3. Test what NextAuth authorize function would return
    console.log("\n3️⃣ Simulating NextAuth authorize function...");
    if (passwordMatch) {
      const authResult = {
        id: user.id,
        name: user.email,
        email: user.email,
        role: user.role,
        locale: user.locale
      };
      console.log("✅ NextAuth would return:", authResult);
    } else {
      console.log("❌ NextAuth would return: null (authentication failed)");
    }
    
    // 4. Debug common issues
    console.log("\n🔍 Debug Information:");
    console.log(`   Email case: "${email}" (should be lowercase)`);
    console.log(`   Email in DB: "${user.email}"`);
    console.log(`   Emails match: ${email === user.email}`);
    console.log(`   Password special chars: ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)}`);
    console.log(`   Hash algorithm: ${user.password.startsWith("$2b$") ? "bcrypt" : "unknown"}`);
    
    // 5. Test different password variations
    console.log("\n🧪 Testing password variations:");
    const variations = [
      password,
      password.trim(),
      password.replace(/\s+/g, ''),
    ];
    
    for (const variation of variations) {
      if (variation !== password) {
        const match = await bcrypt.compare(variation, user.password);
        console.log(`   "${variation}": ${match ? "✅ MATCH" : "❌ NO MATCH"}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Authentication test error:", error);
  }
}

testAuthentication().finally(() => process.exit(0));