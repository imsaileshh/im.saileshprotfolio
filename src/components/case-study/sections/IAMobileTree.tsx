'use client';

import { useState } from 'react';
import { IANode } from '@/types/case-study-builder';
import {
  GitFork,
  Folder,
  FileText,
  HelpCircle,
  ExternalLink,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface IAMobileTreeProps {
  rootNode: IANode;
}

export function IAMobileTree({ rootNode }: IAMobileTreeProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getNodeCategory = (
    node: IANode,
    depth: number
  ): 'root' | 'decision' | 'action' | 'group' | 'page' | 'external' => {
    if (node.type === 'root') return 'root';
    if (node.type === 'decision') return 'decision';
    if (node.type === 'action') return 'action';
    if (node.type === 'external') return 'external';
    if (
      node.type === 'group' ||
      node.id === 'home-hub' ||
      (node.children && node.children.length > 0 && depth <= 2)
    ) {
      return 'group';
    }
    return 'page';
  };

  const renderCard = (
    node: IANode,
    depth: number,
    hasChildren: boolean,
    isCollapsed: boolean
  ) => {
    const category = getNodeCategory(node, depth);

    switch (category) {
      case 'root':
        return (
          <div
            className="w-auto max-w-[240px] min-h-[50px] px-3 py-2 rounded-xl border border-accent/40 bg-[var(--case-surface)] dark:bg-[#0e1117] text-center shadow-xs transition-all relative overflow-hidden flex flex-col items-center justify-center mx-auto"
            onClick={() => hasChildren && toggleNode(node.id)}
            role={hasChildren ? 'button' : undefined}
            tabIndex={hasChildren ? 0 : undefined}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="flex items-center justify-center gap-1 mb-0.5 text-accent">
              <GitFork size={11} className="shrink-0" />
              <span className="font-mono text-[7.5px] uppercase tracking-widest font-bold">
                ROOT APP
              </span>
              {hasChildren && (
                <span className="ml-0.5 text-accent/80">
                  {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </span>
              )}
            </div>
            <h3 className="text-[13px] sm:text-[14px] font-bold text-foreground font-display leading-[1.2] line-clamp-1">
              {node.title}
            </h3>
            {node.description && (
              <p className="text-[10px] sm:text-[11px] text-muted mt-0.5 line-clamp-1 leading-tight">
                {node.description}
              </p>
            )}
          </div>
        );

      case 'decision':
        return (
          <div
            className="w-auto max-w-[210px] min-h-[48px] px-2.5 py-2 rounded-xl border border-amber-500/35 bg-amber-500/10 dark:bg-[#13110c] dark:border-amber-500/40 text-center shadow-xs transition-all flex flex-col items-center justify-center mx-auto cursor-pointer"
            onClick={() => hasChildren && toggleNode(node.id)}
            role={hasChildren ? 'button' : undefined}
            tabIndex={hasChildren ? 0 : undefined}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-600 dark:text-amber-400">
              <HelpCircle size={10} className="shrink-0" />
              <span className="font-mono text-[8px] uppercase tracking-wider font-bold">
                DECISION
              </span>
              {hasChildren && (
                <span className="ml-0.5 text-amber-600/70 dark:text-amber-400/70">
                  {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </span>
              )}
            </div>
            <h4 className="text-[12px] font-semibold text-amber-950 dark:text-amber-200 font-display leading-[1.2] line-clamp-1">
              {node.title}
            </h4>
            {node.description && (
              <p className="text-[9px] text-amber-700/85 dark:text-amber-300/70 mt-0.5 line-clamp-1 leading-tight">
                {node.description}
              </p>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="w-auto max-w-[200px] min-h-[46px] px-2.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-[#0a1411] dark:border-emerald-500/40 text-left shadow-xs transition-all flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap size={10} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              {node.edgeLabel && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[8px] font-mono font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                  {node.edgeLabel}
                </span>
              )}
              <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-200 leading-[1.2] line-clamp-1">
                {node.title}
              </span>
            </div>
            {node.description && (
              <p className="text-[9px] text-emerald-700/80 dark:text-emerald-400/70 line-clamp-1 pl-4 mt-0.5 leading-tight">
                {node.description}
              </p>
            )}
          </div>
        );

      case 'group':
        return (
          <div
            className="w-auto max-w-[220px] min-h-[46px] px-2.5 py-2 rounded-xl border border-border-subtle bg-[var(--case-surface)] text-left shadow-xs transition-all flex flex-col justify-center mx-auto cursor-pointer"
            onClick={() => hasChildren && toggleNode(node.id)}
            role={hasChildren ? 'button' : undefined}
            tabIndex={hasChildren ? 0 : undefined}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Folder size={11} className="text-amber-500 dark:text-amber-400 shrink-0" />
                <h4 className="text-[11.5px] font-semibold text-foreground font-display leading-[1.2] line-clamp-1">
                  {node.title}
                </h4>
              </div>
              {hasChildren && (
                <span className="text-muted shrink-0">
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-[9px] text-muted leading-tight mt-0.5 line-clamp-1 pl-4">
                {node.description}
              </p>
            )}
          </div>
        );

      case 'external':
        return (
          <div className="w-auto max-w-[190px] min-h-[42px] px-2.5 py-1.5 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/10 dark:bg-[#121018] dark:border-purple-500/40 text-left shadow-xs transition-all flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <ExternalLink size={10} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="text-[10.5px] font-medium text-purple-950 dark:text-purple-200 leading-[1.2] line-clamp-1">
                {node.title}
              </span>
            </div>
            {node.description && (
              <p className="text-[8.5px] text-purple-700/80 dark:text-purple-400/70 line-clamp-1 pl-3.5 mt-0.5 leading-tight">
                {node.description}
              </p>
            )}
          </div>
        );

      case 'page':
      default:
        return (
          <div className="w-auto max-w-[190px] min-h-[42px] px-2.5 py-1.5 rounded-xl border border-border-subtle bg-[var(--case-surface)] text-left shadow-xs transition-all flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <FileText size={10} className="text-accent shrink-0" />
              <span className="text-[10.5px] font-medium text-foreground leading-[1.2] line-clamp-1">
                {node.title}
              </span>
            </div>
            {node.description && depth <= 2 && (
              <p className="text-[8.5px] text-muted leading-tight mt-0.5 line-clamp-1 pl-3.5">
                {node.description}
              </p>
            )}
          </div>
        );
    }
  };

  const renderSubtree = (node: IANode, depth: number = 0): React.ReactNode => {
    const validChildren = (node.children || []).filter((c) => Boolean(c && c.id && c.title));
    const hasChildren = validChildren.length > 0;
    const isCollapsed = Boolean(collapsedNodes[node.id]);

    const card = renderCard(node, depth, hasChildren, isCollapsed);

    if (!hasChildren || isCollapsed) {
      return card;
    }

    const anyChildHasChildren = validChildren.some(
      (c) => c.children && c.children.filter((gc) => Boolean(gc && gc.id && gc.title)).length > 0
    );

    return (
      <div key={node.id} className="flex flex-col items-center w-full">
        {/* The parent card */}
        {card}

        {/* Short vertical connector line */}
        <div className="w-px h-3 bg-border-subtle/80 shrink-0 my-0.5" aria-hidden="true" />

        {anyChildHasChildren ? (
          // Children contain nested groups/branches -> render centered column with vertical connectors
          <div className="flex flex-col items-center w-full">
            {validChildren.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center w-full">
                {renderSubtree(child, depth + 1)}
                {idx < validChildren.length - 1 && (
                  <div className="w-px h-3 bg-border-subtle/80 shrink-0 my-1" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // Leaf children (e.g. Sign Up / Login, or Page nodes) -> compact branch list with small hierarchy indentation
          <div className="relative pl-3.5 border-l border-border-subtle/80 flex flex-col items-start space-y-2 my-1 w-fit mx-auto">
            {validChildren.map((child) => (
              <div key={child.id} className="relative flex items-center w-fit">
                {/* Horizontal branch tick line */}
                <div
                  className="absolute -left-[14px] top-1/2 w-3.5 h-px bg-border-subtle/80 -translate-y-1/2"
                  aria-hidden="true"
                />
                {renderCard(child, depth + 1, false, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center py-1">
      {renderSubtree(rootNode, 0)}
    </div>
  );
}
