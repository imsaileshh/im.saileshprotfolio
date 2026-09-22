import { prisma } from '@/lib/database/prisma';
import { requireAdmin } from '@/lib/dashboard/auth';
import { WORK_WHERE_CLAUSE, PERSONAL_PROJECT_WHERE_CLAUSE } from '@/lib/constants/project-types';
import { resolveHomepageConfig, HomepageConfig } from '@/types/homepage-cms';
import { HomeDashboardClient } from '@/components/dashboard/home/HomeDashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomeCMSDashboardPage() {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    redirect('/dashboard/login');
  }

  const [settings, workProjects, personalProjects, skillSections] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    }),
    prisma.project.findMany({
      where: {
        published: true,
        archived: false,
        ...WORK_WHERE_CLAUSE,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.project.findMany({
      where: {
        published: true,
        archived: false,
        ...PERSONAL_PROJECT_WHERE_CLAUSE,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ featured: 'desc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.skillSection.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        skills: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
  ]);

  const defaultWorkIds = workProjects.map((p) => p.id);
  const defaultPersonalIds = personalProjects.map((p) => p.id);

  const initialConfig = resolveHomepageConfig(
    settings?.homepageConfig as unknown as Partial<HomepageConfig> | null,
    settings?.heroContent as Record<string, unknown> | null,
    settings?.aboutContent as Record<string, unknown> | null,
    defaultWorkIds,
    defaultPersonalIds
  );

  return (
    <main className="min-h-full">
      <HomeDashboardClient
        initialConfig={initialConfig}
        workProjects={workProjects}
        personalProjects={personalProjects}
        skillSections={skillSections}
        lastUpdatedAt={settings?.updatedAt ? settings.updatedAt.toISOString() : null}
      />
    </main>
  );
}
