import { resolveImageUrl } from '@/lib/media/resolve-image-url';

export type CaseStudyVisualDisplayType = 'webpage' | 'dashboard' | 'image';
export type CaseStudyVisualDisplaySize = 'medium' | 'large' | 'full';
export type CaseStudyVisualBackgroundType = 'none' | 'theme' | 'custom';
export type CaseStudyVisualFit = 'natural' | 'contain' | 'cover';

export interface CaseStudyVisual {
  id?: string;
  imageUrl: string;
  url?: string;
  alt?: string;
  caption?: string;

  displayType: CaseStudyVisualDisplayType;
  displaySize: CaseStudyVisualDisplaySize;
  backgroundType: CaseStudyVisualBackgroundType;
  backgroundColor?: string;

  padding?: number; // 0 - 120px
  radius?: number;  // 0 - 40px

  fit?: CaseStudyVisualFit;
}

export const VISUAL_DEFAULTS = {
  webpage: {
    padding: 0,
    radius: 0,
    fit: 'natural' as CaseStudyVisualFit,
    displaySize: 'full' as CaseStudyVisualDisplaySize,
    backgroundType: 'none' as CaseStudyVisualBackgroundType,
    backgroundColor: '#0E0F12',
  },
  dashboard: {
    padding: 48,
    radius: 20,
    fit: 'contain' as CaseStudyVisualFit,
    displaySize: 'large' as CaseStudyVisualDisplaySize,
    backgroundType: 'custom' as CaseStudyVisualBackgroundType,
    backgroundColor: '#FFD36A',
  },
  image: {
    padding: 0,
    radius: 16,
    fit: 'natural' as CaseStudyVisualFit,
    displaySize: 'large' as CaseStudyVisualDisplaySize,
    backgroundType: 'none' as CaseStudyVisualBackgroundType,
    backgroundColor: '#18191E',
  },
} as const;

export const RECOMMENDED_SIZES = {
  webpage: {
    title: 'Recommended Size',
    dimension: '1440–1920px wide · Any height',
    detail: 'Best for full website screenshots',
  },
  dashboard: {
    title: 'Recommended Size',
    dimension: '1440 × 900px or 1600 × 1000px',
    detail: 'Best for admin panels, web apps & desktop screens',
  },
  image: {
    title: 'Recommended Size',
    dimension: '1600 × 1000px',
    detail: 'Preserves original image ratio unless cropped',
  },
} as const;

/**
 * Normalizes any raw visual / media object or string into a validated CaseStudyVisual.
 * Ensures backward compatibility with existing projects, bare filenames, and legacy records.
 */
export function normalizeCaseStudyVisual(raw?: unknown, index = 0): CaseStudyVisual & { id: string; url: string } {
  const resolvedUrl = resolveImageUrl(raw) || '';
  let hash = 2166136261;
  for (const char of resolvedUrl) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const fallbackId = `v-${(hash >>> 0).toString(36)}-${index}`;

  if (!raw) {
    return {
      id: fallbackId,
      url: '',
      imageUrl: '',
      alt: '',
      displayType: 'image',
      displaySize: 'large',
      backgroundType: 'none',
      backgroundColor: '#FFD36A',
      padding: 0,
      radius: 16,
      fit: 'natural',
    };
  }

  // If raw is just a URL string
  if (typeof raw === 'string') {
    return {
      id: fallbackId,
      url: resolvedUrl,
      imageUrl: resolvedUrl,
      alt: '',
      displayType: 'image',
      displaySize: 'large',
      backgroundType: 'none',
      backgroundColor: '#FFD36A',
      padding: 0,
      radius: 16,
      fit: 'natural',
    };
  }

  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;

  // Resolve displayType
  let displayType: CaseStudyVisualDisplayType = 'image';
  if (r.displayType === 'webpage' || r.displayType === 'dashboard' || r.displayType === 'image') {
    displayType = r.displayType;
  } else if (r.type === 'webpage' || r.type === 'dashboard' || r.type === 'image') {
    displayType = r.type as CaseStudyVisualDisplayType;
  }

  const defaults = VISUAL_DEFAULTS[displayType];

  // Resolve displaySize
  let displaySize: CaseStudyVisualDisplaySize = defaults.displaySize;
  if (r.displaySize === 'medium' || r.displaySize === 'large' || r.displaySize === 'full') {
    displaySize = r.displaySize;
  } else if (r.width === 'half') {
    displaySize = 'medium';
  } else if (r.width === 'full') {
    displaySize = 'full';
  } else if (r.size === 'half') {
    displaySize = 'medium';
  } else if (r.size === 'full') {
    displaySize = 'full';
  }

  // Resolve backgroundType & backgroundColor
  let backgroundType: CaseStudyVisualBackgroundType = defaults.backgroundType;
  let backgroundColor = (typeof r.backgroundColor === 'string' ? r.backgroundColor : undefined) || defaults.backgroundColor;

  if (r.backgroundType === 'none' || r.backgroundType === 'theme' || r.backgroundType === 'custom') {
    backgroundType = r.backgroundType;
  } else if (r.background === 'card') {
    backgroundType = 'theme';
  } else if (r.background === 'dark') {
    backgroundType = 'custom';
    backgroundColor = '#0E0F12';
  } else if (r.background === 'transparent') {
    backgroundType = 'none';
  }

  // Resolve padding
  let padding: number = defaults.padding;
  if (typeof r.padding === 'number' && !isNaN(r.padding)) {
    padding = Math.max(0, Math.min(120, r.padding));
  }

  // Resolve radius
  let radius: number = defaults.radius;
  if (typeof r.radius === 'number' && !isNaN(r.radius)) {
    radius = Math.max(0, Math.min(40, r.radius));
  }

  // Resolve fit
  let fit: CaseStudyVisualFit = defaults.fit;
  if (r.fit === 'natural' || r.fit === 'contain' || r.fit === 'cover') {
    fit = r.fit;
  }

  const rawAlt = typeof r.alt === 'string' ? r.alt : typeof r.caption === 'string' ? r.caption : typeof r.imageAlt === 'string' ? r.imageAlt : '';
  const rawCaption = typeof r.caption === 'string' ? r.caption : typeof r.imageCaption === 'string' ? r.imageCaption : '';

  return {
    id: typeof r.id === 'string' ? r.id : fallbackId,
    url: resolvedUrl,
    imageUrl: resolvedUrl,
    alt: rawAlt,
    caption: rawCaption,
    displayType,
    displaySize,
    backgroundType,
    backgroundColor,
    padding,
    radius,
    fit,
  };
}
