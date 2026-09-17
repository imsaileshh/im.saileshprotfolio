'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  ExternalLink, 
  Eye, 
  Download, 
  Users, 
  TrendingUp, 
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { ResumeActivityChart } from './ResumeActivityChart';
import { getResumeAnalyticsAction } from '@/app/dashboard/(protected)/resume/actions';
import type { DashboardRangeKey } from '@/lib/dashboard/overview';

export type ResumeEventItem = {
  id: string;
  visitorId: string;
  eventType: string;
  pagePath: string;
  timestamp: string | Date;
};

export type SerializedResumeAnalytics = {
  range?: {
    label: string;
    from?: string | Date;
    to?: string | Date;
  };
  summary: {
    views: number;
    downloads: number;
    uniqueReaders: number;
    conversionRate: number;
  };
  daily: Array<{ date: string; views: number; downloads: number }>;
  recentEvents: ResumeEventItem[];
};

export type ResumeAnalyticsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData: SerializedResumeAnalytics;
};

const RANGES: Array<{ key: DashboardRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'last90', label: 'Last 90 Days' },
];

export function ResumeAnalyticsModal({ isOpen, onClose, initialData }: ResumeAnalyticsModalProps) {
  const [rangeKey, setRangeKey] = useState<DashboardRangeKey>('last7');
  const [analytics, setAnalytics] = useState<SerializedResumeAnalytics>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Sync initialData when it updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setAnalytics(initialData);
      setRangeKey('last7');
    }
  }, [isOpen, initialData]);

  // Lock scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleRangeChange = async (newRange: DashboardRangeKey) => {
    if (newRange === rangeKey || isLoading) return;
    setRangeKey(newRange);
    setIsLoading(true);
    try {
      const data = await getResumeAnalyticsAction(newRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load resume analytics for range', newRange, err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const statCards = [
    {
      label: 'Resume Views',
      value: analytics.summary.views,
      icon: Eye,
      accent: 'text-[#4F8CFF] bg-[#4F8CFF]/10 border-[#4F8CFF]/20',
      description: 'Total resume impressions',
    },
    {
      label: 'Downloads',
      value: analytics.summary.downloads,
      icon: Download,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'PDF/DOCX file downloads',
    },
    {
      label: 'Unique Readers',
      value: analytics.summary.uniqueReaders,
      icon: Users,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Distinct anonymous visitors',
    },
    {
      label: 'Download Rate',
      value: `${analytics.summary.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Downloads per unique reader',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-analytics-modal-title"
    >
      {/* Clickable Backdrop */}
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#0e0e11] text-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Glow Header Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent opacity-70" />

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121216]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/25 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="resume-analytics-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Resume Analytics
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30">
                  {analytics.range?.label || 'Last 7 Days'}
                </span>
                {isLoading && (
                  <Loader2 size={14} className="animate-spin text-zinc-400" />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real resume views and downloads recorded from portfolio sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Range Pills */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
              {RANGES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRangeChange(key)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    rangeKey === key
                      ? 'bg-[#4F8CFF] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Link to Full Page */}
            <Link
              href="/dashboard/resume?view=analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
              title="Open full Resume Analytics page"
            >
              <ExternalLink size={13} />
              <span className="hidden md:inline">Full Page</span>
            </Link>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-white/10 bg-[#121216]/80 p-4 flex flex-col justify-between hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      {card.label}
                    </span>
                    <div className={`p-1.5 rounded-lg border ${card.accent}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Trend Chart */}
          <div className="rounded-xl border border-white/10 bg-[#121216]/80 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Daily Resume Activity</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Impressions vs file downloads per calendar day</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4F8CFF]" /> Views
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" /> Downloads
                </span>
              </div>
            </div>

            <div className="h-[240px] sm:h-[280px]">
              {analytics.daily.length ? (
                <ResumeActivityChart data={analytics.daily} />
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/5">
                  <p className="text-sm text-zinc-500">No activity recorded for this period.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Events Table */}
          <div className="rounded-xl border border-white/10 bg-[#121216]/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Resume Events</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Detailed event logs from portfolio sessions</p>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {analytics.recentEvents.length} events
              </span>
            </div>

            {analytics.recentEvents.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Visitor ID</th>
                      <th className="px-4 py-3">Page</th>
                      <th className="px-4 py-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {analytics.recentEvents.map((event) => {
                      const isDownload = event.eventType === 'resume_download';
                      const formattedTime = new Date(event.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      return (
                        <tr key={event.id} className="text-zinc-300 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                isDownload
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30'
                              }`}
                            >
                              {isDownload ? <Download size={12} /> : <Eye size={12} />}
                              {isDownload ? 'Download' : 'View'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                            {event.visitorId.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400 max-w-[200px] truncate">
                            {event.pagePath || '/'}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400 text-right whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} className="text-zinc-500" />
                              {formattedTime}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-white/5">
                <p className="text-sm text-zinc-500">No resume events recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#121216]/40 flex items-center justify-between text-xs text-zinc-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono text-[10px]">Esc</kbd> or click outside to close</span>
          <Link href="/dashboard/resume" className="hover:text-zinc-300 transition-colors">
            Manage Resumes →
          </Link>
        </div>
      </div>
    </div>
  );
}
