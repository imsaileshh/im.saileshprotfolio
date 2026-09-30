'use client';

import { RoleResponsibilitiesData } from '@/types/case-study-builder';
import { Briefcase, CheckCircle2, Sparkles } from 'lucide-react';

interface MyRoleBlockProps {
  data?: RoleResponsibilitiesData;
}

export function MyRoleBlock({ data }: MyRoleBlockProps) {
  if (!data || !data.items || data.items.length === 0) return null;

  const { title = 'My Role & Responsibilities', description, items = [] } = data;

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">07</span>
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

      {/* Role Tags Grid */}
      <div className="rounded-2xl border border-border-subtle bg-[var(--case-card)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <div
              key={item.id || item.label}
              className="group flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border-subtle bg-[var(--case-surface)] hover:border-accent/40 hover:bg-[var(--case-surface-hover)] text-xs font-semibold text-foreground shadow-xs transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform shrink-0" />
              <span className="tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
