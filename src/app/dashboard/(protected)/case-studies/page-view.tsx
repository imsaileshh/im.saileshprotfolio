'use client';
import Link from 'next/link';
import { CheckCircle2, Clock, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { CaseStudyCard } from '@/components/dashboard/case-studies/CaseStudyCard';
import type { loadPage } from './page-data';

export default function CaseStudiesDashboardPage({ saved, caseStudies, total, published, drafts }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      {saved && (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Case study {saved === 'created' ? 'created' : 'updated'} successfully.
        </div>
      )}

      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#4F8CFF] font-semibold">
              WORKSPACE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Case Studies
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-xl">
            In-depth UX/UI product design stories, process breakdowns, and interactive prototype showcases.
          </p>
        </div>

        <Link
          href="/dashboard/case-studies/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all hover:bg-[#3B78EB] shrink-0"
        >
          <Plus size={16} />
          <span>Add Case Study</span>
        </Link>
      </header>

      {/* ── Stat Counters ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#111113] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Total Case Studies</p>
            <LayoutTemplate className="h-3.5 w-3.5 text-[#4F8CFF]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{total}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111113] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Published</p>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{published}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111113] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Drafts</p>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{drafts}</p>
        </div>
      </section>

      {/* ── Case Studies List / Grid ── */}
      {caseStudies.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#111113] p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-3">
            <Sparkles size={24} className="text-[#4F8CFF]" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No case studies yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Build your first in-depth design story with multi-section research, wireframes, and prototype embeds.
          </p>
          <Link
            href="/dashboard/case-studies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B78EB] transition-colors"
          >
            <Plus size={16} />
            <span>Create First Case Study</span>
          </Link>
        </section>
      )}
    </main>
  );
}
