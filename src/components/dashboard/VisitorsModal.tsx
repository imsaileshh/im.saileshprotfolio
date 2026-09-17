'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Users,
  UserPlus,
  RefreshCw,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { VisitorAnalyticsLineChart } from './VisitorAnalyticsLineChart';
import { VisitorTable, type VisitorRow } from './VisitorTable';
import {
  getVisitorsPopupDataAction,
  type VisitorsPopupData,
} from '@/app/dashboard/(protected)/visitors-actions';
import type { DashboardRangeKey } from '@/lib/dashboard/overview';

export type VisitorsModalProps = {
  isOpen: boolean;
  onClose: () => void;
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

const RANGES: Array<{ key: DashboardRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'last90', label: 'Last 90 Days' },
];

export function VisitorsModal({
  isOpen,
  onClose,
  initialTrend,
  initialVisitors,
}: VisitorsModalProps) {
  const [rangeKey, setRangeKey] = useState<DashboardRangeKey>('last7');
  const [kindFilter, setKindFilter] = useState<'all' | 'new' | 'returning'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<VisitorsPopupData>({
    range: {
      label: 'Last 7 Days',
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    },
    summary: initialVisitors?.summary ?? {
      uniqueVisitors: 0,
      newVisitors: 0,
      returningVisitors: 0,
      totalSessions: 0,
    },
    trend: initialTrend ?? [],
    visitors: initialVisitors?.visitors ?? [],
    pagination: initialVisitors?.pagination ?? {
      total: initialVisitors?.visitors?.length ?? 0,
      page: 1,
      limit: 10,
      pageCount: 1,
    },
  });

  // Reset / sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRangeKey('last7');
      setKindFilter('all');
      setCurrentPage(1);

      // Fetch fresh 10 items for the modal
      void fetchData('last7', 1, 'all');
    }
  }, [isOpen]);

  // Lock scroll when modal is open and handle Escape key
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

  async function fetchData(
    selectedRange: DashboardRangeKey,
    page: number,
    kind: 'all' | 'new' | 'returning'
  ) {
    setIsLoading(true);
    try {
      const result = await getVisitorsPopupDataAction({
        range: selectedRange,
        page,
        limit: 10,
        kind: kind === 'all' ? undefined : kind,
      });
      setData(result);
    } catch (error) {
      console.error('Failed to load visitors popup data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRangeChange = (newRange: DashboardRangeKey) => {
    if (newRange === rangeKey || isLoading) return;
    setRangeKey(newRange);
    setCurrentPage(1);
    void fetchData(newRange, 1, kindFilter);
  };

  const handleKindChange = (newKind: 'all' | 'new' | 'returning') => {
    if (newKind === kindFilter || isLoading) return;
    setKindFilter(newKind);
    setCurrentPage(1);
    void fetchData(rangeKey, 1, newKind);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.pagination.pageCount || isLoading) return;
    setCurrentPage(newPage);
    void fetchData(rangeKey, newPage, kindFilter);
  };

  if (!isOpen) return null;

  const statCards = [
    {
      label: 'Unique Visitors',
      value: data.summary.uniqueVisitors,
      icon: Users,
      accent: 'text-[#4F8CFF] bg-[#4F8CFF]/10 border-[#4F8CFF]/20',
      description: 'Distinct anonymous visitors',
    },
    {
      label: 'New Visitors',
      value: data.summary.newVisitors,
      icon: UserPlus,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'First-time detected sessions',
    },
    {
      label: 'Returning Visitors',
      value: data.summary.returningVisitors,
      icon: RefreshCw,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Repeat portfolio visits',
    },
    {
      label: 'Total Sessions',
      value: data.summary.totalSessions,
      icon: Activity,
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Total active browsing sessions',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitors-modal-title"
    >
      {/* Clickable Backdrop */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#0e0e11] text-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Glow Header Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent opacity-70" />

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121216]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/25 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="visitors-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Visitors Analytics
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#4F8CFF]/15 text-[#4F8CFF] border border-[#4F8CFF]/30">
                  {data.range.label}
                </span>
                {isLoading && (
                  <Loader2 size={14} className="animate-spin text-zinc-400" />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Privacy-conscious anonymous visitor activity from real portfolio sessions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
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
              href="/dashboard/visitors"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
              title="Open full visitors page with custom filters"
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
                <h3 className="text-sm font-semibold text-white">Daily Visitors Trend</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Visitors, sessions, and visitor types across {data.range.label.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="h-[240px] sm:h-[270px]">
              {data.trend.length ? (
                <VisitorAnalyticsLineChart data={data.trend} />
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-white/5">
                  <p className="text-sm text-zinc-500">No visitor trend data available for this period.</p>
                </div>
              )}
            </div>
          </div>

          {/* Visitors Table Section */}
          <div className="rounded-xl border border-white/10 bg-[#121216]/80 overflow-hidden">
            {/* Table Header with Filters */}
            <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Visitor Sessions</h3>
                <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {data.pagination.total} total
                </span>
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
                  <Filter size={12} /> Type:
                </span>
                {(['all', 'new', 'returning'] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => handleKindChange(kind)}
                    disabled={isLoading}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      kindFilter === kind
                        ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/40 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {kind === 'all' ? 'All Visitors' : kind}
                  </button>
                ))}
              </div>
            </div>

            {/* Table content */}
            <div>
              <VisitorTable visitors={data.visitors} />
            </div>

            {/* Pagination Controls */}
            {data.pagination.pageCount > 1 && (
              <div className="px-5 py-3 border-t border-white/10 bg-[#121216]/40 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Page {data.pagination.page} of {data.pagination.pageCount} ({data.pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 transition-colors"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= data.pagination.pageCount || isLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#121216]/40 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono text-[10px]">Esc</kbd> or click outside to close
          </span>
          <Link
            href="/dashboard/visitors"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            Open dedicated visitors page with advanced filters →
          </Link>
        </div>
      </div>
    </div>
  );
}
