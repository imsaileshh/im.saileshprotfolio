import 'server-only';
import type { DashboardPageInput } from '@/lib/dashboard/page-input';
import { prisma } from '@/lib/database/prisma';
import { getWorksCategoriesConfig, getPersonalProjectsCategoriesConfig } from './works-category-actions';


export async function loadPage(_props: DashboardPageInput) {
  const [dbSettings, worksCategoriesConfig, personalCategoriesConfig] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    getWorksCategoriesConfig(),
    getPersonalProjectsCategoriesConfig(),
  ]);

  const settings = dbSettings || {
    isHiringOpen: true,
    availabilityMsg: '',
    maintenanceMode: false,
    analyticsEnabled: true,
    sessionTimeoutMinutes: 5,
    heroContent: null,
    aboutContent: null,
    themeConfig: null,
  };
  return { worksCategoriesConfig, personalCategoriesConfig, settings };
}
