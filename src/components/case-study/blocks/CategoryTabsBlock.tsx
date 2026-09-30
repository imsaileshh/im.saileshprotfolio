'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { ContentBlockItem, CustomBlockRenderer } from '../CustomBlockRenderer';
import { CategoryTabItem, CategoryTabsBlockData } from '@/types/case-study-builder';

interface CategoryTabsBlockProps {
  block: ContentBlockItem;
}

export function CategoryTabsBlock({ block }: CategoryTabsBlockProps) {
  const data: CategoryTabsBlockData = block.categoryTabsData || {
    title: block.headingText,
    description: block.content,
    categories: (block as any).categories || [],
  };

  const rawCategories: CategoryTabItem[] = data.categories || [];
  const categories = rawCategories.filter((c) => !c.hidden);

  const [activeTabId, setActiveTabId] = useState<string>(categories[0]?.id || '');
  const tabListRef = useRef<HTMLDivElement>(null);

  // Sync activeTabId if categories change or initial mount
  useEffect(() => {
    if (categories.length > 0 && (!activeTabId || !categories.some((c) => c.id === activeTabId))) {
      setActiveTabId(categories[0].id);
    }
  }, [categories, activeTabId]);

  if (categories.length === 0) return null;

  const activeIndex = categories.findIndex((c) => c.id === activeTabId);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeCategory = categories[safeActiveIndex];

  const handlePrev = () => {
    const prevIdx = (safeActiveIndex - 1 + categories.length) % categories.length;
    setActiveTabId(categories[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (safeActiveIndex + 1) % categories.length;
    setActiveTabId(categories[nextIdx].id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % categories.length;
      setActiveTabId(categories[nextIdx].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + categories.length) % categories.length;
      setActiveTabId(categories[prevIdx].id);
    }
  };

  const formattedCounter = `${String(safeActiveIndex + 1).padStart(2, '0')} / ${String(categories.length).padStart(2, '0')}`;

  return (
    <div className="category-tabs-block-root my-10 space-y-6 w-full">
      {/* Block Header (Title & Description) */}
      {(data.title || data.description) && (
        <div className="space-y-2 mb-4">
          {data.title && (
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground tracking-tight">
              {data.title}
            </h3>
          )}
          {data.description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal max-w-2xl">
              {data.description}
            </p>
          )}
        </div>
      )}

      {/* ── Category Cards Navigation Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/60 pb-4">
        {/* Horizontal Category Tab Cards Container */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Category Navigation"
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth max-w-full"
        >
          {categories.map((cat, idx) => {
            const isSelected = cat.id === activeTabId;
            const tabNumber = cat.number || String(idx + 1).padStart(2, '0');
            const tabId = `tab-${cat.id}`;
            const panelId = `panel-${cat.id}`;

            return (
              <button
                key={cat.id || idx}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTabId(cat.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 text-left transition-all duration-150 font-sans cursor-pointer min-w-[170px] sm:min-w-[200px] max-w-[240px] ${
                  isSelected
                    ? 'bg-[var(--card)] border-accent text-foreground shadow-sm ring-1 ring-accent/40 font-semibold'
                    : 'bg-[var(--panel)] border-border-subtle/80 text-muted hover:text-foreground hover:border-border-subtle hover:bg-border-subtle/20'
                }`}
              >
                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-accent' : 'text-muted/60'}`}>
                  {tabNumber}
                </span>
                <span className="text-xs sm:text-[13px] tracking-tight truncate leading-tight flex-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Counter & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
          <span className="font-mono text-xs text-muted/80 tracking-widest font-medium">
            {formattedCounter}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Category"
              className="rounded-lg border border-border-subtle/80 bg-[var(--card)] p-1.5 text-muted hover:text-foreground hover:bg-border-subtle/20 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Category"
              className="rounded-lg border border-border-subtle/80 bg-[var(--card)] p-1.5 text-muted hover:text-foreground hover:bg-border-subtle/20 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Category Content Panel ── */}
      {activeCategory && (
        <div
          key={activeCategory.id}
          id={`panel-${activeCategory.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory.id}`}
          className="rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-5 sm:p-8 space-y-6 shadow-sm transition-all duration-200 animate-in fade-in-50"
        >
          {/* Category Top Banner & Metric */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border-subtle/50 pb-5">
            <div className="space-y-1.5 flex-1">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase">
                  {activeCategory.number || String(safeActiveIndex + 1).padStart(2, '0')}
                </span>
                {activeCategory.eyebrow && (
                  <>
                    <span className="text-muted/40 font-mono text-xs">&bull;</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
                      {activeCategory.eyebrow}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              {activeCategory.title && (
                <h4 className="text-lg sm:text-xl lg:text-2xl font-display font-semibold text-foreground tracking-tight leading-snug">
                  {activeCategory.title}
                </h4>
              )}
            </div>

            {/* Outcome Metric Badge (Optional) */}
            {activeCategory.metric?.value && (
              <div className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-left">
                <TrendingUp size={16} className="text-accent" />
                <div>
                  <p className="font-mono text-base sm:text-lg font-bold text-accent leading-none">
                    {activeCategory.metric.value}
                  </p>
                  {activeCategory.metric.label && (
                    <p className="text-[10px] font-mono text-muted/90 uppercase tracking-wider mt-0.5">
                      {activeCategory.metric.label}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Render Nested Content Blocks */}
          {activeCategory.blocks && activeCategory.blocks.length > 0 ? (
            <div className="space-y-6 pt-2">
              {activeCategory.blocks.map((nestedBlock: ContentBlockItem, nIdx: number) => (
                <CustomBlockRenderer key={nestedBlock.id || nIdx} block={nestedBlock} />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted font-normal">
              No content configured for this category yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
