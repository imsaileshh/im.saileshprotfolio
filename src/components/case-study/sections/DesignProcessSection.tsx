'use client';

import { DesignProcessData } from '@/types/case-study-builder';

interface DesignProcessSectionProps {
  processData?: DesignProcessData;
}

export function DesignProcessSection({ processData }: DesignProcessSectionProps) {
  if (!processData || !processData.steps || processData.steps.length === 0) return null;

  const steps = processData.steps;

  return (
    <div className="w-full space-y-8 my-4">
      {/* ── Desktop Horizontal Timeline ── */}
      <div className="hidden md:block w-full">
        <div className="grid grid-cols-5 gap-6 relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-[1.5px] bg-border-subtle -z-0" />

          {steps.map((st, idx) => (
            <div key={st.id || idx} className="relative z-10 space-y-3 text-left">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--card)] border border-border-subtle font-mono text-xs font-bold text-foreground shadow-xs">
                {st.number || String(idx + 1).padStart(2, '0')}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-display leading-tight">{st.title}</h4>
                {st.description && (
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">{st.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Vertical Timeline ── */}
      <div className="block md:hidden space-y-6 relative pl-6 border-l border-border-subtle">
        {steps.map((st, idx) => (
          <div key={st.id || idx} className="relative space-y-1">
            <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[var(--card)] border border-border-subtle font-mono text-[10px] font-bold text-foreground flex items-center justify-center">
              {st.number || String(idx + 1).padStart(2, '0')}
            </span>
            <h4 className="text-sm font-bold text-foreground font-display">{st.title}</h4>
            {st.description && <p className="text-xs text-muted leading-relaxed">{st.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
