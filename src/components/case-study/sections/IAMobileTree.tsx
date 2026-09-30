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

  const getNodeIcon = (type: IANode['type']) => {
    switch (type) {
      case 'root':
        return <GitFork size={15} className="text-accent shrink-0" />;
      case 'decision':
        return <HelpCircle size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'group':
        return <Folder size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'action':
        return <Zap size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" />;
      case 'external':
        return <ExternalLink size={14} className="text-purple-500 dark:text-purple-400 shrink-0" />;
      case 'page':
      case 'child':
      default:
        return <FileText size={14} className="text-accent shrink-0" />;
    }
  };

  const renderMobileNode = (node: IANode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];
    const isRoot = node.type === 'root';
    const isDecision = node.type === 'decision';

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`p-3 rounded-xl border transition-all ${
            isRoot
              ? 'border-accent/50 bg-[var(--case-surface)] dark:bg-[#0e1117]'
              : isDecision
              ? 'border-amber-500/40 bg-[var(--case-surface)] dark:bg-[#13110c]'
              : 'border-border-subtle bg-[var(--case-surface)]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getNodeIcon(node.type)}
              {node.edgeLabel && (
                <span className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-mono text-foreground font-bold shrink-0">
                  {node.edgeLabel}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <span
                  className={`block truncate ${
                    isRoot
                      ? 'text-sm font-bold text-foreground font-display'
                      : isDecision
                      ? 'text-xs font-semibold text-amber-900 dark:text-amber-200'
                      : 'text-xs font-medium text-foreground'
                  }`}
                >
                  {node.title}
                </span>
                {node.description && (
                  <p className="text-[11px] text-muted truncate mt-0.5">{node.description}</p>
                )}
              </div>
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="p-1 rounded text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Toggle subsection"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Children Subtree */}
        {hasChildren && !isCollapsed && (
          <div className="pl-3 sm:pl-4 border-l border-border-subtle space-y-2 ml-3">
            {node.children!.map((child) => renderMobileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="space-y-3 w-full">{renderMobileNode(rootNode, 0)}</div>;
}
