'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { TypographyTokenEditor } from '../sections/TypographyTokenEditor';
import { DEFAULT_TYPOGRAPHY_DEMO } from '@/lib/data/case-study-demo-data';

interface TypographyTokenBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function TypographyTokenBlockEditor({ block, onChange }: TypographyTokenBlockEditorProps) {
  const typography = block.typographyTokensData || DEFAULT_TYPOGRAPHY_DEMO;

  return (
    <div className="space-y-4">
      <TypographyTokenEditor
        typography={typography}
        onChange={(next) => {
          onChange({ typographyTokensData: next });
        }}
      />
    </div>
  );
}
