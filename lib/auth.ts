import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

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
  user: {
    modelName: "User",
    fields: {
      image: "avatarUrl",
    },
  },
  session: {
    modelName: "Session",
  },
  verification: {
    modelName: "Verification",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // no public self-signup; admin creates users
    password: {
      hash: (password: string) => bcrypt.hash(password, 10),
      verify: ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },
  plugins: [nextCookies()],
});
