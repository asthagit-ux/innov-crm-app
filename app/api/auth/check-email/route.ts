import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Checks whether a user email exists for sign-in-only OTP flow.
 * This endpoint does not create users and is only for pre-checking login eligibility.
 */
export async function POST(request: Request) {
  try {
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
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not verify email right now." },
      { status: 500 },
    );
  }
}
