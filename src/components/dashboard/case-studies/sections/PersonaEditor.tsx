'use client';

import { useState } from 'react';
import { Plus, Trash2, User, Sliders, Quote } from 'lucide-react';
import { UserPersonaData } from '@/types/case-study-builder';
import { DEFAULT_PERSONA_DEMO } from '@/lib/data/case-study-demo-data';
import { ImageUploader } from '@/components/dashboard/ImageUploader';

interface PersonaEditorProps {
  data?: UserPersonaData;
  onChange: (newData: UserPersonaData) => void;
}

export function PersonaEditor({ data = DEFAULT_PERSONA_DEMO, onChange }: PersonaEditorProps) {
  const updateField = (field: keyof UserPersonaData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateSlider = (key: 'techSavvy' | 'priceSensitivity' | 'frequencyOfUse', val: number) => {
    const sliders = data.sliders || { techSavvy: 80, priceSensitivity: 50, frequencyOfUse: 90 };
    onChange({ ...data, sliders: { ...sliders, [key]: val } });
  };

  const renderBulletList = (field: keyof UserPersonaData, title: string, placeholder: string) => {
    const items = (data[field] as string[]) || [];
    const addItem = () => onChange({ ...data, [field]: [...items, ''] });
    const editItem = (idx: number, val: string) => {
      const next = [...items];
      next[idx] = val;
      onChange({ ...data, [field]: next });
    };
    const removeItem = (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      onChange({ ...data, [field]: next });
    };

    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-accent">{title} ({items.length})</h5>
          <button
            type="button"
            onClick={addItem}
            className="p-1 rounded bg-accent/15 text-accent hover:bg-accent/25 transition-all text-xs flex items-center gap-1 px-2"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                placeholder={placeholder}
                onChange={(e) => editItem(idx, e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-1 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sliders = data.sliders || { techSavvy: 85, priceSensitivity: 40, frequencyOfUse: 95 };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User size={16} className="text-accent" />
          <span>User Persona Profile</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name (e.g. Elena Rostova)"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Role / Profession"
            value={data.role}
            onChange={(e) => updateField('role', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Age (e.g. 29)"
            value={data.age}
            onChange={(e) => updateField('age', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Location (e.g. New York, NY)"
            value={data.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <ImageUploader
          name="personaImageUrl"
          value={data.imageUrl || (data as any).avatarUrl || ''}
          onChange={(url) => {
            onChange({ ...data, imageUrl: url, avatarUrl: url } as any);
          }}
          label="Profile Photo / Avatar"
          helperText="Upload a profile photo or avatar image for this persona (JPG, PNG, WebP)."
          aspectRatio="aspect-square"
        />

        <textarea
          rows={3}
          placeholder="Persona Bio & Narrative..."
          value={data.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
        />

        <div className="flex items-center gap-2">
          <Quote size={16} className="text-accent shrink-0" />
          <input
            type="text"
            placeholder='Persona Quote (e.g. "Speed and clarity above all else.")'
            value={data.quote}
            onChange={(e) => updateField('quote', e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none italic"
          />
        </div>
      </div>

      {/* Trait Sliders */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sliders size={16} className="text-accent" />
          <span>Behavioral Spectrum Sliders</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Tech Savvy</span>
              <span className="font-mono text-accent">{sliders.techSavvy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.techSavvy}
              onChange={(e) => updateSlider('techSavvy', parseInt(e.target.value))}
              className="w-full accent-accent bg-black/40 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Price Sensitivity</span>
              <span className="font-mono text-accent">{sliders.priceSensitivity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.priceSensitivity}
              onChange={(e) => updateSlider('priceSensitivity', parseInt(e.target.value))}
              className="w-full accent-accent bg-black/40 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Frequency of Use</span>
              <span className="font-mono text-accent">{sliders.frequencyOfUse}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.frequencyOfUse}
              onChange={(e) => updateSlider('frequencyOfUse', parseInt(e.target.value))}
              className="w-full accent-accent bg-black/40 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bullet Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderBulletList('goals', 'Goals & Drivers', 'Primary goal...')}
        {renderBulletList('painPoints', 'Frustrations & Pain Points', 'Friction point...')}
        {renderBulletList('needs', 'Core Needs', 'System requirement...')}
        {renderBulletList('behaviors', 'Observed Behaviors', 'Usage pattern...')}
        {renderBulletList('tools', 'Preferred Tools & Software', 'App / Tool name...')}
        {renderBulletList('motivations', 'Primary Motivations', 'Value driver...')}
      </div>
    </div>
  );
}
