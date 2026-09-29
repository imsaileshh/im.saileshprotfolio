import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getDashboardOverview, resolveDashboardDateRange } from '@/lib/dashboard/overview';
import { prisma } from '@/lib/database/prisma';
import { getDashboardVisitors, getReferrerAnalytics, getResumeAnalytics, getVisitorAnalytics } from '@/lib/dashboard/data';


export async function loadPage(_props: DashboardPageInput) {
  const dateRange = resolveDashboardDateRange('last7');
  const overview = await getDashboardOverview(dateRange);
  const [visitorTrend, referrers, recentVisitors, resumeAnalytics] = await Promise.all([
    getVisitorAnalytics('last7'),
    getReferrerAnalytics('last7'),
    getDashboardVisitors({ page: 1, limit: 5, from: dateRange.from, to: dateRange.to, sort: 'lastSeenDesc' }),
    getResumeAnalytics('last7'),
  ]);
  
  // Check configs for Hero
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const heroConfigured = !!settings?.heroContent;

  // Unread messages
  const unreadMessages = await prisma.contactMessage.findMany({
    where: { isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Recent projects for the analytics sidebar
  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 4,
    select: { id: true, title: true, published: true, archived: true, updatedAt: true }
  });

  const hasTrendData = overview.trends.some(
    (point) => point.visitors || point.pageViews || point.conversions || point.cvDownloads,
  );
  const maxTrendValue = Math.max(
    1,
    ...overview.trends.map((point) => point.pageViews + point.conversions + point.cvDownloads),
  );
  return { overview, visitorTrend, referrers, recentVisitors, resumeAnalytics, heroConfigured, unreadMessages, recentProjects, hasTrendData, maxTrendValue };
}
