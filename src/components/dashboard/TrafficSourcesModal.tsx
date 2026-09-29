'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Globe,
  ExternalLink,
  Smartphone,
  Calendar,
  Layers,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getTrafficSourcesDataAction } from '@/lib/dashboard/client-actions';
import type { TrafficSourceRangeKey, TrafficSourcesData, TrafficSourceDetailItem } from '@/app/dashboard/(protected)/traffic-sources-actions';

export type TrafficSourcesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: TrafficSourcesData;
};

const RANGES: Array<{ key: TrafficSourceRangeKey; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'last90', label: 'Last 90 days' },
  { key: 'all', label: 'All time' },
];

export function TrafficSourcesModal({
  isOpen,
  onClose,
  initialData,
}: TrafficSourcesModalProps) {
  const [rangeKey, setRangeKey] = useState<TrafficSourceRangeKey>('last7');
  const [data, setData] = useState<TrafficSourcesData>(
    initialData ?? {
      range: { key: 'last7', label: 'Last 7 days' },
      totalVisits: 64,
      summary: { total: 64, direct: 33, referral: 9, search: 5 },
      sources: [
        {
          id: 'src-direct',
          name: 'Direct',
          visits: 33,
          percentage: 52,
          type: 'Direct',
          color: '#4F8CFF',
          referrerUrl: 'Direct navigation (bookmarked or direct link)',
          deviceType: 'Desktop 76% · Mobile 24%',
          recentVisit: 'Just now',
          topPages: ['/', '/works', '/about'],
        },
        {
          id: 'src-localhost',
          name: 'localhost',
          visits: 22,
          percentage: 34,
          type: 'Direct',
          color: '#38BDF8',
          referrerUrl: 'http://localhost:3000',
          deviceType: 'Desktop 100%',
          recentVisit: '2 mins ago',
          topPages: ['/dashboard', '/', '/works'],
        },
        {
          id: 'src-behance',
          name: 'Behance',
          visits: 5,
          percentage: 8,
          type: 'Referral',
          color: '#818CF8',
          referrerUrl: 'https://www.behance.net/gallery/123/Case-Study',
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
          referrerUrl: 'https://www.linkedin.com/feed/',
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
          recentVisit: 'Yesterday, 8:15 PM',
          topPages: ['/about'],
        },
      ],
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initialData if provided
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Lock body scroll and handle Escape key
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleRangeChange(newRange: TrafficSourceRangeKey) {
    setIsDropdownOpen(false);
    if (newRange === rangeKey || isLoading) return;
    setRangeKey(newRange);
    setIsLoading(true);

    try {
      const res = await getTrafficSourcesDataAction(newRange);
      setData(res);
    } catch (err) {
      console.error('Failed to change date range for traffic sources:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedSourceId((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  const currentRangeLabel = RANGES.find((r) => r.key === rangeKey)?.label || 'Last 7 days';

  // Chart data formatting
  const chartData = data.sources.map((s) => ({
    name: s.name,
    value: s.visits,
    color: s.color,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="traffic-sources-modal-title"
    >
      {/* Clickable Backdrop */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#0e0e11] text-white shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Glow Header Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent opacity-70" />

        {/* ── HEADER ────────────────────────────────────────── */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex items-start sm:items-center justify-between gap-4 bg-[#121216]/80 shrink-0">
          <div>
            <h2
              id="traffic-sources-modal-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-white"
            >
              Traffic sources
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Understand where visitors are coming from.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-[#16161a] text-xs font-medium text-zinc-200 hover:bg-white/5 hover:text-white transition-colors focus:outline-none cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span>{currentRangeLabel}</span>
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin text-zinc-400" />
                ) : (
                  <span className="text-[10px] text-zinc-400">▼</span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-white/10 bg-[#141418] py-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  {RANGES.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRangeChange(key)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                        rangeKey === key
                          ? 'bg-[#4F8CFF]/15 text-[#4F8CFF]'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{label}</span>
                      {rangeKey === key && <span className="text-[#4F8CFF]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 no-scrollbar">
          {/* Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/5 bg-[#141418] p-3.5 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Total visits</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {data.summary.total}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#141418] p-3.5 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Direct</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {data.summary.direct}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#141418] p-3.5 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Referral</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {data.summary.referral}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#141418] p-3.5 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Search</span>
              <div className="mt-2 text-2xl font-bold tracking-tight text-white">
                {data.summary.search}
              </div>
            </div>
          </div>

          {/* Main Visualization: Large Donut Chart + Source Breakdown */}
          <div className="rounded-xl border border-white/5 bg-[#141418] p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Donut Chart with Center Text */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="relative w-full max-w-[240px] h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={86}
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

                  {/* Centered Total Visits Indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-3xl font-bold tracking-tight text-white leading-none">
                      {data.totalVisits}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-wider">
                      Total visits
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Breakdown List */}
              <div className="md:col-span-7 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Source breakdown
                </div>
                <div className="space-y-2.5">
                  {data.sources.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-white/5 bg-[#101014] hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            className="font-medium text-white truncate"
                            title={item.referrerUrl || item.name}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-zinc-400">
                            {item.visits} {item.visits === 1 ? 'visit' : 'visits'}
                          </span>
                          <span className="font-semibold text-white w-9 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Compact Progress Bar */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(item.percentage, 2)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TRAFFIC SOURCE DETAILS SECTION ────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-white">
                Traffic source details
              </h3>
              <span className="text-xs text-zinc-500">
                Click a row to expand details
              </span>
            </div>

            {/* Desktop / Tablet Table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-white/5 bg-[#141418]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider bg-[#101014]/60">
                    <th className="py-3 px-4">SOURCE</th>
                    <th className="py-3 px-4 text-right">VISITS</th>
                    <th className="py-3 px-4 text-right">%</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.sources.map((item) => {
                    const isExpanded = expandedSourceId === item.id;
                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          onClick={() => toggleExpand(item.id)}
                          className={`group cursor-pointer transition-colors ${
                            isExpanded
                              ? 'bg-white/[0.04]'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span
                                className="font-medium text-white truncate max-w-[200px]"
                                title={item.referrerUrl || item.name}
                              >
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-zinc-200">
                            {item.visits}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-white">
                            {item.percentage}%
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                item.type === 'Direct'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : item.type === 'Referral'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : item.type === 'Search'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-zinc-500 group-hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                        </tr>

                        {/* Expandable Detail Row */}
                        {isExpanded && (
                          <tr className="bg-[#0b0b0e] border-b border-white/5">
                            <td colSpan={5} className="p-4 sm:p-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-zinc-500 block font-medium">
                                    Referrer URL
                                  </span>
                                  <div
                                    className="text-zinc-200 mt-1 truncate font-mono text-[11px]"
                                    title={item.referrerUrl}
                                  >
                                    {item.referrerUrl}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block font-medium">
                                    Device Type
                                  </span>
                                  <span className="text-zinc-200 mt-1 block">
                                    {item.deviceType}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block font-medium">
                                    Recent Visit
                                  </span>
                                  <span className="text-zinc-200 mt-1 block">
                                    {item.recentVisit}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block font-medium">
                                    Top Referring Pages
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.topPages.map((page) => (
                                      <span
                                        key={page}
                                        className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-mono text-[10px]"
                                      >
                                        {page}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (avoiding horizontal scrolling) */}
            <div className="sm:hidden space-y-2.5">
              {data.sources.map((item) => {
                const isExpanded = expandedSourceId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/5 bg-[#141418] overflow-hidden transition-colors"
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <span
                            className="text-xs font-semibold text-white block truncate"
                            title={item.referrerUrl || item.name}
                          >
                            {item.name}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {item.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">
                            {item.percentage}%
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {item.visits} {item.visits === 1 ? 'visit' : 'visits'}
                          </span>
                        </div>
                        <span className="text-zinc-500">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 border-t border-white/5 bg-[#0b0b0e] space-y-2.5 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[11px]">
                            Referrer URL
                          </span>
                          <span
                            className="text-zinc-300 font-mono text-[11px] truncate block mt-0.5"
                            title={item.referrerUrl}
                          >
                            {item.referrerUrl}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Device</span>
                          <span className="text-zinc-300">{item.deviceType}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Recent visit</span>
                          <span className="text-zinc-300">{item.recentVisit}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px] mb-1">
                            Top pages
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.topPages.map((page) => (
                              <span
                                key={page}
                                className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-mono text-[10px]"
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
