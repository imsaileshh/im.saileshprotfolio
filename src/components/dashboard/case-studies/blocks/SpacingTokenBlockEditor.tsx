'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { SpacingTokenEditor } from '../sections/SpacingTokenEditor';
import { DEFAULT_SPACING_DEMO, DEFAULT_RADIUS_DEMO, DEFAULT_SHADOW_DEMO } from '@/lib/data/case-study-demo-data';

interface SpacingTokenBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function SpacingTokenBlockEditor({ block, onChange }: SpacingTokenBlockEditorProps) {
  const spacing = block.spacingTokensData || DEFAULT_SPACING_DEMO;
  const radius = block.radiusTokensData || DEFAULT_RADIUS_DEMO;
  const shadows = block.shadowTokensData || DEFAULT_SHADOW_DEMO;

  return (
    <div className="space-y-4">
      <SpacingTokenEditor
        spacing={spacing}
        radius={radius}
        shadows={shadows}
        onChange={(res) => {
          onChange({
            spacingTokensData: res.spacing,
            radiusTokensData: res.radius,
            shadowTokensData: res.shadows,
          });
        }}
      />
    </div>
  );
}
