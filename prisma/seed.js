import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const SEED_EMAIL = "test@gmail.com";
const SEED_PASSWORD = "123456";

/**
 * Seed script for manual user creation.
 * Creates RolePermission, User, and Account for Better Auth email/password login.
 * Uses Account table (Better Auth); password hashed with better-auth/crypto.
 * Run with: npx prisma db seed
 */
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  const role = await prisma.rolePermission.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      role: "ADMIN",
      permissions: [],
    },
    update: { role: "ADMIN" },
  });

  const hashedPassword = await hashPassword(SEED_PASSWORD);

  const existingUser = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
    include: { userAuth: true },
  });

  if (existingUser) {
    if (existingUser.userAuth) {
      await prisma.userAuth.update({
        where: { id: existingUser.userAuth.id },
        data: { password: hashedPassword },
      });
      console.log("Updated password for existing user:", SEED_EMAIL);
    } else {
      await prisma.userAuth.create({
        data: {
          userId: existingUser.id,
          accountId: SEED_EMAIL,
          providerId: "credential",
          password: hashedPassword,
        },
      });
      console.log("Created UserAuth for existing user:", SEED_EMAIL);
    }
  } else {
    await prisma.user.create({
      data: {
        email: SEED_EMAIL,
        name: "Test",
        rolePermissionId: role.id,
        userAuth: {
          create: {
            accountId: SEED_EMAIL,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    });
    console.log("Created user:", SEED_EMAIL);
  }

  console.log("Seed complete. Login with:", SEED_EMAIL, "| Password:", SEED_PASSWORD);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
