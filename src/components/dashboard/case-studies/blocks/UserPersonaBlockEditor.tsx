'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { PersonaEditor } from '../sections/PersonaEditor';
import { DEFAULT_PERSONA_DEMO } from '@/lib/data/case-study-demo-data';

interface UserPersonaBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function UserPersonaBlockEditor({ block, onChange }: UserPersonaBlockEditorProps) {
  const persona = block.userPersonaData || DEFAULT_PERSONA_DEMO;

  return (
    <div className="space-y-4">
      <PersonaEditor
        data={persona}
        onChange={(newData) => {
          onChange({ userPersonaData: newData });
        }}
      />
    </div>
  );
}
