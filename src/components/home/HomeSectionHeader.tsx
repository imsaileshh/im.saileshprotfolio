'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

export interface HomeSectionHeaderProps {
  icon: LucideIcon;
  heading: string;
  viewAllHref: string;
  actionText?: string;
  desktopActionText?: string;
  isPersonal?: boolean;
}

export function HomeSectionHeader({
  icon: Icon,
  heading,
  viewAllHref,
  actionText,
  desktopActionText,
  isPersonal = false,
}: HomeSectionHeaderProps) {
  // Use actionText if provided, falling back to desktopActionText or heading-based label
  const resolvedActionText =
    actionText ||
    desktopActionText ||
    (isPersonal ? 'All Personal Projects' : 'All Works');

  const isCompactHeading = isPersonal || heading.length > 12;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:gap-y-2.5 mb-4 sm:mb-5 md:mb-10 w-full">
      {/* ── Left: Section Icon Box + Heading (Never Truncated) ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 min-w-0">
        <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-[10px] sm:rounded-[12px] md:rounded-[14px] bg-[var(--card)] border border-border-subtle text-accent shadow-xs shrink-0">
          <Icon
            size={18}
            strokeWidth={2}
            className="text-accent sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
          />
        </div>

        <h2
          className={`font-display font-semibold tracking-tight text-foreground leading-tight whitespace-normal break-words min-w-0 ${
            isCompactHeading
              ? 'text-[18px] sm:text-2xl md:text-3xl lg:text-[40px]'
              : 'text-xl sm:text-2xl md:text-3xl lg:text-[40px]'
          }`}
        >
          {heading}
        </h2>
      </div>

      {/* ── Right / Wrapped: Single Unified Responsive Rectangular Action Button ── */}
      <Link
        href={viewAllHref}
        className="inline-flex items-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 md:px-4 md:py-2.5 min-h-[36px] sm:min-h-[38px] md:min-h-[40px] rounded-[8px] md:rounded-[10px] bg-[var(--card)] border border-border-subtle hover:border-accent/40 hover:bg-[var(--nav-active)] active:scale-[0.98] text-[12px] sm:text-[12.5px] md:text-sm font-semibold text-foreground hover:text-accent transition-all duration-200 shadow-xs whitespace-nowrap group shrink-0 ml-auto touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={resolvedActionText}
      >
        <span>{resolvedActionText}</span>
        <ArrowRight
          size={13}
          className="text-muted group-hover:text-accent transition-all duration-200 group-hover:translate-x-0.5 sm:w-3.5 sm:h-3.5 md:w-[15px] md:h-[15px] shrink-0"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
