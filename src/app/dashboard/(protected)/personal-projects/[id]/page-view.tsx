'use client';
import { PersonalProjectForm } from '@/components/dashboard/personal-projects/PersonalProjectForm';
import type { loadPage } from './page-data';

export default function EditPersonalProjectPage({ project, featuredCount }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="border-b border-white/5 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Edit Personal Project
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Update details, external links, and visibility for {project.title}.
        </p>
      </header>

      <PersonalProjectForm project={project} featuredCount={featuredCount} />
    </main>
  );
}
