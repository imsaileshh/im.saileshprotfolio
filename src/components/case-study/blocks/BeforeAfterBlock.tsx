'use client';

import { useState } from 'react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';
import { DEFAULT_BEFORE_AFTER_DEMO } from '@/components/dashboard/case-studies/blocks/BeforeAfterBlockEditor';

export function BeforeAfterBlock({ block }: { block: ContentBlockItem }) {
  const data = block.beforeAfterData || DEFAULT_BEFORE_AFTER_DEMO;
  const [sliderPos, setSliderPos] = useState(50);

  if (!data || (!data.beforeImage && !data.afterImage)) return null;

  const beforeUrl = resolveImageUrl(data.beforeImage) || data.beforeImage;
  const afterUrl = resolveImageUrl(data.afterImage) || data.afterImage;
  const mode = data.mode || 'side_by_side';

  if (mode === 'slider' && beforeUrl && afterUrl) {
    return (
      <div className="w-full space-y-4 my-6">
        {data.description && <p className="text-xs text-muted leading-relaxed">{data.description}</p>}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-border-subtle bg-black select-none">
          {/* After image (background) */}
          <Image src={afterUrl} alt={data.afterLabel || 'After Redesign'} fill className="object-cover" />

          {/* Before image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative w-full h-full min-w-full">
              <Image src={beforeUrl} alt={data.beforeLabel || 'Before Redesign'} fill className="object-cover" />
            </div>
          </div>

          {/* Slider divider bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-accent shadow-lg cursor-ew-resize flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-accent text-black font-bold flex items-center justify-center text-[10px] shadow-md">
              &harr;
            </div>
          </div>

          {/* Labels */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] font-mono font-bold text-red-300 backdrop-blur-sm">
            {data.beforeLabel || 'BEFORE'}
          </span>
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] font-mono font-bold text-emerald-300 backdrop-blur-sm">
            {data.afterLabel || 'AFTER'}
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseInt(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
          />
        </div>
      </div>
    );
  }

  const isStacked = mode === 'stacked';

  return (
    <div className="w-full space-y-4 my-6">
      {data.description && <p className="text-xs text-muted leading-relaxed">{data.description}</p>}

      <div className={`grid ${isStacked ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
        {/* Before */}
        {beforeUrl && (
          <div className="space-y-2 group">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-red-500/30 bg-[var(--card)] shadow-sm">
              <Image src={beforeUrl} alt={data.beforeLabel || 'Before'} fill className="object-cover" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] font-mono font-bold text-red-300 backdrop-blur-sm">
                {data.beforeLabel || 'BEFORE'}
              </span>
            </div>
          </div>
        )}

        {/* After */}
        {afterUrl && (
          <div className="space-y-2 group">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-[var(--card)] shadow-sm">
              <Image src={afterUrl} alt={data.afterLabel || 'After'} fill className="object-cover" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] font-mono font-bold text-emerald-300 backdrop-blur-sm">
                {data.afterLabel || 'AFTER REDESIGN'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
