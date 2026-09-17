import {
  MessageSquare,
  FolderGit2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { getDashboardOverview, resolveDashboardDateRange } from '@/lib/dashboard/overview';
import { prisma } from '@/lib/database/prisma';
import { getProjectStatus } from '@/lib/dashboard/projects';
import { seedDefaultContentAction } from './seed-actions';
import { DailyVisitorsCard } from '@/components/dashboard/DailyVisitorsCard';
import { ResumeActivityCard } from '@/components/dashboard/ResumeActivityCard';
import { TrafficSourceDonut } from '@/components/dashboard/TrafficSourceDonut';
import { getDashboardVisitors, getReferrerAnalytics, getResumeAnalytics, getVisitorAnalytics } from '@/lib/dashboard/data';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const dateRange = resolveDashboardDateRange('last7');
  const overview = await getDashboardOverview(dateRange);
  const [visitorTrend, referrers, recentVisitors, resumeAnalytics] = await Promise.all([
    getVisitorAnalytics('last7'),
    getReferrerAnalytics('last7'),
    getDashboardVisitors({ page: 1, limit: 5, from: dateRange.from, to: dateRange.to, sort: 'lastSeenDesc' }),
    getResumeAnalytics('last7'),
  ]);
  
  // Check configs for Hero
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const heroConfigured = !!settings?.heroContent;

  // Unread messages
  const unreadMessages = await prisma.contactMessage.findMany({
    where: { isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Recent projects for the analytics sidebar
  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 4,
    select: { id: true, title: true, published: true, archived: true, updatedAt: true }
  });

  const hasTrendData = overview.trends.some(
    (point) => point.visitors || point.pageViews || point.conversions || point.cvDownloads,
  );
  const maxTrendValue = Math.max(
    1,
    ...overview.trends.map((point) => point.pageViews + point.conversions + point.cvDownloads),
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Overview of your portfolio performance, visitors, and activity.
          </p>
        </div>
      </div>

      {/* Needs Attention / Alerts */}
      {unreadMessages.length > 0 && (
        <div className="bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#4F8CFF]/20 rounded-lg text-[#4F8CFF] shrink-0 mt-1 sm:mt-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">You have {unreadMessages.length} unread messages</h3>
              <p className="text-sm text-[#4F8CFF]/80 mt-1">Respond to potential clients and recruiters to keep your pipeline active.</p>
            </div>
          </div>
          <Link href="/dashboard/messages" className="px-4 py-2 bg-[#4F8CFF]/20 text-[#4F8CFF] text-sm font-semibold rounded-lg hover:bg-[#4F8CFF]/30 transition-colors whitespace-nowrap">
            View Messages
          </Link>
        </div>
      )}

      {/* One-time content initializer — only shown when heroContent has never been saved */}
      {!heroConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Portfolio content not yet initialised</h3>
            <p className="text-sm text-amber-400/80 mt-1">Click to load the existing portfolio defaults into the CMS so you can edit them from the dashboard.</p>
          </div>
          <form action={seedDefaultContentAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-lg hover:bg-amber-500/30 transition-colors whitespace-nowrap"
            >
              Initialize Content
            </button>
          </form>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <DailyVisitorsCard
          initialTrend={visitorTrend}
          initialVisitors={{
            summary: recentVisitors.summary,
            visitors: recentVisitors.visitors.map((visitor) => ({
              ...visitor,
              visitTime: visitor.visitTime.toISOString(),
              firstSeen: visitor.firstSeen.toISOString(),
              lastSeen: visitor.lastSeen.toISOString(),
            })),
            pagination: recentVisitors.pagination,
          }}
        />
        <div className="rounded-xl border border-white/5 bg-[#0e0e10] p-6"><h2 className="text-base font-bold text-white">Traffic sources</h2>{referrers.length ? <><TrafficSourceDonut data={referrers.slice(0, 5)} /><div className="space-y-2">{referrers.slice(0, 5).map((referrer) => <div key={referrer.referrer} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-zinc-300">{referrer.referrer}</span><span className="font-medium text-white">{referrer.sessions}</span></div>)}</div></> : <p className="mt-5 text-sm text-zinc-500">No analytics data available yet.</p>}</div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#0e0e10] p-6"><div className="flex items-center justify-between"><h2 className="text-base font-bold text-white">Recent visitors</h2><Link href="/dashboard/visitors" className="text-xs font-semibold text-[#4F8CFF] hover:underline">View all</Link></div><div className="mt-4 space-y-3">{recentVisitors.visitors.length ? recentVisitors.visitors.map((visitor) => <div key={visitor.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 px-3 py-2 text-sm"><span className="font-mono text-xs text-zinc-300">{visitor.id.slice(0, 8).toUpperCase()}</span><span className="truncate text-zinc-500">{visitor.referrer ?? 'Direct'} · {visitor.deviceType ?? 'Unknown'}</span><span className="shrink-0 text-xs text-zinc-500">{visitor.visitTime.toLocaleDateString()}</span></div>) : <p className="text-sm text-zinc-500">No analytics data available yet.</p>}</div></div>
        <ResumeActivityCard
          analytics={{
            range: {
              label: resumeAnalytics.range.label,
              from: resumeAnalytics.range.from.toISOString(),
              to: resumeAnalytics.range.to.toISOString(),
            },
            summary: resumeAnalytics.summary,
            daily: resumeAnalytics.daily,
            recentEvents: resumeAnalytics.recentEvents.map((e) => ({
              ...e,
              timestamp: e.timestamp.toISOString(),
            })),
          }}
        />
      </section>

      {/* Analytics Section */}
      <section className="pt-8 border-t border-white/5">
        <h2 className="text-lg font-semibold text-white mb-6">Analytics Overview</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-[#0e0e10] border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">Traffic Overview</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Last 7 Days</span>
          </div>
          {hasTrendData ? (
            <div className="flex-1 flex items-end gap-2 min-h-[200px]">
              {overview.trends.map((point) => {
                const total = point.pageViews + point.conversions + point.cvDownloads;
                const height = Math.max(4, Math.round((total / maxTrendValue) * 100));
                return (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full h-40 bg-white/5 rounded-md relative flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#4F8CFF] transition-all duration-300 group-hover:bg-[#3B78EB]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{point.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
              <p className="text-sm text-zinc-500">No analytics data available yet.</p>
            </div>
          )}
        </div>

        {/* Recent Projects Sidebar */}
        <div className="bg-[#0e0e10] border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-xs font-semibold text-[#4F8CFF] hover:underline">View All</Link>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {recentProjects.length > 0 ? recentProjects.map(project => {
              const status = getProjectStatus({ published: project.published, archived: project.archived });
              return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group flex flex-col p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-white group-hover:text-[#4F8CFF] transition-colors">{project.title}</span>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-[#4F8CFF] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`inline-block w-2 h-2 rounded-full ${status === 'Published' ? 'bg-green-500' : status === 'Draft' ? 'bg-amber-500' : 'bg-zinc-500'}`}></span>
                  <span className="text-xs text-zinc-500">{status}</span>
                  <span className="text-xs text-zinc-600 ml-auto">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            )}) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-lg">
                <FolderGit2 size={24} className="text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400 font-medium">No projects yet</p>
                <Link href="/dashboard/projects/new" className="text-xs text-[#4F8CFF] hover:underline mt-1">Create your first project</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </section>
    </div>
  );
}
