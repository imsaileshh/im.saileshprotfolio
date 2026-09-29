'use client';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { restoreResumeVersionAction } from '@/lib/dashboard/client-actions';
import type { loadPage } from './page-data';

export default function ResumeVersionsPage({ id, resume }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header>
        <Link href={`/dashboard/resume/${resume.id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Resume detail
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Version History</h1>
        <p className="mt-1 text-sm text-zinc-400">Restore an older version or compare changes from the comparison screen.</p>
      </header>

      <section className="space-y-3">
        {resume.versions.length ? resume.versions.map((version) => (
          <article key={version.id} className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-white">v{version.versionNumber} {version.name ?? ''}</h2>
                  {version.isActive ? <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Active</span> : null}
                  {version.atsScore !== null ? <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300">ATS {version.atsScore}/100</span> : null}
                </div>
                <p className="mt-1 text-sm text-zinc-400">{version.changeSummary ?? 'No change summary'} · {version.createdAt.toLocaleString()}</p>
              </div>
              <form action={restoreResumeVersionAction}>
                <input type="hidden" name="resumeId" value={resume.id} />
                <input type="hidden" name="versionId" value={version.id} />
                <button disabled={version.isActive} className="inline-flex h-9 items-center gap-2 rounded border border-white/10 px-3 text-xs font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                  <RotateCcw size={14} /> Restore
                </button>
              </form>
            </div>
            <pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded border border-white/10 bg-black/30 p-3 text-xs leading-5 text-zinc-300">{version.contentText}</pre>
          </article>
        )) : (
          <div className="rounded-lg border border-white/10 bg-[#111113] p-8 text-center text-sm text-zinc-500">No resume versions yet.</div>
        )}
      </section>
    </main>
  );
}
