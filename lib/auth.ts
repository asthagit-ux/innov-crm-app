import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

/**
 * Better Auth server configuration.
 * - Email/password sign-in only; sign-up disabled (users seeded manually).
 * - nextCookies plugin enables cookie setting from Server Actions.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    modelName: "User",
    fields: {
      image: "avatarUrl",
    },
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "userAuth",
  },
  verification: {
    modelName: "Verification",
  },
  plugins: [nextCookies()],
});