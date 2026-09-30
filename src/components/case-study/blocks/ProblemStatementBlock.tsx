'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { HelpCircle, Sparkles, AlertCircle, TrendingDown } from 'lucide-react';

export function ProblemStatementBlock({ block }: { block: ContentBlockItem }) {
  const data = block.problemStatementData || {
    problemTitle: block.headingText || 'The Core Challenge',
    coreProblem: block.content || (block as any).problem || 'Users faced friction during complex multi-step interactions.',
    context: (block as any).context,
    howMightWe: (block as any).howMightWe,
    userImpact: (block as any).userImpact,
    businessImpact: (block as any).businessImpact,
  };

  const problemText = data.coreProblem || data.problem;
  if (!problemText) return null;

  return (
    <div className="w-full max-w-[960px] mx-auto my-8 space-y-6">
      {/* Small Eyebrow Label */}
      <div className="flex items-center gap-2">
        <HelpCircle size={14} className="text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent font-semibold">
          PROBLEM STATEMENT & CONTEXT
        </span>
      </div>

      {/* Editorial Large Quote */}
      <blockquote className="space-y-2 border-l-2 border-accent pl-4 sm:pl-6 py-1">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-semibold text-foreground tracking-tight leading-snug">
          &ldquo;{problemText}&rdquo;
        </h3>
        {data.context && (
          <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl pt-1">
            {data.context}
          </p>
        )}
      </blockquote>

      {/* HMW Statement Surface */}
      {data.howMightWe && (
        <div className="p-4 sm:p-5 rounded-xl border border-accent/25 bg-accent/10 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>HOW MIGHT WE FRAME</span>
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed italic">
            &ldquo;{data.howMightWe}&rdquo;
          </p>
        </div>
      )}

      {/* Impact Breakdown (User vs Business) */}
      {(data.userImpact || data.businessImpact) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {data.userImpact && (
            <div className="p-4 rounded-xl bg-[var(--case-surface)] border border-border-subtle space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertCircle size={13} />
                <span>User Impact</span>
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed">{data.userImpact}</p>
            </div>
          )}

          {data.businessImpact && (
            <div className="p-4 rounded-xl bg-[var(--case-surface)] border border-border-subtle space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-red-500 dark:text-red-400 font-semibold flex items-center gap-1.5">
                <TrendingDown size={13} />
                <span>Business Impact</span>
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed">{data.businessImpact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
