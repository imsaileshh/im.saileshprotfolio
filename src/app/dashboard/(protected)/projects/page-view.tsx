'use client';
import Link from 'next/link';
import { FolderGit2, Plus, CheckCircle2, FileText, Star } from 'lucide-react';
import { ProjectRows } from '@/components/dashboard/projects/ProjectRows';
import { ProjectSearchForm } from '@/components/dashboard/projects/ProjectSearchForm';
import { WorksCategoriesManager } from '@/components/dashboard/settings/WorksCategoriesManager';
import type { loadPage } from './page-data';
function queryHref(params: Record<string, string | undefined>, updates: Record<string, string | number>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  for (const [key, value] of Object.entries(updates)) {
    query.set(key, String(value));
  }
  return `/dashboard/projects?${query.toString()}`;
}
export default function DashboardProjectsPage({ parsed, data, worksCategoriesConfig, currentParams, saved }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6 max-w-7xl mx-auto">
      {/* Alert banner if saved */}
      {saved ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Work {saved} successfully.
        </div>
      ) : null}

      {/* Header & Primary CTA */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Works</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Curate and manage client deliverables, production websites, and case studies.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F8CFF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all hover:bg-[#3B78EB] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Work</span>
        </Link>
      </header>

      {/* Simple Summary Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Total Works</p>
            <p className="mt-1 text-xl font-bold text-white">{data.stats.total}</p>
          </div>
          <FolderGit2 className="h-5 w-5 text-zinc-600" />
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Published</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{data.stats.published}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500/40" />
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Drafts</p>
            <p className="mt-1 text-xl font-bold text-amber-400">{data.stats.drafts}</p>
          </div>
          <FileText className="h-5 w-5 text-amber-500/40" />
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Featured on Home</p>
            <p className="mt-1 text-xl font-bold text-[#4F8CFF]">{data.stats.featured}</p>
          </div>
          <Star className="h-5 w-5 text-[#4F8CFF]/40" />
        </div>
      </section>

      {/* Search & Filter bar */}
      <section className="rounded-xl border border-white/[0.08] bg-[#111215] p-2">
        <ProjectSearchForm initialSearch={parsed.search} initialView={parsed.view} />
      </section>

      {/* Works Page Categories & Filter Bar Controls */}
      <WorksCategoriesManager
        initialCategories={worksCategoriesConfig.categories}
        initialShowBar={worksCategoriesConfig.showCategoryBar}
      />

      {/* Works Listing */}
      {data.projects.length > 0 ? (
        <ProjectRows projects={data.projects} />
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-[#111215] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-500">
            <FolderGit2 size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">No works found</h2>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              {data.stats.total === 0
                ? 'Create your first professional work to showcase on your portfolio.'
                : 'No works match the active search or category filters.'}
            </p>
          </div>
          {data.stats.total === 0 && (
            <Link
              href="/dashboard/projects/new"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#4F8CFF] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#3B78EB]"
            >
              <Plus size={14} />
              <span>Create Work</span>
            </Link>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {data.pagination.pageCount > 1 && (
        <footer className="flex flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between pt-2">
          <span>
            Showing {data.pagination.from}-{data.pagination.to} of {data.pagination.total} works
          </span>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-zinc-300 transition-colors"
              href={queryHref(currentParams, { page: Math.max(1, data.pagination.page - 1) })}
            >
              Previous
            </Link>
            <span className="font-mono">
              {data.pagination.page} / {data.pagination.pageCount}
            </span>
            <Link
              className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10 text-zinc-300 transition-colors"
              href={queryHref(currentParams, { page: Math.min(data.pagination.pageCount, data.pagination.page + 1) })}
            >
              Next
            </Link>
          </div>
        </footer>
      )}
    </main>
  );
}
