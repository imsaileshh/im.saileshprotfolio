import { normalizeCaseStudyVisual } from '@/types/case-study-visual';

/** Structured media is authoritative on save, including an intentional empty list. */
export function normalizeSectionMedia(section: { images?: unknown; metadata?: any }) {
  const source: unknown[] = Array.isArray(section.metadata?.media)
    ? section.metadata.media
    : Array.isArray(section.images) ? section.images : [];
  const media = source.map(normalizeCaseStudyVisual)
    .filter(item => item.imageUrl && !item.imageUrl.startsWith('data:'));
  return { ...section, images: media.map(item => item.imageUrl), metadata: { ...section.metadata, media } };
}

export function resolveUploadedImageUrl(raw: unknown): string {
  // Upload responses must already identify a stored object, never a filename or browser URL.
  if (typeof raw !== 'string' || !/^(https?:\/\/|\/uploads\/)/i.test(raw)) {
    throw new Error('Upload returned an invalid image URL');
  }
  const visual = normalizeCaseStudyVisual(raw);
  if (!visual.imageUrl) throw new Error('Upload returned an invalid image URL');
  if (process.env.NODE_ENV === 'production' && !/^https?:\/\//i.test(visual.imageUrl)) {
    throw new Error('Upload did not return permanent storage URL');
  }
  return visual.imageUrl;
}
