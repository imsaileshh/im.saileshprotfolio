'use client';

import { useMemo } from 'react';
import { ProjectTimelineData, TimelineItem, TimelinePhase } from '@/types/case-study-builder';
import { Layers } from 'lucide-react';

interface ProjectTimelineBlockProps {
  data?: ProjectTimelineData;
}

interface PositionedTimelineItem extends TimelineItem {
  row: number;
  startCol: number;
  endCol: number;
  colSpan: number;
  phase?: TimelinePhase;
}

export function ProjectTimelineBlock({ data }: ProjectTimelineBlockProps) {
  const {
    title = 'Project Timeline & Execution Roadmap',
    description = 'Weekly breakdown of project phases, activities, and milestones across a 12-week schedule.',
    totalUnits = 12,
    unitLabel = 'Week',
    phases = [],
    items = [],
  } = data || {};

  const sanitizedTotalUnits = Math.max(1, Number(totalUnits) || 12);
  const unitsArray = useMemo(
    () => Array.from({ length: sanitizedTotalUnits }, (_, i) => i + 1),
    [sanitizedTotalUnits]
  );

  // ── Automatic Conflict-Free Interval Positioning Algorithm ──
  // 1. Derives start column & column span accurately from actual week data.
  // 2. Preserves phase staircase progression while mathematically guaranteeing ZERO row collisions.
  // 3. Dynamically expands rows to accommodate overlapping activities without card collisions.
  const { positionedItems, maxRows } = useMemo(() => {
    if (!items || items.length === 0) return { positionedItems: [], maxRows: 1 };

    // Sanitize item bounds
    const normalizedItems = items.map((it) => {
      const rawStart = Number(it.start) || 1;
      const rawEnd = Number(it.end) || rawStart;
      const s = Math.min(rawStart, rawEnd);
      const e = Math.max(rawStart, rawEnd);
      const startCol = Math.max(1, Math.min(s, sanitizedTotalUnits));
      const endCol = Math.max(startCol, Math.min(e, sanitizedTotalUnits));
      const colSpan = Math.max(1, endCol - startCol + 1);

      // Find matching phase
      const phase = phases.find(
        (p) => p.id === it.phaseId || (startCol >= p.start && startCol <= p.end)
      );

      return {
        ...it,
        startCol,
        endCol,
        colSpan,
        phase,
      };
    });

    // Phase order map for natural chronological grouping
    const phaseOrderMap = new Map<string, number>();
    phases.forEach((p, idx) => phaseOrderMap.set(p.id, idx));

    normalizedItems.sort((a, b) => {
      const pA = a.phase?.id ? (phaseOrderMap.get(a.phase.id) ?? 999) : 999;
      const pB = b.phase?.id ? (phaseOrderMap.get(b.phase.id) ?? 999) : 999;
      if (pA !== pB) return pA - pB;
      if (a.startCol !== b.startCol) return a.startCol - b.startCol;
      return b.colSpan - a.colSpan;
    });

    // Row occupancy intervals: row -> Array<{ start: number; end: number }>
    const rowOccupancy: Array<Array<{ start: number; end: number }>> = [];
    const positioned: PositionedTimelineItem[] = [];

    // Group items by phase for waterfall visual progression
    const itemsByPhase = new Map<string, typeof normalizedItems>();
    normalizedItems.forEach((it) => {
      const key = it.phase?.id || 'unassigned';
      if (!itemsByPhase.has(key)) itemsByPhase.set(key, []);
      itemsByPhase.get(key)!.push(it);
    });

    const doesRowOverlap = (r: number, s: number, e: number) => {
      if (!rowOccupancy[r]) return false;
      return rowOccupancy[r].some((placed) => Math.max(s, placed.start) <= Math.min(e, placed.end));
    };

    itemsByPhase.forEach((phaseItems) => {
      phaseItems.forEach((it, phaseIdx) => {
        // Preferred staircase waterfall row (0-indexed) resets per phase
        const preferredRow = phaseIdx;

        let chosenRow = preferredRow;
        // If preferred row already has an item during this week interval, find the lowest collision-free row
        if (doesRowOverlap(chosenRow, it.startCol, it.endCol)) {
          chosenRow = 0;
          while (doesRowOverlap(chosenRow, it.startCol, it.endCol)) {
            chosenRow++;
          }
        }

        if (!rowOccupancy[chosenRow]) {
          rowOccupancy[chosenRow] = [];
        }
        rowOccupancy[chosenRow].push({ start: it.startCol, end: it.endCol });

        positioned.push({
          ...it,
          row: chosenRow + 1, // CSS Grid is 1-indexed
        });
      });
    });

    const calculatedMaxRows = Math.max(...positioned.map((it) => it.row), 1);

    return { positionedItems: positioned, maxRows: calculatedMaxRows };
  }, [items, phases, sanitizedTotalUnits]);

  if (!data || (!items.length && !phases.length)) return null;

  // Minimum column width per unit (ensures cards maintain readable width on narrow viewports while expanding to 100% on desktop)
  const minCanvasWidth = Math.max(640, sanitizedTotalUnits * 76);

  return (
    <div className="w-full max-w-[1080px] min-w-0 mx-auto space-y-6 scroll-mt-24 pt-2 box-border">
      {/* ── 01. Section Header ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-accent tracking-wider">09</span>
          <span className="text-muted/60">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-medium">
            {title}
          </span>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* ── 02. Main Timeline Container (100% Fit, Dynamic CSS Grid) ── */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-border-subtle bg-[var(--case-card)] p-4 sm:p-6 lg:p-7 shadow-sm relative box-border">

        {/* ── DESKTOP & TABLET VISUAL TIMELINE CANVAS (md:block) ── */}
        <div className="hidden md:block w-full max-w-full min-w-0 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent">
          <div
            className="w-full min-w-0 space-y-6 relative"
            style={{
              minWidth: `max(100%, ${minCanvasWidth}px)`,
            }}
          >

            {/* ── A. DYNAMIC PHASE BARS AT THE TOP (100% Width Fit) ── */}
            {phases.length > 0 && (
              <div
                className="grid gap-x-2 sm:gap-x-3 items-center w-full min-w-0"
                style={{
                  gridTemplateColumns: `repeat(${sanitizedTotalUnits}, minmax(0, 1fr))`,
                }}
              >
                {phases.map((phase, pIdx) => {
                  const startCol = Math.max(1, Math.min(phase.start, sanitizedTotalUnits));
                  const endCol = Math.max(startCol, Math.min(phase.end, sanitizedTotalUnits));
                  const colSpan = Math.max(1, endCol - startCol + 1);
                  const isPrimary = pIdx === 0;

                  return (
                    <div
                      key={phase.id || pIdx}
                      className={`h-9 sm:h-10 rounded-xl px-2.5 sm:px-3.5 py-1.5 flex items-center justify-between border shadow-xs font-display font-semibold transition-all min-w-0 ${
                        isPrimary
                          ? 'bg-accent/15 border-accent/40 text-foreground'
                          : 'bg-[var(--case-surface)] border-border-subtle text-foreground'
                      }`}
                      style={{
                        gridColumnStart: startCol,
                        gridColumnEnd: `span ${colSpan}`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1 truncate">
                        <Layers size={14} className={isPrimary ? 'text-accent shrink-0' : 'text-muted shrink-0'} />
                        <span className="truncate text-[12px] sm:text-[13px] font-semibold tracking-wide">
                          {phase.title}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] sm:text-[10px] font-medium text-muted shrink-0 whitespace-nowrap bg-[var(--panel)]/80 px-1.5 py-0.5 rounded border border-border-subtle/50">
                        {unitLabel} {phase.start}–{phase.end}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── B. TASK CANVAS WITH DYNAMIC CONFLICT-FREE GRID ── */}
            <div className="relative py-2 w-full min-w-0">
              {/* Background Vertical Grid Lines Layer (Shared Across All Columns) */}
              <div
                className="absolute inset-0 grid gap-x-2 sm:gap-x-3 pointer-events-none z-0 w-full min-w-0"
                style={{
                  gridTemplateColumns: `repeat(${sanitizedTotalUnits}, minmax(0, 1fr))`,
                }}
              >
                {unitsArray.map((u) => (
                  <div
                    key={u}
                    className="border-l border-border-subtle/40 last:border-r last:border-border-subtle/40 h-full"
                  />
                ))}
              </div>

              {/* Task Cards Grid (Auto-height, Zero Overlap, Natural Wrap) */}
              <div
                className="grid gap-x-2 sm:gap-x-3 gap-y-3 sm:gap-y-3.5 relative z-10 w-full min-w-0"
                style={{
                  gridTemplateColumns: `repeat(${sanitizedTotalUnits}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${maxRows}, minmax(64px, auto))`,
                }}
              >
                {positionedItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl border border-border-subtle hover:border-border-subtle-strong bg-[var(--case-surface)] hover:bg-[var(--case-surface-hover)] p-3 transition-all shadow-xs flex flex-col justify-between min-h-[64px] h-auto min-w-0"
                    style={{
                      gridColumnStart: item.startCol,
                      gridColumnEnd: `span ${item.colSpan}`,
                      gridRowStart: item.row,
                    }}
                  >
                    <div className="flex flex-col gap-1 w-full min-w-0">
                      <div className="flex items-start justify-between gap-2 w-full min-w-0">
                        <h4 className="text-[13px] sm:text-[13.5px] font-semibold text-foreground font-display leading-[1.4] whitespace-normal break-words">
                          {item.title}
                        </h4>
                        <span className="font-mono text-[9.5px] sm:text-[10px] font-medium text-muted shrink-0 ml-1 leading-none px-1.5 py-0.5 rounded bg-[var(--panel)]/80 border border-border-subtle/60 whitespace-nowrap">
                          {item.startCol === item.endCol
                            ? `W${item.startCol}`
                            : `W${item.startCol}–W${item.endCol}`}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] sm:text-[11.5px] text-muted leading-[1.45] font-normal whitespace-normal break-words mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── C. DYNAMIC WEEK LABELS AT THE BOTTOM ── */}
            <div
              className="grid gap-x-2 sm:gap-x-3 pt-3 border-t border-border-subtle/80 w-full min-w-0"
              style={{
                gridTemplateColumns: `repeat(${sanitizedTotalUnits}, minmax(0, 1fr))`,
              }}
            >
              {unitsArray.map((u) => (
                <div key={u} className="text-center min-w-0">
                  <span className="block font-mono text-[11px] sm:text-[12px] font-semibold text-foreground">
                    W{u}
                  </span>
                  <span className="block font-mono text-[8px] sm:text-[9px] text-muted uppercase tracking-wider mt-0.5 font-medium truncate">
                    {unitLabel}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── MOBILE VERTICAL TIMELINE SEQUENCE (<768px) ── */}
        <div className="block md:hidden space-y-6">
          {phases.length > 0 ? (
            phases.map((phase, pIdx) => {
              const phaseItems = items.filter(
                (it) => it.phaseId === phase.id || (!it.phaseId && it.start >= phase.start && it.start <= phase.end)
              );

              phaseItems.sort((a, b) => a.start - b.start);

              return (
                <div key={phase.id || pIdx} className="space-y-3">
                  {/* Phase Header */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-accent/30 bg-accent/10">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-accent" />
                      <span className="text-[13px] sm:text-[14px] font-semibold text-foreground font-display">
                        {phase.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-accent font-semibold px-2 py-0.5 rounded bg-accent/15 border border-accent/20">
                      {unitLabel} {phase.start}–{phase.end}
                    </span>
                  </div>

                  {/* Vertical Task Sequence */}
                  <div className="pl-3.5 border-l-2 border-border-subtle/80 space-y-2.5">
                    {phaseItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-[var(--case-surface)] flex flex-col gap-1.5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[13px] sm:text-[13.5px] font-semibold text-foreground font-display leading-[1.4] break-words">
                            {item.title}
                          </h4>
                          <span className="font-mono text-[10px] text-muted bg-[var(--panel)] px-2 py-0.5 rounded border border-border-subtle shrink-0">
                            {item.start === item.end
                              ? `${unitLabel} ${item.start}`
                              : `${unitLabel} ${item.start}–${item.end}`}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[11.5px] text-muted leading-[1.45] break-words">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* If no phases exist, show chronologically */
            <div className="pl-3.5 border-l-2 border-border-subtle/80 space-y-2.5">
              {[...items]
                .sort((a, b) => a.start - b.start)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-[var(--case-surface)] flex flex-col gap-1.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[13px] sm:text-[13.5px] font-semibold text-foreground font-display leading-[1.4] break-words">
                        {item.title}
                      </h4>
                      <span className="font-mono text-[10px] text-muted bg-[var(--panel)] px-2 py-0.5 rounded border border-border-subtle shrink-0">
                        {item.start === item.end
                          ? `${unitLabel} ${item.start}`
                          : `${unitLabel} ${item.start}–${item.end}`}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11.5px] text-muted leading-[1.45] break-words">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
