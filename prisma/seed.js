import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const SEED_EMAIL = "test@gmail.com";

/**
 * Seed script for manual user creation.
 * Creates RolePermission and User for Better Auth email OTP login.
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

  const existingUser = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
  });

  if (existingUser) {
    console.log("User already exists:", SEED_EMAIL);
  } else {
    await prisma.user.create({
      data: {
        email: SEED_EMAIL,
        name: "Test",
        rolePermissionId: role.id,
      },
    });
    console.log("Created user:", SEED_EMAIL);
  }

  console.log("Seed complete. Request OTP for:", SEED_EMAIL);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
