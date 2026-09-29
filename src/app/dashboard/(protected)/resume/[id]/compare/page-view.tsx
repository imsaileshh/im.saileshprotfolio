'use client';
import Link from 'next/link';
import { ArrowLeft, GitCompare } from 'lucide-react';
import type { loadPage } from './page-data';

export default function ResumeComparePage({ id, resume, versionAId, versionBId, comparison }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header>
        <Link href={`/dashboard/resume/${resume.id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={16} /> Resume detail
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Compare Versions</h1>
        <p className="mt-1 text-sm text-zinc-400">Review text and keyword differences between two saved versions.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-white/10 bg-[#111113] p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block text-sm">
          <span className="mb-2 block text-zinc-400">Base version</span>
          <select name="versionAId" defaultValue={versionAId} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]">
            {resume.versions.map((version) => <option key={version.id} value={version.id}>v{version.versionNumber} {version.name ?? ''}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-zinc-400">Target version</span>
          <select name="versionBId" defaultValue={versionBId} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]">
            {resume.versions.map((version) => <option key={version.id} value={version.id}>v{version.versionNumber} {version.name ?? ''}</option>)}
          </select>
        </label>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
          <GitCompare size={16} /> Compare
        </button>
      </form>

      {comparison ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <h2 className="font-semibold text-white">v{comparison.versionA.versionNumber}</h2>
            <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-300">{comparison.versionA.contentText}</pre>
          </article>
          <article className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <h2 className="font-semibold text-white">v{comparison.versionB.versionNumber}</h2>
            <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-300">{comparison.versionB.contentText}</pre>
          </article>
          <article className="rounded-lg border border-white/10 bg-[#111113] p-5 xl:col-span-2">
            <h2 className="font-semibold text-white">Keyword delta</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-emerald-300">Added terms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparison.addedKeywords.length ? comparison.addedKeywords.map((keyword) => <span key={keyword} className="rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">{keyword}</span>) : <span className="text-sm text-zinc-500">No added terms.</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-red-300">Removed terms</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparison.removedKeywords.length ? comparison.removedKeywords.map((keyword) => <span key={keyword} className="rounded border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-200">{keyword}</span>) : <span className="text-sm text-zinc-500">No removed terms.</span>}
                </div>
              </div>
            </div>
          </article>
        </section>
      ) : (
        <section className="rounded-lg border border-white/10 bg-[#111113] p-8 text-center text-sm text-zinc-500">Create at least two resume versions to compare changes.</section>
      )}
    </main>
  );
}
