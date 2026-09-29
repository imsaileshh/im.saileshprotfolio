import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const educationList = await prisma.education.findMany({
    orderBy: [{ orderIndex: 'asc' }, { startDate: 'desc' }],
  });
  return { educationList };
}
