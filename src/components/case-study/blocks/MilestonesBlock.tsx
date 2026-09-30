'use client';

import { MilestonesData } from '@/types/case-study-builder';
import { Flag, CheckCircle2 } from 'lucide-react';

interface MilestonesBlockProps {
  data?: MilestonesData;
}

export function MilestonesBlock({ data }: MilestonesBlockProps) {
  if (!data || !data.items || data.items.length === 0) return null;

  const { title = 'Project Milestones', description, items = [] } = data;

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">10</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            {title}
          </span>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Milestones Container */}
      <div className="rounded-2xl border border-border-subtle bg-[var(--case-card)] p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((m, idx) => (
            <div
              key={m.id || idx}
              className="group p-5 rounded-xl border border-border-subtle bg-[var(--case-surface)] hover:border-accent/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                  {m.date}
                </span>
                <CheckCircle2 size={16} className="text-accent opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground font-display leading-tight">
                  {m.title}
                </h4>
                {m.description && (
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
