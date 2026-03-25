import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client";

const { Pool } = pg;

/**
 * Detect Neon pooled/direct hostnames so we use the serverless driver.
 * node-pg opens raw TCP; on Vercel that often surfaces as Prisma P1001 against Neon.
 * @param {string | undefined} url
 */
function isNeonDatabaseUrl(url) {
  return typeof url === "string" && url.toLowerCase().includes("neon.tech");
}

/**
 * Creates one Prisma client instance for the app.
 * Neon uses @prisma/adapter-neon (WebSocket/fetch); other Postgres uses pg Pool + PrismaPg.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  const log =
    process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

  if (isNeonDatabaseUrl(url)) {
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter, log });
  }

  const connectionPool = new Pool({
    connectionString: url,
  });

  return new PrismaClient({
    adapter: new PrismaPg(connectionPool),
    log,
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
