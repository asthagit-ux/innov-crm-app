import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET all leads
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
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
          take: 1,
        },
        meetings: {
          orderBy: { meetingDate: "asc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("GET leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create a new lead
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const lead = await prisma.lead.create({
      data: {
        customerName: body.customerName,
        contactNumber: body.contactNumber,
        alternateContact: body.alternateContact,
        email: body.email,
        state: body.state,
        city: body.city,
        platform: body.platform || "Meta Ads",
        leadSource: body.leadSource || "Meta Ads",
        status: body.status || "NEW",
        temperature: body.temperature,
        activeStatus: body.activeStatus || "ACTIVE",
        assignedTo: body.assignedTo,
        leadCreatedDate: body.leadCreatedDate ? new Date(body.leadCreatedDate) : new Date(),
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        propertyType: body.propertyType,
        briefScope: body.briefScope,
        budgetRange: body.budgetRange,
        requirement: body.requirement,
        initialNotes: body.initialNotes,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("POST lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
