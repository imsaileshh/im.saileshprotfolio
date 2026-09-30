'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { ComponentLibraryEditor } from '../sections/ComponentLibraryEditor';
import { DEFAULT_COMPONENTS_DEMO } from '@/lib/data/case-study-demo-data';

interface ComponentShowcaseBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function ComponentShowcaseBlockEditor({ block, onChange }: ComponentShowcaseBlockEditorProps) {
  const components = block.componentShowcaseData || DEFAULT_COMPONENTS_DEMO;

  return (
    <div className="space-y-4">
      <ComponentLibraryEditor
        components={components}
        onChange={(next) => {
          onChange({ componentShowcaseData: next });
        }}
      />
    </div>
  );
}
