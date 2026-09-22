import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { analyticsEventSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

export const VISITOR_COOKIE = 'sp_visitor_id';
export const SESSION_COOKIE = 'sp_session_id';
export const DEFAULT_SESSION_TIMEOUT_MINUTES = 5;

type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

type ClientHints = {
  userAgent: string | null;
  referrer: string | null;
};

type AnalyticsCookieIds = {
  visitorKey: string;
  sessionKey: string;
  isNewVisitorCookie: boolean;
  isNewSessionCookie: boolean;
};

export function getAnalyticsCookieIds(request: NextRequest, input: Partial<AnalyticsEventInput>): AnalyticsCookieIds {
  const visitorCookie = request.cookies.get(VISITOR_COOKIE)?.value;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  const visitorKey = input.visitorKey ?? visitorCookie ?? crypto.randomUUID();
  const sessionKey = input.sessionKey ?? sessionCookie ?? crypto.randomUUID();

  return {
    visitorKey,
    sessionKey,
    isNewVisitorCookie: !visitorCookie,
    isNewSessionCookie: !sessionCookie,
  };
}

export function attachAnalyticsCookies(response: NextResponse, ids: AnalyticsCookieIds) {
  const baseCookie = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  if (ids.isNewVisitorCookie) {
    response.cookies.set(VISITOR_COOKIE, ids.visitorKey, {
      ...baseCookie,
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (ids.isNewSessionCookie) {
    response.cookies.set(SESSION_COOKIE, ids.sessionKey, {
      ...baseCookie,
      maxAge: 60 * 30,
    });
  }
}

export function hashAnalyticsKey(value: string) {
  const salt = process.env.ANALYTICS_SALT ?? 'portfolio-analytics';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function getClientHints(request: NextRequest): ClientHints {
  return {
    userAgent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer') ?? request.headers.get('referrer'),
  };
}

export function parseUserAgent(userAgent: string | null) {
  const value = userAgent ?? '';
  const lower = value.toLowerCase();

  const deviceType = /ipad|tablet/.test(lower)
    ? 'Tablet'
    : /android|iphone|mobile/.test(lower)
      ? 'Mobile'
      : 'Desktop';

  const browser = lower.includes('edg/')
    ? 'Edge'
    : lower.includes('chrome/')
      ? 'Chrome'
      : lower.includes('safari/')
        ? 'Safari'
        : lower.includes('firefox/')
          ? 'Firefox'
          : 'Other';

  const os = lower.includes('windows')
    ? 'Windows'
    : lower.includes('mac os')
      ? 'macOS'
      : lower.includes('android')
        ? 'Android'
        : lower.includes('iphone') || lower.includes('ipad')
          ? 'iOS'
          : lower.includes('linux')
            ? 'Linux'
            : 'Other';

  return { deviceType, browser, os };
}

import {
  detectReferralPlatform,
  resolveAttribution,
  type NormalizedPlatform,
} from './attribution';

export function normalizeReferrer(referrer: string | null): NormalizedPlatform {
  return detectReferralPlatform(referrer);
}

export async function recordAnalyticsEvent(request: NextRequest, input: AnalyticsEventInput) {
  const ids = getAnalyticsCookieIds(request, input);
  const hints = getClientHints(request);
  const visitorHash = hashAnalyticsKey(ids.visitorKey);
  const sessionHash = hashAnalyticsKey(ids.sessionKey);
  const parsedAgent = parseUserAgent(hints.userAgent);
  
  const metadataReferrer = typeof input.metadata.referrer === 'string' ? input.metadata.referrer : null;
  const rawReferrer = metadataReferrer ?? hints.referrer;
  
  const utmSource = typeof input.metadata.utmSource === 'string' ? input.metadata.utmSource : null;
  const utmProfile = typeof input.metadata.utmProfile === 'string' ? input.metadata.utmProfile : null;
  const ref = typeof input.metadata.ref === 'string' ? input.metadata.ref : null;
  const platformParam = typeof input.metadata.platform === 'string' ? input.metadata.platform : null;
  const referralCodeParam = typeof input.metadata.referralCode === 'string' ? input.metadata.referralCode : null;
  const referralNameParam = typeof input.metadata.referralName === 'string' ? input.metadata.referralName : null;

  const attribution = resolveAttribution({
    referrer: rawReferrer,
    utmSource,
    utmProfile,
    ref,
    platform: platformParam,
    referralCode: referralCodeParam,
    referralName: referralNameParam,
  });

  const now = new Date();
  const safeReferrer = rawReferrer || 'Direct';

  const visitor = await prisma.visitor.upsert({
    where: { visitorHash },
    update: {
      lastSeen: now,
      deviceType: parsedAgent.deviceType,
      browser: parsedAgent.browser,
      os: parsedAgent.os,
      ...(attribution.platform !== 'Direct' ? { platform: attribution.platform } : {}),
      ...(attribution.referralCode ? { referralCode: attribution.referralCode } : {}),
      ...(attribution.referralName ? { referralName: attribution.referralName } : {}),
      ...(attribution.referralSource !== 'Direct' ? { referralSource: attribution.referralSource } : {}),
      ...(rawReferrer ? { referrer: safeReferrer, source: attribution.referralSource } : {}),
    },
    create: {
      visitorHash,
      firstSeen: now,
      lastSeen: now,
      deviceType: parsedAgent.deviceType,
      browser: parsedAgent.browser,
      os: parsedAgent.os,
      referrer: safeReferrer,
      source: attribution.referralSource,
      platform: attribution.platform,
      referralCode: attribution.referralCode,
      referralName: attribution.referralName,
      referralSource: attribution.referralSource,
    },
  });

  const visitorSession = await prisma.visitorSession.upsert({
    where: { sessionHash },
    update: {
      lastSeenAt: now,
      exitPage: input.pagePath,
      referrer: safeReferrer,
      userAgent: hints.userAgent,
      deviceType: parsedAgent.deviceType,
      browser: parsedAgent.browser,
      os: parsedAgent.os,
      platform: attribution.platform,
      referralCode: attribution.referralCode,
      referralName: attribution.referralName,
      referralSource: attribution.referralSource,
    },
    create: {
      visitorId: visitor.id,
      sessionHash,
      startedAt: now,
      lastSeenAt: now,
      entryPage: input.pagePath,
      exitPage: input.pagePath,
      referrer: safeReferrer,
      userAgent: hints.userAgent,
      deviceType: parsedAgent.deviceType,
      browser: parsedAgent.browser,
      os: parsedAgent.os,
      platform: attribution.platform,
      referralCode: attribution.referralCode,
      referralName: attribution.referralName,
      referralSource: attribution.referralSource,
    },
  });

  const event = await prisma.analyticsEvent.create({
    data: {
      visitorId: visitor.id,
      sessionId: visitorSession.id,
      eventType: input.eventType,
      pagePath: input.pagePath,
      metadata: input.metadata as unknown as import('@prisma/client').Prisma.InputJsonValue,
      projectId: input.metadata.projectId,
    },
  });

  return { event, ids };
}
