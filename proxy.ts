import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Protects routes under (main) by redirecting unauthenticated users to /login.
 * Matches /dashboard and any future protected routes.
 */
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
