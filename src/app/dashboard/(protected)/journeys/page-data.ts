import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getJourneys, pickParam } from '@/lib/dashboard/data';
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
  });
  const journeys = await getJourneys({
    range: query.range,
    from: query.from,
    to: query.to,
    device: pickParam(resolvedParams, 'device'),
    eventType: pickParam(resolvedParams, 'eventType'),
    converted: pickParam(resolvedParams, 'converted') ? pickParam(resolvedParams, 'converted') === 'true' : undefined,
  });
  return { query, journeys };
}
