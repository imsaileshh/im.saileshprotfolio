'use client';

import { JourneyMapData, JourneyEmotion } from '@/types/case-study-builder';
import { Map, Sparkles, Smile, Frown, Meh } from 'lucide-react';

interface JourneyMapSectionProps {
  journeyMap?: JourneyMapData;
}

export function JourneyMapSection({ journeyMap }: JourneyMapSectionProps) {
  if (!journeyMap || !journeyMap.stages || journeyMap.stages.length === 0) return null;

  const { journeyName, personaName, stages } = journeyMap;

  const renderEmotionBadge = (emotion: JourneyEmotion) => {
    switch (emotion) {
      case 'very-positive':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">Very Positive 🚀</span>;
      case 'positive':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">Positive 🙂</span>;
      case 'neutral':
        return <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-muted border border-border-subtle text-[10px] font-mono">Neutral 😐</span>;
      case 'negative':
        return <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-mono">Negative 🙁</span>;
      case 'very-negative':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 text-[10px] font-mono">Very Negative 😭</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-[var(--panel)] text-muted text-[10px]">Neutral</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-border-subtle/80 bg-[var(--card)]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
            USER JOURNEY MAP MATRIX
          </span>
          <h3 className="text-xl font-display font-semibold text-foreground">{journeyName}</h3>
        </div>
        {personaName && (
          <div className="px-3 py-1 rounded-lg bg-[var(--panel)] border border-border-subtle text-xs text-muted font-mono">
            Persona: <span className="text-foreground font-semibold">{personaName}</span>
          </div>
        )}
      </div>

      {/* Desktop Horizontal Matrix */}
      <div className="hidden lg:block w-full overflow-x-auto no-scrollbar rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-6">
        <div className="grid grid-cols-5 gap-4 min-w-[900px]">
          {stages.map((stg, idx) => (
            <div key={stg.id || idx} className="space-y-4 rounded-xl border border-border-subtle bg-[var(--panel)] p-4 flex flex-col justify-between">
              {/* Stage Header */}
              <div className="space-y-2 border-b border-border-subtle pb-3">
                <span className="font-mono text-[10px] text-accent font-bold">0{idx + 1} STAGE</span>
                <h4 className="text-sm font-bold text-foreground">{stg.name}</h4>
                <div>{renderEmotionBadge(stg.emotion)}</div>
              </div>

              {/* Actions */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">Actions</span>
                <ul className="space-y-1 text-xs text-foreground/90">
                  {stg.actions.map((act, aIdx) => (
                    <li key={aIdx} className="leading-tight">&bull; {act}</li>
                  ))}
                </ul>
              </div>

              {/* Thoughts */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">Thoughts</span>
                <ul className="space-y-1 text-xs text-muted/90 italic">
                  {stg.thoughts.map((th, tIdx) => (
                    <li key={tIdx} className="leading-tight">"{th}"</li>
                  ))}
                </ul>
              </div>

              {/* Pain Points */}
              {stg.painPoints && stg.painPoints.length > 0 && (
                <div className="space-y-1 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400 block font-bold">Friction</span>
                  <ul className="space-y-1 text-[11px] text-red-700 dark:text-red-300">
                    {stg.painPoints.map((pn, pIdx) => (
                      <li key={pIdx}>&bull; {pn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opportunity */}
              {stg.opportunity && (
                <div className="space-y-1 p-2 rounded bg-accent/10 border border-accent/20">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-accent block font-bold flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>Opportunity</span>
                  </span>
                  <p className="text-[11px] text-accent/90 leading-tight">{stg.opportunity}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stacked Stages */}
      <div className="block lg:hidden space-y-4">
        {stages.map((stg, idx) => (
          <div key={stg.id || idx} className="rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent">Stage 0{idx + 1}</span>
                <h4 className="text-base font-bold text-foreground">{stg.name}</h4>
              </div>
              <div>{renderEmotionBadge(stg.emotion)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-muted block mb-1">Actions</span>
                <ul className="space-y-1 text-foreground">
                  {stg.actions.map((act, aIdx) => (
                    <li key={aIdx}>&bull; {act}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase text-muted block mb-1">Thoughts</span>
                <ul className="space-y-1 text-muted italic">
                  {stg.thoughts.map((th, tIdx) => (
                    <li key={tIdx}>"{th}"</li>
                  ))}
                </ul>
              </div>
            </div>

            {stg.opportunity && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent">
                <span className="font-mono font-bold block mb-0.5">Design Opportunity:</span>
                <p>{stg.opportunity}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
