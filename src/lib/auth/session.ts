import { cookies } from 'next/headers';
import { prisma } from '@/lib/database/prisma';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'sailesh_portfolio_session';
const SESSION_EXPIRY_DAYS = 30;

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function verifySession(authHeaderToken?: string) {
  const cookieStore = await cookies();
  const token = authHeaderToken || cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  // Extend session if it's halfway to expiry
  // We'll skip rolling sessions for simplicity unless needed

  return { session, user: session.user };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.delete({
      where: { token },
    }).catch(() => {}); // ignore error if already deleted
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
