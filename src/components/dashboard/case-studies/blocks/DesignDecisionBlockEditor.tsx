'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { DesignDecisionEditor } from '../sections/DesignDecisionEditor';
import { DEFAULT_DESIGN_DECISIONS_DEMO } from '@/lib/data/case-study-demo-data';

interface DesignDecisionBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function DesignDecisionBlockEditor({ block, onChange }: DesignDecisionBlockEditorProps) {
  const designDecisionData = block.designDecisionData || DEFAULT_DESIGN_DECISIONS_DEMO;

  return (
    <div className="space-y-4">
      <DesignDecisionEditor
        data={designDecisionData}
        onChange={(newData) => {
          onChange({ designDecisionData: newData });
        }}
      />
    </div>
  );
}
