'use client';

import { useState } from 'react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { Split } from 'lucide-react';

export interface BeforeAfterData {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  description?: string;
  mode?: 'side_by_side' | 'stacked' | 'slider';
}

export const DEFAULT_BEFORE_AFTER_DEMO: BeforeAfterData = {
  beforeImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  afterImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  beforeLabel: 'Legacy 4-Step Checkout',
  afterLabel: 'Unified Biometric Slide Drawer',
  description: 'Redesigned mobile checkout flow resulting in +24% completion increase.',
  mode: 'side_by_side',
};

interface BeforeAfterBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function BeforeAfterBlockEditor({ block, onChange }: BeforeAfterBlockEditorProps) {
  const data: BeforeAfterData = block.beforeAfterData || DEFAULT_BEFORE_AFTER_DEMO;

  const updateField = (field: keyof BeforeAfterData, value: any) => {
    onChange({ beforeAfterData: { ...data, [field]: value } });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#121418] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Split size={16} className="text-[#4F8CFF]" />
          <h4 className="text-sm font-semibold text-foreground">Before vs After Redesign Comparison</h4>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
          {(['side_by_side', 'stacked', 'slider'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => updateField('mode', m)}
              className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-all ${
                (data.mode || 'side_by_side') === m
                  ? 'bg-[#4F8CFF] text-black font-bold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {m.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={2}
        placeholder="Redesign overview & context description..."
        value={data.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-foreground focus:outline-none resize-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Image */}
        <div className="space-y-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <input
            type="text"
            placeholder="Before Label (e.g. Legacy Flow)"
            value={data.beforeLabel || ''}
            onChange={(e) => updateField('beforeLabel', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-xs text-red-300 font-bold focus:outline-none"
          />
          <ImageUploader
            name="beforeImage"
            value={data.beforeImage}
            onChange={(url) => updateField('beforeImage', url)}
            label="Before Visual / Screenshot"
          />
        </div>

        {/* After Image */}
        <div className="space-y-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <input
            type="text"
            placeholder="After Label (e.g. Redesigned Drawer)"
            value={data.afterLabel || ''}
            onChange={(e) => updateField('afterLabel', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-xs text-emerald-300 font-bold focus:outline-none"
          />
          <ImageUploader
            name="afterImage"
            value={data.afterImage}
            onChange={(url) => updateField('afterImage', url)}
            label="After Visual / Screenshot"
          />
        </div>
      </div>
    </div>
  );
}
