'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { VisitorAnalyticsLineChart } from './VisitorAnalyticsLineChart';
import { VisitorsModal } from './VisitorsModal';
import type { VisitorRow } from './VisitorTable';

export type DailyVisitorsCardProps = {
  initialTrend: Array<{
    date: string;
    visitors: number;
    sessions: number;
    newVisitors: number;
    returningVisitors: number;
  }>;
  initialVisitors?: {
    visitors: VisitorRow[];
    summary: {
      uniqueVisitors: number;
      newVisitors: number;
      returningVisitors: number;
      totalSessions: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pageCount: number;
    };
  };
};

export function DailyVisitorsCard({
  initialTrend,
  initialVisitors,
}: DailyVisitorsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.get('popup') === 'visitors' ||
        searchParams.get('visitors') === 'popup' ||
        searchParams.get('view') === 'visitors'
      ) {
        setIsModalOpen(true);
      }
    }
  }, []);

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-[#0e0e10] p-6 xl:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Daily visitors</h2>
            <p className="mt-1 text-xs text-zinc-500">Last 7 days</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F8CFF] hover:text-[#3B78EB] hover:underline transition-colors focus:outline-none cursor-pointer"
            aria-label="View visitors popup"
          >
            <Users size={13} />
            View visitors
          </button>
        </div>

        <div className="mt-4 h-[230px]">
          {initialTrend.length ? (
            <VisitorAnalyticsLineChart data={initialTrend} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/5">
              <p className="text-sm text-zinc-500">No analytics data available yet.</p>
            </div>
          )}
        </div>
      </div>

      <VisitorsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTrend={initialTrend}
        initialVisitors={initialVisitors}
      />
    </>
  );
}
