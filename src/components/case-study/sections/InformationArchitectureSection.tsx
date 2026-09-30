'use client';

import { InformationArchitectureData } from '@/types/case-study-builder';
import { IAFlowCanvas } from './IAFlowCanvas';
import { IAMobileTree } from './IAMobileTree';

interface InformationArchitectureSectionProps {
  iaData?: InformationArchitectureData;
}

export function InformationArchitectureSection({ iaData }: InformationArchitectureSectionProps) {
  if (!iaData || !iaData.nodes || iaData.nodes.length === 0) return null;

  const rootNode = iaData.nodes[0];

  return (
    <div className="w-full max-w-[1080px] min-w-0 mx-auto space-y-6 scroll-mt-24 pt-2 box-border">
      {/* ── Section Header ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">06</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            Information Architecture
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
          Structure of the product&apos;s primary navigation, functional areas, and page hierarchy.
        </p>
      </div>

      {/* ── Diagram Container ── */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-border-subtle bg-[var(--case-card)] p-4 sm:p-6 lg:p-7 shadow-sm relative box-border">
        {/* Desktop Connected Sitemap Canvas */}
        <div className="hidden md:block w-full max-w-full min-w-0">
          <IAFlowCanvas rootNode={rootNode} />
        </div>

        {/* Mobile Vertical Tree Hierarchy */}
        <div className="block md:hidden w-full">
          <IAMobileTree rootNode={rootNode} />
        </div>
      </div>
    </div>
  );
}
