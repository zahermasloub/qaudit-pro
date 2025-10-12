import prisma from "@/lib/prisma";

async function testRegistrationWorkflow() {
  console.log("🧪 Testing Registration Workflow\n");

  try {
    // 1. Check database connectivity
    console.log("1. Testing database connectivity...");
    const ping = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log("   ✓ DB PING:", ping);

    // 2. Check if registration API user exists
    console.log("\n2. Checking for test user in database...");
    const testUser = await prisma.user.findUnique({
      where: { email: "test@test.com" },
      select: { id: true, email: true, name: true, password: true, role: true, createdAt: true }
    });

    if (testUser) {
      console.log("   ✓ Test user found:", {
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        passwordEncrypted: testUser.password.startsWith("$2b$"),
        createdAt: testUser.createdAt
      });
    } else {
      console.log("   ✗ Test user not found");
    }

    // 3. Check total user count
    const userCount = await prisma.user.count();
    console.log("\n3. Total users in database:", userCount);

    // 4. Create a new user to test registration functionality
    console.log("\n4. Creating new test user via Prisma...");

    // First delete if exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test2@test.com" }
    });

    if (existingUser) {
      await prisma.user.delete({ where: { email: "test2@test.com" } });
      console.log("   ✓ Deleted existing test2 user");
    }

    // Create new user (simulating what the API would do)
    const bcrypt = require("bcrypt");
    const hash = await bcrypt.hash("TestPass123!", 10);

    const newUser = await prisma.user.create({
      data: {
        email: "test2@test.com",
        name: "Test User 2",
        password: hash,
        role: "IA_Auditor",
        locale: "ar"
      },
      select: { id: true, email: true, name: true, role: true, password: true }
    });

    console.log("   ✓ New user created:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      passwordHashed: newUser.password.startsWith("$2b$"),
      passwordLength: newUser.password.length
    });

    // 5. Final verification
    console.log("\n5. Final verification:");
    const finalUserCount = await prisma.user.count();
    console.log("   Total users now:", finalUserCount);

    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, role: true, createdAt: true }
    });
    console.log("   All users:");
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });

    console.log("\n✅ Registration workflow test completed successfully!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

testRegistrationWorkflow().finally(() => process.exit(0));
