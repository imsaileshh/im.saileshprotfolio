'use client';

import { useState } from 'react';
import { Plus, Trash2, GitFork, ChevronRight, Folder, FileText, CornerDownRight } from 'lucide-react';
import { InformationArchitectureData, IANode } from '@/types/case-study-builder';
import { DEFAULT_IA_DEMO } from '@/lib/data/case-study-demo-data';

interface InformationArchitectureEditorProps {
  data?: InformationArchitectureData;
  onChange: (newData: InformationArchitectureData) => void;
}

export function InformationArchitectureEditor({
  data = DEFAULT_IA_DEMO,
  onChange,
}: InformationArchitectureEditorProps) {
  const nodes = data?.nodes || [];

  const updateRootNodes = (newNodes: IANode[]) => {
    onChange({ ...data, nodes: newNodes });
  };

  // Helper to recursively update a node in the tree
  const updateNodeRecursive = (currentNodes: IANode[], targetId: string, updater: (n: IANode) => IANode): IANode[] => {
    return currentNodes.map((n) => {
      if (n.id === targetId) {
        return updater(n);
      }
      if (n.children && n.children.length > 0) {
        return {
          ...n,
          children: updateNodeRecursive(n.children, targetId, updater),
        };
      }
      return n;
    });
  };

  // Helper to recursively delete a node from the tree
  const deleteNodeRecursive = (currentNodes: IANode[], targetId: string): IANode[] => {
    return currentNodes
      .filter((n) => n.id !== targetId)
      .map((n) => ({
        ...n,
        children: n.children ? deleteNodeRecursive(n.children, targetId) : [],
      }));
  };

  // Helper to recursively add a child node to a specific parent node
  const addChildRecursive = (
    currentNodes: IANode[],
    parentId: string,
    newChild: IANode
  ): IANode[] => {
    return currentNodes.map((n) => {
      if (n.id === parentId) {
        return {
          ...n,
          children: [...(n.children || []), newChild],
        };
      }
      if (n.children && n.children.length > 0) {
        return {
          ...n,
          children: addChildRecursive(n.children, parentId, newChild),
        };
      }
      return n;
    });
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<IANode>) => {
    updateRootNodes(updateNodeRecursive(nodes, nodeId, (n) => ({ ...n, ...updates })));
  };

  const handleDeleteNode = (nodeId: string) => {
    updateRootNodes(deleteNodeRecursive(nodes, nodeId));
  };

  const handleAddChild = (parentId: string, childType: IANode['type'] = 'page') => {
    const newChild: IANode = {
      id: `node-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      title: childType === 'group' ? 'New Group' : childType === 'decision' ? 'Have Account?' : 'New Page',
      type: childType,
      description: '',
      edgeLabel: childType === 'action' ? 'Yes' : undefined,
      children: [],
    };
    updateRootNodes(addChildRecursive(nodes, parentId, newChild));
  };

  const addTopLevelGroup = () => {
    if (nodes.length > 0) {
      handleAddChild(nodes[0].id, 'group');
    } else {
      updateRootNodes([
        {
          id: 'root-main',
          title: 'Marketplace Core',
          type: 'root',
          children: [],
        },
      ]);
    }
  };

  const renderEditableNode = (node: IANode, depth: number = 0) => {
    const isRoot = node.type === 'root';
    const isGroup = node.type === 'group';
    const isDecision = node.type === 'decision';

    return (
      <div key={node.id} className="space-y-3">
        <div
          className={`p-3 rounded-xl border transition-all ${
            isRoot
              ? 'border-accent/40 bg-accent/10'
              : isDecision
              ? 'border-amber-500/40 bg-amber-500/10'
              : isGroup
              ? 'border-white/15 bg-black/40'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Type badge or selector */}
            {!isRoot ? (
              <select
                value={node.type}
                onChange={(e) => handleUpdateNode(node.id, { type: e.target.value as IANode['type'] })}
                className="px-2 py-1 rounded bg-black/60 border border-white/15 text-[11px] font-semibold text-foreground focus:outline-none focus:border-accent"
              >
                <option value="group">GROUP</option>
                <option value="page">PAGE</option>
                <option value="decision">DECISION (◇)</option>
                <option value="action">ACTION</option>
                <option value="external">EXTERNAL</option>
              </select>
            ) : (
              <span className="px-2 py-1 rounded bg-accent/20 text-accent font-bold text-[11px]">
                ROOT
              </span>
            )}

            {/* Optional Edge Label Input */}
            {!isRoot && (
              <input
                type="text"
                value={node.edgeLabel || ''}
                onChange={(e) => handleUpdateNode(node.id, { edgeLabel: e.target.value })}
                className="w-24 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-accent"
                placeholder="Branch: Yes/No"
              />
            )}

            {/* Title Input */}
            <input
              type="text"
              value={node.title}
              onChange={(e) => handleUpdateNode(node.id, { title: e.target.value })}
              className={`flex-1 min-w-[140px] rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-none ${
                isRoot ? 'font-bold text-sm text-white' : 'font-semibold'
              }`}
              placeholder="Node Title..."
            />

            {/* Description Input */}
            <input
              type="text"
              value={node.description || ''}
              onChange={(e) => handleUpdateNode(node.id, { description: e.target.value })}
              className="flex-1 min-w-[160px] rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-muted focus:border-accent focus:outline-none hidden md:block"
              placeholder="Short description..."
            />

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => handleAddChild(node.id, 'page')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium text-foreground transition-all"
                title="Add Child Node"
              >
                <Plus size={12} />
                <span>Child</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddChild(node.id, 'group')}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent/20 hover:bg-accent/30 text-[11px] font-medium text-accent transition-all"
                title="Add Group Node"
              >
                <Folder size={12} />
                <span>Group</span>
              </button>
              {!isRoot && (
                <button
                  type="button"
                  onClick={() => handleDeleteNode(node.id)}
                  className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                  title="Delete Node"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Render Children Recursively */}
        {node.children && node.children.length > 0 && (
          <div className="pl-4 sm:pl-6 border-l-2 border-white/10 space-y-3">
            {node.children.map((childNode) => renderEditableNode(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const mainRoot = nodes[0] || { id: 'root-main', title: 'Marketplace Core', type: 'root', children: [] };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <GitFork size={16} className="text-accent" />
              <span>Information Architecture Tree</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Build a hierarchical product sitemap with root, decision nodes, groups, pages, and edge labels.
            </p>
          </div>
          <button
            type="button"
            onClick={addTopLevelGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Group</span>
          </button>
        </div>

        <div className="space-y-4">{renderEditableNode(mainRoot, 0)}</div>
      </div>
    </div>
  );
}
