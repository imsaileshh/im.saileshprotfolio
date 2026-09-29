'use client';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { saveResumeVersionAction } from '@/lib/dashboard/client-actions';
import type { loadPage } from './page-data';

export default function ResumeEditPage({ id, resume, activeVersion }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header>
        <Link href={`/dashboard/resume/${resume.id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Resume detail
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Edit Resume</h1>
        <p className="mt-1 text-sm text-zinc-400">Saving creates a new version and keeps the previous version available for restore or comparison.</p>
      </header>

      <form action={saveResumeVersionAction} className="space-y-4 rounded-lg border border-white/10 bg-[#111113] p-5">
        <input type="hidden" name="resumeId" value={resume.id} />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Version name</span>
            <input name="name" defaultValue={resume.name ?? ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Change summary</span>
            <input name="changeSummary" placeholder="Tailored for frontend dashboard role" className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-2 block text-zinc-400">Resume text</span>
          <textarea name="contentText" required rows={28} defaultValue={activeVersion?.contentText ?? resume.parsedText ?? ''} className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm leading-6 text-white outline-none focus:border-[#4F8CFF]" />
        </label>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
          <Save size={16} /> Save new version
        </button>
      </form>
    </main>
  );
}
