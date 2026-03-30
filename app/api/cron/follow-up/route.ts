import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const CRON_SECRET = process.env.CRON_SECRET || "innov_cron_2024";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const startOfDay = new Date(nowIST);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(nowIST);
    endOfDay.setHours(23, 59, 59, 999);

    const allLeadsWithFollowUp = await prisma.lead.findMany({
      where: { followUpDate: { not: null } },
      select: { id: true, customerName: true, followUpDate: true },
    });

    const leads = await prisma.lead.findMany({
      where: {
        followUpDate: {
          gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
          lte: new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        assignedUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No follow-ups today",
        debug: {
          nowIST: nowIST.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          allLeadsWithFollowUp,
        },
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
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
            <h1 style="font-size: 20px; color: #c9a84c; margin: 0 0 8px;">📅 Follow-up Reminder</h1>
            <p style="color: #888; margin: 0 0 16px;">Innov CRM</p>
            <p>Hi ${recipientName},</p>
            <p>You have a follow-up scheduled today with:</p>
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${lead.customerName}</p>
              <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${lead.contactNumber || '—'}</p>
              <p style="margin: 0 0 8px;"><strong>City:</strong> ${lead.city || '—'}</p>
              <p style="margin: 0;"><strong>Budget:</strong> ${lead.budgetRange || '—'}</p>
            </div>
            <a href="https://innov-crm-app.vercel.app/admin/leads/${lead.id}" 
               style="display: inline-block; background: #c9a84c; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Lead →
            </a>
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