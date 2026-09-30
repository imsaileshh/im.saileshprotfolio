'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { JourneyMapEditor } from '../sections/JourneyMapEditor';
import { DEFAULT_JOURNEY_MAP_DEMO } from '@/lib/data/case-study-demo-data';

interface JourneyMapBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function JourneyMapBlockEditor({ block, onChange }: JourneyMapBlockEditorProps) {
  const journeyMap = block.journeyMapData || DEFAULT_JOURNEY_MAP_DEMO;

  return (
    <div className="space-y-4">
      <JourneyMapEditor
        data={journeyMap}
        onChange={(newData) => {
          onChange({ journeyMapData: newData });
        }}
      />
    </div>
  );
}
