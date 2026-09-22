import { NextRequest, NextResponse } from 'next/server';
import { formatReferralName, detectReferralPlatform } from '@/lib/analytics/attribution';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const rawCode = (code || '').trim().toLowerCase();
  
  if (!rawCode) {
    return NextResponse.redirect(new URL('/', request.url), 307);
  }

  const referralName = formatReferralName(rawCode) || rawCode;
  const referer = request.headers.get('referer') || request.headers.get('referrer');
  const incomingUrl = new URL(request.url);

  // Preserve existing search params or override with referral attribution
  const searchParams = new URLSearchParams(incomingUrl.searchParams);
  
  const detectedPlatform = detectReferralPlatform(
    referer,
    searchParams.get('platform'),
    searchParams.get('utm_source')
  );

  searchParams.set('ref', rawCode);
  searchParams.set('utm_profile', referralName);
  searchParams.set('platform', detectedPlatform);

  // If destination target page was specified (e.g. ?target=/works), navigate there, else '/'
  const targetPath = searchParams.get('target') || '/';
  searchParams.delete('target');

  const redirectUrl = new URL(targetPath, request.url);
  redirectUrl.search = searchParams.toString();

  const response = NextResponse.redirect(redirectUrl, 307);

  // Set session cookie for fallback retention across page loads
  response.cookies.set('sp_attribution', JSON.stringify({
    code: rawCode,
    name: referralName,
    platform: detectedPlatform,
  }), {
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
