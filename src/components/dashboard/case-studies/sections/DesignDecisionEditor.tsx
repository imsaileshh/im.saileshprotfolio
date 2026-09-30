'use client';

import { useState } from 'react';
import { Plus, Trash2, Sparkles, TrendingUp } from 'lucide-react';
import { DesignDecisionData, DesignDecisionItem } from '@/types/case-study-builder';
import { DEFAULT_DESIGN_DECISIONS_DEMO } from '@/lib/data/case-study-demo-data';

interface DesignDecisionEditorProps {
  data?: DesignDecisionData;
  onChange: (newData: DesignDecisionData) => void;
}

export function DesignDecisionEditor({
  data = DEFAULT_DESIGN_DECISIONS_DEMO,
  onChange,
}: DesignDecisionEditorProps) {
  const decisions = data?.decisions || [];

  const addDecision = () => {
    const num = String(decisions.length + 1).padStart(2, '0');
    const newDec: DesignDecisionItem = {
      id: `dec-${Date.now().toString(36)}`,
      number: num,
      category: 'UX ARCHITECTURE',
      title: 'Design Decision Title',
      problem: 'State the core problem and user friction...',
      alternativeConsidered: 'What alternative direction was considered?',
      whyAlternativeRejected: 'Why was that alternative rejected?',
      chosenSolution: 'Explain the chosen design solution...',
      tradeOff: 'What trade-offs were accepted?',
      resultMetric: '+15% Metric Improvement',
    };
    onChange({ ...data, decisions: [...decisions, newDec] });
  };

  const updateDecision = (id: string, updated: Partial<DesignDecisionItem>) => {
    const nextDecs = decisions.map((d) => (d.id === id ? { ...d, ...updated } : d));
    onChange({ ...data, decisions: nextDecs });
  };

  const removeDecision = (id: string) => {
    const nextDecs = decisions.filter((d) => d.id !== id);
    onChange({ ...data, decisions: nextDecs });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <span>Design Decisions & Problems Solved ({decisions.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Highlight high-impact product tradeoffs, alternatives, and quantitative metrics.</p>
          </div>
          <button
            type="button"
            onClick={addDecision}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Decision</span>
          </button>
        </div>

        <div className="space-y-6">
          {decisions.map((dec, index) => (
            <div key={dec.id} className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-4 relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={dec.number}
                    onChange={(e) => updateDecision(dec.id, { number: e.target.value })}
                    className="w-12 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono font-bold text-accent text-center focus:border-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    value={dec.category || ''}
                    onChange={(e) => updateDecision(dec.id, { category: e.target.value.toUpperCase() })}
                    className="w-44 rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted focus:border-accent focus:outline-none"
                    placeholder="CATEGORY"
                  />
                  <input
                    type="text"
                    value={dec.title}
                    onChange={(e) => updateDecision(dec.id, { title: e.target.value })}
                    className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
                    placeholder="Decision Title"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDecision(dec.id)}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Metric Banner */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/10 border border-accent/20">
                <TrendingUp size={14} className="text-accent" />
                <input
                  type="text"
                  value={dec.resultMetric || ''}
                  onChange={(e) => updateDecision(dec.id, { resultMetric: e.target.value })}
                  className="flex-1 border-none bg-transparent text-xs font-mono font-bold text-accent focus:outline-none placeholder:text-accent/50"
                  placeholder="Metric Result (e.g. +24% Checkout Completion)"
                />
              </div>

              {/* Grid of decision details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">01. Problem</label>
                  <textarea
                    rows={3}
                    value={dec.problem}
                    onChange={(e) => updateDecision(dec.id, { problem: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">02. Chosen Solution</label>
                  <textarea
                    rows={3}
                    value={dec.chosenSolution}
                    onChange={(e) => updateDecision(dec.id, { chosenSolution: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">03. Alternative Considered</label>
                  <textarea
                    rows={2}
                    value={dec.alternativeConsidered}
                    onChange={(e) => updateDecision(dec.id, { alternativeConsidered: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">04. Trade-off Accepted</label>
                  <textarea
                    rows={2}
                    value={dec.tradeOff}
                    onChange={(e) => updateDecision(dec.id, { tradeOff: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none resize-none"
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
