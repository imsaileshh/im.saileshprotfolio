'use client';

import { useState } from 'react';
import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { DesignThinkingProcessData, DesignThinkingStep } from '@/types/case-study-builder';
import { DEFAULT_DESIGN_THINKING_PROCESS_DEMO } from '@/lib/data/case-study-demo-data';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, ChevronDown, ChevronRight } from 'lucide-react';

interface DesignThinkingProcessEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function DesignThinkingProcessEditor({ block, onChange }: DesignThinkingProcessEditorProps) {
  const processData: DesignThinkingProcessData =
    block.processData || DEFAULT_DESIGN_THINKING_PROCESS_DEMO;
  const steps = processData.steps || [];

  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateData = (newData: Partial<DesignThinkingProcessData>) => {
    onChange({
      processData: {
        ...processData,
        ...newData,
      },
    });
  };

  const addStep = () => {
    const nextNum = (steps.length + 1).toString().padStart(2, '0');
    const newStep: DesignThinkingStep = {
      id: `step-${Date.now().toString(36)}`,
      number: nextNum,
      title: 'New Process Step',
      items: ['Activity insight...'],
    };
    updateData({ steps: [...steps, newStep] });
  };

  const updateStep = (index: number, updates: Partial<DesignThinkingStep>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...updates };
    updateData({ steps: next });
  };

  const duplicateStep = (index: number) => {
    const target = steps[index];
    const newStep = { ...target, id: `step-${Date.now().toString(36)}` };
    const next = [...steps];
    next.splice(index + 1, 0, newStep);
    updateData({ steps: next });
  };

  const removeStep = (index: number) => {
    const next = steps.filter((_, i) => i !== index);
    updateData({ steps: next });
  };

  const moveStep = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const next = [...steps];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateData({ steps: next });
  };

  const addActivity = (stepIndex: number) => {
    const currentStep = steps[stepIndex];
    const updatedItems = [...(currentStep.items || []), 'New activity...'];
    updateStep(stepIndex, { items: updatedItems });
  };

  const updateActivity = (stepIndex: number, actIndex: number, value: string) => {
    const currentStep = steps[stepIndex];
    const updatedItems = [...(currentStep.items || [])];
    updatedItems[actIndex] = value;
    updateStep(stepIndex, { items: updatedItems });
  };

  const removeActivity = (stepIndex: number, actIndex: number) => {
    const currentStep = steps[stepIndex];
    const updatedItems = currentStep.items.filter((_, i) => i !== actIndex);
    updateStep(stepIndex, { items: updatedItems });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#121418] p-5">
      {/* Title & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Section Title</label>
          <input
            type="text"
            value={processData.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Design Thinking Process"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Short Description</label>
          <input
            type="text"
            value={processData.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe UX methodology from research to testing..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-300 focus:border-[#4F8CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Steps Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            PROCESS STEPS ({steps.length})
          </label>
          <button
            type="button"
            onClick={addStep}
            className="px-2.5 py-1 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] text-xs font-semibold hover:bg-[#4F8CFF]/30 flex items-center gap-1 transition-all"
          >
            <Plus size={13} />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isCollapsed = expandedSteps[step.id];

            return (
              <div key={step.id || idx} className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {isCollapsed ? <ChevronRight size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                    <span className="font-mono text-xs font-bold text-[#4F8CFF] bg-[#4F8CFF]/15 px-2 py-0.5 rounded">
                      STEP {step.number || `0${idx + 1}`}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{step.title}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 'left')}
                      disabled={idx === 0}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 'right')}
                      disabled={idx === steps.length - 1}
                      className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateStep(idx)}
                      className="p-1 text-zinc-500 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-500 block mb-1">Number</label>
                        <input
                          type="text"
                          value={step.number}
                          onChange={(e) => updateStep(idx, { number: e.target.value })}
                          className="w-full rounded border border-white/10 bg-black/60 px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] font-mono text-zinc-500 block mb-1">Step Title</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(idx, { title: e.target.value })}
                          placeholder="e.g. Empathize"
                          className="w-full rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Activities List */}
                    <div className="space-y-2 pl-2 border-l border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Activities</span>
                        <button
                          type="button"
                          onClick={() => addActivity(idx)}
                          className="text-[10px] font-mono text-[#4F8CFF] hover:underline flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Add Activity</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(step.items || []).map((act, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={act}
                              onChange={(e) => updateActivity(idx, aIdx, e.target.value)}
                              placeholder="Activity name..."
                              className="flex-1 rounded border border-white/10 bg-black/50 px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeActivity(idx, aIdx)}
                              className="p-1 text-zinc-500 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
