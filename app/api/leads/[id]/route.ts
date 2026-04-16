import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET single lead
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        teamMembers: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        meetings: {
          orderBy: { meetingDate: "asc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        activities: {
          orderBy: { activityDate: "desc" },
        },
      },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("GET lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update a lead
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.customerName && { customerName: body.customerName }),
        ...(body.contactNumber && { contactNumber: body.contactNumber }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.status && { status: body.status }),
        ...(body.temperature !== undefined && { temperature: body.temperature }),
        ...(body.activeStatus && { activeStatus: body.activeStatus }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo || null }),
        ...(body.followUpDate !== undefined && { followUpDate: body.followUpDate ? new Date(body.followUpDate) : null }),
        ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
        ...(body.briefScope !== undefined && { briefScope: body.briefScope }),
        ...(body.budgetRange !== undefined && { budgetRange: body.budgetRange }),
        ...(body.requirement !== undefined && { requirement: body.requirement }),
        ...(body.initialNotes !== undefined && { initialNotes: body.initialNotes }),
      },
    });
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("PATCH lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE a lead
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
