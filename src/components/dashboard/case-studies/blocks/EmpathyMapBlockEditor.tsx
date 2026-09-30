'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { EmpathyMapEditor } from '../sections/EmpathyMapEditor';
import { DEFAULT_EMPATHY_MAP_DEMO } from '@/lib/data/case-study-demo-data';

interface EmpathyMapBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function EmpathyMapBlockEditor({ block, onChange }: EmpathyMapBlockEditorProps) {
  const empathyMap = block.empathyMapData || DEFAULT_EMPATHY_MAP_DEMO;

  return (
    <div className="space-y-4">
      <EmpathyMapEditor
        data={empathyMap}
        onChange={(newData) => {
          onChange({ empathyMapData: newData });
        }}
      />
    </div>
  );
}
