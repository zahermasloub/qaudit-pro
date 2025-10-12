import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function createUserDirectly() {
  const userData = {
    email: "crc.qa2222@gmail.com",
    name: "CRC User",
    password: "~Zaher@@2865052"
  };

  try {
    console.log(`🔧 Creating user directly in database: ${userData.email}\n`);
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existing) {
      console.log("⚠️ User already exists, deleting first...");
      await prisma.user.delete({
        where: { email: userData.email }
      });
      console.log("✅ Existing user deleted");
    }
    
    // Create new user with bcrypt hash
    console.log("🔐 Hashing password...");
    const hash = await bcrypt.hash(userData.password, 10);
    console.log(`✅ Password hashed: ${hash.substring(0, 20)}...`);
    
    console.log("💾 Creating user in database...");
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hash,
        role: "IA_Auditor",
        locale: "ar"
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true,
        createdAt: true,
        password: true
      }
    });
    
    console.log("✅ User created successfully!");
    console.log("📋 User Details:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Locale: ${user.locale}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
    
    // Test password verification
    console.log("\n🧪 Testing password verification...");
    const isValid = await bcrypt.compare(userData.password, user.password);
    console.log(`   Password verification: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
    
    console.log("\n🎉 User creation completed!");
    console.log("📌 You can now login with:");
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log("   URL: http://localhost:3001/auth/login");
    
  } catch (error) {
    console.error("❌ Error creating user:", error);
  }
}

createUserDirectly().finally(() => process.exit(0));