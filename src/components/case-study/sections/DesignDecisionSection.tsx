'use client';

import { useState } from 'react';
import { DesignDecisionData } from '@/types/case-study-builder';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface DesignDecisionSectionProps {
  designDecisionData?: DesignDecisionData;
}

export function DesignDecisionSection({ designDecisionData }: DesignDecisionSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!designDecisionData || !designDecisionData.decisions || designDecisionData.decisions.length === 0) return null;

  const decisions = designDecisionData.decisions;
  const activeDecision = decisions[selectedIndex] || decisions[0];
  const totalDecisions = decisions.length;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalDecisions - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < totalDecisions - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-[940px] mx-auto space-y-6 sm:space-y-8">
      {/* ── Compact Category Tabs Navigation & Counter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        {/* Compact decision tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 no-scrollbar">
          {decisions.map((dec, idx) => {
            const isSelected = idx === selectedIndex;
            const numStr = dec.number || String(idx + 1).padStart(2, '0');
            const tabTitle = dec.category || dec.title;

            return (
              <button
                key={dec.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`h-[36px] px-3 rounded-md text-[10.5px] font-mono tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                    : 'bg-[var(--case-surface)] text-muted border-border-subtle hover:text-foreground hover:border-border-subtle-strong'
                }`}
              >
                <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-muted'}`}>
                  {numStr}
                </span>
                <span className="truncate max-w-[170px]">{tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Counter & Arrows */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <span className="font-mono text-[11px] text-muted font-medium">
            {String(selectedIndex + 1).padStart(2, '0')} / {String(totalDecisions).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded border border-border-subtle bg-[var(--case-surface)] text-muted hover:text-foreground hover:bg-border-subtle/30 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous decision"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded border border-border-subtle bg-[var(--case-surface)] text-muted hover:text-foreground hover:bg-border-subtle/30 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next decision"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Decision Content ── */}
      <div key={activeDecision.id || selectedIndex} className="space-y-6 sm:space-y-7 animate-in fade-in duration-200">
        {/* Title + Compact Metric */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-6 pb-5 border-b border-border-subtle">
          <div className="space-y-1.5 max-w-[760px]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              <span>{activeDecision.number || String(selectedIndex + 1).padStart(2, '0')}</span>
              <span>&bull;</span>
              <span>{activeDecision.category || 'DESIGN DECISION'}</span>
            </div>
            <h3 className="text-[24px] sm:text-[28px] lg:text-[34px] font-[650] text-foreground font-display leading-[1.15] tracking-tight">
              {activeDecision.title}
            </h3>
          </div>

          {activeDecision.resultMetric && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10.5px] font-medium shrink-0 self-start sm:self-center">
              <TrendingUp size={12} />
              <span>{activeDecision.resultMetric}</span>
            </div>
          )}
        </div>

        {/* 2-Column Editorial Row 1: Problem & Chosen Direction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-12">
          {/* Problem */}
          <div className="space-y-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted font-semibold block">
              PROBLEM
            </span>
            <p className="text-[14px] sm:text-[14.5px] text-zinc-700 dark:text-zinc-300 leading-[1.6]">
              {activeDecision.problem}
            </p>
          </div>

          {/* Chosen Direction */}
          <div className="space-y-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400 font-semibold block">
              CHOSEN DIRECTION
            </span>
            <p className="text-[14px] sm:text-[14.5px] text-foreground font-medium leading-[1.6]">
              {activeDecision.chosenSolution}
            </p>
          </div>
        </div>

        {/* 2-Column Editorial Row 2: Alternative Considered & Why Rejected */}
        {(activeDecision.alternativeConsidered || activeDecision.whyAlternativeRejected) && (
          <div className="pt-6 border-t border-border-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 lg:gap-12">
              {activeDecision.alternativeConsidered ? (
                <div className="space-y-2">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted font-semibold block">
                    ALTERNATIVE CONSIDERED
                  </span>
                  <p className="text-[13.5px] sm:text-[14px] text-zinc-600 dark:text-zinc-400 leading-[1.6]">
                    {activeDecision.alternativeConsidered}
                  </p>
                </div>
              ) : <div />}

              {activeDecision.whyAlternativeRejected ? (
                <div className="space-y-2">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-red-500 dark:text-red-400 font-semibold block">
                    WHY REJECTED
                  </span>
                  <p className="text-[13.5px] sm:text-[14px] text-zinc-600 dark:text-zinc-400 leading-[1.6]">
                    {activeDecision.whyAlternativeRejected}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Full-Width Editorial Row 3: Trade-off */}
        {activeDecision.tradeOff && (
          <div className="pt-6 border-t border-border-subtle space-y-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-amber-500 dark:text-amber-400 font-semibold block">
              TRADE-OFF
            </span>
            <p className="text-[13.5px] sm:text-[14px] text-zinc-600 dark:text-zinc-400 leading-[1.6] max-w-[840px]">
              {activeDecision.tradeOff}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

