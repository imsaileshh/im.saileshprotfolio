export type ProjectImageLike = {
  url: string;
  isCover?: boolean | null;
  order?: number | null;
};

export type ProjectLike = {
  id?: string;
  title?: string;
  coverImageUrl?: string | null;
  coverImage?: string | null;
  coverUrl?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  thumbnailUrl?: string | null;
  images?: ProjectImageLike[] | null;
  caseStudy?: {
    coverImage?: string | null;
    [key: string]: unknown;
  } | null;
};

import { resolveImageUrl } from '@/lib/media/resolve-image-url';

export const DEFAULT_PROJECT_COVER = '/images/projects/project1.svg';

/**
 * Resolves the canonical cover image URL for a project from any supported field:
 * 1. Direct fields: coverImageUrl (canonical), coverImage, coverUrl, imageUrl, image, thumbnailUrl, caseStudy.coverImage
 * 2. Relation images: image marked with isCover === true, or lowest order index, or first available image
 * 3. Safe fallback placeholder
 */
export function getProjectCoverUrl(
  project?: ProjectLike | null,
  fallback: string = DEFAULT_PROJECT_COVER
): string {
  if (!project) return fallback;

  // 1. Direct fields in order of precedence (canonical coverImageUrl first)
  const directFields = [
    project.coverImageUrl,
    project.coverImage,
    project.coverUrl,
    project.imageUrl,
    project.image,
    project.thumbnailUrl,
    project.caseStudy?.coverImage,
  ];

  for (const field of directFields) {
    const resolved = resolveImageUrl(field);
    if (resolved) {
      return resolved;
    }
  }

  // 2. ProjectImage relation
  if (Array.isArray(project.images) && project.images.length > 0) {
    // Prefer explicitly flagged cover image
    const coverImage = project.images.find((img) => Boolean(img?.isCover));
    if (coverImage) {
      const resolved = resolveImageUrl(coverImage.url);
      if (resolved) return resolved;
    }

    // Sort by order ascending if specified
    const sorted = [...project.images].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
    for (const img of sorted) {
      if (img) {
        const resolved = resolveImageUrl(img.url);
        if (resolved) return resolved;
      }
    }
  }

  return fallback;
}
