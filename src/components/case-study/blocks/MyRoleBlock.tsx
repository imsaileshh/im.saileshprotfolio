'use client';

import { useMemo } from 'react';
import { RoleResponsibilitiesData } from '@/types/case-study-builder';
import { motion } from 'framer-motion';

interface MyRoleBlockProps {
  data?: RoleResponsibilitiesData;
}

export function MyRoleBlock({ data }: MyRoleBlockProps) {
  if (!data || !data.items || data.items.length === 0) return null;

  const { title = 'My Role & Responsibilities', description, items = [] } = data;

  // Organize items into rows of 3 (or 4 for larger collections) to create a natural, stable staggered composition
  const rows = useMemo(() => {
    const result: (typeof items)[] = [];
    const chunkSize = items.length <= 6 ? 2 : items.length <= 12 ? 3 : 4;
    for (let i = 0; i < items.length; i += chunkSize) {
      result.push(items.slice(i, i + chunkSize));
    }
    return result;
  }, [items]);

  // Subtle staggered rhythm: alternating left aligned vs subtle offset
  const getRowOffsetClass = (rIdx: number) => {
    switch (rIdx % 4) {
      case 1:
        return 'ml-2 sm:ml-6'; // 8px mobile, 24px desktop
      case 3:
        return 'ml-3 sm:ml-10'; // 12px mobile, 40px desktop
      default:
        return 'ml-0'; // aligned left
    }
  };

  // Content-aware width logic: long titles span full width on mobile; short/medium pair up 2 per row
  const getItemWidthClass = (label: string) => {
    const len = label.trim().length;
    if (len > 18) {
      // Long label (e.g. "Information Architecture", "Competitive Analysis")
      return 'w-full sm:w-auto basis-full sm:basis-auto flex-1 sm:flex-initial';
    }
    if (len <= 11) {
      // Short label (e.g. "User Flow", "Wireframes", "Prototyping")
      return 'flex-1 sm:flex-initial min-w-[115px] sm:min-w-0';
    }
    // Medium label (e.g. "Design Strategy", "Problem Solving", "Empathy Mapping")
    return 'flex-1 sm:flex-initial min-w-[130px] sm:min-w-0';
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto mb-12 sm:mb-16 md:mb-20">
      {/* Header */}
      <div className="space-y-2 mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">07</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            {title}
          </span>
        </div>
        {description && (
          <p className="text-[13px] sm:text-sm text-muted max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Role Cards Container with Staggered Mixed-Width Composition */}
      <div className="rounded-2xl border border-border-subtle bg-[var(--case-card)] p-4 sm:p-6 md:p-8 shadow-xs overflow-hidden">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {rows.map((row, rIdx) => {
            const offsetClass = getRowOffsetClass(rIdx);
            return (
              <div
                key={rIdx}
                className={`flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 ${offsetClass}`}
              >
                {row.map((item, iIdx) => (
                  <motion.div
                    key={item.id || item.label || `${rIdx}-${iIdx}`}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.22, delay: (rIdx * 3 + iIdx) * 0.035 }}
                    className={`group flex items-center gap-2 sm:gap-2.5 h-[42px] sm:h-[46px] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-border-subtle bg-[var(--case-surface)] dark:bg-[#121418] hover:border-accent/40 text-[11.5px] sm:text-[12.5px] font-semibold text-foreground transition-all duration-150 select-none shadow-2xs ${getItemWidthClass(
                      item.label
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    <span className="tracking-wide leading-tight truncate sm:whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
