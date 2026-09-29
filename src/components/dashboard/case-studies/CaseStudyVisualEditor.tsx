'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Eye,
  Globe,
  Layout,
  ImageIcon,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import {
  CaseStudyVisual,
  CaseStudyVisualDisplayType,
  CaseStudyVisualDisplaySize,
  CaseStudyVisualBackgroundType,
  CaseStudyVisualFit,
  normalizeCaseStudyVisual,
  VISUAL_DEFAULTS,
  RECOMMENDED_SIZES,
} from '@/types/case-study-visual';
import { CaseStudyVisualBlock } from '@/components/case-study/CaseStudyVisualBlock';
import { resolveUploadedImageUrl } from '@/lib/media/case-study-media';
import { resolveImageUrl } from '@/lib/media/resolve-image-url';

interface CaseStudyVisualEditorProps {
  value?: CaseStudyVisual | Partial<CaseStudyVisual> | Record<string, unknown> | string | null;
  visual?: CaseStudyVisual | Partial<CaseStudyVisual> | Record<string, unknown> | string | null;
  onChange: (visual: CaseStudyVisual) => void;
  onDelete?: () => void;
  title?: string;
  className?: string;
}

const COLOR_PRESETS = [
  { name: 'Behance Gold', hex: '#FFD36A' },
  { name: 'Deep Slate', hex: '#0F172A' },
  { name: 'Electric Blue', hex: '#4F8CFF' },
  { name: 'Warm Cream', hex: '#F3EFE6' },
  { name: 'Velvet Plum', hex: '#2A1838' },
  { name: 'Minimal Dark', hex: '#16181D' },
  { name: 'Emerald Soft', hex: '#064E3B' },
  { name: 'Sunset Coral', hex: '#BE185D' },
];

export function CaseStudyVisualEditor({
  value,
  visual: visualProp,
  onChange,
  onDelete,
  title = 'Visual / Screenshot',
  className = '',
}: CaseStudyVisualEditorProps) {
  const visual = normalizeCaseStudyVisual(visualProp ?? value);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState(visual.imageUrl);
  const currentVisual = useRef(visual);
  currentVisual.current = visual;
  useEffect(() => { setUrlDraft(visual.imageUrl); }, [visual.imageUrl]);

  const updateVisual = (updates: Partial<CaseStudyVisual>) => {
    const next: CaseStudyVisual = {
      ...currentVisual.current,
      ...updates,
    };
    if ('imageUrl' in updates && !('url' in updates)) {
      next.url = updates.imageUrl || '';
    }
    if ('url' in updates && !('imageUrl' in updates)) {
      next.imageUrl = updates.url || '';
    }
    onChange(next);
  };

  const handleDisplayTypeChange = (type: CaseStudyVisualDisplayType) => {
    const defaults = VISUAL_DEFAULTS[type];
    updateVisual({
      displayType: type,
      padding: defaults.padding,
      radius: defaults.radius,
      fit: defaults.fit,
      displaySize: defaults.displaySize,
      backgroundType: defaults.backgroundType,
      backgroundColor: defaults.backgroundColor,
    });
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image size exceeds 20MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload directly to permanent storage via /api/upload
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Permanent public URL (NEVER a blob: or local object URL)
      const permanentUrl = resolveUploadedImageUrl(data.url);
      updateVisual({ imageUrl: permanentUrl, url: permanentUrl });
    } catch (err) {
      console.error('Visual upload failed:', err);
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const currentRecommendation = RECOMMENDED_SIZES[visual.displayType];

  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-[#101114] p-4 sm:p-5 space-y-5 ${className}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#4F8CFF]" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-semibold">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            {visual.displayType}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Delete visual"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── 01. Image Upload / Source ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-zinc-300">
            Upload Image
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 font-mono"
          >
            <LinkIcon size={11} />
            <span>{showUrlInput ? 'Hide URL' : 'Paste permanent URL'}</span>
          </button>
        </div>

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={onFileInputChange}
          className="hidden"
        />

        {visual.imageUrl ? (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Check size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-zinc-300 truncate" title={visual.imageUrl}>
                    {visual.imageUrl.split('/').pop() || 'Image uploaded'}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-400">{/^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(visual.imageUrl) ? 'Permanent Public URL stored' : visual.imageUrl.startsWith('/') ? 'Local image path' : 'Remote image URL'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
                  title="Replace with new file"
                >
                  <RefreshCw size={12} className={isUploading ? 'animate-spin' : ''} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateVisual({ imageUrl: '', url: '' })}
                  disabled={isUploading}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#4F8CFF] bg-[#4F8CFF]/10'
                : 'border-white/10 bg-black/30 hover:border-white/25 hover:bg-black/40'
            } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="h-6 w-6 text-[#4F8CFF] animate-spin" />
                <p className="text-xs font-medium text-white">Uploading to permanent storage...</p>
                <p className="text-[10px] text-zinc-500">Storing permanently to storage</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#4F8CFF] mb-2">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-medium text-white mb-0.5">
                  Click to choose file <span className="text-zinc-500 font-normal">or drag & drop</span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  PNG, JPG, WebP or SVG up to 20MB
                </p>
              </>
            )}
          </div>
        )}

        {showUrlInput && (
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => {
              setUrlDraft(e.target.value);
            }}
            onBlur={() => {
              const resolved = resolveImageUrl(urlDraft);
              if (urlDraft.trim() && !resolved) {
                setUploadError('Enter a valid image URL.');
              } else {
                setUploadError(null);
                updateVisual({ imageUrl: resolved || '', url: resolved || '' });
              }
            }}
            placeholder="https://... direct image URL"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-xs text-white outline-none font-mono focus:border-[#4F8CFF]"
          />
        )}

        {uploadError && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* ── 02. Display Type Selector ── */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-300">
          Display Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Webpage / Long Screenshot */}
          <button
            type="button"
            onClick={() => handleDisplayTypeChange('webpage')}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
              visual.displayType === 'webpage'
                ? 'border-[#4F8CFF] bg-[#4F8CFF]/10 text-white shadow-sm'
                : 'border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Globe size={14} className={visual.displayType === 'webpage' ? 'text-[#4F8CFF]' : 'text-zinc-500'} />
              <span className="text-xs font-semibold">Webpage</span>
            </div>
            <span className="text-[10px] text-zinc-500 leading-tight">Long vertical screenshot</span>
          </button>

          {/* Dashboard / UI Screen */}
          <button
            type="button"
            onClick={() => handleDisplayTypeChange('dashboard')}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
              visual.displayType === 'dashboard'
                ? 'border-[#4F8CFF] bg-[#4F8CFF]/10 text-white shadow-sm'
                : 'border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Layout size={14} className={visual.displayType === 'dashboard' ? 'text-[#4F8CFF]' : 'text-zinc-500'} />
              <span className="text-xs font-semibold">Dashboard / UI</span>
            </div>
            <span className="text-[10px] text-zinc-500 leading-tight">Presentation frame mockup</span>
          </button>

          {/* Standard Image */}
          <button
            type="button"
            onClick={() => handleDisplayTypeChange('image')}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
              visual.displayType === 'image'
                ? 'border-[#4F8CFF] bg-[#4F8CFF]/10 text-white shadow-sm'
                : 'border-white/10 bg-black/30 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <ImageIcon size={14} className={visual.displayType === 'image' ? 'text-[#4F8CFF]' : 'text-zinc-500'} />
              <span className="text-xs font-semibold">Standard Image</span>
            </div>
            <span className="text-[10px] text-zinc-500 leading-tight">Mockups & visuals</span>
          </button>
        </div>

        {/* Recommended Size Helper Callout */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 flex items-center justify-between text-[11px]">
          <span className="font-mono text-zinc-500 uppercase tracking-wider text-[10px]">
            {currentRecommendation.title}:
          </span>
          <div className="text-right">
            <span className="font-mono font-semibold text-zinc-300">{currentRecommendation.dimension}</span>
            <span className="text-zinc-500 block text-[10px]">{currentRecommendation.detail}</span>
          </div>
        </div>
      </div>

      {/* ── 03. Display Size Controls ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-zinc-300">
            Display Size
          </label>
          <span className="text-[10px] font-mono text-zinc-500">
            {visual.displaySize === 'medium' ? 'max 720px (centered)' : visual.displaySize === 'large' ? 'max 1000px (centered)' : 'Full width (100%)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['medium', 'large', 'full'] as CaseStudyVisualDisplaySize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateVisual({ displaySize: size })}
              className={`h-8 rounded-lg border text-xs font-medium capitalize transition-all ${
                visual.displaySize === size
                  ? 'border-[#4F8CFF] bg-[#4F8CFF]/20 text-[#4F8CFF] font-semibold'
                  : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {size === 'full' ? 'Full Width' : size}
            </button>
          ))}
        </div>
      </div>

      {/* ── 04. Background Controls (Dashboard, Image, or optional Webpage) ── */}
      {(visual.displayType === 'dashboard' || visual.displayType === 'image') && (
        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-300">
              Presentation Background
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              Behind the screenshot
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['none', 'theme', 'custom'] as CaseStudyVisualBackgroundType[]).map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => updateVisual({ backgroundType: bg })}
                className={`h-8 rounded-lg border text-xs font-medium capitalize transition-all ${
                  visual.backgroundType === bg
                    ? 'border-[#4F8CFF] bg-[#4F8CFF]/20 text-[#4F8CFF] font-semibold'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {bg === 'none' ? 'None' : bg === 'theme' ? 'Theme Card' : 'Custom Color'}
              </button>
            ))}
          </div>

          {/* Custom Color Input & Presets */}
          {visual.backgroundType === 'custom' && (
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium">Background Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md border border-white/20 shadow-inner"
                    style={{ backgroundColor: visual.backgroundColor || '#FFD36A' }}
                  />
                  <input
                    type="color"
                    value={visual.backgroundColor || '#FFD36A'}
                    onChange={(e) => updateVisual({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    title="Choose color"
                  />
                  <input
                    type="text"
                    value={visual.backgroundColor || '#FFD36A'}
                    onChange={(e) => updateVisual({ backgroundColor: e.target.value })}
                    placeholder="#FFD36A"
                    className="h-7 w-24 rounded-md border border-white/10 bg-black/60 px-2 text-xs font-mono text-white outline-none focus:border-[#4F8CFF]"
                  />
                </div>
              </div>

              {/* Quick Behance Palette Swatches */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-zinc-500 mr-1">Presets:</span>
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => updateVisual({ backgroundColor: preset.hex })}
                    className="group relative flex items-center justify-center h-6 w-6 rounded-md border border-white/15 transition-transform hover:scale-110 active:scale-95"
                    style={{ backgroundColor: preset.hex }}
                    title={`${preset.name} (${preset.hex})`}
                  >
                    {visual.backgroundColor?.toLowerCase() === preset.hex.toLowerCase() && (
                      <Check size={11} className={preset.hex === '#FFD36A' || preset.hex === '#F3EFE6' ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 05. Presentation Controls: Padding & Corner Radius ── */}
      <div className="space-y-4 pt-2 border-t border-white/[0.06]">
        {/* Padding Slider (0px - 120px) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">Presentation Frame Padding</span>
            <span className="font-mono text-accent font-semibold">{visual.padding ?? 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={4}
            value={visual.padding ?? 0}
            onChange={(e) => updateVisual({ padding: Number(e.target.value) })}
            className="w-full accent-[#4F8CFF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-600">
            <span>0px (Tight)</span>
            <span>48px (Default)</span>
            <span>120px (Spacious)</span>
          </div>
        </div>

        {/* Corner Radius Slider (0px - 40px) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">Corner Radius</span>
            <span className="font-mono text-accent font-semibold">{visual.radius ?? 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={2}
            value={visual.radius ?? 0}
            onChange={(e) => updateVisual({ radius: Number(e.target.value) })}
            className="w-full accent-[#4F8CFF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-600">
            <span>0px (Sharp)</span>
            <span>20px (Default)</span>
            <span>40px (Curved)</span>
          </div>
        </div>

        {/* Image Fit: Natural | Contain | Cover */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Image Fit
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['natural', 'contain', 'cover'] as CaseStudyVisualFit[]).map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => updateVisual({ fit })}
                className={`h-8 rounded-lg border text-xs font-medium capitalize transition-all ${
                  visual.fit === fit
                    ? 'border-[#4F8CFF] bg-[#4F8CFF]/20 text-[#4F8CFF] font-semibold'
                    : 'border-white/10 bg-black/40 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 06. Alt Text & Caption ── */}
      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/[0.06]">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Alt Text (Accessibility)
          </label>
          <input
            type="text"
            value={visual.alt || ''}
            onChange={(e) => updateVisual({ alt: e.target.value })}
            placeholder="e.g. Desktop homepage design screenshot"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Caption (Optional)
          </label>
          <input
            type="text"
            value={visual.caption || ''}
            onChange={(e) => updateVisual({ caption: e.target.value })}
            placeholder="e.g. High-fidelity UI iteration 3"
            className="h-8 w-full rounded-lg border border-white/10 bg-black/50 px-2.5 text-xs text-white outline-none focus:border-[#4F8CFF]"
          />
        </div>
      </div>

      {/* ── 07. REAL-TIME LIVE PREVIEW ── */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye size={13} className="text-[#4F8CFF]" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Live Preview
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Real-time Behance rendering
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0c0d10] p-4 sm:p-6 overflow-hidden min-h-[160px] flex items-center justify-center relative">
          {visual.imageUrl ? (
            <div className="w-full">
              <CaseStudyVisualBlock visual={visual} isPreview={true} />
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-600 space-y-1">
              <ImageIcon size={24} className="mx-auto opacity-40" />
              <p className="text-xs font-mono">Upload an image above to see live presentation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
