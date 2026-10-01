'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { IANode } from '@/types/case-study-builder';
import { IANodeCard } from './IANodeCard';

interface IAFlowCanvasProps {
  rootNode: IANode;
}

interface PositionedNode {
  node: IANode;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  edgeLabel?: string;
  children: PositionedNode[];
  subtreeWidth: number;
}

interface ConnectorLine {
  id: string;
  path: string;
  edgeLabel?: string;
  labelX?: number;
  labelY?: number;
}

// 1. Filter out invalid/empty children before computing layout
function sanitizeTree(node: IANode): IANode {
  const validChildren = (node.children || [])
    .filter((c) => Boolean(c && c.id != null))
    .map(sanitizeTree);

  return {
    ...node,
    title: node.title ?? '',
    children: validChildren,
  };
}

export function IAFlowCanvas({ rootNode }: IAFlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Measure visible container width dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setContainerWidth(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const sanitizedRoot = useMemo(() => sanitizeTree(rootNode), [rootNode]);

  // Dedicated Compact Sitemap Layout Engine
  const { positionedNodes, lines, totalWidth, totalHeight, fitScale } = useMemo(() => {
    const PADDING_X = 24;
    const PADDING_Y = 24;

    const getNodeDimensions = (type: IANode['type']) => {
      switch (type) {
        case 'root':
          return { width: 140, height: 48 };
        case 'decision':
          return { width: 110, height: 42 };
        case 'group':
          return { width: 110, height: 44 };
        case 'action':
        case 'external':
        case 'page':
        case 'child':
        default:
          return { width: 100, height: 38 };
      }
    };

    const VERTICAL_STACK_GAP = 10;
    const GROUP_COLUMN_GAP = 18;
    const LEVEL_GAP = 36;

    const rawNodesList: PositionedNode[] = [];
    const parentChildPairs: Array<{ parent: PositionedNode; child: PositionedNode }> = [];

    // Check if node subtree can be laid out vertically
    const isVerticalStack = (node: IANode): boolean => {
      if (!node.children || node.children.length === 0) return true;
      if (node.type === 'group') return true;
      return node.children.every((c) => !c.children || c.children.length === 0);
    };

    // Subtree width calculation
    const computeSubtreeWidth = (node: IANode): number => {
      const { width: ownWidth } = getNodeDimensions(node.type);
      if (!node.children || node.children.length === 0) {
        return ownWidth;
      }

      if (isVerticalStack(node)) {
        // Vertical stack: width is max width of parent or any descendant
        const maxDescendantWidth = Math.max(
          ownWidth,
          ...node.children.map((c) => computeSubtreeWidth(c))
        );
        return maxDescendantWidth;
      }

      // Horizontal branching for top-level root/decision levels
      const childWidths = node.children.map((c) => computeSubtreeWidth(c));
      const totalChildWidth =
        childWidths.reduce((a, b) => a + b, 0) +
        (node.children.length - 1) * GROUP_COLUMN_GAP;

      return Math.max(ownWidth, totalChildWidth);
    };

    // Layout node recursively
    const layoutNode = (
      node: IANode,
      startX: number,
      startY: number,
      parentPos?: PositionedNode
    ): PositionedNode => {
      const { width, height } = getNodeDimensions(node.type);
      const subtreeWidth = computeSubtreeWidth(node);

      const centerX = startX + subtreeWidth / 2;
      const x = centerX - width / 2;
      const y = startY;
      const centerY = y + height / 2;

      const pNode: PositionedNode = {
        node,
        x,
        y,
        width,
        height,
        centerX,
        centerY,
        edgeLabel: node.edgeLabel,
        children: [],
        subtreeWidth,
      };

      rawNodesList.push(pNode);
      if (parentPos) {
        parentChildPairs.push({ parent: parentPos, child: pNode });
      }

      if (node.children && node.children.length > 0) {
        if (isVerticalStack(node)) {
          // Flatten descendants into vertical stack under group column
          let currentY = y + height + LEVEL_GAP;

          const layoutVerticalChildren = (
            childrenList: IANode[],
            parentPosition: PositionedNode
          ) => {
            childrenList.forEach((child) => {
              const cDim = getNodeDimensions(child.type);
              const cX = parentPosition.centerX - cDim.width / 2;
              const cY = currentY;
              const cCenterY = cY + cDim.height / 2;

              const childPos: PositionedNode = {
                node: child,
                x: cX,
                y: cY,
                width: cDim.width,
                height: cDim.height,
                centerX: parentPosition.centerX,
                centerY: cCenterY,
                edgeLabel: child.edgeLabel,
                children: [],
                subtreeWidth: cDim.width,
              };

              rawNodesList.push(childPos);
              parentChildPairs.push({ parent: parentPosition, child: childPos });

              currentY += cDim.height + VERTICAL_STACK_GAP;

              if (child.children && child.children.length > 0) {
                layoutVerticalChildren(child.children, childPos);
              }
            });
          };

          layoutVerticalChildren(node.children, pNode);
        } else {
          // Horizontal top-level columns (Root -> Groups)
          let currentChildX = startX;
          const childY = y + height + LEVEL_GAP;

          pNode.children = node.children.map((child) => {
            const childSubtreeWidth = computeSubtreeWidth(child);
            const childPos = layoutNode(child, currentChildX, childY, pNode);
            currentChildX += childSubtreeWidth + GROUP_COLUMN_GAP;
            return childPos;
          });
        }
      }

      return pNode;
    };

    layoutNode(sanitizedRoot, 0, 0);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    rawNodesList.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y < minY) minY = n.y;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    const naturalTreeWidth = maxX - minX;
    const naturalTreeHeight = maxY - minY;

    const availableWidth = Math.max(containerWidth - PADDING_X * 2, 320);

    // Calculate auto fit scale if natural width exceeds available desktop width
    let fitScale = 1;
    if (availableWidth > 0 && naturalTreeWidth > availableWidth) {
      fitScale = Math.min(1, Math.max(0.68, availableWidth / naturalTreeWidth));
    }

    const scaledTreeWidth = naturalTreeWidth * fitScale;
    const scaledTreeHeight = naturalTreeHeight * fitScale;

    const canvasWidth = containerWidth > 0 ? containerWidth : naturalTreeWidth + PADDING_X * 2;
    const canvasHeight = Math.round(scaledTreeHeight + PADDING_Y * 2);

    const xShift = (canvasWidth - scaledTreeWidth) / 2 - minX * fitScale;
    const yShift = PADDING_Y - minY * fitScale;

    // Shift all nodes and apply scale factor
    const positionedNodes = rawNodesList.map((n) => ({
      ...n,
      x: n.x * fitScale + xShift,
      y: n.y * fitScale + yShift,
      width: n.width * fitScale,
      height: n.height * fitScale,
      centerX: n.centerX * fitScale + xShift,
      centerY: n.centerY * fitScale + yShift,
    }));

    const nodeMap = new Map<string, PositionedNode>();
    positionedNodes.forEach((n) => nodeMap.set(n.node.id, n));

    // Group children by parent to create clean orthogonal connectors
    const parentToChildrenMap = new Map<string, { parent: PositionedNode; children: PositionedNode[] }>();

    parentChildPairs.forEach(({ parent: origP, child: origC }) => {
      const parent = nodeMap.get(origP.node.id)!;
      const child = nodeMap.get(origC.node.id)!;
      if (!parentToChildrenMap.has(parent.node.id)) {
        parentToChildrenMap.set(parent.node.id, { parent, children: [] });
      }
      parentToChildrenMap.get(parent.node.id)!.children.push(child);
    });

    const linesList: ConnectorLine[] = [];

    parentToChildrenMap.forEach(({ parent, children }) => {
      if (!children || children.length === 0) return;

      const parentBottomY = parent.y + parent.height;

      // Vertical stacked children connector (group column trunk line + child drop lines)
      const areVerticalChildren = children.every(
        (c) => Math.abs(c.centerX - parent.centerX) < 4
      );

      if (areVerticalChildren) {
        children.forEach((child) => {
          linesList.push({
            id: `${parent.node.id}-${child.node.id}`,
            path: `M ${parent.centerX} ${parentBottomY} L ${child.centerX} ${child.y}`,
            edgeLabel: child.edgeLabel,
            labelX: child.centerX,
            labelY: (parentBottomY + child.y) / 2 - 6,
          });
        });
      } else if (children.length === 1) {
        const child = children[0];
        linesList.push({
          id: `${parent.node.id}-${child.node.id}`,
          path: `M ${parent.centerX} ${parentBottomY} L ${child.centerX} ${child.y}`,
          edgeLabel: child.edgeLabel,
          labelX: child.centerX,
          labelY: (parentBottomY + child.y) / 2 - 6,
        });
      } else {
        // Horizontal top-level branch bar ONLY from first to last child
        const sortedChildren = [...children].sort((a, b) => a.centerX - b.centerX);
        const firstChild = sortedChildren[0];
        const lastChild = sortedChildren[sortedChildren.length - 1];

        const childTopY = firstChild.y;
        const midY = parentBottomY + (childTopY - parentBottomY) / 2;

        const pathParts = [
          `M ${parent.centerX} ${parentBottomY} L ${parent.centerX} ${midY}`,
          `M ${firstChild.centerX} ${midY} L ${lastChild.centerX} ${midY}`,
        ];

        sortedChildren.forEach((child) => {
          pathParts.push(`M ${child.centerX} ${midY} L ${child.centerX} ${child.y}`);
        });

        linesList.push({
          id: `group-connector-${parent.node.id}`,
          path: pathParts.join(' '),
        });

        sortedChildren.forEach((child) => {
          if (child.edgeLabel) {
            linesList.push({
              id: `label-${parent.node.id}-${child.node.id}`,
              path: '',
              edgeLabel: child.edgeLabel,
              labelX: child.centerX,
              labelY: midY - 6,
            });
          }
        });
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log({
        containerWidth,
        naturalTreeWidth: Math.round(naturalTreeWidth),
        fitScale: fitScale.toFixed(2),
        totalHeight: Math.round(canvasHeight),
      });
    }

    return {
      positionedNodes,
      lines: linesList,
      totalWidth: Math.round(canvasWidth),
      totalHeight: Math.round(canvasHeight),
      fitScale,
    };
  }, [sanitizedRoot, containerWidth]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full min-w-0 overflow-x-hidden overflow-y-visible pb-1 relative"
    >
      <div
        className="relative mx-auto transition-all duration-200"
        style={{
          width: '100%',
          maxWidth: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }}
      >
        {/* SVG Connector Lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        >
          {lines.map((line) =>
            line.path ? (
              <path
                key={line.id}
                d={line.path}
                fill="none"
                stroke="currentColor"
                className="text-border-subtle-strong opacity-75"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null
          )}
        </svg>

        {/* Edge Labels */}
        {lines.map(
          (line) =>
            line.edgeLabel &&
            line.labelX !== undefined &&
            line.labelY !== undefined && (
              <div
                key={`label-${line.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{
                  left: `${line.labelX}px`,
                  top: `${line.labelY}px`,
                }}
              >
                <span className="px-1.5 py-0.5 rounded bg-[var(--case-surface)] border border-border-subtle text-[8px] font-mono text-foreground shadow-xs font-semibold">
                  {line.edgeLabel}
                </span>
              </div>
            )
        )}

        {/* Nodes */}
        {positionedNodes.map((pNode) => (
          <div
            key={pNode.node.id}
            className="absolute transition-all duration-200"
            style={{
              left: `${pNode.x}px`,
              top: `${pNode.y}px`,
            }}
          >
            <IANodeCard
              node={pNode.node}
              width={pNode.width}
              height={pNode.height}
              compact={fitScale < 0.85}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
