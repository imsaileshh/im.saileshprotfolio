'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Layout, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserFlowData, UserFlowNode, UserFlowEdge, UserFlowNodeStyleType } from '@/types/case-study-builder';
import { DEFAULT_USER_FLOW_DEMO } from '@/lib/data/case-study-demo-data';

interface UserFlowEditorProps {
  data?: UserFlowData;
  onChange: (newData: UserFlowData) => void;
}

export function UserFlowEditor({ data = DEFAULT_USER_FLOW_DEMO, onChange }: UserFlowEditorProps) {
  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  const addNode = () => {
    const newId = `node-${Date.now().toString(36)}`;
    const newNode: UserFlowNode = {
      id: newId,
      title: 'New Screen / Step',
      description: 'Step description details...',
      type: 'screen',
    };
    onChange({
      ...data,
      nodes: [...nodes, newNode],
    });
  };

  const updateNode = (id: string, updated: Partial<UserFlowNode>) => {
    const newNodes = nodes.map((n) => (n.id === id ? { ...n, ...updated } : n));
    onChange({ ...data, nodes: newNodes });
  };

  const removeNode = (id: string) => {
    const newNodes = nodes.filter((n) => n.id !== id);
    const newEdges = edges.filter((e) => e.from !== id && e.to !== id);
    onChange({ ...data, nodes: newNodes, edges: newEdges });
  };

  const addEdge = () => {
    if (nodes.length < 2) return;
    const newEdge: UserFlowEdge = {
      id: `edge-${Date.now().toString(36)}`,
      from: nodes[0].id,
      to: nodes[1].id,
      label: 'Next Step',
    };
    onChange({
      ...data,
      edges: [...edges, newEdge],
    });
  };

  const updateEdge = (id: string, updated: Partial<UserFlowEdge>) => {
    const newEdges = edges.map((e) => (e.id === id ? { ...e, ...updated } : e));
    onChange({ ...data, edges: newEdges });
  };

  const removeEdge = (id: string) => {
    const newEdges = edges.filter((e) => e.id !== id);
    onChange({ ...data, edges: newEdges });
  };

  return (
    <div className="space-y-6">
      {/* Nodes Section */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layout size={16} className="text-accent" />
              <span>Flow Nodes ({nodes.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Define screen, action, decision, and start/end points.</p>
          </div>
          <button
            type="button"
            onClick={addNode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Node</span>
          </button>
        </div>

        <div className="space-y-3">
          {nodes.map((node, index) => (
            <div key={node.id} className="p-3.5 rounded-lg border border-white/10 bg-black/30 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-accent">
                <span>#{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                <input
                  type="text"
                  placeholder="Node Title"
                  value={node.title}
                  onChange={(e) => updateNode(node.id, { title: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={node.description || ''}
                  onChange={(e) => updateNode(node.id, { description: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                />

                <select
                  value={node.type}
                  onChange={(e) => updateNode(node.id, { type: e.target.value as UserFlowNodeStyleType })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="start">Start Node</option>
                  <option value="screen">Screen Node</option>
                  <option value="decision">Decision Node</option>
                  <option value="action">Action Node</option>
                  <option value="success">Success Node</option>
                  <option value="error">Error Node</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeNode(node.id)}
                className="p-1.5 rounded-lg text-muted/60 hover:text-red-400 hover:bg-white/5 transition-colors self-end sm:self-center"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connections / Edges Section */}
      <div className="rounded-xl border border-white/10 bg-[#121418] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ArrowRight size={16} className="text-accent" />
              <span>Node Connections ({edges.length})</span>
            </h4>
            <p className="text-xs text-muted mt-0.5">Define transitions and direction between nodes.</p>
          </div>
          <button
            type="button"
            onClick={addEdge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-all"
          >
            <Plus size={14} />
            <span>Add Connection</span>
          </button>
        </div>

        <div className="space-y-3">
          {edges.map((edge) => (
            <div key={edge.id} className="p-3 rounded-lg border border-white/10 bg-black/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                <select
                  value={edge.from}
                  onChange={(e) => updateEdge(edge.id, { from: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      From: {n.title}
                    </option>
                  ))}
                </select>

                <select
                  value={edge.to}
                  onChange={(e) => updateEdge(edge.id, { to: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      To: {n.title}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Connection Label (e.g. Next / Yes)"
                  value={edge.label || ''}
                  onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => removeEdge(edge.id)}
                className="p-1.5 rounded-lg text-muted/60 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
