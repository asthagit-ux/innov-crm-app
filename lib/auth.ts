import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import prisma from "./prisma";
import { sendOtpEmail } from "./otp-email";

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
  plugins: [
    emailOTP({
      disableSignUp: true,
      expiresIn: 300,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== "sign-in") {
          return;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (!existingUser) {
          throw new Error("No account found for this email.");
        }

        await sendOtpEmail({
          email,
          otp,
        });
      },
    }),
    nextCookies(),
  ],
});