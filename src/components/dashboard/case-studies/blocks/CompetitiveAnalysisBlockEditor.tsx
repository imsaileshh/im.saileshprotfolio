'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { CompetitiveAnalysisEditor } from '../sections/CompetitiveAnalysisEditor';
import { DEFAULT_COMPETITIVE_ANALYSIS_DEMO } from '@/lib/data/case-study-demo-data';

interface CompetitiveAnalysisBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function CompetitiveAnalysisBlockEditor({ block, onChange }: CompetitiveAnalysisBlockEditorProps) {
  const analysis = block.competitiveAnalysisData || DEFAULT_COMPETITIVE_ANALYSIS_DEMO;

  return (
    <div className="space-y-4">
      <CompetitiveAnalysisEditor
        data={analysis}
        onChange={(newData) => {
          onChange({ competitiveAnalysisData: newData });
        }}
      />
    </div>
  );
}
