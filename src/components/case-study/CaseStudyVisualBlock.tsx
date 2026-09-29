'use client';

import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import {
  CaseStudyVisual,
  normalizeCaseStudyVisual,
} from '@/types/case-study-visual';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';

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
  const resolvedSrc = resolveImageUrl(visual.imageUrl || visual.url) || '';
  const [hasLoadError, setHasLoadError] = useState(false);

  // Development warning logging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!resolvedSrc) {
        console.warn('[CaseStudyVisualBlock] Missing or invalid image URL for visual:', {
          id: visual.id,
          displayType: visual.displayType,
          alt: visual.alt || visual.caption,
          rawSource: visual.imageUrl || visual.url,
        });
      } else if (hasLoadError) {
        console.warn(`[CaseStudyVisualBlock] Failed to load image at: "${resolvedSrc}"`);
      }
    }
  }, [resolvedSrc, hasLoadError, visual.id, visual.displayType, visual.alt, visual.caption, visual.imageUrl, visual.url]);

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

  // Fallback rendering for invalid / missing / broken image URLs
  if (!resolvedSrc || hasLoadError) {
    const fallbackAlt = visual.alt || visual.caption || 'Website screenshot';
    return (
      <figure className={`cs-visual-block cs-visual-fallback my-8 ${sizeClass} ${className} max-w-full overflow-hidden`}>
        <div
          className={`cs-visual-frame relative w-full flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 ${
            isThemeCard ? 'bg-[var(--card)] border border-border-subtle/80' : 'bg-black/30 border border-white/10'
          }`}
          style={{
            backgroundColor: visual.backgroundType === 'custom' ? bgStyle : isThemeCard ? undefined : 'transparent',
            borderRadius: `${radius}px`,
          }}
        >
          <div className="flex flex-col items-center justify-center text-center max-w-sm space-y-2 p-6 rounded-xl bg-white/[0.04] border border-white/5">
            <ImageOff size={28} className="text-zinc-500 mb-1" />
            <p className="text-xs font-mono font-medium text-zinc-300">{fallbackAlt}</p>
            <p className="text-[11px] font-mono text-zinc-500">
              {isPreview ? 'Image preview unavailable' : 'Visual asset unavailable'}
            </p>
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
            src={resolvedSrc}
            alt={visual.alt || visual.caption || 'Website screenshot'}
            loading={isPreview ? 'eager' : 'lazy'}
            onError={() => setHasLoadError(true)}
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
              src={resolvedSrc}
              alt={visual.alt || visual.caption || 'Dashboard UI screen'}
              loading={isPreview ? 'eager' : 'lazy'}
              onError={() => setHasLoadError(true)}
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
          src={resolvedSrc}
          alt={visual.alt || visual.caption || 'Case study visual'}
          loading={isPreview ? 'eager' : 'lazy'}
          onError={() => setHasLoadError(true)}
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
