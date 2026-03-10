import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client";

const { Pool } = pg;

/**
 * Creates one Prisma client instance for the app.
 * This avoids opening extra database connections during hot reloads in development.
 */
function createPrismaClient() {
  const connectionPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter: new PrismaPg(connectionPool),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * Reuses the Prisma client across server reloads in development.
 * Next.js refreshes modules often, so caching the instance prevents connection leaks.
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
