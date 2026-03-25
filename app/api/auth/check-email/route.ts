import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Maps Prisma / DB errors to a stable API code for client + ops debugging.
 * Does not expose connection strings or stack traces.
 */
function getPublicDbFailureCode(error: unknown) {
  const err = error as { code?: string };
  const prismaCode = typeof err.code === "string" ? err.code : undefined;

  switch (prismaCode) {
    case "P1000":
      return { code: "DB_AUTH_FAILED", prismaCode };
    case "P1001":
      return { code: "DB_UNREACHABLE", prismaCode };
    case "P1002":
      return { code: "DB_CONNECTION_TIMEOUT", prismaCode };
    case "P1003":
      return { code: "DB_NOT_FOUND", prismaCode };
    case "P1017":
      return { code: "DB_SERVER_CLOSED", prismaCode };
    default:
      return { code: "DB_QUERY_FAILED", prismaCode };
  }
}

/**
 * Checks whether a user email exists for sign-in-only OTP flow.
 * This endpoint does not create users and is only for pre-checking login eligibility.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL?.trim()) {
      console.error({
        fn: "POST /api/auth/check-email",
        code: "MISSING_DATABASE_URL",
        hint: "Set DATABASE_URL in Vercel Project Settings → Environment Variables for Production.",
      });
      return NextResponse.json(
        {
          success: false,
          error: "Could not verify email right now.",
          code: "MISSING_DATABASE_URL",
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      exists: Boolean(existingUser),
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    const { code, prismaCode } = getPublicDbFailureCode(error);
    console.error({
      fn: "POST /api/auth/check-email",
      message: err?.message ?? String(error),
      code: err?.code,
      publicCode: code,
      prismaCode: prismaCode ?? err?.code,
      error,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Could not verify email right now.",
        code,
        ...(prismaCode ? { prismaCode } : {}),
      },
      { status: 500 },
    );
  }
}
