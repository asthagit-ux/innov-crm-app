import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Lead } from '@/generated/prisma/client';

export async function GET() {
  try {
    const INACTIVE_STATUSES = ['CLOSED_WON', 'CLOSED_LOST', 'JUNK'];
    const INACTIVE_STATUSES_SET = new Set(INACTIVE_STATUSES);
    const HOT_TEMPERATURE = 'HOT';

    const [totalLeads, hotLeads, activeLeads, recentLeadsRaw] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({
          where: {
            temperature: HOT_TEMPERATURE,
          },
        }),
        prisma.lead.count({
          where: {
            status: {
              notIn: INACTIVE_STATUSES,
            },
          },
        }),
        prisma.lead.findMany({
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            customerName: true,
            contactNumber: true,
            alternateContact: true,
            status: true,
            temperature: true,
            createdAt: true,
          },
        }),
      ]);

    const recentLeads = recentLeadsRaw.map((lead: Lead) => ({
      id: lead.id,
      name: lead.customerName,
      phone: lead.contactNumber ?? lead.alternateContact ?? null,
      email: null,
      status: lead.status,
      temperature: lead.temperature,
      isActive: !INACTIVE_STATUSES_SET.has(lead.status),
      createdAt: lead.createdAt,
    }));

    return NextResponse.json({
      data: {
        summary: {
          totalLeads,
          hotLeads,
          activeLeads,
        },
        recentLeads,
      },
    });
  } catch (error) {
    console.error('Failed to load dashboard data', error);

    return NextResponse.json(
      {
        message: 'Failed to load dashboard data',
      },
      {
        status: 500,
      }
    );
  }
}

