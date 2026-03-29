import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET || "innov_cron_2024";

export async function GET(req: NextRequest) {
  // Security check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get today's date range in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const startOfDay = new Date(istNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(istNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert back to UTC for DB query
    const utcStart = new Date(startOfDay.getTime() - istOffset);
    const utcEnd = new Date(endOfDay.getTime() - istOffset);

    // Find leads with follow-up date today
    const leads = await prisma.lead.findMany({
      where: {
        followUpDate: {
          gte: utcStart,
          lte: utcEnd,
        },
        activeStatus: "ACTIVE",
      },
      include: {
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({ success: true, message: "No follow-ups today" });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const results = [];

    for (const lead of leads) {
      const recipientEmail = lead.assignedUser?.email || process.env.SMTP_FROM;
      const recipientName = lead.assignedUser?.name || "Team";

      if (!recipientEmail) continue;

      await transporter.sendMail({
        from: `"Innov CRM" <${process.env.SMTP_FROM}>`,
        to: recipientEmail,
        subject: `📅 Follow-up Reminder: ${lead.customerName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f0f; color: #fff; border-radius: 12px;">
            <div style="margin-bottom: 24px;">
              <h1 style="font-size: 20px; color: #c9a84c; margin: 0;">📅 Follow-up Reminder</h1>
              <p style="color: #888; margin: 4px 0 0;">Innov CRM · ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <p style="margin: 0 0 16px;">Hi ${recipientName},</p>
            <p style="margin: 0 0 16px;">You have a follow-up scheduled today with:</p>
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${lead.customerName}</p>
              <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${lead.contactNumber || '—'}</p>
              <p style="margin: 0 0 8px;"><strong>City:</strong> ${lead.city || '—'}</p>
              <p style="margin: 0 0 8px;"><strong>Property:</strong> ${lead.propertyType || '—'}</p>
              <p style="margin: 0;"><strong>Budget:</strong> ${lead.budgetRange || '—'}</p>
            </div>
            <a href="https://innov-crm-app.vercel.app/admin/leads/${lead.id}" 
               style="display: inline-block; background: #c9a84c; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Lead →
            </a>
            <p style="margin: 24px 0 0; color: #555; font-size: 12px;">Innov CRM · innov-crm-app.vercel.app</p>
          </div>
        `,
      });

      results.push({ lead: lead.customerName, sentTo: recipientEmail });
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${results.length} reminder(s)`,
      results,
    });

  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}