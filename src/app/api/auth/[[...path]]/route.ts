import { NextRequest, NextResponse } from 'next/server';
import { loginWithPin } from '@/lib/auth/auth';
import { destroySession, verifySession } from '@/lib/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const segment = path[0] ?? '';

  if (segment === 'session') {
    try {
      const authSession = await verifySession();
      if (authSession) {
        return NextResponse.json({ user: authSession.user, authenticated: true }, { status: 200 });
      }
      return NextResponse.json({ authenticated: false }, { status: 401 });
    } catch {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'ok', endpoint: 'auth' });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const segment = path[0] ?? '';

  if (segment === 'login') {
    try {
      const { pin } = await request.json();
      if (!pin) {
        return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
      }
      const result = await loginWithPin(pin);
      if (result.success) {
        return NextResponse.json({ user: result.user, token: result.token }, { status: 200 });
      }
      return NextResponse.json({ error: result.error }, { status: 401 });
    } catch {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  if (segment === 'logout') {
    try {
      await destroySession();
      return NextResponse.json({ success: true }, { status: 200 });
    } catch {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'ok', endpoint: 'auth' });
}