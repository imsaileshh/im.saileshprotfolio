import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ orderIndex: 'asc' }, { startDate: 'desc' }],
  });
  return { experiences };
}
