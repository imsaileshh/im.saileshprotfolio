'use client';

import { useMemo, useState } from 'react';
import { UserFlowData, UserFlowNode, UserFlowEdge, UserFlowNodeStyleType } from '@/types/case-study-builder';
import { Play, Layout, HelpCircle, Sparkles, CheckCircle2, AlertCircle, Info, ChevronDown } from 'lucide-react';

interface UserFlowSectionProps {
  userFlow?: UserFlowData;
}

interface PositionedNode {
  node: UserFlowNode;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
}

export function UserFlowSection({ userFlow }: UserFlowSectionProps) {
  const [selectedNode, setSelectedNode] = useState<UserFlowNode | null>(null);

  if (!userFlow || !userFlow.nodes || userFlow.nodes.length === 0) return null;

  const nodes = userFlow.nodes;
  const edges = userFlow.edges || [];

  // ── 1. Calculate Flow Ranks & 2D Canvas Layout ──
  const layout = useMemo(() => {
    const nodeMap = new Map<string, UserFlowNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const inDegree = new Map<string, number>();
    const outEdges = new Map<string, UserFlowEdge[]>();
    const inEdges = new Map<string, UserFlowEdge[]>();

    nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      outEdges.set(n.id, []);
      inEdges.set(n.id, []);
    });

    edges.forEach((e) => {
      if (nodeMap.has(e.from) && nodeMap.has(e.to)) {
        inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
        outEdges.get(e.from)?.push(e);
        inEdges.get(e.to)?.push(e);
      }
    });

    // Determine levels (ranks)
    const levels = new Map<string, number>();
    const queue: string[] = [];

    nodes.forEach((n) => {
      if (n.type === 'start' || inDegree.get(n.id) === 0) {
        levels.set(n.id, 0);
        queue.push(n.id);
      }
    });

    if (queue.length === 0 && nodes.length > 0) {
      levels.set(nodes[0].id, 0);
      queue.push(nodes[0].id);
    }

    const visited = new Set<string>();
    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      const currLevel = levels.get(currId) || 0;
      const outs = outEdges.get(currId) || [];

      outs.forEach((e) => {
        const nextLevel = Math.max(levels.get(e.to) || 0, currLevel + 1);
        levels.set(e.to, nextLevel);
        queue.push(e.to);
      });
    }

    // Assign remaining unvisited nodes
    nodes.forEach((n, idx) => {
      if (!levels.has(n.id)) {
        levels.set(n.id, idx);
      }
    });

    // Group nodes by level
    const maxLevel = Math.max(...Array.from(levels.values()), 0);
    const levelGroups: UserFlowNode[][] = Array.from({ length: maxLevel + 1 }, () => []);

    nodes.forEach((n) => {
      const lvl = levels.get(n.id) || 0;
      levelGroups[lvl].push(n);
    });

    // Calculate (x, y) coordinates for desktop canvas
    const nodePositions = new Map<string, PositionedNode>();
    let maxTotalWidth = 800;

    // Calculate max level width
    levelGroups.forEach((group) => {
      let w = 0;
      group.forEach((n) => {
        const nw = n.type === 'decision' ? 110 : n.type === 'start' ? 130 : 175;
        w += nw + 32;
      });
      if (w > maxTotalWidth) maxTotalWidth = w;
    });

    const canvasWidth = Math.max(760, maxTotalWidth + 40);

    let currentY = 32;
    levelGroups.forEach((group, levelIdx) => {
      let maxHeight = 0;
      group.forEach((n) => {
        const nh = n.type === 'decision' ? 110 : n.type === 'start' ? 40 : 66;
        if (nh > maxHeight) maxHeight = nh;
      });

      // Position nodes across column spacing
      const count = group.length;
      const colWidth = canvasWidth / (count + 1);

      group.forEach((n, idx) => {
        const nw = n.type === 'decision' ? 110 : n.type === 'start' ? 130 : 175;
        const nh = n.type === 'decision' ? 110 : n.type === 'start' ? 40 : 66;
        const x = colWidth * (idx + 1) - nw / 2;
        const y = currentY + (maxHeight - nh) / 2;

        nodePositions.set(n.id, {
          node: n,
          x,
          y,
          width: nw,
          height: nh,
          level: levelIdx,
        });
      });

      currentY += maxHeight + 50; // vertical gap
    });

    const canvasHeight = currentY + 20;

    return { nodePositions, canvasWidth, canvasHeight, outEdges };
  }, [nodes, edges]);

  const { nodePositions, canvasWidth, canvasHeight } = layout;

  // ── Helper Icon Renderer ──
  const getNodeIcon = (type: UserFlowNodeStyleType) => {
    switch (type) {
      case 'start':
        return <Play size={12} className="fill-emerald-500 dark:fill-emerald-400 text-emerald-500 dark:text-emerald-400" />;
      case 'screen':
        return <Layout size={13} className="text-accent" />;
      case 'decision':
        return <HelpCircle size={15} className="text-amber-500 dark:text-amber-400" />;
      case 'action':
        return <Sparkles size={13} className="text-purple-500 dark:text-purple-400" />;
      case 'success':
        return <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />;
      case 'error':
        return <AlertCircle size={13} className="text-red-500 dark:text-red-400" />;
      default:
        return <Layout size={13} className="text-accent" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Description caption */}
      <p className="text-xs text-muted font-mono">
        UX Flowchart &bull; Interactive Node Diagram
      </p>

      {/* ── 2. Desktop Flow Canvas (SVG + HTML Nodes) ── */}
      <div className="hidden md:block w-full max-w-[840px] mx-auto rounded-2xl border border-border-subtle bg-[var(--case-card)] bg-[radial-gradient(var(--case-border-strong)_1px,transparent_1px)] [background-size:16px_16px] shadow-sm overflow-x-auto no-scrollbar scrollbar-hidden p-4 sm:p-6">
        <div
          className="relative mx-auto transition-all"
          style={{ width: canvasWidth, height: canvasHeight }}
        >
          {/* SVG Connector Lines Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            width={canvasWidth}
            height={canvasHeight}
          >
            <defs>
              <marker
                id="flow-arrowhead"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--muted)" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const fromPos = nodePositions.get(edge.from);
              const toPos = nodePositions.get(edge.to);
              if (!fromPos || !toPos) return null;

              // Calculate source & target ports
              let sourceX = fromPos.x + fromPos.width / 2;
              let sourceY = fromPos.y + fromPos.height;

              if (fromPos.node.type === 'decision') {
                const cx = fromPos.x + fromPos.width / 2;
                const cy = fromPos.y + fromPos.height / 2;
                const targetCx = toPos.x + toPos.width / 2;

                if (targetCx < cx - 30) {
                  // Left branch
                  sourceX = fromPos.x;
                  sourceY = cy;
                } else if (targetCx > cx + 30) {
                  // Right branch
                  sourceX = fromPos.x + fromPos.width;
                  sourceY = cy;
                } else {
                  // Bottom branch
                  sourceX = cx;
                  sourceY = fromPos.y + fromPos.height;
                }
              }

              const targetX = toPos.x + toPos.width / 2;
              const targetY = toPos.y;

              const dx = targetX - sourceX;
              const dy = targetY - sourceY;

              let pathD = '';
              let labelX = (sourceX + targetX) / 2;
              let labelY = (sourceY + targetY) / 2;

              if (Math.abs(dx) < 6) {
                pathD = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
              } else if (fromPos.node.type === 'decision' && Math.abs(dx) > 30) {
                // Orthogonal right angle
                const midX = sourceX + (dx > 0 ? 24 : -24);
                pathD = `M ${sourceX} ${sourceY} H ${targetX} V ${targetY}`;
                labelX = midX;
                labelY = sourceY - 10;
              } else {
                const midY = sourceY + dy * 0.5;
                pathD = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
              }

              // Label width calculation
              const labelText = edge.label || '';
              const labelWidth = Math.max(36, labelText.length * 7 + 16);

              return (
                <g key={edge.id || `${edge.from}-${edge.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--case-border-strong)"
                    strokeWidth="1.5"
                    markerEnd="url(#flow-arrowhead)"
                  />
                  {labelText && (
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      <rect
                        x={-labelWidth / 2}
                        y={-10}
                        width={labelWidth}
                        height={20}
                        rx={5}
                        fill="var(--case-surface)"
                        stroke="var(--case-border-strong)"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="fill-foreground font-mono text-[10px] font-medium"
                      >
                        {labelText}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML Diagram Nodes Layer */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {Array.from(nodePositions.values()).map(({ node, x, y, width, height }) => {
              // Node type 1: START CAPSULE
              if (node.type === 'start') {
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    style={{ left: x, top: y, width, height }}
                    className="absolute cursor-pointer px-4 py-2 rounded-full border border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-50/90 dark:bg-[#0a1812] hover:border-emerald-400 text-emerald-950 dark:text-emerald-200 flex items-center justify-center gap-2 font-mono text-xs font-semibold shadow-xs transition-all hover:scale-[1.03]"
                  >
                    <Play size={12} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{node.title.toUpperCase()}</span>
                  </div>
                );
              }

              // Node type 2: DECISION DIAMOND
              if (node.type === 'decision') {
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    style={{ left: x, top: y, width, height }}
                    className="absolute cursor-pointer flex items-center justify-center group"
                  >
                    {/* Rotated Diamond Background */}
                    <div className="absolute inset-0 rotate-45 rounded-xl border-2 border-amber-500/40 dark:border-amber-500/40 bg-amber-50/90 dark:bg-[#16140e] shadow-xs group-hover:border-amber-400 transition-all" />

                    {/* Unrotated Text Content */}
                    <div className="relative z-10 p-2 text-center flex flex-col items-center justify-center max-w-[92px]">
                      <HelpCircle size={15} className="text-amber-600 dark:text-amber-400 mb-0.5 shrink-0" />
                      <h4 className="text-[12px] font-bold text-amber-950 dark:text-amber-200 font-display leading-tight line-clamp-2">
                        {node.title}
                      </h4>
                    </div>
                  </div>
                );
              }

              // Node type 3: SCREEN / ACTION / SUCCESS / ERROR
              let borderClass = 'border-border-subtle hover:border-accent/40 bg-[var(--case-surface)]';
              let badgeColor = 'text-accent';
              let badgeLabel = 'SCREEN';

              if (node.type === 'action') {
                borderClass = 'border-purple-500/30 dark:border-purple-500/40 hover:border-purple-400 bg-purple-50/90 dark:bg-[#121017]';
                badgeColor = 'text-purple-600 dark:text-purple-400';
                badgeLabel = 'ACTION';
              } else if (node.type === 'success') {
                borderClass = 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-400 bg-emerald-50/90 dark:bg-[#0d1612]';
                badgeColor = 'text-emerald-600 dark:text-emerald-400';
                badgeLabel = 'SUCCESS';
              } else if (node.type === 'error') {
                borderClass = 'border-red-500/30 dark:border-red-500/40 hover:border-red-400 bg-red-50/90 dark:bg-[#180d0d]';
                badgeColor = 'text-red-600 dark:text-red-400';
                badgeLabel = 'ERROR';
              }

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  style={{ left: x, top: y, width, height }}
                  className={`absolute cursor-pointer p-3 rounded-xl border shadow-xs transition-all hover:scale-[1.02] flex flex-col justify-between ${borderClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {getNodeIcon(node.type)}
                      <span className={`font-mono text-[9px] uppercase tracking-wider font-bold ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    </div>
                    {node.description && <Info size={11} className="text-muted hover:text-foreground" />}
                  </div>

                  <h4 className="text-xs sm:text-[13px] font-semibold text-foreground font-display leading-tight line-clamp-1">
                    {node.title}
                  </h4>

                  {node.description ? (
                    <p className="text-[10px] text-muted line-clamp-1 leading-none">
                      {node.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border-subtle text-[11px] font-mono text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-foreground/80 font-medium">Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-accent inline-block" />
            <span className="text-foreground/80 font-medium">Screen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 inline-block" />
            <span className="text-foreground/80 font-medium">Action</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 rounded-xs bg-amber-500 inline-block" />
            <span className="text-foreground/80 font-medium">Decision</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-foreground/80 font-medium">Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block" />
            <span className="text-foreground/80 font-medium">Error</span>
          </div>
        </div>
      </div>

      {/* ── 3. Dedicated Modern Mobile Flow Diagram (<768px) ── */}
      <div className="block md:hidden w-full max-w-full rounded-2xl border border-border-subtle bg-[var(--case-card)] bg-[radial-gradient(var(--case-border-strong)_1px,transparent_1px)] [background-size:16px_16px] px-3 py-4 sm:px-4 sm:py-5 overflow-x-hidden">
        <div className="flex flex-col items-center w-full">
          {nodes.map((node, idx) => {
            const outgoingEdges = edges.filter((e) => e.from === node.id);
            const isLast = idx === nodes.length - 1;

            // Subtle serpentine offset around the vertical spine (~14px)
            // Start, Decision, and Success remain centered
            let offsetClass = 'translate-x-0 mx-auto';
            if (node.type !== 'start' && node.type !== 'decision' && node.type !== 'success') {
              offsetClass = idx % 2 === 1 ? '-translate-x-3.5 mx-auto' : 'translate-x-3.5 mx-auto';
            }

            return (
              <div key={node.id} className="w-full flex flex-col items-center">
                {/* ── NODE CARDS BY TYPE ── */}
                {node.type === 'start' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className="w-[215px] max-w-[85%] px-3 py-2.5 rounded-full border border-emerald-500/40 dark:border-emerald-500/50 bg-emerald-50/90 dark:bg-[#0a1812] shadow-xs flex items-center gap-2.5 cursor-pointer hover:border-emerald-500/70 active:scale-[0.98] transition-all mx-auto"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Play size={10} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400 translate-x-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-muted font-medium">
                          STEP 0{idx + 1}
                        </span>
                        <span className="text-[8.5px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          START
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground font-display leading-tight truncate">
                        {node.title}
                      </h4>
                      {node.description && (
                        <p className="text-[9px] text-muted leading-tight line-clamp-1 mt-0.5">
                          {node.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {node.type === 'decision' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className="relative my-2 flex flex-col items-center justify-center cursor-pointer group mx-auto"
                    style={{ width: 136, height: 118 }}
                  >
                    {/* Rotated diamond shape background */}
                    <div className="absolute w-[86px] h-[86px] rotate-45 rounded-xl border-2 border-amber-500/40 dark:border-amber-500/50 bg-amber-50/95 dark:bg-[#16140e] shadow-xs group-hover:border-amber-500/70 transition-colors" />

                    {/* Unrotated content */}
                    <div className="relative z-10 px-2 py-1 text-center flex flex-col items-center justify-center max-w-[108px]">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[8px] uppercase font-bold tracking-wider mb-0.5">
                        <span className="text-[9px]">◇</span>
                        <span>DECISION</span>
                        <span className="text-[9px]">◇</span>
                      </div>
                      <h4 className="text-[11.5px] font-bold text-amber-950 dark:text-amber-200 font-display leading-tight line-clamp-2">
                        {node.title}
                      </h4>
                      {node.description && (
                        <p className="text-[8px] text-muted leading-tight mt-0.5 line-clamp-1">
                          {node.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {node.type === 'screen' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-[205px] max-w-[82%] p-2.5 rounded-xl border border-border-subtle bg-[var(--case-surface)] shadow-xs cursor-pointer hover:border-accent/40 active:scale-[0.98] transition-all ${offsetClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layout size={11} className="text-accent" />
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted font-medium">
                          STEP 0{idx + 1}
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono uppercase font-bold text-accent">
                        SCREEN
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground font-display leading-tight mt-1 truncate">
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-[9.5px] text-muted leading-snug line-clamp-2 mt-0.5">
                        {node.description}
                      </p>
                    )}
                  </div>
                )}

                {node.type === 'action' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-[195px] max-w-[78%] p-2.5 rounded-xl border border-purple-500/30 dark:border-purple-500/40 bg-purple-50/80 dark:bg-[#121017] shadow-xs cursor-pointer hover:border-purple-500/60 active:scale-[0.98] transition-all ${offsetClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={11} className="text-purple-500 dark:text-purple-400" />
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted font-medium">
                          STEP 0{idx + 1}
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono uppercase font-bold text-purple-600 dark:text-purple-400">
                        ACTION
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground font-display leading-tight mt-1 truncate">
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-[9.5px] text-muted leading-snug line-clamp-2 mt-0.5">
                        {node.description}
                      </p>
                    )}
                  </div>
                )}

                {node.type === 'success' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className="w-[205px] max-w-[82%] p-2.5 rounded-2xl border border-emerald-500/35 dark:border-emerald-500/45 bg-emerald-50/90 dark:bg-[#0d1612] shadow-xs cursor-pointer hover:border-emerald-500/70 active:scale-[0.98] transition-all text-center flex flex-col items-center mx-auto"
                  >
                    <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[8.5px] uppercase font-bold mb-0.5">
                      <CheckCircle2 size={11} />
                      <span>✓ SUCCESS</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground font-display leading-tight truncate">
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-[9.5px] text-muted leading-snug line-clamp-2 mt-0.5">
                        {node.description}
                      </p>
                    )}
                  </div>
                )}

                {node.type === 'error' && (
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-[195px] max-w-[78%] p-2.5 rounded-xl border border-red-500/30 dark:border-red-500/40 bg-red-50/80 dark:bg-[#180d0d] shadow-xs cursor-pointer hover:border-red-500/60 active:scale-[0.98] transition-all ${offsetClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={11} className="text-red-500 dark:text-red-400" />
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted font-medium">
                          STEP 0{idx + 1}
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono uppercase font-bold text-red-600 dark:text-red-400">
                        ERROR
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground font-display leading-tight mt-1 truncate">
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-[9.5px] text-muted leading-snug line-clamp-2 mt-0.5">
                        {node.description}
                      </p>
                    )}
                  </div>
                )}

                {/* ── INTEGRATED CONNECTORS TO NEXT NODE ── */}
                {!isLast && (
                  <div className="w-full my-1 flex flex-col items-center">
                    {outgoingEdges.length > 1 ? (
                      /* Multi-branching connector split */
                      <div className="w-full max-w-[260px] mx-auto flex flex-col items-center">
                        <div className="w-px h-2.5 bg-border-strong dark:bg-border-subtle" />
                        <div className="relative w-full flex justify-between items-start pt-1">
                          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-border-strong dark:bg-border-subtle" />
                          {outgoingEdges.map((edge) => (
                            <div key={edge.id} className="flex-1 flex flex-col items-center px-1">
                              <div className="w-px h-2 bg-border-strong dark:bg-border-subtle" />
                              {edge.label && (
                                <span className="px-1.5 py-0.5 my-0.5 rounded-full bg-[var(--case-surface)] border border-border-subtle text-[8px] font-mono text-foreground/80 font-medium tracking-tight shadow-2xs text-center max-w-[100px] truncate">
                                  {edge.label}
                                </span>
                              )}
                              <div className="w-px h-2 bg-border-strong dark:bg-border-subtle" />
                              <svg className="w-2.5 h-2.5 text-muted -mt-0.5 shrink-0" viewBox="0 0 10 6" fill="currentColor">
                                <path d="M0 0 L5 6 L10 0 Z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Single integrated vertical connector line with inline badge & arrow */
                      <div className="flex flex-col items-center justify-center relative">
                        <div className="w-px h-2.5 bg-border-strong dark:bg-border-subtle" />
                        {outgoingEdges[0]?.label ? (
                          <span className="px-2 py-0.5 my-0.5 rounded-full bg-[var(--case-surface)] border border-border-subtle text-[8.5px] font-mono text-foreground/80 font-medium tracking-tight shadow-2xs whitespace-nowrap">
                            {outgoingEdges[0].label}
                          </span>
                        ) : null}
                        <div className="w-px h-2.5 bg-border-strong dark:bg-border-subtle" />
                        <svg className="w-2.5 h-2.5 text-muted -mt-0.5 shrink-0" viewBox="0 0 10 6" fill="currentColor">
                          <path d="M0 0 L5 6 L10 0 Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer/Modal */}
      {selectedNode && selectedNode.description && (
        <div className="p-4 rounded-xl border border-border-subtle bg-[var(--case-surface)] flex items-start justify-between gap-4 text-xs text-foreground shadow-xs">
          <div>
            <span className="font-mono text-[10px] text-muted uppercase font-bold block mb-1">
              Node Specification: {selectedNode.title}
            </span>
            <p className="text-foreground">{selectedNode.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            className="text-muted hover:text-foreground font-mono text-xs px-2 py-1 bg-[var(--case-card)] rounded border border-border-subtle cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
