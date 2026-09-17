'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { ResumeActivityChart } from './ResumeActivityChart';
import { ResumeAnalyticsModal, type SerializedResumeAnalytics } from './ResumeAnalyticsModal';

export function ResumeActivityCard({ analytics }: { analytics: SerializedResumeAnalytics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('popup') === 'resume-analytics' || searchParams.get('resume') === 'analytics') {
        setIsModalOpen(true);
      }
    }
  }, []);

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-[#0e0e10] p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Resume activity</h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F8CFF] hover:text-[#3B78EB] hover:underline transition-colors focus:outline-none"
            aria-label="View resume analytics in popup"
          >
            <BarChart3 size={13} />
            View analytics
          </button>
        </div>

        <div className="mt-4 h-[210px]">
          {analytics.daily.length ? (
            <ResumeActivityChart data={analytics.daily} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/5">
              <p className="text-sm text-zinc-500">No analytics data available yet.</p>
            </div>
          )}
        </div>
      </div>

      <ResumeAnalyticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={analytics}
      />
    </>
  );
}
