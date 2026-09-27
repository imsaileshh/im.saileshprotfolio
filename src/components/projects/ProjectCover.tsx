'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProjectCoverUrl, DEFAULT_PROJECT_COVER } from '@/lib/projects/cover-image';

export interface ProjectCoverProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: '16/9' | '16/10' | 'square' | 'auto';
  className?: string;
  imageClassName?: string;
  fallbackSrc?: string;
}

const ASPECT_RATIO_CLASSES = {
  '16/9': 'aspect-[16/9]',
  '16/10': 'aspect-[16/10]',
  square: 'aspect-square',
  auto: '',
} as const;

export function ProjectCover({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px',
  aspectRatio = '16/9',
  className = '',
  imageClassName = '',
  fallbackSrc = DEFAULT_PROJECT_COVER,
}: ProjectCoverProps) {
  const resolvedInitial = src && src.trim() && !src.includes('Invalid url') ? src.trim() : fallbackSrc;

  const [currentSrcProp, setCurrentSrcProp] = useState(src);
  const [imgSrc, setImgSrc] = useState(resolvedInitial);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state if src prop changes dynamically
  if (src !== currentSrcProp) {
    setCurrentSrcProp(src);
    setImgSrc(resolvedInitial);
    setIsLoaded(false);
  }

  const aspectClass = ASPECT_RATIO_CLASSES[aspectRatio] ?? 'aspect-[16/9]';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-zinc-900/90 ${aspectClass} ${className}`.trim()}
    >
      {/* Subtle skeleton placeholder to eliminate layout shift */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr from-[#121316] via-[#1a1b20] to-[#121316] transition-opacity duration-300 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
        aria-hidden="true"
      />

      <Image
        src={imgSrc}
        alt={alt || 'Project cover image'}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
        } ${imageClassName}`.trim()}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
            setIsLoaded(true);
          }
        }}
      />
    </div>
  );
}

export const WorkCover = ProjectCover;
export type WorkCoverProps = ProjectCoverProps;

export { getProjectCoverUrl, DEFAULT_PROJECT_COVER };
