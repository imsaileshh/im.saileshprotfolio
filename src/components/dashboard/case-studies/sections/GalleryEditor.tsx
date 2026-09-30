'use client';

import { useState } from 'react';
import { Plus, Trash2, Maximize2, MoveUp, MoveDown } from 'lucide-react';
import { GalleryData, GalleryLayout, GalleryImageItem } from '@/types/case-study-builder';
import { DEFAULT_GALLERY_DEMO } from '@/lib/data/case-study-demo-data';
import { ImageUploader } from '@/components/dashboard/ImageUploader';

interface GalleryEditorProps {
  data?: GalleryData;
  onChange: (newData: GalleryData) => void;
}

export function GalleryEditor({ data = DEFAULT_GALLERY_DEMO, onChange }: GalleryEditorProps) {
  const images = data?.images || [];
  const layout = data?.layout || 'grid3';

  const setLayout = (l: GalleryLayout) => {
    onChange({ ...data, layout: l });
  };

  const addImage = (url: string) => {
    const newImg: GalleryImageItem = {
      id: `img-${Date.now().toString(36)}`,
      url,
      alt: 'Gallery showcase screen',
      caption: '',
    };
    onChange({ ...data, images: [...images, newImg] });
  };

  const updateImage = (id: string, updated: Partial<GalleryImageItem>) => {
    const nextImages = images.map((img) => (img.id === id ? { ...img, ...updated } : img));
    onChange({ ...data, images: nextImages });
  };

  const removeImage = (id: string) => {
    const nextImages = images.filter((img) => img.id !== id);
    onChange({ ...data, images: nextImages });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const nextImages = [...images];
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIdx];
    nextImages[targetIdx] = temp;
    onChange({ ...data, images: nextImages });
  };

  const layoutOptions: Array<{ id: GalleryLayout; label: string }> = [
    { id: 'grid2', label: 'Grid (2 Cols)' },
    { id: 'grid3', label: 'Grid (3 Cols)' },
    { id: 'masonry', label: 'Masonry' },
    { id: 'scroll', label: 'Horizontal Scroll' },
    { id: 'hero_supporting', label: 'Large + Supporting' },
    { id: 'device_showcase', label: 'Device Showcase' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Maximize2 size={16} className="text-accent" />
              <span>Multi-Image Gallery ({images.length} Images)</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Select a presentation layout and upload/reorder gallery images.</p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
            {layoutOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayout(opt.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  layout === opt.id
                    ? 'bg-accent text-black font-semibold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload box */}
        <div className="p-4 rounded-xl border border-dashed border-white/15 bg-black/30">
          <label className="text-xs font-semibold text-foreground block mb-2">Upload New Image to Gallery</label>
          <ImageUploader
            name="galleryImage"
            value=""
            onChange={(url) => {
              if (url) addImage(url);
            }}
          />
        </div>

        {/* Image items */}
        <div className="space-y-3">
          {images.map((img, index) => (
            <div key={img.id} className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img.url}
                  onChange={(e) => updateImage(img.id, { url: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-foreground focus:border-accent focus:outline-none w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                <input
                  type="text"
                  placeholder="Alt text"
                  value={img.alt || ''}
                  onChange={(e) => updateImage(img.id, { alt: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Caption text"
                  value={img.caption || ''}
                  onChange={(e) => updateImage(img.id, { caption: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-muted focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30"
                >
                  <MoveUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === images.length - 1}
                  className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30"
                >
                  <MoveDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="p-1 rounded text-muted hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
