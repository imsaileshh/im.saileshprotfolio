import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: { themeConfig: true },
    });
    return NextResponse.json({ themeConfig: settings?.themeConfig ?? null });
  } catch {
    // Fail gracefully -- caller falls back to CSS defaults
    return NextResponse.json({ themeConfig: null });
  }
}
