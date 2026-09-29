'use client';
import Link from 'next/link';
import { ArrowLeft, Gauge } from 'lucide-react';
import { runAtsAnalysisAction } from '@/lib/dashboard/client-actions';
import type { loadPage } from './page-data';
function scoreTone(score: number | null) {
  if (score === null) return 'text-zinc-500';
  if (score >= 80) return 'text-emerald-300';
  if (score >= 60) return 'text-amber-300';
  return 'text-red-300';
}
export default function ResumeAtsPage({ id, resume, latestAnalysis }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href={`/dashboard/resume/${resume.id}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Resume detail
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">ATS Analysis</h1>
          <p className="mt-1 text-sm text-zinc-400">Generate a deterministic compatibility estimate against a real job description.</p>
        </div>
        {latestAnalysis ? (
          <div className="rounded-lg border border-white/10 bg-[#111113] px-5 py-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Latest score</p>
            <p className={`text-3xl font-semibold ${scoreTone(latestAnalysis.overallScore)}`}>{latestAnalysis.overallScore ?? 'N/A'}</p>
          </div>
        ) : null}
      </header>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <form action={runAtsAnalysisAction} className="space-y-4 rounded-lg border border-white/10 bg-[#111113] p-5">
          <input type="hidden" name="resumeId" value={resume.id} />
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-[#4F8CFF]" />
            <h2 className="text-lg font-semibold text-white">Run analysis</h2>
          </div>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Resume version</span>
            <select name="versionId" defaultValue={resume.activeVersionId ?? resume.versions[0]?.id ?? ''} className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]">
              {resume.versions.map((version) => (
                <option key={version.id} value={version.id}>v{version.versionNumber} {version.name ?? ''}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Job title</span>
            <input name="title" required className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" placeholder="Frontend Developer" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-400">Company</span>
              <input name="company" className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-zinc-400">Industry</span>
              <input name="industry" className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#4F8CFF]" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-2 block text-zinc-400">Job description</span>
            <textarea name="description" required rows={12} className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-[#4F8CFF]" />
          </label>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
            <Gauge size={16} /> Analyze
          </button>
        </form>

        <div className="space-y-4">
          {latestAnalysis ? (
            <>
              <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
                <h2 className="text-lg font-semibold text-white">{latestAnalysis.label}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-5">
                  {[
                    ['Keyword', latestAnalysis.keywordScore],
                    ['Sections', latestAnalysis.sectionScore],
                    ['Formatting', latestAnalysis.formattingScore],
                    ['Readability', latestAnalysis.readabilityScore],
                    ['Contact', latestAnalysis.contactScore],
                  ].map(([label, score]) => (
                    <div key={label} className="rounded border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                      <p className={`mt-1 text-xl font-semibold ${scoreTone(score as number | null)}`}>{score ?? 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
                <h2 className="text-lg font-semibold text-white">Suggestions</h2>
                <div className="mt-4 space-y-3">
                  {latestAnalysis.suggestions.length ? latestAnalysis.suggestions.map((suggestion) => (
                    <article key={suggestion.id} className="rounded border border-white/10 p-3">
                      <p className="text-sm font-semibold text-white">{suggestion.section} · {suggestion.severity}</p>
                      <p className="mt-1 text-sm text-zinc-300">{suggestion.issue}</p>
                      <p className="mt-2 text-xs text-zinc-500">{suggestion.suggestedFix}</p>
                    </article>
                  )) : <p className="text-sm text-zinc-500">No suggestions for this run.</p>}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
                <h2 className="text-lg font-semibold text-white">Keyword Analysis</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {latestAnalysis.keywordAnalysis.length ? latestAnalysis.keywordAnalysis.map((keyword) => (
                    <span key={keyword.id} className={`rounded border px-2 py-1 text-xs ${keyword.foundInResume ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>
                      {keyword.keyword}
                    </span>
                  )) : <p className="text-sm text-zinc-500">No job keywords were extracted.</p>}
                </div>
              </section>
            </>
          ) : (
            <section className="flex min-h-72 items-center justify-center rounded-lg border border-white/10 bg-[#111113] p-8 text-center">
              <p className="text-sm text-zinc-500">Run an analysis to see ATS score, missing keywords, and improvement suggestions.</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
