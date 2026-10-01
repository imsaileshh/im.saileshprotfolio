'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  CaseStudySidebar,
  CaseStudyMobileNav,
  getVisibleCaseStudySections,
  scrollToCaseStudySection,
  findCaseStudyScrollContainer,
  CaseStudySidebarSection,
} from '@/components/case-study/CaseStudySidebar';

interface CaseStudyPageShellProps {
  title: string;
  year?: string;
  backHref?: string;
  backLabel?: string;
  customGlowColor?: string | null;
  sections?: CaseStudySidebarSection[];
  children: React.ReactNode;
}

export function CaseStudyPageShell({
  title,
  year = '2025',
  backHref = '/works',
  backLabel = 'Back',
  customGlowColor,
  sections = [],
  children,
}: CaseStudyPageShellProps) {
  const visibleSections = useMemo(() => getVisibleCaseStudySections(sections), [sections]);
  const [activeSection, setActiveSection] = useState<string>('');
  const activeSectionRef = useRef<string>('');

  // Unified scroll handler for both mobile TOC and desktop sidebar
  const handleSectionClick = useCallback((id: string) => {
    activeSectionRef.current = id;
    setActiveSection(id);
    scrollToCaseStudySection(id);
  }, []);

  // Listen to the actual scroll container for active section tracking
  useEffect(() => {
    const container = findCaseStudyScrollContainer();
    if (!container) return;

    const isWindowScroll =
      container === document.documentElement ||
      container === document.body ||
      container === document.scrollingElement;

    const handleScroll = () => {
      const sectionElements = document.querySelectorAll('.case-study-section');
      if (sectionElements.length === 0) return;

      const containerTop = isWindowScroll ? 0 : container.getBoundingClientRect().top;
      const currentScroll = isWindowScroll ? window.scrollY : container.scrollTop;
      const scrollHeight = isWindowScroll ? document.documentElement.scrollHeight : container.scrollHeight;
      const clientHeight = isWindowScroll ? window.innerHeight : container.clientHeight;

      // Bottom detection: highlight last section
      if (scrollHeight - currentScroll - clientHeight < 60) {
        const lastEl = sectionElements[sectionElements.length - 1];
        if (lastEl?.id && lastEl.id !== activeSectionRef.current) {
          activeSectionRef.current = lastEl.id;
          setActiveSection(lastEl.id);
        }
        return;
      }

      // Find section whose top has reached near stickyOffset
      let currentActiveId = '';
      sectionElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const relTop = rect.top - containerTop;
        if (relTop <= 150) {
          currentActiveId = el.id;
        }
      });

      if (currentActiveId && currentActiveId !== activeSectionRef.current) {
        activeSectionRef.current = currentActiveId;
        setActiveSection(currentActiveId);
      }
    };

    const targetToListen = isWindowScroll ? window : container;
    targetToListen.addEventListener('scroll', handleScroll, { passive: true });

    // Initial sync
    handleScroll();

    return () => {
      targetToListen.removeEventListener('scroll', handleScroll);
    };
  }, [visibleSections]);

  return (
    <>
      {/* ── 00. Ambient Glow (Static, GPU-friendly, NO animate-pulse) ── */}
      {customGlowColor ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[800px] opacity-70 mix-blend-screen dark:mix-blend-lighten"
          style={{
            background: `radial-gradient(circle 800px at 50% -100px, ${customGlowColor}, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(79,140,255,0.04),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.03),transparent)]"
          aria-hidden="true"
        />
      )}

      {/* ── 01. Sticky Top Navigation Bar (PageShell: Back button + Title + Year) ── */}
      <div
        data-case-study-header
        className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-[var(--bg)]/90 backdrop-blur-md transition-colors"
      >
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex-1 flex items-center gap-5">
            <Link
              href={backHref}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle/80 bg-[var(--card)] hover:bg-border-subtle/20 text-xs sm:text-sm font-semibold text-foreground transition-colors shadow-sm shrink-0"
            >
              <ArrowLeft size={16} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
              <span className="hidden xs:inline">{backLabel.replace('Back to ', 'Back')}</span>
              <span className="xs:hidden">Back</span>
            </Link>
            <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
          </div>

          <div className="hidden sm:flex flex-1 justify-center px-3 text-center overflow-hidden">
            <span className="block truncate text-sm font-semibold text-muted tracking-wide max-w-[200px] sm:max-w-[360px] md:max-w-[480px]">
              {title}
            </span>
          </div>

          <div className="flex-1 flex justify-end items-center gap-5">
            <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
            <span className="text-sm font-semibold text-muted font-mono">{year}</span>
          </div>
        </div>
      </div>

      {/* ── 02. Page Layout with Sidebar TOC + Content ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:py-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 relative z-0">
          {/* Mobile/Tablet Horizontal TOC */}
          {visibleSections.length > 1 && (
            <CaseStudyMobileNav
              sections={visibleSections}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              stickyTopClass="top-[60px]"
              className="lg:hidden mb-8"
            />
          )}

          {/* Desktop Sticky TOC Sidebar */}
          {visibleSections.length > 1 && (
            <CaseStudySidebar
              sections={visibleSections}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              className="hidden lg:sticky lg:top-24 lg:block z-40 max-h-[calc(100vh-120px)] pb-4"
            />
          )}

          {/* Main Content Body */}
          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
