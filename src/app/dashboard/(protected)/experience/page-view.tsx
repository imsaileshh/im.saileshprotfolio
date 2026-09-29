'use client';
import { ExperienceForm } from './ExperienceForm';
import { ExperienceList } from './ExperienceList';
import type { loadPage } from './page-data';

export default function DashboardExperiencePage({ experiences }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">Experience</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your work history.</p>
      </header>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Add Experience</h2>
        <ExperienceForm />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Manage Experience (Drag to Reorder)</h2>
        <ExperienceList initialExperiences={experiences} />
      </section>
    </main>
  );
}
