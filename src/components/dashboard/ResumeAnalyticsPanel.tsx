import { Download, Eye, Users } from 'lucide-react';
import { ResumeActivityChart } from './ResumeActivityChart';

export type ResumeAnalyticsData = {
  summary: { views: number; downloads: number; uniqueReaders: number; conversionRate: number };
  daily: Array<{ date: string; views: number; downloads: number }>;
  recentEvents: Array<{ id: string; visitorId: string; eventType: string; pagePath: string; timestamp: Date }>;
};

export function ResumeAnalyticsPanel({ analytics }: { analytics: ResumeAnalyticsData }) {
  const cards = [
    { label: 'Resume views', value: analytics.summary.views, icon: Eye },
    { label: 'Downloads', value: analytics.summary.downloads, icon: Download },
    { label: 'Unique readers', value: analytics.summary.uniqueReaders, icon: Users },
    { label: 'Download conversion', value: `${analytics.summary.conversionRate.toFixed(1)}%`, icon: Download },
  ];

  return <div className="space-y-6"><section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-lg border border-white/10 bg-[#111113] p-4"><Icon className="h-5 w-5 text-[#4F8CFF]" /><p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>)}</section><section className="rounded-lg border border-white/10 bg-[#111113] p-5"><h2 className="text-base font-semibold text-white">Daily resume activity</h2><div className="mt-5 h-[280px]">{analytics.daily.length ? <ResumeActivityChart data={analytics.daily} /> : <div className="flex h-full items-center justify-center rounded border border-dashed border-white/10"><p className="text-sm text-zinc-500">No analytics data available yet.</p></div>}</div></section><section className="rounded-lg border border-white/10 bg-[#111113] p-5"><h2 className="text-base font-semibold text-white">Recent resume events</h2>{analytics.recentEvents.length ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-white/10 text-sm"><thead className="text-left text-xs uppercase tracking-wide text-zinc-500"><tr><th className="py-3 pr-4">Event</th><th className="py-3 pr-4">Anonymous visitor</th><th className="py-3 pr-4">Page</th><th className="py-3">Time</th></tr></thead><tbody className="divide-y divide-white/10">{analytics.recentEvents.map((event) => <tr key={event.id} className="text-zinc-300"><td className="py-3 pr-4">{event.eventType === 'resume_download' ? 'Download' : 'View'}</td><td className="py-3 pr-4 font-mono text-xs">{event.visitorId.slice(0, 8).toUpperCase()}</td><td className="py-3 pr-4">{event.pagePath}</td><td className="py-3">{event.timestamp.toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-zinc-500">No analytics data available yet.</p>}</section></div>;
}
