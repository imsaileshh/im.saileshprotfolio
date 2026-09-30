'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { DesignProcessEditor } from '../sections/DesignProcessEditor';
import { DEFAULT_DESIGN_PROCESS_DEMO } from '@/lib/data/case-study-demo-data';

interface DesignProcessBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function DesignProcessBlockEditor({ block, onChange }: DesignProcessBlockEditorProps) {
  const processData = block.designProcessData || DEFAULT_DESIGN_PROCESS_DEMO;

  return (
    <div className="space-y-4">
      <DesignProcessEditor
        data={processData}
        onChange={(newData) => {
          onChange({ designProcessData: newData });
        }}
      />
    </div>
  );
}
