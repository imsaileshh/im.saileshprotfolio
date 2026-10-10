'use client';

import { ImageUploader } from '@/components/dashboard/ImageUploader';
import type { HeroSectionConfig } from '@/types/homepage-cms';
import { Eye, EyeOff, LayoutTemplate, Sparkles, Type } from 'lucide-react';

interface HomeHeroEditorProps {
  hero: HeroSectionConfig;
  onChange: (updated: HeroSectionConfig) => void;
}

const inputClass =
  'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const selectClass =
  'h-10 w-full rounded-lg border border-white/10 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#4F8CFF]';
const textareaClass =
  'min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

const FONT_FAMILIES = [
  { label: 'Helvetica Neue (Fallback Stack)', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Inter (Sans)', value: 'var(--font-sans), sans-serif' },
  { label: 'Outfit (Display)', value: 'var(--font-display), sans-serif' },
  { label: 'System Monospace', value: 'ui-monospace, monospace' },
  { label: 'System Serif', value: 'ui-serif, Georgia, serif' },
];

const FONT_WEIGHTS = [
  { label: '500 · Medium', value: '500' },
  { label: '600 · Semi-Bold', value: '600' },
  { label: '700 · Bold', value: '700' },
  { label: '800 · Extra-Bold', value: '800' },
];

const FONT_SIZES = [
  { label: 'Responsive Standard (clamp 30px–50px)', value: 'clamp(30px, 4.5vw, 50px)' },
  { label: 'Responsive Large (clamp 36px–56px)', value: 'clamp(36px, 5vw, 56px)' },
  { label: 'Responsive Compact (clamp 28px–44px)', value: 'clamp(28px, 4vw, 44px)' },
  { label: 'Fixed 42px', value: '42px' },
  { label: 'Fixed 48px', value: '48px' },
  { label: 'Fixed 52px', value: '52px' },
];

const COLOR_PRESETS = [
  { label: 'Teal Accent (#2DD4BF)', value: '#2DD4BF' },
  { label: 'Emerald (#10B981)', value: '#10B981' },
  { label: 'Sky Blue (#38BDF8)', value: '#38BDF8' },
  { label: 'Indigo (#818CF8)', value: '#818CF8' },
  { label: 'Amber (#F59E0B)', value: '#F59E0B' },
  { label: 'White (#FFFFFF)', value: '#FFFFFF' },
];

export function HomeHeroEditor({ hero, onChange }: HomeHeroEditorProps) {
  const updateField = <K extends keyof HeroSectionConfig>(
    field: K,
    value: HeroSectionConfig[K]
  ) => {
    onChange({
      ...hero,
      [field]: value,
    });
  };

  const currentHeading = hero.heading || "Hey, I'm Sailesh P!";
  const currentHighlight = hero.headingHighlight || 'Sailesh P!';
  const currentHighlightColor = hero.highlightColor || '#2DD4BF';

  // Live preview highlight rendering
  const renderPreviewHeading = () => {
    if (!currentHighlight || !currentHeading.includes(currentHighlight)) {
      return <span>{currentHeading}</span>;
    }
    const parts = currentHeading.split(currentHighlight);
    return (
      <>
        {parts[0]}
        <span style={{ color: currentHighlightColor }}>{currentHighlight}</span>
        {parts.slice(1).join(currentHighlight)}
      </>
    );
  };

  return (
    <section id="hero" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* ── Section Title & Enable / Disable Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Hero Section</h2>
            <p className="text-xs text-zinc-400">
              Manage the primary headline, typography, introduction text, portrait image, and CTA buttons.
            </p>
          </div>
        </div>

        {/* Section Visibility Switch */}
        <button
          type="button"
          onClick={() => updateField('visible', !hero.visible)}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
            hero.visible
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
          }`}
        >
          {hero.visible ? (
            <>
              <Eye size={14} />
              <span>Section Visible</span>
            </>
          ) : (
            <>
              <EyeOff size={14} />
              <span>Section Hidden</span>
            </>
          )}
        </button>
      </div>

      {!hero.visible && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          Hero section is currently set to hidden and will not be displayed on the public homepage.
        </div>
      )}

      {/* ── Live In-Editor Heading & Text Preview ── */}
      <div className="rounded-lg border border-white/10 bg-black/40 p-5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          <span>Live Hero Typography Preview</span>
          <span>Helvetica Neue Stack</span>
        </div>
        <div className="border border-white/5 rounded-lg bg-[#111214] p-5 space-y-2">
          {/* Eyebrow */}
          <div className="font-helvetica text-[11px] font-medium text-muted tracking-[0.16em] uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{hero.eyebrow || 'UI/UX DESIGNER · FRONTEND DEVELOPER'}</span>
          </div>

          {/* Heading */}
          <div
            style={{
              fontFamily: hero.headingFontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: hero.headingFontWeight || '600',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              letterSpacing: '-0.035em',
              color: hero.headingColor || '#F4F4F4',
            }}
            className="leading-[1.12] text-foreground"
          >
            {renderPreviewHeading()}
          </div>

          {/* Tagline */}
          <div className="font-helvetica text-sm sm:text-base font-medium text-foreground/90">
            {hero.tagline || 'Designing experiences. Building digital products.'}
          </div>

          {/* Description */}
          <div className="font-helvetica text-xs sm:text-sm font-normal text-muted leading-relaxed max-w-xl">
            {hero.description ||
              "I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications."}
          </div>
        </div>
      </div>

      {/* ── Content Text Fields ── */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Eyebrow Label */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              1. Eyebrow Label (Small Top Text)
            </span>
            <input
              value={hero.eyebrow}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              className={inputClass}
              placeholder="UI/UX DESIGNER · FRONTEND DEVELOPER"
            />
          </label>

          {/* Main Heading Text */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              2. Main Heading Text (Single Continuous Heading)
            </span>
            <input
              value={currentHeading}
              onChange={(e) => updateField('heading', e.target.value)}
              className={inputClass}
              placeholder="Hey, I'm Sailesh P!"
            />
          </label>

          {/* Heading Highlight Segment */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              3. Heading Highlight Text (Highlighted in Accent Color)
            </span>
            <input
              value={currentHighlight}
              onChange={(e) => updateField('headingHighlight', e.target.value)}
              className={inputClass}
              placeholder="Sailesh P!"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              The segment of text inside the Main Heading that will be highlighted with the teal accent color.
            </p>
          </label>

          {/* Tagline */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              4. Tagline (Sub-statement)
            </span>
            <input
              value={hero.tagline || ''}
              onChange={(e) => updateField('tagline', e.target.value)}
              className={inputClass}
              placeholder="Designing experiences. Building digital products."
            />
          </label>

          {/* Description */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              5. Description (Introduction Paragraph)
            </span>
            <textarea
              value={hero.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className={`${textareaClass} min-h-24`}
              placeholder="I'm a UI/UX Designer and Frontend Developer focused on creating intuitive user experiences and high-performance web applications."
            />
          </label>
        </div>

        {/* ── Typography System Controls (Fields 6, 7, 8, 9) ── */}
        <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-[#4F8CFF]" />
            <h3 className="text-sm font-semibold text-white">Heading Typography &amp; Colors</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Heading Font Family */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                6. Font Family
              </span>
              <select
                value={hero.headingFontFamily || '"Helvetica Neue", Helvetica, Arial, sans-serif'}
                onChange={(e) => updateField('headingFontFamily', e.target.value)}
                className={selectClass}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Heading Font Weight */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                7. Font Weight
              </span>
              <select
                value={hero.headingFontWeight || '600'}
                onChange={(e) => updateField('headingFontWeight', e.target.value)}
                className={selectClass}
              >
                {FONT_WEIGHTS.map((fw) => (
                  <option key={fw.value} value={fw.value}>
                    {fw.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Heading Font Size */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                8. Font Size
              </span>
              <select
                value={hero.headingFontSize || 'clamp(30px, 4.5vw, 50px)'}
                onChange={(e) => updateField('headingFontSize', e.target.value)}
                className={selectClass}
              >
                {FONT_SIZES.map((sz) => (
                  <option key={sz.value} value={sz.value}>
                    {sz.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 9. Text Colors */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <span className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              9. Highlight Accent Color
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = (currentHighlightColor).toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => updateField('highlightColor', preset.value)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'border-white/40 bg-white/15 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/30"
                      style={{ backgroundColor: preset.value }}
                    />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-zinc-500">Custom Highlight Hex:</span>
              <input
                type="text"
                value={hero.highlightColor || ''}
                onChange={(e) => updateField('highlightColor', e.target.value)}
                placeholder="#2DD4BF"
                className="h-8 w-28 rounded border border-white/10 bg-black px-2 text-xs font-mono text-white outline-none focus:border-[#4F8CFF]"
              />
            </div>
          </div>
        </div>

        {/* ── Portrait Image Controls ── */}
        <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#4F8CFF]" />
            <h3 className="text-sm font-semibold text-white">Portrait Image</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Upload a photo or change the profile image URL.
          </p>

          <ImageUploader
            name="heroImage"
            value={hero.imageUrl || '/images/profile/IMG_0871.jpg'}
            onChange={(url) => updateField('imageUrl', url)}
            label="Hero Portrait Image"
            helperText="Recommended: 4:5 aspect ratio portrait (JPG, PNG, WebP)."
            aspectRatio="aspect-[4/5]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Editorial Profile Name (Under image)
              </span>
              <input
                value={hero.profileLabels || 'SAILESH P.'}
                onChange={(e) => updateField('profileLabels', e.target.value)}
                className={inputClass}
                placeholder="SAILESH P."
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Supporting Text (Metadata tag)
              </span>
              <input
                value={hero.supportingText || 'DESIGN / CODE / MOTION'}
                onChange={(e) => updateField('supportingText', e.target.value)}
                className={inputClass}
                placeholder="DESIGN / CODE / MOTION"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

