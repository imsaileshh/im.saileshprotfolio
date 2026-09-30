'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { HelpCircle, Sparkles } from 'lucide-react';

export interface ProblemStatementData {
  title?: string;
  problem: string;
  context?: string;
  userImpact?: string;
  businessImpact?: string;
  opportunity?: string;
  howMightWe?: string;
}

export const DEFAULT_PROBLEM_STATEMENT_DEMO: ProblemStatementData = {
  title: 'B2C Marketplace Cart Abandonment',
  problem: '38% of mobile buyers abandon their cart during multi-step registration forms due to context switching and slow page reloads.',
  context: 'Legacy checkout required buyers to navigate through 4 separate wizard pages on mobile browsers.',
  userImpact: 'Cognitive fatigue, lost order confidence, and friction on low-bandwidth mobile connections.',
  businessImpact: '$450,000 estimated quarterly revenue loss from drop-offs.',
  opportunity: 'Engineered an inline biometric guest checkout slide-over drawer.',
  howMightWe: 'How might we allow users to complete an order in under 30 seconds without forcing account creation upfront?',
};

interface ProblemStatementBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function ProblemStatementBlockEditor({ block, onChange }: ProblemStatementBlockEditorProps) {
  const data: ProblemStatementData = block.problemStatementData || DEFAULT_PROBLEM_STATEMENT_DEMO;

  const updateField = (field: keyof ProblemStatementData, value: string) => {
    onChange({ problemStatementData: { ...data, [field]: value } });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#121418] p-5">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle size={16} className="text-[#4F8CFF]" />
        <h4 className="text-sm font-semibold text-foreground">Problem Statement & Opportunity</h4>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Problem Title (e.g. Cart Abandonment Rate)"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground font-semibold focus:outline-none"
        />

        <textarea
          rows={3}
          placeholder="Core Problem Statement (large focus statement)..."
          value={data.problem}
          onChange={(e) => updateField('problem', e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-foreground focus:outline-none leading-relaxed resize-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">User Impact</label>
            <textarea
              rows={2}
              value={data.userImpact || ''}
              onChange={(e) => updateField('userImpact', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-foreground focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase text-muted block mb-1">Business Impact</label>
            <textarea
              rows={2}
              value={data.businessImpact || ''}
              onChange={(e) => updateField('businessImpact', e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-foreground focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#4F8CFF]/10 border border-[#4F8CFF]/20">
          <Sparkles size={16} className="text-[#4F8CFF] shrink-0" />
          <input
            type="text"
            placeholder="How Might We... (HMW statement highlight)"
            value={data.howMightWe || ''}
            onChange={(e) => updateField('howMightWe', e.target.value)}
            className="flex-1 border-none bg-transparent text-xs font-semibold text-[#4F8CFF] focus:outline-none placeholder:text-[#4F8CFF]/50"
          />
        </div>
      </div>
    </div>
  );
}
