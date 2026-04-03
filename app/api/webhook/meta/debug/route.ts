import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Temporary debug endpoint — remove after fixing the webhook issue
// Usage: GET /api/webhook/meta/debug?leadgen_id=1486486759493480
export async function GET(req: NextRequest) {
  const leadgenId = req.nextUrl.searchParams.get("leadgen_id");

  if (!leadgenId) {
    return NextResponse.json({ error: "Missing leadgen_id query param" }, { status: 400 });
  }

  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  // Step 1: Check if DEFAULT_USER_ID exists in DB
  const defaultUserId = process.env.DEFAULT_USER_ID;
  let userExists = false;
  let userRecord: { id: string; email: string } | { error: string } | null = null;
  try {
    const found = await prisma.user.findUnique({ where: { id: defaultUserId! } });
    userExists = !!found;
    if (found) userRecord = { id: found.id, email: found.email };
  } catch (e) {
    userRecord = { error: String(e) };
  }

  // Step 2: Call Graph API and return raw response
  let graphApiResponse: Record<string, unknown> | null = null;
  let graphApiError: string | null = null;
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${accessToken}`
    );
    graphApiResponse = await response.json() as Record<string, unknown>;
  } catch (e) {
    graphApiError = String(e);
  }

  return NextResponse.json({
    debug: {
      defaultUserId,
      userExistsInDb: userExists,
      userRecord,
      graphApi: {
        url: `https://graph.facebook.com/v19.0/${leadgenId}`,
        response: graphApiResponse,
        error: graphApiError,
        hasFieldData: !!graphApiResponse?.field_data,
      },
    },
  });
}
