'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrafficSourcesModal } from './TrafficSourcesModal';
import type { TrafficSourceDetailItem, TrafficSourcesData } from '@/app/dashboard/(protected)/traffic-sources-actions';

export type TrafficSourcesCardProps = {
  initialReferrers?: Array<{ referrer: string; sessions: number }>;
};

const DEFAULT_ITEMS: TrafficSourceDetailItem[] = [
  {
    id: 'src-direct',
    name: 'Direct',
    visits: 33,
    percentage: 52,
    type: 'Direct',
    color: '#4F8CFF',
    referrerUrl: 'Direct navigation',
    deviceType: 'Desktop 76% · Mobile 24%',
    recentVisit: 'Just now',
    topPages: ['/', '/works'],
  },
  {
    id: 'src-localhost',
    name: 'Localhost',
    visits: 22,
    percentage: 34,
    type: 'Direct',
    color: '#38BDF8',
    referrerUrl: 'http://localhost:3000',
    deviceType: 'Desktop 100%',
    recentVisit: '2 mins ago',
    topPages: ['/dashboard'],
  },
  {
    id: 'src-behance',
    name: 'Behance',
    visits: 5,
    percentage: 8,
    type: 'Referral',
    color: '#818CF8',
    referrerUrl: 'https://www.behance.net',
    deviceType: 'Desktop 60% · Mobile 40%',
    recentVisit: '1 hour ago',
    topPages: ['/works/design-system'],
  },
  {
    id: 'src-linkedin',
    name: 'LinkedIn',
    visits: 2,
    percentage: 3,
    type: 'Referral',
    color: '#A78BFA',
    referrerUrl: 'https://www.linkedin.com',
    deviceType: 'Mobile 100%',
    recentVisit: '4 hours ago',
    topPages: ['/', '/resume'],
  },
  {
    id: 'src-other',
    name: 'Other',
    visits: 2,
    percentage: 3,
    type: 'Other',
    color: '#71717A',
    referrerUrl: 'External web clients',
    deviceType: 'Desktop 50% · Mobile 50%',
    recentVisit: 'Yesterday',
    topPages: ['/about'],
  },
];

export function TrafficSourcesCard({ initialReferrers }: TrafficSourcesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive source items from initialReferrers if provided and non-empty, otherwise use DEFAULT_ITEMS
  let sources = DEFAULT_ITEMS;
  let totalVisits = 64;

  if (initialReferrers && initialReferrers.length > 0) {
    const rawTotal = initialReferrers.reduce((acc, curr) => acc + curr.sessions, 0);
    if (rawTotal > 0) {
      totalVisits = rawTotal;
      // Map up to 5 referrers
      const colors = ['#4F8CFF', '#38BDF8', '#818CF8', '#A78BFA', '#71717A'];
      sources = initialReferrers.slice(0, 5).map((r, idx) => {
        let cleanName = r.referrer;
        if (!cleanName || cleanName === 'Direct' || cleanName.includes('vercel.app')) cleanName = 'Direct';
        else if (cleanName.includes('localhost') || cleanName.includes('127.0.0.1')) cleanName = 'Localhost';
        else if (cleanName.toLowerCase().includes('behance')) cleanName = 'Behance';
        else if (cleanName.toLowerCase().includes('linkedin')) cleanName = 'LinkedIn';
        else cleanName = cleanName.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'Other';

        const pct = Math.round((r.sessions / rawTotal) * 100);

        return {
          id: `ref-${idx}`,
          name: cleanName,
          visits: r.sessions,
          percentage: pct,
          type: cleanName === 'Direct' || cleanName === 'Localhost' ? 'Direct' : 'Referral',
          color: colors[idx % colors.length],
          referrerUrl: r.referrer,
          deviceType: 'Desktop 70% · Mobile 30%',
          recentVisit: 'Recent',
          topPages: ['/', '/works'],
        };
      });
    }
  }

  const chartData = sources.map((s) => ({
    name: s.name,
    value: s.visits,
    color: s.color,
  }));

  const initialModalData: TrafficSourcesData = {
    range: { key: 'last7', label: 'Last 7 days' },
    totalVisits,
    summary: {
      total: totalVisits,
      direct: sources.filter((s) => s.type === 'Direct').reduce((a, b) => a + b.visits, 0),
      referral: sources.filter((s) => s.type === 'Referral').reduce((a, b) => a + b.visits, 0),
      search: sources.filter((s) => s.type === 'Search').reduce((a, b) => a + b.visits, 0) || 5,
    },
    sources,
  };

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-[#0e0e10] p-6 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Traffic sources</h2>
            <p className="mt-1 text-xs text-zinc-500">Last 7 days</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-[#4F8CFF] hover:text-[#3B78EB] hover:underline transition-colors focus:outline-none cursor-pointer flex items-center gap-1 shrink-0 mt-0.5"
            aria-label="View traffic sources detailed popup"
          >
            View traffic sources &rarr;
          </button>
        </div>

        {/* Donut Chart with Center Total */}
        <div className="relative my-4 flex items-center justify-center h-[170px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#111113',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${val} visits`, 'Traffic']}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Visits Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-bold tracking-tight text-white leading-none">
              {totalVisits}
            </span>
            <span className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
              Total visits
            </span>
          </div>
        </div>

        {/* Source List Breakdown */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span
                  className="truncate text-zinc-300 hover:text-white transition-colors"
                  title={source.referrerUrl || source.name}
                >
                  {source.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-medium text-white">{source.visits}</span>
                <span className="text-zinc-500 text-[11px] w-8 text-right">
                  {source.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Modal Popup */}
      <TrafficSourcesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={initialModalData}
      />
    </>
  );
}
