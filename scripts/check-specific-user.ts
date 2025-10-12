import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function checkSpecificUser() {
  const email = "crc.qa2222@gmail.com";
  const testPassword = "~Zaher@@2865052";
  
  try {
    console.log(`🔍 Checking user: ${email}\n`);
    
    // 1. Check if user exists
    const user = await prisma.user.findUnique({ 
      where: { email: email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true
      }
    });
    
    if (user) {
      console.log("✅ USER EXISTS:", user.email);
      console.log("📋 User Details:");
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Locale: ${user.locale}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Password Hash Length: ${user.password.length}`);
      console.log(`   Password Hash Sample: ${user.password.substring(0, 20)}...`);
      console.log(`   Is Bcrypt Hash: ${user.password.startsWith("$2b$") || user.password.startsWith("$2a$")}`);
      
      // 2. Test password verification
      console.log("\n🔐 Testing password verification:");
      try {
        const isValidPassword = await bcrypt.compare(testPassword, user.password);
        console.log(`   Password "${testPassword}" is ${isValidPassword ? "VALID ✅" : "INVALID ❌"}`);
        
        // Test with different variations
        const variations = [
          testPassword.trim(),
          testPassword.toLowerCase(),
          testPassword.toUpperCase(),
        ];
        
        for (const variation of variations) {
          if (variation !== testPassword) {
            const isValid = await bcrypt.compare(variation, user.password);
            console.log(`   Variation "${variation}" is ${isValid ? "VALID ✅" : "INVALID ❌"}`);
          }
        }
        
      } catch (bcryptError) {
        console.log(`   ❌ Bcrypt error: ${bcryptError}`);
      }
      
    } else {
      console.log("❌ USER NOT FOUND:", email);
      
      // Check if there's a similar email
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: email.split('@')[0] // Check username part
          }
        },
        select: { email: true, name: true }
      });
      
      if (similarUsers.length > 0) {
        console.log("🔍 Similar users found:");
        similarUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`));
      }
    }
    
    // 3. Show all users for debugging
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, createdAt: true }
    });
    
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log("All users:");
    allUsers.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.email} (${u.name}) - ${u.createdAt}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkSpecificUser().finally(() => process.exit(0));