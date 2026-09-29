import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { pickParam, getDashboardMessages } from '@/lib/dashboard/data';
import { messageListQuerySchema } from '@/lib/validation/schemas';
type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function loadPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const parsed = messageListQuerySchema.parse({
    page: pickParam(resolvedParams, 'page'),
    limit: pickParam(resolvedParams, 'limit'),
    search: pickParam(resolvedParams, 'search'),
    status: pickParam(resolvedParams, 'status'),
    priority: pickParam(resolvedParams, 'priority'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
    sort: pickParam(resolvedParams, 'sort'),
  });
  const data = await getDashboardMessages(parsed);
  return { parsed, data };
}
