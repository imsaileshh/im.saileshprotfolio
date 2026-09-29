import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { getWorksCategoriesConfig } from '../settings/works-category-actions';
import { getDashboardProjects } from '@/lib/dashboard/projects';
import { pickParam } from '@/lib/dashboard/data';
import { projectListQuerySchema } from '@/lib/validation/schemas';
type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function loadPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const parsed = projectListQuerySchema.parse({
    page: pickParam(resolvedParams, 'page'),
    limit: pickParam(resolvedParams, 'limit'),
    search: pickParam(resolvedParams, 'search'),
    view: pickParam(resolvedParams, 'view'),
    category: pickParam(resolvedParams, 'category'),
    technology: pickParam(resolvedParams, 'technology'),
    status: pickParam(resolvedParams, 'status'),
    year: pickParam(resolvedParams, 'year'),
    sort: pickParam(resolvedParams, 'sort'),
  });

  const [data, worksCategoriesConfig] = await Promise.all([
    getDashboardProjects(parsed),
    getWorksCategoriesConfig(),
  ]);
  const currentParams = {
    search: parsed.search,
    view: parsed.view,
    category: parsed.category,
    technology: parsed.technology,
    status: parsed.status,
    year: parsed.year,
    sort: parsed.sort,
    limit: String(parsed.limit),
  };
  const saved = pickParam(resolvedParams, 'saved');
  return { parsed, data, worksCategoriesConfig, currentParams, saved };
}
