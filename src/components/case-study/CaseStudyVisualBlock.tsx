'use client';

import React from 'react';
import {
  CaseStudyVisual,
  normalizeCaseStudyVisual,
} from '@/types/case-study-visual';

interface CaseStudyVisualBlockProps {
  visual: CaseStudyVisual | any;
  className?: string;
  isPreview?: boolean;
}

export function CaseStudyVisualBlock({
  visual: rawVisual,
  className = '',
  isPreview = false,
}: CaseStudyVisualBlockProps) {
  const visual = normalizeCaseStudyVisual(rawVisual);

  if (!visual.imageUrl) {
    return null;
  }

  // Display size class:
  // medium = max-w-[720px] mx-auto
  // large = max-w-[1000px] mx-auto
  // full = w-full
  let sizeClass = 'w-full';
  if (visual.displaySize === 'medium') {
    sizeClass = 'w-full max-w-[720px] mx-auto';
  } else if (visual.displaySize === 'large') {
    sizeClass = 'w-full max-w-[1000px] mx-auto';
  }

  // Presentation background:
  let bgStyle: string = 'transparent';
  let isThemeCard = false;
  if (visual.backgroundType === 'custom') {
    bgStyle = visual.backgroundColor || '#FFD36A';
  } else if (visual.backgroundType === 'theme') {
    isThemeCard = true;
  }

  // Padding resolution (Desktop: visual.padding, Tablet: min(padding, 40), Mobile: min(padding, 20))
  const desktopPad = visual.padding ?? 0;
  const tabletPad = Math.min(desktopPad, 40);
  const mobilePad = Math.min(desktopPad, 20);

  // Corner radius
  const radius = visual.radius ?? 0;

  // Fit class
  let fitClass = 'h-auto';
  if (visual.fit === 'contain') {
    fitClass = 'h-auto object-contain';
  } else if (visual.fit === 'cover') {
    fitClass = 'h-auto object-cover';
  } else {
    // Natural aspect ratio
    fitClass = 'h-auto';
  }

  // 1. WEBPAGE / LONG SCREENSHOT
  if (visual.displayType === 'webpage') {
    const hasCustomBg = visual.backgroundType === 'custom';
    const hasThemeBg = visual.backgroundType === 'theme';

    return (
      <figure className={`cs-visual-block cs-visual-webpage my-8 ${sizeClass} ${className} max-w-full overflow-hidden`}>
        <div
          className={`cs-visual-frame relative w-full overflow-hidden transition-all duration-300 ${
            hasThemeBg ? 'bg-[var(--card)] border border-border-subtle/80' : ''
          }`}
          style={{
            backgroundColor: hasCustomBg ? bgStyle : hasThemeBg ? undefined : 'transparent',
            borderRadius: `${radius}px`,
            ['--cs-pad-desktop' as string]: `${desktopPad}px`,
            ['--cs-pad-tablet' as string]: `${tabletPad}px`,
            ['--cs-pad-mobile' as string]: `${mobilePad}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visual.imageUrl}
            alt={visual.alt || visual.caption || 'Website screenshot'}
            loading={isPreview ? 'eager' : 'lazy'}
            className="block w-full h-auto select-none"
            style={{
              borderRadius: radius > 0 && desktopPad === 0 ? `${radius}px` : undefined,
            }}
          />
        </div>

        {visual.caption && (
          <figcaption className="text-xs font-mono text-center text-muted/70 pt-2.5 px-4">
            {visual.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // 2. DASHBOARD / UI SCREENSHOT
  if (visual.displayType === 'dashboard') {
    return (
      <figure className={`cs-visual-block cs-visual-dashboard my-8 ${sizeClass} ${className} max-w-full overflow-hidden`}>
        <div
          className={`cs-visual-frame relative w-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isThemeCard ? 'bg-[var(--card)] border border-border-subtle/80' : ''
          }`}
          style={{
            backgroundColor: visual.backgroundType === 'custom' ? bgStyle : isThemeCard ? undefined : 'transparent',
            borderRadius: `${radius}px`,
            ['--cs-pad-desktop' as string]: `${desktopPad}px`,
            ['--cs-pad-tablet' as string]: `${tabletPad}px`,
            ['--cs-pad-mobile' as string]: `${mobilePad}px`,
          }}
        >
          <div className="w-full flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.imageUrl}
              alt={visual.alt || visual.caption || 'Dashboard UI screen'}
              loading={isPreview ? 'eager' : 'lazy'}
              className={`w-full ${fitClass} rounded-lg shadow-2xl border border-black/10 dark:border-white/10 select-none`}
            />
          </div>
        </div>

        {visual.caption && (
          <figcaption className="text-xs font-mono text-center text-muted/70 pt-2.5 px-4">
            {visual.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // 3. STANDARD IMAGE
  return (
    <figure className={`cs-visual-block cs-visual-image my-8 ${sizeClass} ${className} max-w-full overflow-hidden`}>
      <div
        className={`cs-visual-frame relative w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isThemeCard ? 'bg-[var(--card)] border border-border-subtle/80' : ''
        }`}
        style={{
          backgroundColor: visual.backgroundType === 'custom' ? bgStyle : isThemeCard ? undefined : 'transparent',
          borderRadius: `${radius}px`,
          ['--cs-pad-desktop' as string]: `${desktopPad}px`,
          ['--cs-pad-tablet' as string]: `${tabletPad}px`,
          ['--cs-pad-mobile' as string]: `${mobilePad}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.imageUrl}
          alt={visual.alt || visual.caption || 'Case study visual'}
          loading={isPreview ? 'eager' : 'lazy'}
          className={`w-full ${fitClass} select-none`}
          style={{
            borderRadius: desktopPad === 0 && radius > 0 ? `${radius}px` : undefined,
          }}
        />
      </div>

      {visual.caption && (
        <figcaption className="text-xs font-mono text-center text-muted/70 pt-2.5 px-4">
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
}
