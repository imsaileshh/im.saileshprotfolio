'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  X, 
  Clock, 
  CheckCircle2, 
  Eye,
  RefreshCw
} from 'lucide-react';

interface HomeOverviewPreviewProps {
  updatedAt?: string | null;
  activeSection: string;
  onSelectSection: (id: string) => void;
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'section-order', label: 'Section Order' },
  { id: 'hero', label: 'Hero' },
  { id: 'works', label: 'Works' },
  { id: 'personal-projects', label: 'Personal Projects' },
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
];

export function HomeOverviewPreview({
  updatedAt,
  activeSection,
  onSelectSection,
}: HomeOverviewPreviewProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Recently synced';

  return (
    <header className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-white/10 bg-[#111113] p-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Home</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={12} />
              Live CMS
            </span>
          </div>
          <p className="mt-1.5 text-sm text-zinc-400">
            Manage everything displayed on your public homepage.
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={13} />
            <span>Last updated: {formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 hover:border-white/25 transition-colors"
          >
            <Eye size={15} />
            In-App Preview
          </button>
          
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4F8CFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B78EB] transition-colors shadow-sm"
          >
            <span>Open Homepage</span>
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      {/* Section Quick Jump Pill Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-semibold border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Live In-App Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-white">Live Homepage Preview</span>
              <span className="text-xs text-zinc-400 hidden sm:inline">(Actual public homepage)</span>
            </div>

            {/* Viewport Toggles & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-white/10 bg-black/50 p-1">
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    viewport === 'desktop' ? 'bg-[#4F8CFF] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    viewport === 'mobile' ? 'bg-[#4F8CFF] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Refresh preview"
              >
                <RefreshCw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950 ${
                viewport === 'mobile'
                  ? 'w-[390px] max-w-full rounded-[36px] border-4 border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
                  : 'w-full max-w-6xl'
              }`}
            >
              <iframe
                key={iframeKey}
                src="/"
                title="Public Homepage Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
