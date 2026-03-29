import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET meetings
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

// POST schedule a meeting
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (!body.leadId || !body.agenda || !body.meetingDate) {
      return NextResponse.json({ error: "leadId, agenda and meetingDate are required" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        leadId: body.leadId,
        userId: session.user.id,
        agenda: body.agenda,
        meetingDate: new Date(body.meetingDate),
      },
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, customerName: true, contactNumber: true } },
      },
    });

    // Add a comment to the lead about the meeting
    await prisma.comment.create({
      data: {
        leadId: body.leadId,
        userId: session.user.id,
        content: `📅 Meeting scheduled for ${new Date(body.meetingDate).toLocaleString("en-IN")} — ${body.agenda}`,
        type: "meeting",
      },
    });

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error("POST meeting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}