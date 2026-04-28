import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    const meetings = await prisma.meeting.findMany({
      where: leadId ? { leadId } : {},
      orderBy: { meetingDate: "asc" },
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, customerName: true, contactNumber: true } },
      },
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error("GET meetings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const body = await req.json();
    if (!body.leadId || !body.agenda || !body.meetingDate) {
      return NextResponse.json({ error: "leadId, agenda and meetingDate are required" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        leadId: body.leadId,
        userId: user.id,
        agenda: body.agenda,
        meetingDate: new Date(body.meetingDate),
      },
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, customerName: true, contactNumber: true } },
      },
    });

    await prisma.comment.create({
      data: {
        leadId: body.leadId,
        userId: user.id,
        content: `📅 Meeting scheduled for ${new Date(body.meetingDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} — ${body.agenda}`,
        type: "meeting",
      },
    });

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error("POST meeting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const body = await req.json();
    if (!body.id || !body.agenda || !body.meetingDate) {
      return NextResponse.json({ error: "id, agenda and meetingDate are required" }, { status: 400 });
    }

    const meeting = await prisma.meeting.update({
      where: { id: body.id },
      data: {
        agenda: body.agenda,
        meetingDate: new Date(body.meetingDate),
        reminderSent: false,
      },
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, customerName: true, contactNumber: true } },
      },
    });

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error("PATCH meeting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await requireAuth();
    if (!user) return response!;

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.meeting.delete({ where: { id: body.id } });

    return NextResponse.json({ success: true, data: { deletedId: body.id } });
  } catch (error) {
    console.error("DELETE meeting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
