'use client';

import { useState } from 'react';
import { User, Eye, EyeOff, Plus, Trash2, Sparkles } from 'lucide-react';
import type { AboutSectionConfig } from '@/types/homepage-cms';

interface HomeAboutEditorProps {
  aboutConfig: AboutSectionConfig;
  onChange: (updated: AboutSectionConfig) => void;
}

const inputClass =
  'h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';
const textareaClass =
  'min-h-32 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#4F8CFF]';

export function HomeAboutEditor({ aboutConfig, onChange }: HomeAboutEditorProps) {
  const [newSpec, setNewSpec] = useState('');

  const updateField = <K extends keyof AboutSectionConfig>(
    field: K,
    value: AboutSectionConfig[K]
  ) => {
    onChange({
      ...aboutConfig,
      [field]: value,
    });
  };

  const handleAddSpecialization = () => {
    const trimmed = newSpec.trim();
    if (!trimmed) return;
    const formatted = trimmed.endsWith('.') ? trimmed.toUpperCase() : `${trimmed.toUpperCase()}.`;
    const updated = [...(aboutConfig.specializations || []), formatted];
    updateField('specializations', updated);
    setNewSpec('');
  };

  const handleRemoveSpecialization = (index: number) => {
    const updated = aboutConfig.specializations.filter((_, i) => i !== index);
    updateField('specializations', updated);
  };

  const handleUpdateSpecialization = (index: number, val: string) => {
    const updated = [...aboutConfig.specializations];
    updated[index] = val;
    updateField('specializations', updated);
  };

  return (
    <section id="about" className="rounded-xl border border-white/10 bg-[#111113] p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">About Section</h2>
            <p className="text-xs text-zinc-400">
              Manage the About Me headline, biography paragraph, and animated specialization typewriter.
            </p>
          </div>
        </div>

        {/* Section Visibility Switch */}
        <button
          type="button"
          onClick={() => updateField('visible', !aboutConfig.visible)}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors border ${
            aboutConfig.visible
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700'
          }`}
        >
          {aboutConfig.visible ? (
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

      {/* Main Text Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Section Label (Eyebrow)
          </span>
          <input
            value={aboutConfig.label}
            onChange={(e) => updateField('label', e.target.value)}
            className={inputClass}
            placeholder="About Me"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Heading
          </span>
          <input
            value={aboutConfig.heading}
            onChange={(e) => updateField('heading', e.target.value)}
            className={inputClass}
            placeholder="Design. Build. Ship."
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Subheading / Role
          </span>
          <input
            value={aboutConfig.subheading}
            onChange={(e) => updateField('subheading', e.target.value)}
            className={inputClass}
            placeholder="UI/UX Designer • Frontend Developer • Vibe Coder"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
            Biography / Content
          </span>
          <textarea
            value={aboutConfig.content}
            onChange={(e) => updateField('content', e.target.value)}
            className={textareaClass}
            placeholder="I'm a UI/UX Designer and Frontend Developer..."
          />
        </label>
      </div>

      {/* Specialization Typewriter Words Editor */}
      <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#4F8CFF]" />
            <h3 className="text-sm font-semibold text-white">
              Specialization Typewriter Words
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            &quot;I specialize as a ...&quot;
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          These roles rotate dynamically with a smooth typewriter animation on the homepage right-hand side.
        </p>

        {/* Existing Words List */}
        <div className="space-y-2">
          {aboutConfig.specializations?.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 w-6 text-right shrink-0">
                0{index + 1}
              </span>
              <input
                value={spec}
                onChange={(e) => handleUpdateSpecialization(index, e.target.value)}
                className={`${inputClass} font-mono uppercase text-xs`}
                placeholder="UI/UX DESIGNER."
              />
              <button
                type="button"
                onClick={() => handleRemoveSpecialization(index)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                title="Remove word"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Word Input */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <input
            value={newSpec}
            onChange={(e) => setNewSpec(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSpecialization();
              }
            }}
            className={`${inputClass} text-xs font-mono uppercase`}
            placeholder="ADD NEW SPECIALIZATION..."
          />
          <button
            type="button"
            onClick={handleAddSpecialization}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Connected CTA Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-white/5 bg-black/20 p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">CTA Link Text</span>
          <input
            value={aboutConfig.ctaText}
            onChange={(e) => updateField('ctaText', e.target.value)}
            className={inputClass}
            placeholder="More about me"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-400">CTA Destination URL</span>
          <input
            value={aboutConfig.ctaLink}
            onChange={(e) => updateField('ctaLink', e.target.value)}
            className={inputClass}
            placeholder="/about"
          />
        </label>
      </div>
    </section>
  );
}
