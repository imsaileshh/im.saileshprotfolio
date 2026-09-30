'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { DesignProcessData, ProcessStepItem } from '@/types/case-study-builder';
import { DEFAULT_DESIGN_PROCESS_DEMO } from '@/lib/data/case-study-demo-data';

interface DesignProcessEditorProps {
  data?: DesignProcessData;
  onChange: (newData: DesignProcessData) => void;
}

export function DesignProcessEditor({
  data = DEFAULT_DESIGN_PROCESS_DEMO,
  onChange,
}: DesignProcessEditorProps) {
  const steps = data?.steps || [];

  const addStep = () => {
    const num = String(steps.length + 1).padStart(2, '0');
    const newStep: ProcessStepItem = {
      id: `step-${Date.now().toString(36)}`,
      number: num,
      title: 'New Process Phase',
      description: 'Phase overview description details...',
    };
    onChange({ ...data, steps: [...steps, newStep] });
  };

  const updateStep = (id: string, updated: Partial<ProcessStepItem>) => {
    const nextSteps = steps.map((s) => (s.id === id ? { ...s, ...updated } : s));
    onChange({ ...data, steps: nextSteps });
  };

  const removeStep = (id: string) => {
    const nextSteps = steps.filter((s) => s.id !== id);
    onChange({ ...data, steps: nextSteps });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 size={16} className="text-accent" />
              <span>Design Process Workflow ({steps.length} Steps)</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Chronological design process phases or retrospective takeaways.</p>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((st) => (
            <div key={st.id} className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={st.number}
                  onChange={(e) => updateStep(st.id, { number: e.target.value })}
                  className="w-12 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs font-mono font-bold text-accent text-center focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phase Title"
                  value={st.title}
                  onChange={(e) => updateStep(st.id, { title: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-foreground focus:border-accent focus:outline-none flex-1"
                />
              </div>

              <input
                type="text"
                placeholder="Description of activities..."
                value={st.description}
                onChange={(e) => updateStep(st.id, { description: e.target.value })}
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-1 text-xs text-muted focus:border-accent focus:outline-none flex-1 w-full"
              />

              <button
                type="button"
                onClick={() => removeStep(st.id)}
                className="p-1.5 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
