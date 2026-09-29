'use client';
import { HomeDashboardClient } from '@/components/dashboard/home/HomeDashboardClient';
import type { loadPage } from './page-data';

export default function HomeCMSDashboardPage({ settings, workProjects, personalProjects, skillSections, initialConfig }: Awaited<ReturnType<typeof loadPage>>) {
  
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
