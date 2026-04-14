import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

/**
 * Migration script: set a default password for all existing users
 * who were created before the email+password auth switch and have
 * no credential Account record.
 *
 * Default password: Innov@2024
 * Users should change this on first login.
 *
 * Run with: node prisma/migrate-passwords.js
 */

const DEFAULT_PASSWORD = "Innov@2024";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  // Ensure USER role exists alongside ADMIN
  await prisma.rolePermission.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      role: "USER",
      permissions: [],
    },
    update: { role: "USER" },
  });
  console.log("✅ USER role ensured.");

  // Find all users without a credential account
  const usersWithoutCredential = await prisma.user.findMany({
    where: {
      accounts: {
        none: {
          providerId: "credential",
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (usersWithoutCredential.length === 0) {
    console.log("✅ All users already have a credential account. Nothing to migrate.");
    await pool.end();
    return;
  }

  console.log(`\nFound ${usersWithoutCredential.length} user(s) without a password:\n`);

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const user of usersWithoutCredential) {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email,
        providerId: "credential",
        password: hashedPassword,
      },
    });
    console.log(`  ✅ ${user.name} (${user.email})`);
  }

  console.log(`
Migration complete.
─────────────────────────────────────────
Default password set for all users above:

  ${DEFAULT_PASSWORD}

⚠️  Share this password directly with each
    user and ask them to change it after
    their first login.
─────────────────────────────────────────`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
