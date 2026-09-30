'use client';

import { MetricsData } from '@/types/case-study-builder';

interface MetricsSectionProps {
  metricsData?: MetricsData;
}

export function MetricsSection({ metricsData }: MetricsSectionProps) {
  if (!metricsData || !metricsData.items || metricsData.items.length === 0) return null;

  const { items, columns = 4 } = metricsData;

  let gridColClass = 'grid-cols-2 md:grid-cols-4';
  if (columns === 2) gridColClass = 'grid-cols-1 sm:grid-cols-2';
  if (columns === 3) gridColClass = 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="w-full my-8 py-6 border-y border-border-subtle">
      <div className={`grid ${gridColClass} gap-8 text-left`}>
        {items.map((met, idx) => (
          <div key={met.id || idx} className="space-y-1.5">
            <div className="flex items-baseline gap-1 font-mono text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-none">
              {met.prefix && <span className="text-3xl sm:text-4xl text-muted">{met.prefix}</span>}
              <span>{met.value}</span>
              {met.suffix && <span className="text-2xl sm:text-3xl text-muted">{met.suffix}</span>}
            </div>

            <h4 className="text-sm font-bold text-foreground font-display pt-1">{met.label}</h4>
            {met.description && (
              <p className="text-xs text-muted leading-relaxed max-w-[220px]">{met.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
