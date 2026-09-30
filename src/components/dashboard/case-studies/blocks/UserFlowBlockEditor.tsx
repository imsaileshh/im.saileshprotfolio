'use client';

import { ContentBlockItem } from '@/components/case-study/CustomBlockRenderer';
import { UserFlowEditor } from '../sections/UserFlowEditor';
import { DEFAULT_USER_FLOW_DEMO } from '@/lib/data/case-study-demo-data';

interface UserFlowBlockEditorProps {
  block: ContentBlockItem;
  onChange: (updates: Partial<ContentBlockItem>) => void;
}

export function UserFlowBlockEditor({ block, onChange }: UserFlowBlockEditorProps) {
  const userFlow = block.userFlowData || DEFAULT_USER_FLOW_DEMO;

  return (
    <div className="space-y-4">
      <UserFlowEditor
        data={userFlow}
        onChange={(newFlowData) => {
          onChange({ userFlowData: newFlowData });
        }}
      />
    </div>
  );
}
