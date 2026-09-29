'use client';
import { AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { pickParam } from '@/lib/dashboard/presentation';
import { VisitorAnalyticsLineChart } from '@/components/dashboard/VisitorAnalyticsLineChart';
import { VisitorTable } from '@/components/dashboard/VisitorTable';
import type { loadPage } from './page-data';

export default function DashboardVisitorsPage({ resolvedParams, query, range, data, trend, error }: Awaited<ReturnType<typeof loadPage>>) {
  if (error || !data) {
    return (
      <main className="space-y-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visitor Analytics</h1>
            <p className="text-sm text-zinc-400">Privacy-conscious anonymous visitor activity from real sessions.</p>
          </div>
        </header>

        <section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111113] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-white">Unable to load visitor data right now.</h2>
          <p className="mt-1 text-sm text-zinc-400">There was an issue retrieving visitor analytics. Please try reloading or check back shortly.</p>
          <a
            href="/dashboard/visitors"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </a>
        </section>
      </main>
    );
  }
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitor Analytics</h1>
          <p className="text-sm text-zinc-400">Privacy-conscious anonymous visitor activity from real sessions.</p>
        </div>
        <form className="flex flex-wrap gap-2">
          <select
            name="range"
            defaultValue={range.range}
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="custom">Custom</option>
          </select>
          <input
            name="from"
            type="date"
            defaultValue={pickParam(resolvedParams, 'from')}
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="to"
            type="date"
            defaultValue={pickParam(resolvedParams, 'to')}
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="device"
            defaultValue={query.device}
            placeholder="Device"
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="browser"
            defaultValue={query.browser}
            placeholder="Browser"
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="os"
            defaultValue={query.os}
            placeholder="Operating system"
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <input
            name="referrer"
            defaultValue={query.referrer}
            placeholder="Referrer"
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          />
          <select
            name="kind"
            defaultValue={query.kind ?? ''}
            className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"
          >
            <option value="">All visitors</option>
            <option value="new">New Visitor</option>
            <option value="returning">Returning Visitor</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white cursor-pointer hover:bg-[#3d7ae8] transition-colors"
          >
            <Filter size={15} /> Filter
          </button>
        </form>
      </header>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Daily visitors</h2>
            <p className="mt-1 text-xs text-zinc-500">{range.range}</p>
          </div>
        </div>
        <div className="mt-5 h-[280px]">
          {trend.length ? (
            <VisitorAnalyticsLineChart data={trend} />
          ) : (
            <div className="flex h-full items-center justify-center rounded border border-dashed border-white/10">
              <p className="text-sm text-zinc-500">No analytics data available yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Unique visitors', data.summary.uniqueVisitors],
          ['New visitors', data.summary.newVisitors],
          ['Returning visitors', data.summary.returningVisitors],
          ['Total sessions', data.summary.totalSessions],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#111113] p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113]">
        <VisitorTable visitors={data.visitors} />
      </section>

      {data.pagination.pageCount > 1 && (
        <nav className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            Page {data.pagination.page} of {data.pagination.pageCount}
          </span>
          <div className="flex gap-2">
            {data.pagination.page > 1 && (
              <a
                className="rounded border border-white/10 px-3 py-1.5 hover:bg-white/10"
                href={`?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(resolvedParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? '' : v ?? ''])
                  ),
                  page: String(data.pagination.page - 1),
                }).toString()}`}
              >
                Previous
              </a>
            )}
            {data.pagination.page < data.pagination.pageCount && (
              <a
                className="rounded border border-white/10 px-3 py-1.5 hover:bg-white/10"
                href={`?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(resolvedParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? '' : v ?? ''])
                  ),
                  page: String(data.pagination.page + 1),
                }).toString()}`}
              >
                Next
              </a>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
