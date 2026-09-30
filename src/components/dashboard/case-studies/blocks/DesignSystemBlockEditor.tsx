'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { DesignSystemEditor } from '../sections/DesignSystemEditor';
import { DEFAULT_DESIGN_SYSTEM_DEMO } from '@/lib/data/case-study-demo-data';

interface DesignSystemBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function DesignSystemBlockEditor({ block, onChange }: DesignSystemBlockEditorProps) {
  const designSystem = block.designSystemData || DEFAULT_DESIGN_SYSTEM_DEMO;

  return (
    <div className="space-y-4">
      <DesignSystemEditor
        data={designSystem}
        onChange={(newData) => {
          onChange({ designSystemData: newData });
        }}
      />
    </div>
  );
}
