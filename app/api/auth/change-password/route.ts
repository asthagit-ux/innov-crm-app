import { NextResponse } from "next/server";
import { requireAuth, adminClient } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const admin = adminClient();
    const { error } = await admin.auth.admin.updateUserById(user.id, { password: newPassword });

    if (error) {
      console.error("change-password error:", error);
      return NextResponse.json({ success: false, error: "Could not change password." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("change-password error:", error);
    return NextResponse.json({ success: false, error: "Could not change password." }, { status: 500 });
  }
}
