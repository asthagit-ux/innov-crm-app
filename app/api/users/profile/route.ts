import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth();
  if (!user) return response!;

  const id = new URL(req.url).searchParams.get('id') ?? user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id },
    select: { name: true, rolePermission: { select: { role: true } } },
  });

  if (!dbUser) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({ name: dbUser.name, role: dbUser.rolePermission.role });
}
