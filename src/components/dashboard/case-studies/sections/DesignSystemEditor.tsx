'use client';

import { useState } from 'react';
import { Layers, Palette, Type, Maximize, Box, Eye } from 'lucide-react';
import { DesignSystemData } from '@/types/case-study-builder';
import { DEFAULT_DESIGN_SYSTEM_DEMO } from '@/lib/data/case-study-demo-data';
import { ColorTokenEditor } from './ColorTokenEditor';
import { TypographyTokenEditor } from './TypographyTokenEditor';
import { SpacingTokenEditor } from './SpacingTokenEditor';
import { ComponentLibraryEditor } from './ComponentLibraryEditor';

interface DesignSystemEditorProps {
  data?: DesignSystemData;
  onChange: (newData: DesignSystemData) => void;
}

export function DesignSystemEditor({
  data = DEFAULT_DESIGN_SYSTEM_DEMO,
  onChange,
}: DesignSystemEditorProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');

  const updateColors = (res: { colorGroups: any[]; semanticTokens: any[] }) => {
    onChange({ ...data, colorGroups: res.colorGroups, semanticTokens: res.semanticTokens });
  };

  const updateTypography = (typo: any[]) => {
    onChange({ ...data, typography: typo });
  };

  const updateSpacingSuite = (res: { spacing: any[]; radius: any[]; shadows: any[] }) => {
    onChange({ ...data, spacing: res.spacing, radius: res.radius, shadows: res.shadows });
  };

  const updateComponents = (comps: any[]) => {
    onChange({ ...data, components: comps });
  };

  return (
    <div className="space-y-6">
      {/* Design System Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'colors'
              ? 'bg-accent text-black shadow'
              : 'bg-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Palette size={14} />
          <span>Color Tokens ({data.colorGroups?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'typography'
              ? 'bg-accent text-black shadow'
              : 'bg-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Type size={14} />
          <span>Typography ({data.typography?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spacing')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'spacing'
              ? 'bg-accent text-black shadow'
              : 'bg-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Maximize size={14} />
          <span>Spacing, Radius & Shadows</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'components'
              ? 'bg-accent text-black shadow'
              : 'bg-white/5 text-muted hover:text-foreground'
          }`}
        >
          <Box size={14} />
          <span>Components ({data.components?.length || 0})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'colors' && (
        <ColorTokenEditor
          colorGroups={data.colorGroups}
          semanticTokens={data.semanticTokens}
          onChange={updateColors}
        />
      )}

      {activeTab === 'typography' && (
        <TypographyTokenEditor
          typography={data.typography}
          onChange={updateTypography}
        />
      )}

      {activeTab === 'spacing' && (
        <SpacingTokenEditor
          spacing={data.spacing}
          radius={data.radius}
          shadows={data.shadows}
          onChange={updateSpacingSuite}
        />
      )}

      {activeTab === 'components' && (
        <ComponentLibraryEditor
          components={data.components}
          onChange={updateComponents}
        />
      )}
    </div>
  );
}
