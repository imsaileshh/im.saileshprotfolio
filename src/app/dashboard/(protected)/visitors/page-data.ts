import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getDashboardVisitors, getVisitorAnalytics, pickParam } from '@/lib/dashboard/data';
import { analyticsQuerySchema, visitorListQuerySchema } from '@/lib/validation/schemas';
type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function loadPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};

  const queryResult = visitorListQuerySchema.safeParse({
    page: pickParam(resolvedParams, 'page'),
    limit: pickParam(resolvedParams, 'limit'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
    device: pickParam(resolvedParams, 'device'),
    browser: pickParam(resolvedParams, 'browser'),
    os: pickParam(resolvedParams, 'os'),
    referrer: pickParam(resolvedParams, 'referrer'),
    kind: pickParam(resolvedParams, 'kind'),
    hasConversion: pickParam(resolvedParams, 'hasConversion'),
    sort: pickParam(resolvedParams, 'sort'),
  });
  const query = queryResult.success
    ? queryResult.data
    : { page: 1, limit: 20, sort: 'lastSeenDesc' as const };

  const rangeResult = analyticsQuerySchema.safeParse({
    range: pickParam(resolvedParams, 'range'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
  });
  const range = rangeResult.success
    ? rangeResult.data
    : { range: 'last7' as const, from: undefined, to: undefined };

  let data: Awaited<ReturnType<typeof getDashboardVisitors>> | null = null;
  let trend: Awaited<ReturnType<typeof getVisitorAnalytics>> = [];
  let error: string | null = null;

  try {
    const results = await Promise.all([
      getDashboardVisitors(query),
      getVisitorAnalytics(range.range, range.from, range.to),
    ]);
    data = results[0];
    trend = results[1];
  } catch (err) {
    console.error('Error loading dashboard visitors data:', err);
    error = 'Unable to load visitor data right now.';
  }
  return { resolvedParams, query, range, data, trend, error };
}
