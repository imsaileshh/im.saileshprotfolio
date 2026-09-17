'use server';

import { verifySession } from '@/lib/auth/session';
import { getDashboardVisitors, getVisitorAnalytics } from '@/lib/dashboard/data';
import { resolveDashboardDateRange, type DashboardRangeKey } from '@/lib/dashboard/overview';

export type SerializedVisitorRow = {
  id: string;
  firstSeen: string | Date;
  lastSeen: string | Date;
  referrer: string | null;
  deviceType: string | null;
  browser?: string | null;
  os?: string | null;
  landingPage: string | null;
  visitTime: string | Date;
  sessionDurationSeconds: number;
  resumeViewed: boolean;
  resumeDownloaded: boolean;
  sessions?: number;
  pages?: number;
  interactions?: number;
  conversions?: number;
};

export type VisitorsPopupData = {
  range: {
    label: string;
    from: string;
    to: string;
  };
  summary: {
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    totalSessions: number;
  };
  trend: Array<{
    date: string;
    visitors: number;
    sessions: number;
    newVisitors: number;
    returningVisitors: number;
  }>;
  visitors: SerializedVisitorRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
};

export async function getVisitorsPopupDataAction(params: {
  range?: DashboardRangeKey;
  page?: number;
  limit?: number;
  kind?: 'new' | 'returning';
}): Promise<VisitorsPopupData> {
  const auth = await verifySession();
  if (!auth || auth.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const rangeKey = params.range ?? 'last7';
  const dateRange = resolveDashboardDateRange(rangeKey);
  const [data, trend] = await Promise.all([
    getDashboardVisitors({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      from: dateRange.from,
      to: dateRange.to,
      kind: params.kind,
      sort: 'lastSeenDesc',
    }),
    getVisitorAnalytics(rangeKey),
  ]);

  return {
    range: {
      label: dateRange.label,
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString(),
    },
    summary: data.summary,
    trend,
    visitors: data.visitors.map((v) => ({
      ...v,
      visitTime: v.visitTime instanceof Date ? v.visitTime.toISOString() : String(v.visitTime),
      firstSeen: v.firstSeen instanceof Date ? v.firstSeen.toISOString() : String(v.firstSeen),
      lastSeen: v.lastSeen instanceof Date ? v.lastSeen.toISOString() : String(v.lastSeen),
    })),
    pagination: data.pagination,
  };
}
