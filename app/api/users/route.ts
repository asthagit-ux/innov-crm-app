import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.email('Please provide a valid email address.').transform((value) =>
    value.trim().toLowerCase()
  ),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

const updateUserSchema = z.object({
  id: z.string().trim().uuid('Invalid user id.'),
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.email('Please provide a valid email address.').transform((value) =>
    value.trim().toLowerCase()
  ),
});

const deleteUserSchema = z.object({
  id: z.string().trim().uuid('Invalid user id.'),
});

async function requireAdmin(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        ),
      };
    }

    const sessionUserId =
      (session.user as { id?: string | null } | undefined)?.id ?? null;
    const sessionEmail =
      (session.user as { email?: string | null } | undefined)?.email ?? null;

    const sessionDbUser = await prisma.user.findFirst({
      where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail ?? '' },
      select: {
        id: true,
        rolePermission: {
          select: { role: true },
        },
      },
    });

    if (!sessionDbUser || sessionDbUser.rolePermission.role !== 'ADMIN') {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, userId: sessionDbUser.id };
  } catch (error) {
    console.error({ fn: 'requireAdmin', error });
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Authorization failed', code: 'AUTH_FAILED' },
        { status: 500 }
      ),
    };
  }
}

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) return adminCheck.response;

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        rolePermission: {
          select: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(
          (user: {
            id: string;
            name: string;
            email: string;
            createdAt: Date;
            rolePermission: { role: string };
          }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: user.rolePermission.role,
          })
        ),
      },
    });
  } catch (error) {
    console.error({ fn: 'GET /api/users', error });
    return NextResponse.json(
      { success: false, error: 'Could not load users right now.', code: 'USERS_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) return adminCheck.response;

    const payload = await request.json();
    const parsed = createUserSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? 'Invalid user payload.',
          code: 'INVALID_USER_PAYLOAD',
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists.', code: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    const rolePermission = await prisma.rolePermission.findFirst({
      where: { role },
      select: { id: true },
    });

    if (!rolePermission) {
      return NextResponse.json(
        {
          success: false,
          error: `${role} role is not configured yet.`,
          code: 'ROLE_NOT_CONFIGURED',
        },
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        rolePermissionId: rolePermission.id,
        accounts: {
          create: {
            accountId: email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            ...user,
            role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error({ fn: 'POST /api/users', error });
    return NextResponse.json(
      { success: false, error: 'Could not create user right now.', code: 'USER_CREATE_FAILED' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) return adminCheck.response;

    const payload = await request.json();
    const parsed = updateUserSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? 'Invalid update payload.',
          code: 'INVALID_UPDATE_PAYLOAD',
        },
        { status: 400 }
      );
    }

    const { id, name, email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const conflictingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (conflictingUser && conflictingUser.id !== id) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists.', code: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error({ fn: 'PATCH /api/users', error });
    return NextResponse.json(
      { success: false, error: 'Could not update user right now.', code: 'USER_UPDATE_FAILED' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) return adminCheck.response;

    const payload = await request.json();
    const parsed = deleteUserSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue?.message ?? 'Invalid delete payload.',
          code: 'INVALID_DELETE_PAYLOAD',
        },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    if (id === adminCheck.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot delete your own account.',
          code: 'SELF_DELETE_NOT_ALLOWED',
        },
        { status: 409 }
      );
    }

    const [targetUser, leadCount, chatCount, sessionCount, activityCount] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id },
          select: { id: true },
        }),
        prisma.lead.count({ where: { userId: id } }),
        prisma.chat.count({ where: { userId: id } }),
        prisma.session.count({ where: { userId: id } }),
        prisma.leadActivity.count({ where: { userId: id } }),
      ]);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found.', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const hasDependents = leadCount > 0 || chatCount > 0 || sessionCount > 0 || activityCount > 0;
    if (hasDependents) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete user because dependent records exist.',
          code: 'USER_HAS_DEPENDENTS',
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json(
      {
        success: true,
        data: { deletedId: id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error({ fn: 'DELETE /api/users', error });
    return NextResponse.json(
      { success: false, error: 'Could not delete user right now.', code: 'USER_DELETE_FAILED' },
      { status: 500 }
    );
  }
}
