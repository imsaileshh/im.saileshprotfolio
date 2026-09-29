import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';
import { PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { getPersonalProjectsCategoriesConfig } from '@/app/dashboard/(protected)/settings/works-category-actions';


export async function loadPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const saved = resolvedParams.saved;

  const [projects, categoriesConfig] = await Promise.all([
    // Fetch only Personal Projects & Open Source (completely separate from Works)
    prisma.project.findMany({
      where: {
        ...PERSONAL_PROJECT_WHERE_CLAUSE,
        archived: false,
      },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    getPersonalProjectsCategoriesConfig().catch(() => ({
      showCategoryBar: true,
      categories: ['All', 'Case Studies', 'Web Development', 'Tools', 'Experiments', 'UI/UX'],
    })),
  ]);

  const total = projects.length;
  const published = projects.filter((p) => p.published).length;
  const drafts = projects.filter((p) => !p.published).length;
  const featured = projects.filter((p) => p.featured).length;
  return { saved, projects, categoriesConfig, total, published, drafts, featured };
}
