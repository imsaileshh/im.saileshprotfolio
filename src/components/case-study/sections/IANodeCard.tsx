'use client';

import { GitFork, Folder, FileText, HelpCircle, ExternalLink, Zap } from 'lucide-react';
import { IANode } from '@/types/case-study-builder';

interface IANodeCardProps {
  node: IANode;
  width?: number;
  height?: number;
  compact?: boolean;
  className?: string;
}

export function IANodeCard({ node, width, height, compact = false, className = '' }: IANodeCardProps) {
  const { type, title, description } = node;
  const cardStyle = {
    width: width ? `${width}px` : undefined,
    minHeight: height ? `${height}px` : undefined,
  };

  switch (type) {
    case 'root':
      return (
        <div
          className={`w-full rounded-xl border border-accent/40 bg-[var(--case-surface)] p-1.5 sm:p-2 text-center shadow-xs hover:border-accent transition-all group relative overflow-hidden flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
          <div className="flex items-center justify-center gap-1 mb-0.5 text-accent">
            <GitFork size={11} />
            <span className="font-mono text-[7.5px] uppercase tracking-widest font-bold">
              ROOT APP
            </span>
          </div>
          <h3 className="text-[10.5px] font-bold text-foreground font-display leading-[1.2] line-clamp-2">
            {title}
          </h3>
          {description && !compact && (
            <p className="text-[8px] text-muted mt-0.5 line-clamp-1 leading-tight">{description}</p>
          )}
        </div>
      );

    case 'decision':
      return (
        <div
          className={`w-full rounded-xl border border-amber-500/35 bg-amber-500/10 dark:bg-[#13110c] dark:border-amber-500/40 p-1.5 sm:p-2 text-center shadow-xs hover:border-amber-500/70 transition-all flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-600 dark:text-amber-400">
            <HelpCircle size={10} />
            <span className="font-mono text-[7.5px] uppercase tracking-widest font-bold">
              DECISION
            </span>
          </div>
          <h4 className="text-[10px] font-semibold text-amber-950 dark:text-amber-200 font-display leading-[1.2] line-clamp-2">
            {title}
          </h4>
          {description && !compact && (
            <p className="text-[8px] text-amber-700/90 dark:text-amber-300/70 mt-0.5 line-clamp-1 leading-tight">{description}</p>
          )}
        </div>
      );

    case 'group':
      return (
        <div
          className={`w-full rounded-xl border border-border-subtle bg-[var(--case-surface)] p-1.5 sm:p-2 text-left shadow-xs hover:border-border-subtle-strong transition-all flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          <div className="flex items-center gap-1.5">
            <Folder size={12} className="text-amber-500 dark:text-amber-400 shrink-0" />
            <h4 className="text-[10px] font-semibold text-foreground font-display leading-[1.2] line-clamp-2">
              {title}
            </h4>
          </div>
          {description && !compact && (
            <p className="text-[8px] text-muted leading-tight mt-0.5 line-clamp-1 pl-4">{description}</p>
          )}
        </div>
      );

    case 'action':
      return (
        <div
          className={`w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-[#0a1411] dark:border-emerald-500/40 p-1.5 sm:p-2 text-left shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold text-emerald-950 dark:text-emerald-200 leading-[1.2] line-clamp-2">{title}</span>
          </div>
          {description && !compact && (
            <p className="text-[8px] text-emerald-700/80 dark:text-emerald-400/70 line-clamp-1 pl-3.5 mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      );

    case 'external':
      return (
        <div
          className={`w-full rounded-xl border border-dashed border-purple-500/30 bg-purple-500/10 dark:bg-[#121018] dark:border-purple-500/40 p-1.5 sm:p-2 text-left shadow-xs hover:border-purple-500/50 transition-all flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          <div className="flex items-center gap-1.5">
            <ExternalLink size={10} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-[10px] font-semibold text-purple-950 dark:text-purple-200 leading-[1.2] line-clamp-2">{title}</span>
          </div>
          {description && !compact && (
            <p className="text-[8px] text-purple-700/80 dark:text-purple-400/70 line-clamp-1 pl-3.5 mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      );

    case 'page':
    case 'child':
    default:
      return (
        <div
          className={`w-full rounded-xl border border-border-subtle bg-[var(--case-surface)] p-1.5 sm:p-2 text-left hover:border-border-subtle-strong transition-all flex flex-col justify-center ${className}`}
          style={cardStyle}
        >
          <div className="flex items-center gap-1.5">
            <FileText size={10} className="text-accent shrink-0" />
            <span className="text-[10px] font-semibold text-foreground leading-[1.2] line-clamp-2">{title}</span>
          </div>
          {description && !compact && (
            <p className="text-[8px] text-muted leading-tight mt-0.5 line-clamp-1 pl-3.5">{description}</p>
          )}
        </div>
      );
  }
}
