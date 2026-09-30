'use client';

import { useMemo } from 'react';
import { ProjectTimelineData, TimelineItem } from '@/types/case-study-builder';
import { Layers } from 'lucide-react';

interface ProjectTimelineBlockProps {
  data?: ProjectTimelineData;
}

interface PositionedTimelineItem extends TimelineItem {
  row: number;
  startCol: number;
  colSpan: number;
}

export function ProjectTimelineBlock({ data }: ProjectTimelineBlockProps) {
  if (!data || (!data.items?.length && !data.phases?.length)) return null;

  const {
    title = 'Project Timeline & Execution Roadmap',
    description = 'Weekly breakdown of project phases, activities, and milestones across a 12-week schedule.',
    totalUnits = 12,
    unitLabel = 'Week',
    phases = [],
    items = [],
  } = data;

  const unitsArray = Array.from({ length: totalUnits }, (_, i) => i + 1);

  // ── Step-by-Step Staircase Positioning Algorithm ──
  // Each phase generates a descending staircase (Row 1 -> Row 2 -> Row 3...).
  // When a new Phase starts, the staircase resets near Row 1.
  const { positionedItems, maxRows } = useMemo(() => {
    if (!items || items.length === 0) return { positionedItems: [], maxRows: 1 };

    const sortedItems = [...items].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (a.end - a.start) - (b.end - b.start);
    });

    const positioned: PositionedTimelineItem[] = [];

    if (phases && phases.length > 0) {
      const processedIds = new Set<string>();

      phases.forEach((phase) => {
        // Find items belonging to this phase (by phaseId or week boundary overlap)
        const phaseItems = sortedItems.filter((it) => {
          if (processedIds.has(it.id)) return false;
          if (it.phaseId) return it.phaseId === phase.id;
          return it.start >= phase.start && it.start <= phase.end;
        });

        phaseItems.sort((a, b) => a.start - b.start);

        phaseItems.forEach((it, idx) => {
          processedIds.add(it.id);
          let startCol = Math.max(1, Math.min(it.start, totalUnits));
          const endCol = Math.max(startCol, Math.min(it.end, totalUnits));
          let colSpan = Math.max(1, endCol - startCol + 1);

          // If duration is 1 week on its dedicated staircase row:
          // - If before totalUnits, expand colSpan to 2 (span startCol -> startCol+1)
          // - If at totalUnits (Week 12), shift startCol left by 1 (span 11 -> 12) so right edge aligns perfectly with container right boundary!
          if (colSpan === 1) {
            if (startCol < totalUnits) {
              colSpan = 2;
            } else if (startCol > 1) {
              startCol = startCol - 1;
              colSpan = 2;
            }
          }

          // Staircase row inside phase (Row 1, Row 2, Row 3...)
          const row = idx + 1;

          positioned.push({
            ...it,
            row,
            startCol,
            colSpan,
          });
        });
      });

      // Handle unassigned items
      const unassigned = sortedItems.filter((it) => !processedIds.has(it.id));
      unassigned.forEach((it, idx) => {
        let startCol = Math.max(1, Math.min(it.start, totalUnits));
        const endCol = Math.max(startCol, Math.min(it.end, totalUnits));
        let colSpan = Math.max(1, endCol - startCol + 1);
        if (colSpan === 1) {
          if (startCol < totalUnits) {
            colSpan = 2;
          } else if (startCol > 1) {
            startCol = startCol - 1;
            colSpan = 2;
          }
        }
        positioned.push({
          ...it,
          row: idx + 1,
          startCol,
          colSpan,
        });
      });
    } else {
      // Fallback: staircase with 4-item resets
      sortedItems.forEach((it, idx) => {
        let startCol = Math.max(1, Math.min(it.start, totalUnits));
        const endCol = Math.max(startCol, Math.min(it.end, totalUnits));
        let colSpan = Math.max(1, endCol - startCol + 1);
        if (colSpan === 1) {
          if (startCol < totalUnits) {
            colSpan = 2;
          } else if (startCol > 1) {
            startCol = startCol - 1;
            colSpan = 2;
          }
        }
        positioned.push({
          ...it,
          row: (idx % 4) + 1,
          startCol,
          colSpan,
        });
      });
    }

    const maxRows = Math.max(...positioned.map((it) => it.row), 1);

    return { positionedItems: positioned, maxRows };
  }, [items, phases, totalUnits]);

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

      {/* ── 02. Main Timeline Container (100% Fit, Shared 12-Column Grid) ── */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-border-subtle bg-[var(--case-card)] p-4 sm:p-6 lg:p-7 shadow-sm relative overflow-hidden box-border">

        {/* ── DESKTOP VISUAL STAIRCASE TIMELINE CANVAS (md:block) ── */}
        <div className="hidden md:block w-full max-w-full min-w-0">
          <div className="w-full max-w-full min-w-0 space-y-6 relative">

            {/* ── A. SHARED 12-COLUMN PHASE BARS AT THE TOP ── */}
            {phases.length > 0 && (
              <div className="grid grid-cols-12 gap-x-2 sm:gap-x-3 items-center w-full min-w-0">
                {phases.map((phase, pIdx) => {
                  const startCol = Math.max(1, Math.min(phase.start, totalUnits));
                  const endCol = Math.max(startCol, Math.min(phase.end, totalUnits));
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
                        <Layers size={13} className={isPrimary ? 'text-accent shrink-0' : 'text-muted shrink-0'} />
                        <span className="truncate text-[12px] sm:text-[12.5px] font-semibold tracking-wide">{phase.title}</span>
                      </div>
                      <span className="font-mono text-[8.5px] sm:text-[9px] font-medium text-muted shrink-0 whitespace-nowrap bg-background/50 px-1.5 py-0.5 rounded border border-border-subtle/50">
                        W{phase.start}–W{phase.end}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── B. STAIRCASE TASK CANVAS WITH SHARED 12-COLUMN GRID ── */}
            <div className="relative py-3 min-h-[280px] sm:min-h-[320px] w-full min-w-0">
              {/* Background Vertical Grid Lines Layer (Shared 12 Columns) */}
              <div className="absolute inset-0 grid grid-cols-12 gap-x-2 sm:gap-x-3 pointer-events-none z-0 w-full min-w-0">
                {unitsArray.map((u) => (
                  <div
                    key={u}
                    className="border-l border-border-subtle/50 last:border-r last:border-border-subtle/50 h-full"
                  />
                ))}
              </div>

              {/* Task Staircase Grid (Shared 12 Columns) */}
              <div
                className="grid grid-cols-12 gap-x-2 sm:gap-x-3 gap-y-3.5 sm:gap-y-4 relative z-10 w-full min-w-0"
                style={{
                  gridTemplateRows: `repeat(${maxRows}, minmax(54px, auto))`,
                }}
              >
                {positionedItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl border border-border-subtle hover:border-border-subtle-strong bg-[var(--case-surface)] hover:bg-[var(--case-surface-hover)] px-2.5 py-2 sm:px-3 sm:py-2.5 transition-all shadow-xs flex flex-col justify-center min-h-[54px] sm:min-h-[58px] overflow-hidden min-w-0"
                    style={{
                      gridColumnStart: item.startCol,
                      gridColumnEnd: `span ${item.colSpan}`,
                      gridRowStart: item.row,
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 w-full min-w-0">
                      <h4 className="text-[11px] sm:text-[11.5px] font-[550] sm:font-semibold text-foreground font-display leading-[1.3] whitespace-normal">
                        {item.title}
                      </h4>
                      <span className="font-mono text-[8.5px] sm:text-[9px] font-medium text-muted shrink-0 ml-1 leading-tight">
                        W{item.start === item.end ? item.start : `${item.start}–${item.end}`}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[8.5px] sm:text-[9px] text-muted leading-tight font-normal mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── C. WEEK LABELS AT THE BOTTOM (Shared 12 Columns) ── */}
            <div className="grid grid-cols-12 gap-x-2 sm:gap-x-3 pt-3 border-t border-border-subtle/80 w-full min-w-0">
              {unitsArray.map((u) => (
                <div key={u} className="text-center min-w-0">
                  <span className="block font-mono text-[10px] sm:text-[11px] font-semibold text-foreground">
                    W{u}
                  </span>
                  <span className="block font-mono text-[7.5px] sm:text-[8px] text-muted uppercase tracking-wider mt-0.5 font-medium truncate">
                    {unitLabel}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── MOBILE VERTICAL TIMELINE SEQUENCE (<768px) ── */}
        <div className="block md:hidden space-y-6">
          {phases.map((phase, pIdx) => {
            const phaseItems = items.filter(
              (it) => (it.phaseId === phase.id || !it.phaseId) && it.start >= phase.start && it.start <= phase.end
            );

            const displayItems = phaseItems.length > 0
              ? phaseItems
              : items.filter((it) => it.start >= phase.start && it.start <= phase.end);

            return (
              <div key={phase.id || pIdx} className="space-y-3">
                {/* Phase Header */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-accent/30 bg-accent/10">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-accent" />
                    <span className="text-xs sm:text-sm font-semibold text-foreground font-display">{phase.title}</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-accent font-semibold">
                    {unitLabel} {phase.start}–{phase.end}
                  </span>
                </div>

                {/* Vertical Task Sequence */}
                <div className="pl-3 border-l-2 border-border-subtle space-y-2.5">
                  {(displayItems.length > 0 ? displayItems : items).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-border-subtle bg-[var(--case-surface)] flex flex-col gap-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground font-display leading-snug">{item.title}</h4>
                        <span className="font-mono text-[10px] text-muted bg-[var(--panel)] px-2 py-0.5 rounded border border-border-subtle shrink-0">
                          {item.start === item.end ? `${unitLabel} ${item.start}` : `${unitLabel} ${item.start}–${item.end}`}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted leading-relaxed mt-0.5">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
