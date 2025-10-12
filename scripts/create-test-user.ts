import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    console.log("Creating test user...");

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: "test@test.com" }
    });

    if (existing) {
      console.log("User already exists, deleting first...");
      await prisma.user.delete({
        where: { email: "test@test.com" }
      });
    }

    // Create new user
    const hash = await bcrypt.hash("Passw0rd!", 10);
    const user = await prisma.user.create({
      data: {
        email: "test@test.com",
        name: "Test User",
        password: hash,
        role: "IA_Auditor",
        locale: "ar"
      }
    });

    console.log("✓ Test user created successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.password.substring(0, 20) + "...",
      passwordStartsWithBcrypt: user.password.startsWith("$2b$")
    });

  } catch (error) {
    console.error("✗ Error creating test user:", error);
  }
}

createTestUser().finally(() => process.exit(0));
