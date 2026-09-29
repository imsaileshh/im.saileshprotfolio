'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion, type Transition, type Variants } from 'framer-motion';
import { BookOpen, ArrowLeft } from 'lucide-react';
import type { ProjectDetailData, CaseStudyDetailData } from '@/components/projects/ProjectDetailTemplate';
import { CaseStudyContent, CaseStudyHeroHeader, type CaseStudyContentData } from '@/components/case-study/CaseStudyContent';
import { resolveImageUrl } from '@/components/case-study/CustomBlockRenderer';
import { CaseStudySidebar, CaseStudyMobileNav, getCaseStudySectionId } from '@/components/case-study/CaseStudySidebar';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';

interface CaseStudyChipsCardProps {
  slug: string;
  projectTitle?: string;
  project?: ProjectDetailData;
  caseStudy?: CaseStudyDetailData | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CaseStudyChipsCard({
  slug,
  projectTitle,
  project,
  caseStudy: initialCaseStudy,
  isOpen: externalIsOpen,
  onOpenChange,
}: CaseStudyChipsCardProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = useCallback((open: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  }, [externalIsOpen, onOpenChange]);

  const [mounted, setMounted] = useState(false);
  const [fullCaseStudy, setFullCaseStudy] = useState<CaseStudyDetailData | null>(initialCaseStudy || null);
  const [activeSection, setActiveSection] = useState<string>('');
  const activeSectionRef = useRef<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Track case study modal scroll on top progress bar while open
  useModalScrollProgress(isOpen, modalScrollRef);

  const effectiveTitle = fullCaseStudy?.title || projectTitle || project?.title || 'Case Study';
  const effectiveSlug = slug || fullCaseStudy?.slug || project?.slug || '';
  const layoutId = `case-study-${project?.id || effectiveSlug || 'default'}`;

  const [hasRequested, setHasRequested] = useState(false);

  const fetchDetails = useCallback(() => {
    if (hasRequested || !effectiveSlug) return;
    setHasRequested(true);
    fetch(`/api/portfolio/case-studies/preview/${effectiveSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFullCaseStudy((prev) => ({
            ...prev,
            ...data,
            slug: effectiveSlug,
            status: 'PUBLISHED',
          }));
        }
      })
      .catch(() => {});
  }, [hasRequested, effectiveSlug]);

  // Fetch full case study only when modal is opened or hovered (never unprompted on closed cards)
  useEffect(() => {
    if (initialCaseStudy && initialCaseStudy.sections && initialCaseStudy.sections.length > 0) {
      setFullCaseStudy(initialCaseStudy);
      return;
    }

    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, initialCaseStudy, fetchDetails]);

  // Lock body and layout scroll and restore focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const scrollContainer = document.getElementById('scroll-container');
      const originalContainerOverflow = scrollContainer ? scrollContainer.style.overflow : '';
      if (scrollContainer) {
        scrollContainer.style.overflow = 'hidden';
      }

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (scrollContainer) {
          scrollContainer.style.overflow = originalContainerOverflow;
        }
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  }, [setIsOpen]);

  // Escape key support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Track active section inside modal scroll body via IntersectionObserver (ref-deduplicated)
  useEffect(() => {
    if (!isOpen) return;

    const scrollContainer = modalScrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const newId = entry.target.id;
            if (newId && newId !== activeSectionRef.current) {
              activeSectionRef.current = newId;
              setActiveSection(newId);
            }
          }
        }
      },
      {
        root: scrollContainer,
        rootMargin: '-10% 0px -65% 0px',
      }
    );

    const sectionElements = scrollContainer.querySelectorAll('.case-study-section');
    sectionElements.forEach((el) => observer.observe(el));

    const activeSectionsList = fullCaseStudy?.sections || [];
    if (sectionElements.length > 0 && !activeSectionRef.current) {
      const initialId = sectionElements[0].id;
      if (initialId) {
        activeSectionRef.current = initialId;
        setActiveSection(initialId);
      }
    } else if (activeSectionsList.length > 0 && !activeSectionRef.current) {
      const initialId = getCaseStudySectionId(activeSectionsList[0], 0);
      activeSectionRef.current = initialId;
      setActiveSection(initialId);
    }

    // Detect bottom of scroll container to highlight last section
    const handleScroll = () => {
      if (scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 40) {
        if (activeSectionsList.length > 0) {
          const lastIdx = activeSectionsList.length - 1;
          const lastId = getCaseStudySectionId(activeSectionsList[lastIdx], lastIdx);
          if (lastId && lastId !== activeSectionRef.current) {
            activeSectionRef.current = lastId;
            setActiveSection(lastId);
          }
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, fullCaseStudy?.sections]);

  // Smooth scroll to target section inside modal
  const scrollToSection = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (activeSectionRef.current !== id) {
      activeSectionRef.current = id;
      setActiveSection(id);
    }
    const container = modalScrollRef.current;
    if (!container) return;

    const targetEl = container.querySelector(`#${id}`) as HTMLElement | null;
    if (targetEl) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const topOffset = window.innerWidth < 768 ? 54 : 24;
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop - topOffset;
      container.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
    }
  }, []);

  const sections = fullCaseStudy?.sections || [];
  const cover = resolveImageUrl(fullCaseStudy?.coverImage || fullCaseStudy?.coverUrl || project?.coverUrl || '');
  const description = fullCaseStudy?.description || project?.description || '';
  const category = fullCaseStudy?.category || project?.category || 'Case Studies';
  const year = fullCaseStudy?.year || project?.year || '2025';
  const role = fullCaseStudy?.role || project?.role || 'Completed';
  const client = fullCaseStudy?.client || project?.client || null;
  const technologies: string[] =
    (fullCaseStudy?.technologies && fullCaseStudy.technologies.length > 0
      ? fullCaseStudy.technologies
      : null) ||
    (project?.technologies && project.technologies.length > 0 ? project.technologies : null) ||
    ['Figma', 'Photoshop'];
  const liveUrl = fullCaseStudy?.liveUrl || project?.liveUrl || null;
  const githubUrl = fullCaseStudy?.githubUrl || project?.githubUrl || null;

  // Compose pure CaseStudyContent data object matching standalone page
  const caseStudyObj: CaseStudyContentData = {
    id: fullCaseStudy?.id || project?.id || 'cs',
    title: effectiveTitle,
    slug: effectiveSlug,
    description: description,
    coverImage: cover,
    status: fullCaseStudy?.status || 'PUBLISHED',
    sourceType: fullCaseStudy?.sourceType || 'MANUAL',
    sourcePdf: fullCaseStudy?.sourcePdf || null,
    sections: sections,
    metadata: {
      category,
      year,
      role,
      client,
      technologies,
      liveUrl,
      githubUrl,
      ...(fullCaseStudy?.metadata || {}),
    },
    project: {
      title: project?.title || effectiveTitle,
      category,
      year,
      role,
      client,
      technologies,
      liveUrl,
      githubUrl,
      coverImageUrl: cover,
      ...(fullCaseStudy?.project || {}),
    },
  };

  // Apple-inspired smooth morph: 280ms duration (within 250-320ms target), cubic-bezier easing
  const appleTransition: Transition = shouldReduceMotion
    ? { duration: 0.15, ease: 'easeOut' as const }
    : {
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1] as const,
      };

  // Subtle entrance for internal content
  const contentVariants: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 6,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.24,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <LayoutGroup id={layoutId}>
      {/* ── Root Container: Positioned in sticky bottom flow ── */}
      <div className="cscc-root-container">
        {/* Placeholder: Keeps exact dimensions when modal is open to prevent ANY layout shift */}
        {isOpen && (
          <div
            className="cscc-pill-placeholder"
            aria-hidden="true"
          />
        )}

        {/* Originating Compact Case Study CTA with shared layoutId */}
        {!isOpen && (
          <motion.div
            layoutId={shouldReduceMotion ? undefined : layoutId}
            transition={appleTransition}
            className="cscc-origin-card group"
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
              }
            }}
            onMouseEnter={fetchDetails}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-label="Open Case Study Details"
          >
            {/* Shimmer & Glow */}
            <div className="cscc-shimmer" aria-hidden="true" />
            <div className="cscc-glow" aria-hidden="true" />

            {/* Content Pill */}
            <div className="cscc-pill-inner">
              <div className="cscc-pill-left">
                <span className="cscc-pill-ico" aria-hidden="true">
                  <BookOpen size={14} strokeWidth={2} />
                </span>
                <div className="cscc-pill-text">
                  <span className="cscc-eyebrow">CASE STUDY</span>
                  <span className="cscc-pill-title">A deeper look into the design process</span>
                </div>
              </div>

              {/* + Trigger Button */}
              <button
                ref={triggerRef}
                type="button"
                className="cscc-toggle-ring"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                aria-label={`Open Case Study for ${effectiveTitle}`}
              >
                <span className="cscc-plus-icon" aria-hidden="true">+</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ════════════ IMMERSIVE POPUP/MODAL (PORTALED) ════════════ */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="cscc-modal-portal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="case-study-modal-title"
              data-lenis-prevent="true"
            >
              {/* Static backdrop blur layer (blur stays fixed, no continuous GPU re-filtering) */}
              <div className="cscc-modal-backdrop-blur" aria-hidden="true" />

              {/* Fast, lightweight dimming scrim */}
              <motion.div
                key="backdrop-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.22, ease: 'easeOut' }}
                onClick={handleClose}
                className="cscc-modal-scrim"
                aria-hidden="true"
              />

              {/* Centered Expanded Container (Shares layoutId for spatial morph) */}
              <div className="cscc-modal-viewport" onClick={handleClose}>
                <motion.div
                  ref={modalContainerRef}
                  layoutId={shouldReduceMotion ? undefined : layoutId}
                  transition={appleTransition}
                  style={{ willChange: 'transform, opacity' }}
                  className="cscc-modal-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Glass Ambient Effects */}
                  <div className="cscc-modal-glow-top" aria-hidden="true" />
                  <div className="cscc-modal-glow-bottom" aria-hidden="true" />

                  {/* ── 01. POPUP TOP HEADER BAR ── */}
                  <header className="sticky top-0 z-30 flex h-[60px] w-full shrink-0 items-center justify-between border-b border-border-subtle/50 bg-[var(--bg)]/95 px-4 sm:px-6 md:px-8 backdrop-blur-md">
                    {/* Left: Back / Close control */}
                    <div className="flex-1 flex items-center gap-5">
                      <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={handleClose}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-border-subtle/80 bg-[var(--card)] hover:bg-border-subtle/20 text-xs sm:text-sm font-semibold text-foreground transition-all shadow-sm shrink-0 cursor-pointer"
                        aria-label="Back / Close Case Study"
                      >
                        <ArrowLeft size={16} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
                        <span className="hidden xs:inline">Back</span>
                        <span className="xs:hidden">Back</span>
                      </button>
                      <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
                    </div>

                    {/* Center: Case Study Title */}
                    <div className="hidden sm:flex flex-1 justify-center px-3 text-center overflow-hidden">
                      <h2
                        id="case-study-modal-title"
                        className="block truncate text-sm font-semibold text-muted tracking-wide max-w-[200px] sm:max-w-[360px] md:max-w-[480px]"
                      >
                        {effectiveTitle}
                      </h2>
                    </div>

                    {/* Right: Year */}
                    <div className="flex-1 flex justify-end items-center gap-3 sm:gap-5">
                      <div className="h-6 w-px bg-border-subtle/50 hidden sm:block" />
                      <span className="text-xs sm:text-sm font-semibold text-muted font-mono">
                        {year}
                      </span>
                    </div>
                  </header>

                  {/* ── 02. ONE CLEAN SCROLL CONTAINER FOR THE WHOLE POPUP ── */}
                  <div
                    id="case-study-modal-scroll"
                    ref={modalScrollRef}
                    data-lenis-prevent="true"
                    onWheel={(e) => e.stopPropagation()}
                    className="cscc-modal-scroll-body flex-1 overflow-y-auto overscroll-contain"
                  >
                    <motion.div
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ willChange: 'transform, opacity' }}
                      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 lg:py-10"
                    >
                      {/* ── 01. HERO / TITLE / STRUCTURED METADATA ── */}
                      <CaseStudyHeroHeader caseStudy={caseStudyObj} />

                      {/* ── 02. FEATURED COVER IMAGE ── */}
                      {cover && (
                        <div className="w-full max-w-[960px] mx-auto rounded-2xl border border-border-subtle/80 bg-[var(--card)] p-1.5 shadow-sm">
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/50 border border-border-subtle/40">
                            <Image
                              src={cover}
                              alt={effectiveTitle}
                              fill
                              priority
                              decoding="async"
                              className="object-cover w-full h-full"
                              sizes="(max-width: 1024px) 100vw, 960px"
                            />
                          </div>
                        </div>
                      )}

                      {/* ── 03. SUBTLE HORIZONTAL DIVIDER ── */}
                      <div className="w-full border-t border-border-subtle/60 my-10 sm:my-14" />

                      {/* ── TWO-COLUMN CASE STUDY CONTENT LAYOUT ── */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 relative z-0">
                        {/* Mobile Compact Horizontal Navigation */}
                        {sections.length > 0 && (
                          <CaseStudyMobileNav
                            sections={sections}
                            activeSection={activeSection}
                            onSectionClick={scrollToSection}
                            className="lg:hidden mb-8"
                          />
                        )}

                        {/* Left: CASE STUDY SIDEBAR */}
                        {sections.length > 0 && (
                          <div className="hidden lg:block lg:sticky lg:top-4 w-64 shrink-0 z-20 pb-4">
                            <CaseStudySidebar
                              sections={sections}
                              activeSection={activeSection}
                              onSectionClick={scrollToSection}
                              className="w-full"
                            />
                          </div>
                        )}

                        {/* Right: CASE STUDY CONTENT */}
                        <div className="min-w-0 flex-1">
                          <CaseStudyContent caseStudy={caseStudyObj} sectionsOnly={true} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Styles (Scoped, High-Performance CSS) ── */}
      <style>{`
        /* ── Sticky flow wrapper ── */
        .cscc-root-container {
          position: relative;
          width: 100%;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          padding-bottom: 20px;
        }

        /* Invisible placeholder prevents layout shift when modal is open */
        .cscc-pill-placeholder {
          width: 100%;
          height: 58px;
          border-radius: 20px;
          pointer-events: none;
          opacity: 0;
        }

        /* ── Originating Card (Apple Chips Pill) ── */
        .cscc-origin-card {
          position: relative;
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(18,20,23,0.85);
          box-shadow:
            0 6px 24px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          cursor: pointer;
          overflow: hidden;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        [data-theme='light'] .cscc-origin-card {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow:
            0 6px 20px rgba(0,0,0,0.06),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .cscc-origin-card:hover {
          border-color: rgba(45,212,191,0.3);
          background: rgba(22,25,30,0.9);
          box-shadow:
            0 10px 30px rgba(0,0,0,0.45),
            0 0 16px rgba(45,212,191,0.1),
            inset 0 1px 0 rgba(255,255,255,0.12);
        }
        [data-theme='light'] .cscc-origin-card:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(13,148,136,0.3);
        }

        .cscc-shimmer {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: linear-gradient(
            108deg,
            transparent 20%,
            rgba(255,255,255,0.04) 50%,
            transparent 80%
          );
          background-size: 220% 100%;
          animation: cscc-shim 7s ease-in-out infinite;
        }
        @keyframes cscc-shim {
          0%,100% { background-position: 220% 0; }
          50%      { background-position: -220% 0; }
        }

        .cscc-glow {
          position: absolute; pointer-events: none; z-index: 0;
          width: 220px; height: 140px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(45,212,191,0.08) 0%, transparent 70%);
          bottom: -30px; right: -15px;
        }

        .cscc-pill-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 18px;
        }

        .cscc-pill-left {
          display: flex; align-items: center; gap: 12px;
          min-width: 0;
        }

        .cscc-pill-ico {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: rgba(45,212,191,0.1); border: 1px solid rgba(45,212,191,0.22);
          color: #2DD4BF; transition: transform .2s ease, background .2s ease;
        }
        [data-theme='light'] .cscc-pill-ico { background: rgba(13,148,136,0.09); border-color: rgba(13,148,136,0.2); color: #0D9488; }
        .cscc-origin-card:hover .cscc-pill-ico { transform: scale(1.06) rotate(3deg); background: rgba(45,212,191,0.18); }

        .cscc-pill-text {
          display: flex; flex-direction: column; gap: 1px; min-width: 0;
        }

        .cscc-eyebrow {
          font-size: 9px; font-family: ui-monospace,monospace;
          letter-spacing: .15em; color: #2DD4BF; font-weight: 600; text-transform: uppercase;
        }
        [data-theme='light'] .cscc-eyebrow { color: #0D9488; }

        .cscc-pill-title {
          font-size: 13px; font-weight: 600; color: var(--text, #fff);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: -0.015em;
        }
        @media(max-width:480px){ .cscc-pill-title { max-width: 170px; font-size: 12px; } }

        /* Trigger + button */
        .cscc-toggle-ring {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: rgba(45,212,191,0.12); border: 1px solid rgba(45,212,191,0.3);
          color: #2DD4BF; font-size: 16px; font-weight: 600; line-height: 1;
          cursor: pointer; transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }
        [data-theme='light'] .cscc-toggle-ring {
          background: rgba(13,148,136,0.1); border-color: rgba(13,148,136,0.26); color: #0D9488;
        }
        .cscc-origin-card:hover .cscc-toggle-ring {
          transform: scale(1.08); background: rgba(45,212,191,0.22); border-color: rgba(45,212,191,0.5);
        }
        .cscc-plus-icon { display: inline-block; font-size: 18px; transform: translateY(-1px); }

        /* ════════ EXPANDED MODAL PORTAL ════════ */
        .cscc-modal-portal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        /* Static backdrop blur layer */
        .cscc-modal-backdrop-blur {
          position: fixed;
          inset: 0;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 0;
          pointer-events: none;
        }

        /* Dimming Scrim */
        .cscc-modal-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          z-index: 1;
          will-change: opacity;
        }
        [data-theme='light'] .cscc-modal-scrim {
          background: rgba(0, 0, 0, 0.45);
        }

        .cscc-modal-viewport {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .cscc-modal-viewport { padding: 20px; }
        }

        /* Main Modal Card */
        .cscc-modal-card {
          position: relative;
          width: 100%;
          max-width: 1180px;
          max-height: calc(100dvh - 16px);
          height: 94dvh;
          border-radius: 20px;
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
          background: var(--bg, #111214);
          color: var(--text, #fff);
          box-shadow:
            0 20px 48px -12px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .cscc-modal-card {
            border-radius: 28px;
            max-height: calc(100vh - 24px);
            height: 92vh;
          }
        }
        [data-theme='light'] .cscc-modal-card {
          box-shadow:
            0 20px 48px -12px rgba(0, 0, 0, 0.16),
            0 0 0 1px rgba(0, 0, 0, 0.06);
        }

        .cscc-modal-glow-top {
          position: absolute; pointer-events: none; z-index: 0;
          width: 420px; height: 200px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(45,212,191,0.05) 0%, transparent 70%);
          top: -60px; left: 15%;
        }
        .cscc-modal-glow-bottom {
          position: absolute; pointer-events: none; z-index: 0;
          width: 380px; height: 180px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(45,212,191,0.03) 0%, transparent 70%);
          bottom: -50px; right: 10%;
        }

        /* Scroll Body */
        .cscc-modal-scroll-body {
          position: relative; z-index: 10;
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
        [data-theme='light'] .cscc-modal-scroll-body {
          scrollbar-color: rgba(0,0,0,0.15) transparent;
        }
      `}</style>
    </LayoutGroup>
  );
}
