'use client';

import { useState } from 'react';
import { Plus, Trash2, Heart, User, Sparkles } from 'lucide-react';
import { EmpathyMapData, EmpathyMapVariant } from '@/types/case-study-builder';
import { DEFAULT_EMPATHY_MAP_DEMO } from '@/lib/data/case-study-demo-data';
import { ImageUploader } from '@/components/dashboard/ImageUploader';

interface EmpathyMapEditorProps {
  data?: EmpathyMapData;
  onChange: (newData: EmpathyMapData) => void;
}

export function EmpathyMapEditor({ data = DEFAULT_EMPATHY_MAP_DEMO, onChange }: EmpathyMapEditorProps) {
  const persona = data?.persona || DEFAULT_EMPATHY_MAP_DEMO.persona;
  const variant = data?.variant || 'classic';

  const updatePersona = (updated: Partial<typeof persona>) => {
    onChange({ ...data, persona: { ...persona, ...updated } });
  };

  const setVariant = (v: EmpathyMapVariant) => {
    onChange({ ...data, variant: v });
  };

  const updateListField = (field: keyof EmpathyMapData, list: string[]) => {
    onChange({ ...data, [field]: list });
  };

  const addListItem = (field: keyof EmpathyMapData) => {
    const current = (data[field] as string[]) || [];
    onChange({ ...data, [field]: [...current, 'New research insight item...'] });
  };

  const editListItem = (field: keyof EmpathyMapData, index: number, value: string) => {
    const current = [...((data[field] as string[]) || [])];
    current[index] = value;
    onChange({ ...data, [field]: current });
  };

  const removeListItem = (field: keyof EmpathyMapData, index: number) => {
    const current = [...((data[field] as string[]) || [])];
    current.splice(index, 1);
    onChange({ ...data, [field]: current });
  };

  const renderBulletList = (field: keyof EmpathyMapData, title: string, placeholder: string) => {
    const items = (data[field] as string[]) || [];
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-accent">{title} ({items.length})</h5>
          <button
            type="button"
            onClick={() => addListItem(field)}
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
                onChange={(e) => editListItem(field, idx, e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeListItem(field, idx)}
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

  return (
    <div className="space-y-6">
      {/* Persona Header Info */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User size={16} className="text-accent" />
            <span>Target Persona Context</span>
          </h4>
          {/* Variant Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setVariant('classic')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                variant === 'classic'
                  ? 'bg-accent text-black shadow'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Classic Empathy Map
            </button>
            <button
              type="button"
              onClick={() => setVariant('synthesis')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                variant === 'synthesis'
                  ? 'bg-accent text-black shadow'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Research Synthesis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Name</label>
            <input
              type="text"
              placeholder="Persona Name (e.g. Alex Rivera)"
              value={persona.name}
              onChange={(e) => updatePersona({ name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Role</label>
            <input
              type="text"
              placeholder="Role / Title"
              value={persona.role}
              onChange={(e) => updatePersona({ role: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Age</label>
            <input
              type="text"
              placeholder="Age (e.g. 32)"
              value={persona.age || ''}
              onChange={(e) => updatePersona({ age: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Location</label>
            <input
              type="text"
              placeholder="Location (e.g. San Francisco, CA)"
              value={persona.location || ''}
              onChange={(e) => updatePersona({ location: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Occupation</label>
            <input
              type="text"
              placeholder="Occupation"
              value={persona.occupation || ''}
              onChange={(e) => updatePersona({ occupation: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted uppercase block mb-1">Status</label>
            <input
              type="text"
              placeholder="Status (e.g. Tech Professional)"
              value={persona.status || ''}
              onChange={(e) => updatePersona({ status: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-muted uppercase block mb-1">
            Personality Traits (comma-separated)
          </label>
          <input
            type="text"
            placeholder="Calm, Thinker, Analytical, Creative"
            value={(persona.personalityTags || []).join(', ')}
            onChange={(e) =>
              updatePersona({
                personalityTags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <ImageUploader
          name="empathyPersonaImageUrl"
          value={persona.avatarUrl || (persona as any).imageUrl || ''}
          onChange={(url) => {
            updatePersona({ avatarUrl: url, imageUrl: url } as any);
          }}
          label="Persona Photo / Avatar"
          helperText="Upload an avatar image for this empathy map persona (JPG, PNG, WebP)."
          aspectRatio="aspect-square"
        />

        <div>
          <label className="text-[10px] font-mono text-muted uppercase block mb-1">Brief Story / Bio</label>
          <textarea
            rows={2}
            placeholder="Short Bio / Background context..."
            value={persona.bio || ''}
            onChange={(e) => updatePersona({ bio: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Quadrants Grid */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Heart size={16} className="text-accent" />
          <span>Empathy Map Quadrants ({variant === 'classic' ? 'Thinks / Feels / Says / Does' : 'Cognitive Friction / Environment / Expressed Needs / External Influences'})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variant === 'classic' ? (
            <>
              {renderBulletList('thinks', 'THINKS (Internal thoughts & beliefs)', 'What is the user thinking?')}
              {renderBulletList('feels', 'FEELS (Emotions & feelings)', 'What emotions drive them?')}
              {renderBulletList('says', 'SAYS (Quotes & public statements)', 'What do they communicate?')}
              {renderBulletList('does', 'DOES (Observed behaviors & actions)', 'What behaviors occur?')}
            </>
          ) : (
            <>
              {renderBulletList('cognitiveFriction', 'Cognitive Friction', 'Mental obstacles or confusion...')}
              {renderBulletList('environment', 'Environment & Context', 'Physical or digital surroundings...')}
              {renderBulletList('expressedNeeds', 'Expressed Needs', 'Stated expectations and requirements...')}
              {renderBulletList('externalInfluences', 'External Influences', 'Social, technical, or market factors...')}
            </>
          )}
        </div>
      </div>

      {/* Additional Synthesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderBulletList('painPoints', 'Pain Points', 'Friction point...')}
        {renderBulletList('goals', 'User Goals', 'Desired outcome...')}
      </div>
    </div>
  );
}
