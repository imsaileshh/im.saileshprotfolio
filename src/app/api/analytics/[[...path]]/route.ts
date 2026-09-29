import { NextRequest, NextResponse } from 'next/server';
import { allowedAnalyticsEventTypes, analyticsEventSchema, heartbeatSchema } from '@/lib/validation/schemas';
import { attachAnalyticsCookies, recordAnalyticsEvent } from '@/lib/analytics/server';

export async function GET() {
  return NextResponse.json({ allowedEventTypes: allowedAnalyticsEventTypes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const segment = path[0] ?? '';

  if (segment === 'heartbeat') {
    try {
      const payload = heartbeatSchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json(
          { error: 'Invalid heartbeat', details: payload.error.flatten() },
          { status: 400 },
        );
      }
      const { ids } = await recordAnalyticsEvent(request, {
        eventType: 'page_view',
        pagePath: payload.data.pagePath,
        visitorKey: payload.data.visitorKey,
        sessionKey: payload.data.sessionKey,
        metadata: {},
      });
      const response = NextResponse.json({ success: true }, { status: 201 });
      attachAnalyticsCookies(response, ids);
      return response;
    } catch (error) {
      console.error('Heartbeat API Error:', error);
      return NextResponse.json({ error: 'Failed to record heartbeat' }, { status: 500 });
    }
  }

  try {
    const payload = analyticsEventSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid analytics event', details: payload.error.flatten() },
        { status: 400 },
      );
    }
    const { ids } = await recordAnalyticsEvent(request, payload.data);
    const response = NextResponse.json({ success: true }, { status: 201 });
    attachAnalyticsCookies(response, ids);
    return response;
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Failed to record analytics event' }, { status: 500 });
  }
}