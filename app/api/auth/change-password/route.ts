import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;

    const account = await prisma.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { id: true, password: true },
    });

    if (!account?.password) {
      return NextResponse.json(
        { success: false, error: "No password set for this account." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, account.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedNew },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("change-password error:", error);
    return NextResponse.json(
      { success: false, error: "Could not change password." },
      { status: 500 }
    );
  }
}
