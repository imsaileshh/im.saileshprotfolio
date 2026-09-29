import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getConversionAnalytics, getDashboardAnalytics, getDeviceAnalytics, getPageAnalytics, getReferrerAnalytics, getScrollDepthAnalytics, getVisitorAnalytics, pickParam } from '@/lib/dashboard/data';
import { analyticsQuerySchema } from '@/lib/validation/schemas';
type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function loadPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const query = analyticsQuerySchema.parse({
    range: pickParam(resolvedParams, 'range'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
    page: pickParam(resolvedParams, 'page'),
    limit: pickParam(resolvedParams, 'limit'),
    search: pickParam(resolvedParams, 'search'),
    sort: pickParam(resolvedParams, 'sort'),
  });

  const [overview, visitorTrend, pages, devices, referrers, conversions, scrollDepth] = await Promise.all([
    getDashboardAnalytics(query.range, query.from, query.to),
    getVisitorAnalytics(query.range, query.from, query.to),
    getPageAnalytics(query),
    getDeviceAnalytics(query.range, query.from, query.to),
    getReferrerAnalytics(query.range, query.from, query.to),
    getConversionAnalytics(query.range, query.from, query.to),
    getScrollDepthAnalytics(query.range, query.from, query.to),
  ]);
  return { query, overview, visitorTrend, pages, devices, referrers, conversions, scrollDepth };
}
