'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { ColorTokenEditor } from '../sections/ColorTokenEditor';
import { DEFAULT_COLOR_GROUPS_DEMO, DEFAULT_SEMANTIC_TOKENS_DEMO } from '@/lib/data/case-study-demo-data';

interface ColorTokenBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function ColorTokenBlockEditor({ block, onChange }: ColorTokenBlockEditorProps) {
  const colorGroups = block.colorTokensData?.colorGroups || DEFAULT_COLOR_GROUPS_DEMO;
  const semanticTokens = block.colorTokensData?.semanticTokens || DEFAULT_SEMANTIC_TOKENS_DEMO;

  return (
    <div className="space-y-4">
      <ColorTokenEditor
        colorGroups={colorGroups}
        semanticTokens={semanticTokens}
        onChange={(res) => {
          onChange({ colorTokensData: res });
        }}
      />
    </div>
  );
}
