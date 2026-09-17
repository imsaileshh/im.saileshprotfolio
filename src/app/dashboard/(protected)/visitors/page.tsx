import { Filter } from 'lucide-react';
import { getDashboardVisitors, getVisitorAnalytics, pickParam } from '@/lib/dashboard/data';
import { analyticsQuerySchema, visitorListQuerySchema } from '@/lib/validation/schemas';
import { VisitorAnalyticsLineChart } from '@/components/dashboard/VisitorAnalyticsLineChart';
import { VisitorTable } from '@/components/dashboard/VisitorTable';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardVisitorsPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const query = visitorListQuerySchema.parse({
    page: pickParam(resolvedParams, 'page'),
    limit: pickParam(resolvedParams, 'limit'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
    device: pickParam(resolvedParams, 'device'),
    browser: pickParam(resolvedParams, 'browser'),
    os: pickParam(resolvedParams, 'os'),
    referrer: pickParam(resolvedParams, 'referrer'),
    kind: pickParam(resolvedParams, 'kind'),
    hasConversion: pickParam(resolvedParams, 'hasConversion'),
    sort: pickParam(resolvedParams, 'sort'),
  });
  const range = analyticsQuerySchema.parse({
    range: pickParam(resolvedParams, 'range'),
    from: pickParam(resolvedParams, 'from'),
    to: pickParam(resolvedParams, 'to'),
  });
  const [data, trend] = await Promise.all([
    getDashboardVisitors(query),
    getVisitorAnalytics(range.range, range.from, range.to),
  ]);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
        <p className="text-sm text-zinc-400">Privacy-conscious anonymous visitor activity from real sessions.</p>
        </div>
        <form className="flex flex-wrap gap-2">
          <select name="range" defaultValue={range.range} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white"><option value="today">Today</option><option value="last7">Last 7 Days</option><option value="last30">Last 30 Days</option><option value="last90">Last 90 Days</option><option value="custom">Custom</option></select>
          <input name="from" type="date" defaultValue={pickParam(resolvedParams, 'from')} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="to" type="date" defaultValue={pickParam(resolvedParams, 'to')} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="device" defaultValue={query.device} placeholder="Device" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="browser" defaultValue={query.browser} placeholder="Browser" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="os" defaultValue={query.os} placeholder="Operating system" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="referrer" defaultValue={query.referrer} placeholder="Referrer" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <select name="kind" defaultValue={query.kind ?? ''} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="">All visitors</option>
            <option value="new">New Visitor</option>
            <option value="returning">Returning Visitor</option>
          </select>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white"><Filter size={15} /> Filter</button>
        </form>
      </header>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold">Daily visitors</h2><p className="mt-1 text-xs text-zinc-500">{range.range}</p></div></div>
        <div className="mt-5 h-[280px]">{trend.length ? <VisitorAnalyticsLineChart data={trend} /> : <div className="flex h-full items-center justify-center rounded border border-dashed border-white/10"><p className="text-sm text-zinc-500">No analytics data available yet.</p></div>}</div>
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

      {data.pagination.pageCount > 1 && <nav className="flex items-center justify-between text-sm text-zinc-400"><span>Page {data.pagination.page} of {data.pagination.pageCount}</span><div className="flex gap-2">{data.pagination.page > 1 && <a className="rounded border border-white/10 px-3 py-1.5 hover:bg-white/10" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(resolvedParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] ?? '' : value ?? ''])), page: String(data.pagination.page - 1) }).toString()}`}>Previous</a>}{data.pagination.page < data.pagination.pageCount && <a className="rounded border border-white/10 px-3 py-1.5 hover:bg-white/10" href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(resolvedParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] ?? '' : value ?? ''])), page: String(data.pagination.page + 1) }).toString()}`}>Next</a>}</div></nav>}
    </main>
  );
}
