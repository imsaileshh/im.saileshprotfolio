'use client';

import { DesignThinkingProcessData } from '@/types/case-study-builder';

interface DesignThinkingProcessProps {
  data?: DesignThinkingProcessData;
}

export function DesignThinkingProcess({ data }: DesignThinkingProcessProps) {
  if (!data || !data.steps || data.steps.length === 0) return null;

  const { title = 'Design Thinking Process', description, steps = [] } = data;

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">08</span>
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

      {/* Main Process Timeline Container */}
      <div className="rounded-2xl border border-border-subtle bg-[var(--case-card)] p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Desktop Horizontal Process Timeline (md:flex) */}
        <div className="hidden md:flex items-start justify-between gap-4 relative">
          {/* Connecting Line across top */}
          <div className="absolute top-4 left-6 right-6 h-[1.5px] bg-border-subtle z-0" />

          {steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="flex-1 flex flex-col items-center text-center relative z-10 space-y-4 group"
            >
              {/* Step Marker Badge */}
              <div className="w-9 h-9 rounded-full border border-accent/50 bg-[var(--case-surface)] text-accent font-mono text-xs font-bold flex items-center justify-center shadow-sm group-hover:border-accent group-hover:scale-110 transition-all">
                {step.number || `0${idx + 1}`}
              </div>

              {/* Step Title */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-display tracking-tight">
                  {step.title}
                </h4>
              </div>

              {/* Activities List */}
              {step.items && step.items.length > 0 && (
                <div className="w-full pt-2 border-t border-border-subtle/80">
                  <ul className="space-y-1.5 text-xs text-muted">
                    {step.items.map((act, aIdx) => (
                      <li key={aIdx} className="leading-snug">
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Vertical Process Timeline (md:hidden) */}
        <div className="block md:hidden space-y-6">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="flex items-start gap-4 relative">
              {/* Vertical connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-[1.5px] bg-border-subtle" />
              )}

              {/* Step Badge */}
              <div className="w-8 h-8 rounded-full border border-accent/50 bg-[var(--case-surface)] text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 z-10">
                {step.number || `0${idx + 1}`}
              </div>

              <div className="space-y-2 pt-0.5 flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground font-display">{step.title}</h4>
                {step.items && step.items.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-muted">
                    {step.items.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
