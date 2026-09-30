'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { InformationArchitectureEditor } from '../sections/InformationArchitectureEditor';
import { DEFAULT_IA_DEMO } from '@/lib/data/case-study-demo-data';

interface InformationArchitectureBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function InformationArchitectureBlockEditor({ block, onChange }: InformationArchitectureBlockEditorProps) {
  const iaData = block.iaData || DEFAULT_IA_DEMO;

  return (
    <div className="space-y-4">
      <InformationArchitectureEditor
        data={iaData}
        onChange={(newData) => {
          onChange({ iaData: newData });
        }}
      />
    </div>
  );
}
