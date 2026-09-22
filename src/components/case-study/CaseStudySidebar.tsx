'use client';

import React from 'react';

export interface CaseStudySidebarSection {
  id?: string;
  title: string;
  slug?: string;
  order?: number;
}

export function getCaseStudySectionId(
  section: { slug?: string; id?: string; title?: string },
  idx: number
): string {
  const raw = (section.slug && section.slug.trim()) || (section.title && section.title.trim()) || `section-${idx}`;
  const safe = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return safe || `section-${idx}`;
}

interface CaseStudySidebarProps {
  sections: CaseStudySidebarSection[];
  activeSection: string;
  onSectionClick: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
  className?: string;
  title?: string;
}

/**
 * CaseStudySidebar
 * Reusable Case Study internal navigation sidebar matching the standalone
 * Case Study Detail page (/case-studies/[slug]) precisely in typography,
 * sizing, colors, numbering, active states, and hover transitions.
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

          return (
            <a
              key={section.id || idx}
              href={`#${safeId}`}
              onClick={(e) => onSectionClick(e, safeId)}
              className={`group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ease-out cursor-pointer pointer-events-auto ${
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
              <span className="leading-snug">{section.title}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * CaseStudyMobileNav
 * Compact horizontal navigation for small screens / mobile viewports
 * that preserves the exact same section numbering and active states.
 */
export function CaseStudyMobileNav({
  sections,
  activeSection,
  onSectionClick,
  className = '',
}: {
  sections: CaseStudySidebarSection[];
  activeSection: string;
  onSectionClick: (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => void;
  className?: string;
}) {
  if (!sections || sections.length === 0) return null;

  return (
    <div
      className={`sticky top-0 z-30 w-full border-b border-border-subtle/50 bg-[var(--bg)]/95 backdrop-blur-md px-3 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0 ${className}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold shrink-0 pl-1">
        TOC
      </span>
      {sections.map((section, idx) => {
        const safeId = getCaseStudySectionId(section, idx);
        const isActive = activeSection === safeId;

        return (
          <button
            key={section.id || idx}
            type="button"
            onClick={(e) => onSectionClick(e, safeId)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-150 ease-out cursor-pointer ${
              isActive
                ? 'bg-accent/15 text-accent font-semibold border border-accent/30'
                : 'bg-[var(--card)] text-muted hover:text-foreground border border-border-subtle/80'
            }`}
          >
            <span className="font-mono text-[10px]">{String(idx + 1).padStart(2, '0')}</span>
            <span className="whitespace-nowrap">{section.title}</span>
          </button>
        );
      })}
    </div>
  );
}
