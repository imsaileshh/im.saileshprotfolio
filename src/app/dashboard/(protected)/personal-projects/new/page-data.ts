import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const featuredCount = await prisma.project.count({
    where: {
      projectType: { in: ['Personal Project', 'Open Source'] },
      featured: true,
      archived: false,
    },
  });
  return { featuredCount };
}
