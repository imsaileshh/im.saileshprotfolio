import 'server-only';
import { getDashboardOverview, resolveDashboardDateRange } from '@/lib/dashboard/overview';
import { prisma } from '@/lib/database/prisma';
import { getDashboardVisitors, getReferrerAnalytics, getResumeAnalytics, getVisitorAnalytics } from '@/lib/dashboard/data';

export async function loadPage() {
  const dateRange = resolveDashboardDateRange('last7');

  // Parallelize all independent queries simultaneously
  const [
    overview,
    visitorTrend,
    referrers,
    recentVisitors,
    resumeAnalytics,
    settings,
    unreadMessages,
    recentProjects,
  ] = await Promise.all([
    getDashboardOverview(dateRange),
    getVisitorAnalytics('last7'),
    getReferrerAnalytics('last7'),
    getDashboardVisitors({ page: 1, limit: 5, from: dateRange.from, to: dateRange.to, sort: 'lastSeenDesc' }),
    getResumeAnalytics('last7'),
    prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: { heroContent: true },
    }),
    prisma.contactMessage.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 4,
      select: { id: true, title: true, published: true, archived: true, updatedAt: true },
    }),
  ]);

  const heroConfigured = !!settings?.heroContent;
  const hasTrendData = overview.trends.some(
    (point) => point.visitors || point.pageViews || point.conversions || point.cvDownloads,
  );
  const maxTrendValue = Math.max(
    1,
    ...overview.trends.map((point) => point.pageViews + point.conversions + point.cvDownloads),
  );

  return {
    overview,
    visitorTrend,
    referrers,
    recentVisitors,
    resumeAnalytics,
    heroConfigured,
    unreadMessages,
    recentProjects,
    hasTrendData,
    maxTrendValue,
  };
}
