import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const sections = await prisma.skillSection.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      skills: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' }
  });
  return { sections, settings };
}
