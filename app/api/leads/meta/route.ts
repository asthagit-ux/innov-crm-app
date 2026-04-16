import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [platformRows, sourceRows] = await Promise.all([
      prisma.lead.findMany({
        select: { platform: true },
        distinct: ["platform"],
        orderBy: { platform: "asc" },
      }),
      prisma.lead.findMany({
        select: { leadSource: true },
        distinct: ["leadSource"],
        where: { leadSource: { not: null } },
        orderBy: { leadSource: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      platforms: platformRows.map((r: { platform: string }) => r.platform).filter(Boolean),
      sources: sourceRows.map((r: { leadSource: string | null }) => r.leadSource).filter(Boolean),
    });
  } catch (error) {
    console.error("GET leads meta error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
