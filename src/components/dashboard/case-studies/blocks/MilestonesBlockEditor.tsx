'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { MilestonesData, MilestoneItem } from '@/types/case-study-builder';
import { DEFAULT_MILESTONES_DEMO } from '@/lib/data/case-study-demo-data';
import { Plus, Trash2, Copy } from 'lucide-react';

interface MilestonesBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function MilestonesBlockEditor({ block, onChange }: MilestonesBlockEditorProps) {
  const milestonesData: MilestonesData = block.milestonesData || DEFAULT_MILESTONES_DEMO;
  const items = milestonesData.items || [];

  const updateData = (newData: Partial<MilestonesData>) => {
    onChange({
      milestonesData: {
        ...milestonesData,
        ...newData,
      },
    });
  };

  const addItem = () => {
    const newItem: MilestoneItem = {
      id: `milestone-${Date.now().toString(36)}`,
      date: 'Week 4',
      title: 'New Milestone Checkpoint',
      description: 'Milestone description...',
    };
    updateData({ items: [...items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<MilestoneItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...updates };
    updateData({ items: next });
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const newItem = { ...target, id: `milestone-${Date.now().toString(36)}` };
    const next = [...items];
    next.splice(index + 1, 0, newItem);
    updateData({ items: next });
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateData({ items: next });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#121418] p-5">
      {/* Title & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Section Title</label>
          <input
            type="text"
            value={milestonesData.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Key Milestones"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Short Description</label>
          <input
            type="text"
            value={milestonesData.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Highlight delivery checkpoints..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-300 focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            MILESTONES ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="px-2.5 py-1 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/30 flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => updateItem(idx, { date: e.target.value })}
                  placeholder="Week 3 / Oct 15"
                  className="w-28 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-[#4F8CFF] font-mono font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="Milestone title..."
                  className="flex-1 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => duplicateItem(idx)}
                  className="p-1 text-zinc-500 hover:text-white"
                  title="Duplicate"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                placeholder="Optional description / details..."
                className="w-full rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-zinc-400 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
