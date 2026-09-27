'use client';

import React from 'react';

export interface PopupProgressBarProps {
  progress?: number;
  className?: string;
  barRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Reusable 2px popup progress bar using the site's cyan/teal accent (#2dd4bf).
 */
export function PopupProgressBar({ progress, className = '', barRef }: PopupProgressBarProps) {
  return (
    <div
      className={`h-[2px] w-full overflow-hidden bg-black/40 relative shrink-0 ${className}`}
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-[var(--accent,#2dd4bf)] shadow-[0_0_8px_var(--accent,#2dd4bf)]"
        style={{
          transform: typeof progress === 'number' ? `scaleX(${Math.min(Math.max(progress, 0), 1)})` : 'scaleX(0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
