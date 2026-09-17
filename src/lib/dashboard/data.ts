import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/prisma';
import { DEFAULT_SESSION_TIMEOUT_MINUTES } from '@/lib/analytics/server';
import { getDashboardOverview, resolveDashboardDateRange, type DashboardRangeKey } from '@/lib/dashboard/overview';

export const contactStatuses = ['New', 'Read', 'Replied', 'Archived'] as const;
export const messagePriorities = ['Low', 'Normal', 'High', 'Urgent'] as const;
export const conversionEventTypes = ['hire_click', 'resume_download', 'contact_submit'] as const;
export const projectInteractionEventTypes = ['project_live_click', 'github_click'] as const;

type SearchParams = Record<string, string | string[] | undefined>;

export function pickParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function dateFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  };
}

export function parseDateRange(params: {
  range?: DashboardRangeKey;
  from?: Date;
  to?: Date;
}) {
  return resolveDashboardDateRange(params.range ?? 'last7', params.from, params.to);
}

export function formatShortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

function clampPage(page: number) {
  return Math.max(1, page);
}

function offset(page: number, limit: number) {
  return (clampPage(page) - 1) * limit;
}

export async function getDashboardMessages(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  from?: Date;
  to?: Date;
  sort: 'newest' | 'oldest';
}) {
  const createdAt = dateFilter(query.from, query.to);
  const where = {
    ...(query.status ? { status: query.status as 'New' | 'Read' | 'Replied' | 'Archived' } : {}),
    ...(query.priority ? { priority: query.priority as 'Low' | 'Normal' | 'High' | 'Urgent' } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
            { subject: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [total, messages, counts] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: query.sort === 'oldest' ? 'asc' : 'desc' },
      skip: offset(query.page, query.limit),
      take: query.limit,
    }),
    Promise.all(
      contactStatuses.map(async (status) => ({
        status,
        count: await prisma.contactMessage.count({ where: { status } }),
      })),
    ),
  ]);

  const statusCounts = Object.fromEntries(counts.map((item) => [item.status, item.count])) as Record<(typeof contactStatuses)[number], number>;

  return {
    messages,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pageCount: Math.max(1, Math.ceil(total / query.limit)),
    },
    counts: {
      total: await prisma.contactMessage.count(),
      ...statusCounts,
    },
  };
}

export async function getMessageDetail(id: string) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  const [previous, next] = await Promise.all([
    prisma.contactMessage.findFirst({
      where: { createdAt: { lt: message.createdAt } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    }),
    prisma.contactMessage.findFirst({
      where: { createdAt: { gt: message.createdAt } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    }),
  ]);

  if (message.status === 'New') {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'Read', isRead: true },
    });
    return { message: updated, previous, next };
  }

  return { message, previous, next };
}

export async function getDashboardVisitors(query: {
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  kind?: 'new' | 'returning';
  hasConversion?: boolean;
  sort: 'lastSeenDesc' | 'firstSeenAsc';
}) {
  const firstSeen = dateFilter(query.from, query.to);
  const where = {
    ...(query.device ? { deviceType: query.device } : {}),
    ...(query.browser ? { browser: query.browser } : {}),
    ...(query.os ? { os: query.os } : {}),
    ...(query.referrer ? { referrer: { contains: query.referrer, mode: 'insensitive' as const } } : {}),
    ...(query.kind === 'new' && firstSeen ? { firstSeen } : {}),
    ...(query.hasConversion
      ? {
          events: {
            some: { eventType: { in: [...conversionEventTypes] } },
          },
        }
      : {}),
  };

  const [total, uniqueVisitors, newVisitors, visitors] = await Promise.all([
    prisma.visitor.count({ where }),
    prisma.visitor.count(),
    prisma.visitor.count({ where: firstSeen ? { firstSeen } : {} }),
    prisma.visitor.findMany({
      where,
      orderBy: query.sort === 'firstSeenAsc' ? { firstSeen: 'asc' } : { lastSeen: 'desc' },
      skip: offset(query.page, query.limit),
      take: query.limit,
    }),
  ]);

  const rows = await Promise.all(
    visitors.map(async (visitor) => {
      const [sessions, pages, interactions, conversions, latestSession, resumeEvents] = await Promise.all([
        prisma.visitorSession.count({ where: { visitorId: visitor.id } }),
        prisma.analyticsEvent.count({ where: { visitorId: visitor.id, eventType: 'page_view' } }),
        prisma.analyticsEvent.count({ where: { visitorId: visitor.id, eventType: { not: 'page_view' } } }),
        prisma.analyticsEvent.count({ where: { visitorId: visitor.id, eventType: { in: [...conversionEventTypes] } } }),
        prisma.visitorSession.findFirst({
          where: { visitorId: visitor.id },
          orderBy: { lastSeenAt: 'desc' },
          select: { entryPage: true, startedAt: true, lastSeenAt: true },
        }),
        prisma.analyticsEvent.findMany({
          where: { visitorId: visitor.id, eventType: { in: ['resume_view', 'resume_download'] } },
          select: { eventType: true },
        }),
      ]);

      return {
        ...visitor,
        sessions,
        pages,
        interactions,
        conversions,
        landingPage: latestSession?.entryPage ?? null,
        visitTime: latestSession?.lastSeenAt ?? visitor.lastSeen,
        sessionDurationSeconds: latestSession
          ? Math.max(0, Math.round((latestSession.lastSeenAt.getTime() - latestSession.startedAt.getTime()) / 1000))
          : 0,
        resumeViewed: resumeEvents.some((event) => event.eventType === 'resume_view'),
        resumeDownloaded: resumeEvents.some((event) => event.eventType === 'resume_download'),
      };
    }),
  );

  return {
    visitors: rows,
    summary: {
      uniqueVisitors,
      newVisitors,
      returningVisitors: Math.max(0, uniqueVisitors - newVisitors),
      totalSessions: await prisma.visitorSession.count(),
    },
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pageCount: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getResumeAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  const events = await prisma.analyticsEvent.findMany({
    where: {
      eventType: { in: ['resume_view', 'resume_download'] },
      timestamp: { gte: range.from, lte: range.to },
    },
    orderBy: { timestamp: 'desc' },
    select: {
      id: true,
      visitorId: true,
      eventType: true,
      pagePath: true,
      timestamp: true,
      metadata: true,
    },
  });

  const buckets = new Map<string, { date: string; views: number; downloads: number }>();
  const cursor = new Date(range.from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(range.to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    buckets.set(date, { date, views: 0, downloads: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const event of events) {
    const bucket = buckets.get(event.timestamp.toISOString().slice(0, 10));
    if (!bucket) continue;
    if (event.eventType === 'resume_view') bucket.views += 1;
    if (event.eventType === 'resume_download') bucket.downloads += 1;
  }

  const views = events.filter((event) => event.eventType === 'resume_view');
  const downloads = events.filter((event) => event.eventType === 'resume_download');
  const uniqueReaders = new Set(views.map((event) => event.visitorId)).size;

  return {
    range: { label: range.label, from: range.from, to: range.to },
    summary: {
      views: views.length,
      downloads: downloads.length,
      uniqueReaders,
      conversionRate: uniqueReaders ? (downloads.length / uniqueReaders) * 100 : 0,
    },
    daily: Array.from(buckets.values()),
    recentEvents: events.slice(0, 12),
  };
}

export async function getVisitorDetail(id: string) {
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: {
      visitorSessions: { orderBy: { startedAt: 'desc' } },
      events: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!visitor) notFound();

  return {
    visitor,
    overview: {
      sessions: visitor.visitorSessions.length,
      pageViews: visitor.events.filter((event) => event.eventType === 'page_view').length,
      events: visitor.events.length,
      conversions: visitor.events.filter((event) => conversionEventTypes.includes(event.eventType as (typeof conversionEventTypes)[number])).length,
    },
  };
}

export async function getLiveVisitors() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const timeout = settings?.sessionTimeoutMinutes ?? DEFAULT_SESSION_TIMEOUT_MINUTES;
  const activeSince = new Date(Date.now() - timeout * 60 * 1000);
  const sessions = await prisma.visitorSession.findMany({
    where: { lastSeenAt: { gte: activeSince } },
    include: { visitor: true },
    orderBy: { lastSeenAt: 'desc' },
    take: 100,
  });

  return { activeSince, timeout, sessions };
}

export async function getDashboardAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  return getDashboardOverview(range);
}

export async function getVisitorAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  const sessions = await prisma.visitorSession.findMany({
    where: { startedAt: { gte: range.from, lte: range.to } },
    select: { visitorId: true, startedAt: true },
    orderBy: { startedAt: 'asc' },
  });

  const buckets = new Map<string, { date: string; visitors: Set<string>; sessions: number; newVisitors: number; returningVisitors: number }>();
  for (const session of sessions) {
    const key = session.startedAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? { date: key, visitors: new Set(), sessions: 0, newVisitors: 0, returningVisitors: 0 };
    bucket.visitors.add(session.visitorId);
    bucket.sessions += 1;
    buckets.set(key, bucket);
  }

  const firstSeenVisitors = await prisma.visitor.findMany({
    where: { firstSeen: { gte: range.from, lte: range.to } },
    select: { id: true, firstSeen: true },
  });

  for (const visitor of firstSeenVisitors) {
    const key = visitor.firstSeen.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? { date: key, visitors: new Set(), sessions: 0, newVisitors: 0, returningVisitors: 0 };
    bucket.newVisitors += 1;
    bucket.visitors.add(visitor.id);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values()).map((bucket) => ({
    date: bucket.date,
    visitors: bucket.visitors.size,
    sessions: bucket.sessions,
    newVisitors: bucket.newVisitors,
    returningVisitors: Math.max(0, bucket.visitors.size - bucket.newVisitors),
  }));
}

export async function getPageAnalytics(query: {
  page: number;
  limit: number;
  search?: string;
  range?: DashboardRangeKey;
  from?: Date;
  to?: Date;
}) {
  const range = parseDateRange({ range: query.range, from: query.from, to: query.to });
  const rows = await prisma.analyticsEvent.groupBy({
    by: ['pagePath'],
    where: {
      eventType: 'page_view',
      timestamp: { gte: range.from, lte: range.to },
      ...(query.search ? { pagePath: { contains: query.search, mode: 'insensitive' as const } } : {}),
    },
    _count: { _all: true },
    orderBy: { _count: { pagePath: 'desc' } },
    skip: offset(query.page, query.limit),
    take: query.limit,
  });

  const pages = await Promise.all(
    rows.map(async (row) => {
      const [uniqueVisitors, entries, exits] = await Promise.all([
        prisma.analyticsEvent.groupBy({
          by: ['visitorId'],
          where: { pagePath: row.pagePath, eventType: 'page_view', timestamp: { gte: range.from, lte: range.to } },
        }),
        prisma.visitorSession.count({ where: { entryPage: row.pagePath, startedAt: { gte: range.from, lte: range.to } } }),
        prisma.visitorSession.count({ where: { exitPage: row.pagePath, startedAt: { gte: range.from, lte: range.to } } }),
      ]);
      return { route: row.pagePath, pageViews: row._count._all, uniqueVisitors: uniqueVisitors.length, entries, exits };
    }),
  );

  return { pages, range };
}

export async function getDeviceAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  return prisma.visitorSession.groupBy({
    by: ['deviceType', 'browser', 'os'],
    where: { startedAt: { gte: range.from, lte: range.to } },
    _count: { _all: true },
    orderBy: { _count: { deviceType: 'desc' } },
  });
}

export async function getReferrerAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  const rows = await prisma.visitorSession.groupBy({
    by: ['referrer'],
    where: { startedAt: { gte: range.from, lte: range.to } },
    _count: { _all: true },
    orderBy: { _count: { referrer: 'desc' } },
  });

  return Promise.all(
    rows.map(async (row) => {
      const sessions = await prisma.visitorSession.findMany({
        where: { referrer: row.referrer, startedAt: { gte: range.from, lte: range.to } },
        select: { id: true },
      });
      const sessionIds = sessions.map((session) => session.id);
      const conversions = sessionIds.length
        ? await prisma.analyticsEvent.count({
            where: { sessionId: { in: sessionIds }, eventType: { in: [...conversionEventTypes] } },
          })
        : 0;

      return {
        referrer: row.referrer ?? 'Direct',
        sessions: row._count._all,
        conversions,
        conversionRate: row._count._all === 0 ? 0 : (conversions / row._count._all) * 100,
      };
    }),
  );
}

export async function getConversionAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  const [visitors, projectViews, projectInteractions, hireClicks, cvDownloads, contactSubmissions] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ['visitorId'], where: { timestamp: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'project_view', timestamp: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { eventType: { in: [...projectInteractionEventTypes] }, timestamp: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'hire_click', timestamp: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'resume_download', timestamp: { gte: range.from, lte: range.to } } }),
    prisma.analyticsEvent.count({ where: { eventType: 'contact_submit', timestamp: { gte: range.from, lte: range.to } } }),
  ]);

  const steps = [
    { label: 'Visitors', count: visitors.length },
    { label: 'Project View', count: projectViews },
    { label: 'Project Interaction', count: projectInteractions },
    { label: 'Hire Me Click', count: hireClicks },
    { label: 'CV Download or Contact Submit', count: cvDownloads + contactSubmissions },
  ];

  return steps.map((step, index) => {
    const previous = index === 0 ? step.count : steps[index - 1].count;
    return {
      ...step,
      previousStepRate: previous === 0 ? 0 : (step.count / previous) * 100,
      overallRate: steps[0].count === 0 ? 0 : (step.count / steps[0].count) * 100,
    };
  });
}

export async function getScrollDepthAnalytics(rangeKey: DashboardRangeKey = 'last7', from?: Date, to?: Date) {
  const range = parseDateRange({ range: rangeKey, from, to });
  const sessions = await prisma.analyticsEvent.groupBy({
    by: ['sessionId'],
    where: { timestamp: { gte: range.from, lte: range.to }, sessionId: { not: null } },
  });
  const totalSessions = sessions.length;

  return Promise.all(
    [25, 50, 75, 90, 100].map(async (milestone) => {
      const reached = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          eventType: 'scroll_depth',
          timestamp: { gte: range.from, lte: range.to },
          metadata: { path: ['scrollDepth'], gte: milestone },
          sessionId: { not: null },
        },
      });

      return {
        milestone,
        sessions: reached.length,
        percentage: totalSessions === 0 ? 0 : (reached.length / totalSessions) * 100,
      };
    }),
  );
}

export async function getJourneys(query: {
  range?: DashboardRangeKey;
  from?: Date;
  to?: Date;
  device?: string;
  eventType?: string;
  converted?: boolean;
}) {
  const range = parseDateRange({ range: query.range, from: query.from, to: query.to });
  const sessions = await prisma.visitorSession.findMany({
    where: {
      startedAt: { gte: range.from, lte: range.to },
      ...(query.device ? { deviceType: query.device } : {}),
      ...(query.converted !== undefined
        ? {
            events: query.converted
              ? { some: { eventType: { in: [...conversionEventTypes] } } }
              : { none: { eventType: { in: [...conversionEventTypes] } } },
          }
        : {}),
    },
    include: {
      events: {
        where: query.eventType ? { eventType: query.eventType } : {},
        orderBy: { timestamp: 'asc' },
      },
      visitor: true,
    },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  return sessions.map((session) => ({
    ...session,
    durationSeconds: Math.max(0, Math.round((session.lastSeenAt.getTime() - session.startedAt.getTime()) / 1000)),
    conversionEvent: session.events.find((event) => conversionEventTypes.includes(event.eventType as (typeof conversionEventTypes)[number]))?.eventType ?? null,
    dropOffPoint: session.exitPage ?? session.events.at(-1)?.pagePath ?? session.entryPage,
  }));
}
