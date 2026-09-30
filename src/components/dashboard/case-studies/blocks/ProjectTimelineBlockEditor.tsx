'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { ProjectTimelineData, TimelinePhase, TimelineItem } from '@/types/case-study-builder';
import { DEFAULT_PROJECT_TIMELINE_DEMO } from '@/lib/data/case-study-demo-data';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy } from 'lucide-react';

interface ProjectTimelineBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function ProjectTimelineBlockEditor({ block, onChange }: ProjectTimelineBlockEditorProps) {
  const timelineData: ProjectTimelineData =
    block.timelineData || DEFAULT_PROJECT_TIMELINE_DEMO;

  const phases = timelineData.phases || [];
  const items = timelineData.items || [];

  const updateData = (newData: Partial<ProjectTimelineData>) => {
    onChange({
      timelineData: {
        ...timelineData,
        ...newData,
      },
    });
  };

  // Phase Actions
  const addPhase = () => {
    const newPhase: TimelinePhase = {
      id: `phase-${Date.now().toString(36)}`,
      title: 'New Phase',
      start: 1,
      end: 4,
    };
    updateData({ phases: [...phases, newPhase] });
  };

  const updatePhase = (index: number, updates: Partial<TimelinePhase>) => {
    const next = [...phases];
    next[index] = { ...next[index], ...updates };
    updateData({ phases: next });
  };

  const removePhase = (index: number) => {
    const next = phases.filter((_, i) => i !== index);
    updateData({ phases: next });
  };

  // Item Actions
  const addItem = () => {
    const newItem: TimelineItem = {
      id: `item-${Date.now().toString(36)}`,
      title: 'New Activity Item',
      start: 1,
      end: 2,
      phaseId: phases[0]?.id,
    };
    updateData({ items: [...items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<TimelineItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    updateData({ items: next });
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const newItem = { ...target, id: `item-${Date.now().toString(36)}` };
    const next = [...items];
    next.splice(index + 1, 0, newItem);
    updateData({ items: next });
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateData({ items: next });
  };

  return (
    <div className="space-y-5 rounded-xl border border-white/10 bg-[#121418] p-5">
      {/* Basic Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Timeline Title</label>
          <input
            type="text"
            value={timelineData.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Project Timeline & Execution Roadmap"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Unit Label</label>
          <input
            type="text"
            value={timelineData.unitLabel || 'Week'}
            onChange={(e) => updateData({ unitLabel: e.target.value })}
            placeholder="Week / Sprint / Month"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="w-48">
        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Total Units ({timelineData.unitLabel || 'Week'}s)</label>
        <input
          type="number"
          min={1}
          max={52}
          value={timelineData.totalUnits || 12}
          onChange={(e) => updateData({ totalUnits: parseInt(e.target.value) || 12 })}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
        />
      </div>

      {/* Phases Management */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            TIMELINE PHASES ({phases.length})
          </label>
          <button
            type="button"
            onClick={addPhase}
            className="px-2.5 py-1 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/30 flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Add Phase</span>
          </button>
        </div>

        <div className="space-y-2">
          {phases.map((phase, idx) => (
            <div key={phase.id || idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/10 items-center">
              <input
                type="text"
                value={phase.title}
                onChange={(e) => updatePhase(idx, { title: e.target.value })}
                placeholder="Phase Title (e.g. UX Design)"
                className="sm:col-span-3 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white focus:outline-none"
              />
              <div className="flex items-center gap-1 sm:col-span-2">
                <span className="text-[10px] font-mono text-zinc-500">Start:</span>
                <input
                  type="number"
                  min={1}
                  max={timelineData.totalUnits}
                  value={phase.start}
                  onChange={(e) => updatePhase(idx, { start: parseInt(e.target.value) || 1 })}
                  className="w-14 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-white text-center"
                />
                <span className="text-[10px] font-mono text-zinc-500">End:</span>
                <input
                  type="number"
                  min={1}
                  max={timelineData.totalUnits}
                  value={phase.end}
                  onChange={(e) => updatePhase(idx, { end: parseInt(e.target.value) || 1 })}
                  className="w-14 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-white text-center"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removePhase(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Items Management */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            TIMELINE ITEMS / ACTIVITIES ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="px-2.5 py-1 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/30 flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/10 items-center">
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(idx, { title: e.target.value })}
                placeholder="Activity Title..."
                className="sm:col-span-5 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white focus:outline-none"
              />

              <select
                value={item.phaseId || ''}
                onChange={(e) => updateItem(idx, { phaseId: e.target.value })}
                className="sm:col-span-3 rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="">No Phase</option>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              <div className="sm:col-span-3 flex items-center gap-1">
                <span className="text-[10px] font-mono text-zinc-500">U:</span>
                <input
                  type="number"
                  min={1}
                  max={timelineData.totalUnits}
                  value={item.start}
                  onChange={(e) => updateItem(idx, { start: parseInt(e.target.value) || 1 })}
                  className="w-12 rounded border border-white/10 bg-black/60 px-1.5 py-1 text-xs text-white text-center"
                />
                <span className="text-[10px] text-zinc-500">-</span>
                <input
                  type="number"
                  min={1}
                  max={timelineData.totalUnits}
                  value={item.end}
                  onChange={(e) => updateItem(idx, { end: parseInt(e.target.value) || 1 })}
                  className="w-12 rounded border border-white/10 bg-black/60 px-1.5 py-1 text-xs text-white text-center"
                />
              </div>

              <div className="sm:col-span-1 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => duplicateItem(idx)}
                  className="p-1 text-zinc-500 hover:text-white"
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
