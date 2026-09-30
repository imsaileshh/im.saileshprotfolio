'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { CaseStudyContent, type CaseStudyContentData } from '@/components/case-study/CaseStudyContent';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function CaseStudyEditorPreview({
  caseStudy,
  initialSectionId,
  onClose,
}: {
  caseStudy: CaseStudyContentData;
  initialSectionId?: string;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<DeviceMode>('desktop');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (initialSectionId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(initialSectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialSectionId]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050505] text-zinc-100 font-sans antialiased overflow-hidden">
      {/* ── Preview Header Bar ── */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#0e0f12]/95 px-4 sm:px-6 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Back to Editor</span>
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
              Case Study Preview
            </h2>
            <p className="text-[10px] text-zinc-400">Current unsaved editor state</p>
          </div>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              device === 'desktop'
                ? 'bg-[#4F8CFF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              device === 'tablet'
                ? 'bg-[#4F8CFF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tablet size={14} />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              device === 'mobile'
                ? 'bg-[#4F8CFF] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Close Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Preview (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Public Frame Scroll Area ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#050505] scrollbar-thin">
        <div
          className={`transition-all duration-300 ease-in-out ${
            device === 'desktop'
              ? 'w-full max-w-5xl py-4'
              : device === 'tablet'
              ? 'w-[768px] max-w-full my-4 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl p-6 sm:p-8 overflow-hidden min-h-[800px]'
              : 'w-[390px] max-w-full my-4 rounded-3xl border-4 border-zinc-800 bg-[#0a0a0a] shadow-2xl p-4 overflow-hidden min-h-[700px]'
          }`}
        >
          <CaseStudyContent caseStudy={caseStudy} />
        </div>
      </main>
    </div>
  );
}
