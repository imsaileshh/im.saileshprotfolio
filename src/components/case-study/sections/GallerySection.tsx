'use client';

import { GalleryData } from '@/types/case-study-builder';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';

interface GallerySectionProps {
  galleryData?: GalleryData;
}

export function GallerySection({ galleryData }: GallerySectionProps) {
  if (!galleryData || !galleryData.images || galleryData.images.length === 0) return null;

  const { images, layout = 'grid3' } = galleryData;

  const resolvedImages = images.map((img) => ({
    ...img,
    resolvedUrl: resolveImageUrl(img.url) || img.url,
  }));

  if (layout === 'scroll') {
    return (
      <div className="w-full my-6 overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center gap-4 min-w-max">
          {resolvedImages.map((img, idx) => (
            <div key={img.id || idx} className="w-80 sm:w-96 space-y-2 shrink-0">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border-subtle bg-black/40 shadow-sm">
                <Image src={img.resolvedUrl} alt={img.alt || `Gallery Image ${idx + 1}`} fill className="object-cover" />
              </div>
              {img.caption && <p className="text-[11px] text-muted font-mono">{img.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'hero_supporting' && resolvedImages.length > 1) {
    const hero = resolvedImages[0];
    const rest = resolvedImages.slice(1);

    return (
      <div className="w-full space-y-6 my-6">
        <div className="space-y-2">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border-subtle bg-black/40 shadow-md">
            <Image src={hero.resolvedUrl} alt={hero.alt || 'Hero Showcase'} fill className="object-cover" />
          </div>
          {hero.caption && <p className="text-xs text-muted font-mono">{hero.caption}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {rest.map((img, idx) => (
            <div key={img.id || idx} className="space-y-1.5">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-border-subtle bg-black/40 shadow-sm">
                <Image src={img.resolvedUrl} alt={img.alt || `Supporting Image ${idx + 1}`} fill className="object-cover" />
              </div>
              {img.caption && <p className="text-[10px] text-muted font-mono">{img.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  let gridColClass = 'grid-cols-1 md:grid-cols-3';
  if (layout === 'grid2') gridColClass = 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="w-full my-6">
      <div className={`grid ${gridColClass} gap-4 sm:gap-6`}>
        {resolvedImages.map((img, idx) => (
          <div key={img.id || idx} className="space-y-2 group">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-border-subtle/80 bg-[var(--card)] shadow-sm group-hover:border-accent/40 transition-colors">
              <Image src={img.resolvedUrl} alt={img.alt || `Gallery Image ${idx + 1}`} fill className="object-cover transition-transform group-hover:scale-102" />
            </div>
            {img.caption && <p className="text-[11px] text-muted font-mono">{img.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
