'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { RoleResponsibilitiesData, RoleResponsibilityItem } from '@/types/case-study-builder';
import { DEFAULT_ROLE_RESPONSIBILITIES_DEMO } from '@/lib/data/case-study-demo-data';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy } from 'lucide-react';

interface MyRoleBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function MyRoleBlockEditor({ block, onChange }: MyRoleBlockEditorProps) {
  const roleData: RoleResponsibilitiesData = block.roleData || DEFAULT_ROLE_RESPONSIBILITIES_DEMO;
  const items = roleData.items || [];

  const updateData = (newData: Partial<RoleResponsibilitiesData>) => {
    onChange({
      roleData: {
        ...roleData,
        ...newData,
      },
    });
  };

  const addItem = () => {
    const newItem: RoleResponsibilityItem = {
      id: `role-${Date.now().toString(36)}`,
      label: 'New Responsibility Tag',
    };
    updateData({ items: [...items, newItem] });
  };

  const updateItem = (index: number, label: string) => {
    const next = [...items];
    next[index] = { ...next[index], label };
    updateData({ items: next });
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const newItem = { ...target, id: `role-${Date.now().toString(36)}` };
    const next = [...items];
    next.splice(index + 1, 0, newItem);
    updateData({ items: next });
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateData({ items: next });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
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
            value={roleData.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="My Role & Responsibilities"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Short Description</label>
          <input
            type="text"
            value={roleData.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Summarize responsibilities and methods..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-300 focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Responsibilities Items */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            RESPONSIBILITIES ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="px-2.5 py-1 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/30 flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Add Responsibility</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder="Responsibility label..."
                className="flex-1 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                  title="Move Left"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                  title="Move Right"
                >
                  <ArrowDown size={12} />
                </button>
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
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
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
