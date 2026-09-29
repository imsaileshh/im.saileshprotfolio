import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';


export async function loadPage(_props: DashboardPageInput) {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' }
  }) || {};
  return { settings };
}
