'use client';
import { BarChart3, Download, Eye, MousePointerClick, Send, Users } from 'lucide-react';
import { VisitorAnalyticsLineChart } from '@/components/dashboard/VisitorAnalyticsLineChart';
import type { loadPage } from './page-data';
function format(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}
function pct(value: number) {
  return `${format(value)}%`;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-white/10 p-3 text-sm">
      <span className="truncate text-zinc-300">{label}</span>
      <span className="shrink-0 font-medium text-white">{value}</span>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}
export default function DashboardAnalyticsPage({ query, overview, visitorTrend, pages, devices, referrers, conversions, scrollDepth }: Awaited<ReturnType<typeof loadPage>>) {
  
  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-400">No analytics data available for the selected date range when records are empty.</p>
        </div>
        <form className="flex flex-wrap gap-2">
          <select name="range" defaultValue={query.range} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <input name="from" type="date" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <input name="to" type="date" className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white" />
          <button className="h-10 rounded-lg bg-[#4F8CFF] px-4 text-sm font-semibold text-white">Apply</button>
        </form>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Visitors', value: overview.kpis.uniqueVisitors.value, Icon: Users },
          { label: 'Page views', value: overview.kpis.pageViews.value, Icon: Eye },
          { label: 'Sessions', value: overview.kpis.sessions.value, Icon: BarChart3 },
          { label: 'Project views', value: overview.kpis.projectViews.value, Icon: MousePointerClick },
          { label: 'CV downloads', value: overview.kpis.cvDownloads.value, Icon: Download },
          { label: 'Contact submissions', value: overview.kpis.contactMessages.value, Icon: Send },
          { label: 'Hire Me clicks', value: overview.kpis.hireClicks.value, Icon: MousePointerClick },
          { label: 'Conversion rate', value: overview.kpis.conversionRate.value, Icon: BarChart3 },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#111113] p-4">
            <Icon className="h-5 w-5 text-[#4F8CFF]" />
            <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{label === 'Conversion rate' ? pct(value) : format(value)}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#111113] p-5">
        <h2 className="text-base font-semibold text-white">Visitor Analytics Chart</h2>
        {visitorTrend.length ? (
          <div className="mt-5 h-[280px]">
            <VisitorAnalyticsLineChart data={visitorTrend} />
          </div>
        ) : (
          <div className="mt-5 flex h-56 items-center justify-center rounded border border-dashed border-white/10">
            <p className="text-sm text-zinc-500">No analytics data available for the selected date range.</p>
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Page Analytics">
          {pages.pages.length ? pages.pages.map((page) => (
            <Row key={page.route} label={page.route} value={`${page.pageViews} views, ${page.uniqueVisitors} visitors`} />
          )) : <Empty>No analytics data available for the selected date range.</Empty>}
        </Panel>
        <Panel title="Conversion Funnel">
          {conversions.some((step) => step.count) ? conversions.map((step) => (
            <Row key={step.label} label={step.label} value={`${step.count} (${pct(step.previousStepRate)} from previous)`} />
          )) : <Empty>No analytics data available for the selected date range.</Empty>}
        </Panel>
        <Panel title="Referrer Analytics">
          {referrers.length ? referrers.map((referrer) => (
            <Row key={referrer.referrer} label={referrer.referrer} value={`${referrer.sessions} sessions, ${pct(referrer.conversionRate)} conversion`} />
          )) : <Empty>No analytics data available for the selected date range.</Empty>}
        </Panel>
        <Panel title="Device Analytics">
          {devices.length ? devices.map((device) => (
            <Row key={`${device.deviceType}-${device.browser}-${device.os}`} label={`${device.deviceType ?? 'Unknown'} / ${device.browser ?? 'Unknown'} / ${device.os ?? 'Unknown'}`} value={`${device._count._all} sessions`} />
          )) : <Empty>No analytics data available for the selected date range.</Empty>}
        </Panel>
        <Panel title="Scroll Depth Analytics">
          {scrollDepth.some((item) => item.sessions) ? scrollDepth.map((item) => (
            <Row key={item.milestone} label={`${item.milestone}%`} value={`${item.sessions} sessions (${pct(item.percentage)})`} />
          )) : <Empty>No analytics data available for the selected date range.</Empty>}
        </Panel>
      </section>
    </main>
  );
}
