'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { SearchCode, Sparkles, CheckCircle2 } from 'lucide-react';

export function ResearchFindingsBlock({ block }: { block: ContentBlockItem }) {
  const items = block.researchFindings || [];
  if (!items.length) return null;

  return (
    <div className="w-full space-y-6 my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it, idx) => (
          <div
            key={it.id || idx}
            className="rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-6 space-y-4 shadow-sm hover:border-accent/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-extrabold text-accent">
                  {it.number || String(idx + 1).padStart(2, '0')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent uppercase font-bold">
                  RESEARCH FINDING
                </span>
              </div>

              <h4 className="text-base font-display font-semibold text-foreground leading-snug">
                {it.title}
              </h4>
              <p className="text-xs text-muted leading-relaxed">{it.description}</p>
            </div>

            {/* Evidence & Impact */}
            <div className="space-y-2 pt-3 border-t border-border-subtle/50 text-xs">
              {it.evidence && (
                <div className="p-3 rounded-xl bg-[var(--panel)] border border-border-subtle/60 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-muted font-bold block">Observed Evidence</span>
                  <p className="text-muted/90 italic leading-relaxed">"{it.evidence}"</p>
                </div>
              )}

              {it.impact && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Product Impact</span>
                  </span>
                  <p className="leading-relaxed">{it.impact}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
