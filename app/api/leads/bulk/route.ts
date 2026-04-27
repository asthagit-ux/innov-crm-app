import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const body = await req.json();
    const { ids, data } = body as { ids: string[]; data: Record<string, string | null> };

    if (!ids?.length || !data) {
      return NextResponse.json({ error: "ids and data are required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.temperature !== undefined) updateData.temperature = data.temperature;
    if (data.activeStatus) updateData.activeStatus = data.activeStatus;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: { count: result.count } });
  } catch (error) {
    console.error("PATCH bulk leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
