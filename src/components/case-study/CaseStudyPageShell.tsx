'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CaseStudySidebar, getCaseStudySectionId } from '@/components/case-study/CaseStudySidebar';

interface CaseStudyPageShellProps {
  title: string;
  year?: string;
  backHref?: string;
  backLabel?: string;
  customGlowColor?: string | null;
  sections?: Array<{ id?: string; title: string; slug?: string }>;
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
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const scrollContainer = document.getElementById('scroll-container');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-20% 0px -75% 0px',
      }
    );

    const sectionElements = document.querySelectorAll('.case-study-section');
    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const container = document.getElementById('scroll-container');

    if (element) {
      setActiveSection(id);
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offsetTop = elementRect.top - containerRect.top + container.scrollTop - 96;
        container.scrollTo({ top: offsetTop, behavior: 'smooth' });
      } else {
        const y = element.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* ── 00. Ambient Glow ── */}
      {customGlowColor ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[800px] opacity-70 mix-blend-screen dark:mix-blend-lighten animate-pulse"
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
      <div className="sticky top-0 z-50 w-full border-b border-border-subtle/50 bg-[var(--bg)]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex-1 flex items-center gap-5">
            <Link
              href={backHref}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle/80 bg-[var(--card)] hover:bg-border-subtle/20 text-xs sm:text-sm font-semibold text-foreground transition-all shadow-sm shrink-0"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
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
            <span className="text-sm font-semibold text-muted">{year}</span>
          </div>
        </div>
      </div>

      {/* ── 02. Page Layout with Sidebar TOC + Content ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:py-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 relative z-0">
          {/* Mobile/Tablet TOC */}
          {sections.length > 1 && (
            <details className="group mb-8 block rounded-xl border border-white/10 bg-black/30 lg:hidden w-full">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-bold uppercase tracking-widest text-zinc-300 outline-none">
                Case Study Sections
                <span className="text-zinc-500 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <nav className="flex flex-col gap-2 border-t border-white/10 p-4">
                {sections.map((section, idx) => {
                  const safeId = getCaseStudySectionId(section, idx);
                  return (
                    <a
                      key={section.id || idx}
                      href={`#${safeId}`}
                      onClick={(e) => {
                        scrollTo(e, safeId);
                        const details = e.currentTarget.closest('details');
                        if (details) details.removeAttribute('open');
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeSection === safeId ? 'bg-white/5 font-semibold text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className={`font-mono text-xs ${activeSection === safeId ? 'text-accent' : 'text-muted'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  );
                })}
              </nav>
            </details>
          )}

          {/* Desktop Sticky TOC Sidebar */}
          {sections.length > 1 && (
            <CaseStudySidebar
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollTo}
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
