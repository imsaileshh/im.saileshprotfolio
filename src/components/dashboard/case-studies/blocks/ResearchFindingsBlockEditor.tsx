'use client';

import { useState } from 'react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { Plus, Trash2, SearchCode, MoveUp, MoveDown } from 'lucide-react';

export interface ResearchFindingItem {
  id: string;
  number?: string;
  title: string;
  description: string;
  evidence?: string;
  impact?: string;
}

export const DEFAULT_RESEARCH_FINDINGS_DEMO: ResearchFindingItem[] = [
  {
    id: 'f1',
    number: '01',
    title: 'Users compare across multiple sellers before checkout',
    description: 'Buyers frequently open 3+ competing merchant tabs to verify price consistency and shipping promises.',
    evidence: '12 out of 15 interviewed users engaged in multi-tab comparison browsing behavior.',
    impact: 'Implement a unified price transparency badge & live delivery tracker on product pages.',
  },
  {
    id: 'f2',
    number: '02',
    title: 'Mobile checkout drop-off occurs at mandatory registration',
    description: 'Requiring account creation before payment introduces severe friction on smartphone screens.',
    evidence: 'Analytics tearing down cart funnel showed 38% exit rate at the guest vs signup step.',
    impact: 'Architect a 1-click biometric express guest checkout drawer.',
  },
];

interface ResearchFindingsBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function ResearchFindingsBlockEditor({ block, onChange }: ResearchFindingsBlockEditorProps) {
  const items: ResearchFindingItem[] = block.researchFindings || DEFAULT_RESEARCH_FINDINGS_DEMO;

  const addFinding = () => {
    const newFinding: ResearchFindingItem = {
      id: `find-${Date.now().toString(36)}`,
      number: String(items.length + 1).padStart(2, '0'),
      title: 'New Research Finding',
      description: 'Describe qualitative research insight...',
      evidence: 'Observed user behavior evidence...',
      impact: 'Product design impact outcome...',
    };
    onChange({ researchFindings: [...items, newFinding] });
  };

  const updateFinding = (id: string, updated: Partial<ResearchFindingItem>) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...updated } : it));
    onChange({ researchFindings: next });
  };

  const removeFinding = (id: string) => {
    onChange({ researchFindings: items.filter((it) => it.id !== id) });
  };

  const moveFinding = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    onChange({ researchFindings: next });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#121418] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <SearchCode size={16} className="text-[#4F8CFF]" />
            <span>Research Findings & Insights ({items.length})</span>
          </h4>
          <p className="text-xs text-muted mt-0.5">Document qualitative user findings, observed evidence, & product impact.</p>
        </div>
        <button
          type="button"
          onClick={addFinding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F8CFF]/15 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/25 transition-all"
        >
          <Plus size={14} />
          <span>Add Finding</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((it, idx) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={it.number || String(idx + 1).padStart(2, '0')}
                  onChange={(e) => updateFinding(it.id, { number: e.target.value })}
                  className="w-12 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono font-bold text-[#4F8CFF] text-center focus:outline-none"
                />
                <input
                  type="text"
                  value={it.title}
                  onChange={(e) => updateFinding(it.id, { title: e.target.value })}
                  className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:outline-none"
                  placeholder="Finding Title"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveFinding(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                >
                  <MoveUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => moveFinding(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1 text-muted hover:text-foreground disabled:opacity-30"
                >
                  <MoveDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeFinding(it.id)}
                  className="p-1 text-muted hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="Description..."
              value={it.description}
              onChange={(e) => updateFinding(it.id, { description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:outline-none resize-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Observed Evidence</label>
                <textarea
                  rows={2}
                  value={it.evidence || ''}
                  onChange={(e) => updateFinding(it.id, { evidence: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/60 p-2 text-xs text-foreground focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">Product Design Impact</label>
                <textarea
                  rows={2}
                  value={it.impact || ''}
                  onChange={(e) => updateFinding(it.id, { impact: e.target.value })}
                  className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-foreground focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
