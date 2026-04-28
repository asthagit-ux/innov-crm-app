import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuthWithRole } from "@/lib/api-auth";

// GET single lead
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user, role, response } = await requireAuthWithRole();
    if (!user) return response!;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        teamMembers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
        meetings: {
          orderBy: { meetingDate: "asc" },
          include: { user: { select: { id: true, name: true } } },
        },
        activities: { orderBy: { activityDate: "desc" } },
      },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    // USER can only view leads assigned to them
    if (role === "USER" && lead.assignedTo !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
    const { user, role, response } = await requireAuthWithRole();
    if (!user) return response!;

    // USER can only update leads assigned to them, and cannot reassign
    if (role === "USER") {
      const existing = await prisma.lead.findUnique({ where: { id }, select: { assignedTo: true } });
      if (!existing || existing.assignedTo !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

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
        // Only ADMIN can reassign leads
        ...(role === "ADMIN" && body.assignedTo !== undefined && { assignedTo: body.assignedTo || null }),
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

// DELETE a lead — ADMIN only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user, role, response } = await requireAuthWithRole();
    if (!user) return response!;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
