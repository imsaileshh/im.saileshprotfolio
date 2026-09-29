'use client';
import { AboutEditor } from '@/components/dashboard/about/AboutEditor';
import type { loadPage } from './page-data';

export default function DashboardAboutPage({ settings }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">About Page Content</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage all content for the public About page.</p>
      </header>

      <AboutEditor settings={settings} />
    </main>
  );
}
