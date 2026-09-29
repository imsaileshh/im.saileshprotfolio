/**
 * Unified image URL resolver for Next.js CMS.
 * Resolves images from any legacy or modern format:
 * - full absolute URLs (HTTPS / HTTP)
 * - root-relative paths (/uploads/..., /images/...)
 * - legacy bare filenames (e.g. 1790613605098-af7007-HOMEPAGE-UPLOAD.jpg -> /uploads/...)
 * - object formats: { url, imageUrl, publicUrl, src, image, asset: { url } }
 *
 * Prevents invalid relative URLs from being requested, which cause 404s.
 * Returns null if no valid image URL could be resolved.
 */

const KNOWN_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|svg|gif|avif|ico|bmp|tiff)$/i;

export function resolveImageUrl(image: unknown): string | null {
  if (!image) return null;

  let raw: string | null = null;

  if (typeof image === 'string') {
    raw = image;
  } else if (typeof image === 'object' && image !== null) {
    const obj = image as Record<string, unknown>;
    // An explicitly cleared canonical field must not resurrect a legacy URL.
    if (Object.hasOwn(obj, 'imageUrl')) return resolveImageUrl(obj.imageUrl);
    const candidate =
      obj.url ||
      obj.imageUrl ||
      obj.publicUrl ||
      obj.src ||
      obj.image ||
      (obj.asset && typeof obj.asset === 'object' ? (obj.asset as Record<string, unknown>).url || (obj.asset as Record<string, unknown>).publicUrl : null) ||
      (obj.data && typeof obj.data === 'object' ? (obj.data as Record<string, unknown>).publicUrl : null) ||
      obj.path;

    if (typeof candidate === 'string') {
      raw = candidate;
    }
  }

  if (!raw) return null;

  let trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^(?!https?:|data:image\/)[a-z][a-z\d+.-]*:/i.test(trimmed)) return null;

  // Normalize windows backslashes
  trimmed = trimmed.replace(/\\/g, '/');

  // Reject temporary or invalid values
  if (
    trimmed.startsWith('blob:') ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.includes('Invalid url') ||
    trimmed === '[object Object]'
  ) {
    return null;
  }

  // 1. Data URLs
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // 2. Full HTTP / HTTPS URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return url.hostname && !url.username && !url.password ? url.href : null;
    } catch {
      return null;
    }
  }

  // 3. Protocol-relative URLs
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // 4. Strip leading "public/" if mistakenly persisted (e.g. public/uploads/...)
  if (trimmed.startsWith('public/')) {
    trimmed = trimmed.slice(6); // leaves '/uploads/...' or 'uploads/...'
  }

  // 5. Already root-relative paths (/uploads/..., /images/..., /...)
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // 6. Prefixed with uploads/ or images/ without leading slash
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('images/') || trimmed.startsWith('assets/')) {
    return `/${trimmed}`;
  }

  // 7. Legacy bare filename (e.g. 1790613605098-af7007-HOMEPAGE-UPLOAD.jpg)
  // If it has no path separators and has an image extension or upload timestamp pattern
  if (!trimmed.includes('/')) {
    if (KNOWN_IMAGE_EXTENSIONS.test(trimmed) || /^\d{10,}-[a-zA-Z0-9]+-/.test(trimmed)) {
      return `/uploads/${trimmed}`;
    }
  }

  // If there's an image extension with some subpath without leading slash, prepend slash
  if (KNOWN_IMAGE_EXTENSIONS.test(trimmed)) {
    return `/${trimmed}`;
  }

  // Do not silently generate an invalid relative URL that will 404
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[resolveImageUrl] Unrecognized or invalid image URL candidate: "${raw}"`);
  }

  return null;
}
