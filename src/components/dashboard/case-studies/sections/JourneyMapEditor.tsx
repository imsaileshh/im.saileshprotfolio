'use client';

import { useState } from 'react';
import { Plus, Trash2, Map, Smile, Frown, Meh } from 'lucide-react';
import { JourneyMapData, JourneyStage, JourneyEmotion } from '@/types/case-study-builder';
import { DEFAULT_JOURNEY_MAP_DEMO } from '@/lib/data/case-study-demo-data';

interface JourneyMapEditorProps {
  data?: JourneyMapData;
  onChange: (newData: JourneyMapData) => void;
}

export function JourneyMapEditor({ data = DEFAULT_JOURNEY_MAP_DEMO, onChange }: JourneyMapEditorProps) {
  const stages = data?.stages || [];

  const updateHeader = (key: 'journeyName' | 'personaName', val: string) => {
    onChange({ ...data, [key]: val });
  };

  const addStage = () => {
    const newStage: JourneyStage = {
      id: `stg-${Date.now().toString(36)}`,
      name: 'New Stage',
      actions: ['User action...'],
      thoughts: ['User thought...'],
      painPoints: ['Pain point...'],
      emotion: 'neutral',
      opportunity: 'Design opportunity...',
    };
    onChange({ ...data, stages: [...stages, newStage] });
  };

  const updateStage = (id: string, updated: Partial<JourneyStage>) => {
    const nextStages = stages.map((stg) => (stg.id === id ? { ...stg, ...updated } : stg));
    onChange({ ...data, stages: nextStages });
  };

  const removeStage = (id: string) => {
    const nextStages = stages.filter((stg) => stg.id !== id);
    onChange({ ...data, stages: nextStages });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Map size={16} className="text-accent" />
          <span>Customer Journey Overview</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Journey Title (e.g. End-to-End E-Commerce Journey)"
            value={data.journeyName}
            onChange={(e) => updateHeader('journeyName', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="Target Persona (e.g. Elena Rostova)"
            value={data.personaName}
            onChange={(e) => updateHeader('personaName', e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Stages Matrix Editor */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Journey Stages ({stages.length})</span>
          </h4>
          <button
            type="button"
            onClick={addStage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Stage</span>
          </button>
        </div>

        <div className="space-y-4">
          {stages.map((stg, index) => (
            <div key={stg.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-xs font-semibold text-accent">0{index + 1}</span>
                  <input
                    type="text"
                    value={stg.name}
                    onChange={(e) => updateStage(stg.id, { name: e.target.value })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none flex-1 max-w-xs"
                    placeholder="Stage Name (e.g. Discovery)"
                  />
                  <select
                    value={stg.emotion}
                    onChange={(e) => updateStage(stg.id, { emotion: e.target.value as JourneyEmotion })}
                    className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="very-negative">Very Negative 😭</option>
                    <option value="negative">Negative 🙁</option>
                    <option value="neutral">Neutral 😐</option>
                    <option value="positive">Positive 🙂</option>
                    <option value="very-positive">Very Positive 🚀</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeStage(stg.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Actions (comma-separated)</label>
                  <input
                    type="text"
                    value={stg.actions.join(', ')}
                    onChange={(e) => updateStage(stg.id, { actions: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Thoughts (comma-separated)</label>
                  <input
                    type="text"
                    value={stg.thoughts.join(', ')}
                    onChange={(e) => updateStage(stg.id, { thoughts: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Pain Points (comma-separated)</label>
                  <input
                    type="text"
                    value={stg.painPoints.join(', ')}
                    onChange={(e) => updateStage(stg.id, { painPoints: e.target.value.split(',').map((s) => s.trim()) })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">Design Opportunity</label>
                  <input
                    type="text"
                    value={stg.opportunity}
                    onChange={(e) => updateStage(stg.id, { opportunity: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
