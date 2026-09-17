import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// ISR: cache for 60 s — avoids hitting the DB on every client fetch.
export const revalidate = 60;

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: { themeConfig: true },
    });
    return NextResponse.json({ themeConfig: settings?.themeConfig ?? null });
  } catch {
    // Fail gracefully — caller falls back to CSS defaults
    return NextResponse.json({ themeConfig: null });
  }
}
