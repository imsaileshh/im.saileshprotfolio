import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const categories = await prisma.projectTaxonomy.findMany({
    where: { type: 'category' },
    orderBy: { name: 'asc' },
  });
  return { categories };
}
