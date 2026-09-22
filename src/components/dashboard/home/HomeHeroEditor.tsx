'use client';

import { ImageUploader } from '@/components/dashboard/ImageUploader';
import type { HeroSectionConfig } from '@/types/homepage-cms';
import { Eye, EyeOff, LayoutTemplate, Sparkles } from 'lucide-react';

interface HomeHeroEditorProps {
  hero: HeroSectionConfig;
  onChange: (updated: HeroSectionConfig) => void;
}

const inputClass =
  'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const textareaClass =
  'min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

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

  return (
    <section id="hero" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* Section Title & Enable / Disable Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Hero Section</h2>
            <p className="text-xs text-zinc-400">
              Manage the primary headline, introduction text, portrait image, and buttons.
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

      {/* Typography & Text Fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eyebrow Label */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Eyebrow Label (Small Top Text)
            </span>
            <input
              value={hero.eyebrow}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              className={inputClass}
              placeholder="UI/UX DESIGNER • FRONTEND DEVELOPER • VIBE CODER"
            />
          </label>

          {/* Heading Line 1 & Line 2 */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Heading Line 1
            </span>
            <input
              value={hero.heading1}
              onChange={(e) => updateField('heading1', e.target.value)}
              className={inputClass}
              placeholder="Hey, I'm"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Heading Line 2
            </span>
            <input
              value={hero.heading2}
              onChange={(e) => updateField('heading2', e.target.value)}
              className={inputClass}
              placeholder="Sailesh."
            />
          </label>

          {/* Subheading */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Subheading / Supporting Role
            </span>
            <input
              value={hero.subheading}
              onChange={(e) => updateField('subheading', e.target.value)}
              className={inputClass}
              placeholder="UI/UX Designer, Frontend Developer, Vibe Coder"
            />
          </label>

          {/* Description Paragraphs */}
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Description Paragraph 1
            </span>
            <textarea
              value={hero.description1}
              onChange={(e) => updateField('description1', e.target.value)}
              className={`${textareaClass} min-h-20`}
              placeholder="I’m a UI/UX Designer & Frontend Developer"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Description Paragraph 2
            </span>
            <textarea
              value={hero.description2}
              onChange={(e) => updateField('description2', e.target.value)}
              className={`${textareaClass} min-h-24`}
              placeholder="I craft digital experiences that balance aesthetic precision with robust engineering..."
            />
          </label>
        </div>

        {/* Portrait Image Controls */}
        <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#4F8CFF]" />
            <h3 className="text-sm font-semibold text-white">Portrait Image</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Upload a new photo, replace the current image, or enter an image URL.
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

        {/* Buttons / Call to Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-lg border border-white/5 bg-black/20 p-5">
          {/* Primary CTA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Primary Button</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={hero.primaryCtaVisible}
                  onChange={(e) => updateField('primaryCtaVisible', e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-[#4F8CFF] focus:ring-0"
                />
                <span>Visible</span>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Button Text</span>
              <input
                value={hero.primaryCtaText}
                onChange={(e) => updateField('primaryCtaText', e.target.value)}
                className={inputClass}
                placeholder="Explore My Work"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Link URL</span>
              <input
                value={hero.primaryCtaLink}
                onChange={(e) => updateField('primaryCtaLink', e.target.value)}
                className={inputClass}
                placeholder="/works"
              />
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={hero.primaryCtaNewTab}
                onChange={(e) => updateField('primaryCtaNewTab', e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-[#4F8CFF] focus:ring-0"
              />
              <span>Open link in new tab</span>
            </label>
          </div>

          {/* Secondary CTA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Secondary Button</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={hero.secondaryCtaVisible}
                  onChange={(e) => updateField('secondaryCtaVisible', e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-[#4F8CFF] focus:ring-0"
                />
                <span>Visible</span>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Button Text</span>
              <input
                value={hero.secondaryCtaText}
                onChange={(e) => updateField('secondaryCtaText', e.target.value)}
                className={inputClass}
                placeholder="Contact Me"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Link URL</span>
              <input
                value={hero.secondaryCtaLink}
                onChange={(e) => updateField('secondaryCtaLink', e.target.value)}
                className={inputClass}
                placeholder="#hire"
              />
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={hero.secondaryCtaNewTab}
                onChange={(e) => updateField('secondaryCtaNewTab', e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-[#4F8CFF] focus:ring-0"
              />
              <span>Open link in new tab</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
