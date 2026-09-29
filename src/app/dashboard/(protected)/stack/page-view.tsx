'use client';
import { updateStackHeroAction } from '@/lib/dashboard/client-actions';
import { StackEditor } from './StackEditor';
import type { loadPage } from './page-data';

export default function DashboardStackPage({ sections, settings }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Stack Manager</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage your technologies, categories, and Stack page content.</p>
        </div>
      </header>

      {/* Hero Editor */}
      <section className="rounded-lg border border-white/10 bg-[#111113] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Stack Header</h2>
        <form action={updateStackHeroAction} className="flex flex-col gap-4 max-w-2xl">
          <label className="block text-sm">
            <span className="mb-1.5 block text-zinc-400">Title</span>
            <input name="stackTitle" defaultValue={settings?.stackTitle || 'STACK'} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-zinc-400">Description</span>
            <textarea name="stackDescription" defaultValue={settings?.stackDescription || 'Technologies I use to design, build and ship digital products.'} className="min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#4F8CFF]" />
          </label>
          <div className="flex justify-end">
            <button type="submit" className="h-10 rounded-lg bg-[#4F8CFF] px-6 text-sm font-semibold text-white hover:bg-[#3B78EB]">Save Header</button>
          </div>
        </form>
      </section>

      {/* Categories & Technologies Editor */}
      <StackEditor sections={sections} />
    </main>
  );
}
