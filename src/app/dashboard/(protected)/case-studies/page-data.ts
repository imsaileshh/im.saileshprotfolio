import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const resolvedParams = (await searchParams) ?? {};
  const saved = resolvedParams.saved;

  const caseStudies = await prisma.caseStudy.findMany({
    include: {
      sections: { orderBy: { order: 'asc' } },
      project: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const total = caseStudies.length;
  const published = caseStudies.filter((c) => c.status === 'PUBLISHED').length;
  const drafts = caseStudies.filter((c) => c.status === 'DRAFT').length;
  return { saved, caseStudies, total, published, drafts };
}
