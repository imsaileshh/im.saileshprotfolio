'use client';

import React, { useRef, useEffect } from 'react';

export interface CaseStudySidebarSection {
  id?: string;
  title: string;
  slug?: string;
  order?: number;
  metadata?: any;
  content?: string | null;
  images?: any[];
}

/**
 * Generates a stable, unique, slug-based section id with "section-" prefix.
 * e.g., "01 Executive Overview" -> "section-executive-overview"
 *       "Information Architecture" -> "section-information-architecture"
 */
export function getCaseStudySectionId(
  section: { slug?: string; id?: string; title?: string },
  idx: number
): string {
  let raw = (section.slug && section.slug.trim()) || (section.title && section.title.trim()) || '';
  // Strip leading numbers like "01 ", "01 - ", "1. ", "06 "
  raw = raw.replace(/^\d+[\s\.\-]+/, '').trim();

  let safe = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!safe) {
    safe = section.id ? `section-${section.id}` : `section-${idx + 1}`;
  } else if (!safe.startsWith('section-')) {
    safe = `section-${safe}`;
  }

  return safe;
}

/**
 * Filters out hidden sections so rendered content and TOC always match 1-to-1.
 */
export function getVisibleCaseStudySections<T extends { metadata?: any; content?: string | null; images?: any[]; title?: string }>(
  sections: T[]
): T[] {
  return (sections || []).filter((section) => {
    const meta = (section.metadata as Record<string, unknown>) || {};
    if (Boolean(meta?.hidden)) return false;
    const hasBlocks = Array.isArray(meta?.blocks) && meta.blocks.length > 0;
    const hasMedia = (section.images && section.images.length > 0) || (Array.isArray(meta?.media) && meta.media.length > 0);
    const hasContent = Boolean(section.content?.trim());
    const hasStats = Array.isArray(meta?.stats) && meta.stats.length > 0;
    const hasSpecialData = Boolean(
      meta?.userFlow ||
      meta?.informationArchitecture ||
      meta?.empathyMap ||
      meta?.persona ||
      meta?.journeyMap ||
      meta?.competitiveAnalysis ||
      meta?.designDecision ||
      meta?.metrics ||
      meta?.designProcess ||
      meta?.designSystem ||
      meta?.gallery
    );
    return hasBlocks || hasMedia || hasContent || hasStats || hasSpecialData;
  });
}

/**
 * Finds the actual scroll container owning vertical scrolling.
 * Checks for modal scroller (#case-study-modal-scroll),
 * root main panel (#scroll-container / .main-panel),
 * any scrollable parent element, or window/document fallback.
 */
export function findCaseStudyScrollContainer(startEl?: HTMLElement | null): HTMLElement | null {
  if (typeof window === 'undefined') return null;

  // 1. Direct check if inside modal
  const modalScroll = startEl?.closest('#case-study-modal-scroll') || document.getElementById('case-study-modal-scroll');
  if (modalScroll && modalScroll instanceof HTMLElement) {
    const style = window.getComputedStyle(modalScroll);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return modalScroll;
    }
  }

  // 2. Check if inside #scroll-container / .main-panel
  const mainPanel =
    startEl?.closest('#scroll-container') ||
    startEl?.closest('.main-panel') ||
    document.getElementById('scroll-container') ||
    document.querySelector('.main-panel');

  if (mainPanel && mainPanel instanceof HTMLElement) {
    const style = window.getComputedStyle(mainPanel);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && mainPanel.clientHeight > 0) {
      return mainPanel;
    }
  }

  // 3. Check any parent of startEl with overflowY === auto/scroll and real height
  let parent = startEl?.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }

  // 4. Default to document.scrollingElement or document.documentElement
  const scrollingEl = document.scrollingElement || document.documentElement || document.body;
  return scrollingEl instanceof HTMLElement ? scrollingEl : null;
}

/**
 * Robust scroll navigation function shared by both mobile TOC and desktop sidebar.
 * Accurately calculates target position relative to the owning scroll container
 * and applies sticky header + TOC height offset so headings are never covered.
 */
export function scrollToCaseStudySection(
  targetId: string,
  containerEl?: HTMLElement | null
) {
  if (typeof window === 'undefined') return;

  const target = document.getElementById(targetId) || document.getElementById(`section-${targetId}`);
  if (!target) return;

  const container = containerEl || findCaseStudyScrollContainer(target);
  if (!container) return;

  const isWindowScroll =
    container === document.documentElement ||
    container === document.body ||
    container === document.scrollingElement;

  // Determine dynamic sticky offset
  const tocEl = document.querySelector('[data-case-study-mobile-toc]');
  const tocHeight = tocEl ? tocEl.getBoundingClientRect().height : 44;

  let stickyOffset = 110;
  if (container.id === 'case-study-modal-scroll') {
    // In modal, modal header is outside scroller; TOC is sticky top-0
    stickyOffset = tocHeight + 16;
  } else {
    // On page, header (~60px) + TOC (~44px) + breathing space (~12px) = ~116px
    const headerEl = document.querySelector('[data-case-study-header]') || document.querySelector('header');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 60;
    stickyOffset = headerHeight + tocHeight + 12;
  }

  if (isWindowScroll) {
    const targetRect = target.getBoundingClientRect();
    const targetTop = window.scrollY + targetRect.top - stickyOffset;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  } else {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop =
      container.scrollTop +
      targetRect.top -
      containerRect.top -
      stickyOffset;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }

  // Update URL hash without navigation or page reload
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', `#${target.id}`);
  }
}

interface CaseStudySidebarProps {
  sections: CaseStudySidebarSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
  title?: string;
}

/**
 * CaseStudySidebar
 * Reusable desktop navigation sidebar sharing the exact same section IDs,
 * numbering, active state, and scroll navigation as mobile.
 */
export function CaseStudySidebar({
  sections,
  activeSection,
  onSectionClick,
  className = '',
  title = 'Case Study',
}: CaseStudySidebarProps) {
  if (!sections || sections.length === 0) return null;

  const widthClass = className.includes('w-') ? '' : 'w-64';

  return (
    <aside className={`shrink-0 flex flex-col pointer-events-auto select-none ${widthClass} ${className}`}>
      <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted">{title}</h3>
      <nav className="flex flex-col gap-1">
        {sections.map((section, idx) => {
          const safeId = getCaseStudySectionId(section, idx);
          const isActive = activeSection === safeId;
          const cleanTitle = (section.title || '').replace(/^\d+[\s\.\-]+/, '').trim() || section.title;

          return (
            <button
              key={section.id || idx}
              type="button"
              data-section-id={safeId}
              onClick={() => onSectionClick(safeId)}
              className={`group flex items-start text-left gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ease-out cursor-pointer pointer-events-auto w-full ${
                isActive
                  ? 'bg-foreground/5 font-semibold text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span
                className={`font-mono text-xs transition-colors duration-150 ease-out shrink-0 pt-0.5 ${
                  isActive ? 'text-accent' : 'text-muted/60 group-hover:text-muted'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="leading-snug">{cleanTitle}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * CaseStudyMobileNav
 * Compact horizontal navigation for small screens / mobile viewports
 * that preserves the exact horizontal pill UI, auto-centers active item,
 * and scrolls smoothly to target sections.
 */
export function CaseStudyMobileNav({
  sections,
  activeSection,
  onSectionClick,
  className = '',
  stickyTopClass = 'top-0',
}: {
  sections: CaseStudySidebarSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
  stickyTopClass?: string;
}) {
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active TOC pill into view horizontally without causing any vertical page scroll
  useEffect(() => {
    if (!activeSection || !navContainerRef.current) return;
    const container = navContainerRef.current;
    const activeBtn = container.querySelector(`[data-section-id="${activeSection}"]`) as HTMLElement | null;
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const scrollLeft =
      container.scrollLeft +
      (btnRect.left - containerRect.left) -
      (containerRect.width / 2) +
      (btnRect.width / 2);

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth',
    });
  }, [activeSection]);

  if (!sections || sections.length === 0) return null;

  return (
    <div
      ref={navContainerRef}
      data-case-study-mobile-toc
      className={`sticky ${stickyTopClass} z-30 w-full border-b border-border-subtle/50 bg-[var(--bg)]/95 backdrop-blur-md px-3 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0 ${className}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold shrink-0 pl-1 select-none">
        TOC
      </span>
      {sections.map((section, idx) => {
        const safeId = getCaseStudySectionId(section, idx);
        const isActive = activeSection === safeId;
        const cleanTitle = (section.title || '').replace(/^\d+[\s\.\-]+/, '').trim() || section.title;

        return (
          <button
            key={section.id || idx}
            type="button"
            data-section-id={safeId}
            onClick={() => onSectionClick(safeId)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-150 ease-out cursor-pointer select-none ${
              isActive
                ? 'bg-accent/15 text-accent font-semibold border border-accent/30 shadow-xs'
                : 'bg-[var(--card)] text-muted hover:text-foreground border border-border-subtle/80'
            }`}
          >
            <span className="font-mono text-[10px] opacity-80">{String(idx + 1).padStart(2, '0')}</span>
            <span className="whitespace-nowrap">{cleanTitle}</span>
          </button>
        );
      })}
    </div>
  );
}
