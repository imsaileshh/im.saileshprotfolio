'use client';
import Link from 'next/link';
import { ArrowLeft, Archive, Download, FilePenLine, Gauge, GitCompare, History } from 'lucide-react';
import { archiveResumeAction } from '@/lib/dashboard/client-actions';
import type { loadPage } from './page-data';

export default function ResumeDetailPage({ id, resume, latestAnalysis, activeVersion }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard/resume" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft size={16} /> Resume CMS
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{resume.name ?? resume.fileName}</h1>
          <p className="mt-1 text-sm text-zinc-400">{activeVersion ? `Active version v${activeVersion.versionNumber}` : 'No active version'} · {resume.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/api/dashboard/resume/${resume.id}/export?format=txt`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 hover:bg-white/10">
            <Download size={16} /> Export text
          </Link>
          <Link href={`/dashboard/resume/${resume.id}/compare`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 hover:bg-white/10">
            <GitCompare size={16} /> Compare
          </Link>
          <Link href={`/dashboard/resume/${resume.id}/versions`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-zinc-200 hover:bg-white/10">
            <History size={16} /> Versions
          </Link>
          <Link href={`/dashboard/resume/${resume.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white hover:bg-[#3d78e5]">
            <FilePenLine size={16} /> Edit
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">ATS score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{latestAnalysis?.overallScore ?? 'No run'}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Versions</p>
          <p className="mt-2 text-2xl font-semibold text-white">{resume.versions.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Sections</p>
          <p className="mt-2 text-2xl font-semibold text-white">{resume.sections.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#111113] p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Downloads</p>
          <p className="mt-2 text-2xl font-semibold text-white">{resume.downloads}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {resume.sections.length ? resume.sections.map((section) => (
            <article key={section.id} className="rounded-lg border border-white/10 bg-[#111113] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{section.title}</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{section.content}</pre>
            </article>
          )) : (
            <article className="rounded-lg border border-white/10 bg-[#111113] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Resume Text</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{activeVersion?.contentText ?? resume.parsedText ?? 'No readable resume text yet.'}</pre>
            </article>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Latest ATS</h2>
              <Link href={`/dashboard/resume/${resume.id}/ats`} className="inline-flex items-center gap-1 text-xs text-[#8AB4FF] hover:text-white">
                <Gauge size={13} /> Open
              </Link>
            </div>
            {latestAnalysis ? (
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <p className="text-3xl font-semibold text-white">{latestAnalysis.overallScore ?? 'N/A'}<span className="text-sm text-zinc-500"> / 100</span></p>
                <p>{latestAnalysis.jobDescription?.title}</p>
                <p className="text-xs text-zinc-500">{latestAnalysis.suggestions.length} suggestions · {latestAnalysis.keywordAnalysis.filter((item) => item.foundInResume).length} keywords matched</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Run ATS analysis with a target job description.</p>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-[#111113] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {resume.skills.length ? resume.skills.map((skill) => (
                <span key={skill.id} className="rounded border border-white/10 px-2 py-1 text-xs text-zinc-200">{skill.name}</span>
              )) : <p className="text-sm text-zinc-500">No skills extracted yet.</p>}
            </div>
          </div>

          <form action={archiveResumeAction} className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
            <input type="hidden" name="resumeId" value={resume.id} />
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-500/30 px-4 text-sm font-medium text-red-200 hover:bg-red-500/10">
              <Archive size={16} /> Archive resume
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
