'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, X, BookOpen, ChevronRight, Layers, FileSearch, PenTool, TestTube, Sparkles } from 'lucide-react';
import { getTechLogo } from '@/lib/stack/tech-logos';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaseStudyModalWork {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  year: string;
  coverUrl: string;
  technologies: string[];
  liveUrl?: string | null;
  hasCaseStudy?: boolean;
  caseStudySlug?: string | null;
}

interface CaseStudyMorphModalProps {
  work: CaseStudyModalWork | null;
  originRect: OriginRect | null;
  onClose: () => void;
}

/* ─────────────────────────────────────────────
   Section pillars for design process preview
───────────────────────────────────────────── */
const PROCESS_STEPS = [
  { icon: FileSearch, label: 'UX Research', desc: 'User interviews, competitive audits & affinity mapping to surface real pain points.' },
  { icon: Layers, label: 'Design System', desc: 'Token-based color, spacing & type scales — component libraries with dark/light semantics.' },
  { icon: PenTool, label: 'Wireframes', desc: 'Low-fi → mid-fi → annotated high-fi specs across every breakpoint.' },
  { icon: TestTube, label: 'Prototype Testing', desc: 'Clickable Figma prototypes validated through moderated usability sessions & A/B refinement.' },
];

/* ─────────────────────────────────────────────
   Animation helpers
───────────────────────────────────────────── */
function getModalTransform(rect: OriginRect | null): string {
  if (!rect) return '';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Target modal: centered, max 860px wide, max 90vh tall
  const targetW = Math.min(860, vw * 0.94);
  const targetH = Math.min(vh * 0.90, 820);
  const targetX = (vw - targetW) / 2;
  const targetY = (vh - targetH) / 2;

  const scaleX = rect.width / targetW;
  const scaleY = rect.height / targetH;

  const translateX = rect.x - targetX;
  const translateY = rect.y - targetY;

  return `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
}

/* ─────────────────────────────────────────────
   Main Modal Component
───────────────────────────────────────────── */
export function CaseStudyMorphModal({ work, originRect, onClose }: CaseStudyMorphModalProps) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Track modal scrolling on top progress bar while open
  useModalScrollProgress(Boolean(work && phase !== 'closed'), scrollRef);

  /* Mount portal */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Drive open/close phase on work prop change */
  useEffect(() => {
    if (work) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setImgError(false);
      // Next frame: kick to opening
      const raf = requestAnimationFrame(() => {
        setPhase('opening');
        // After CSS open transition completes
        const t = setTimeout(() => {
          setPhase('open');
          closeButtonRef.current?.focus();
        }, 380);
        return () => clearTimeout(t);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setPhase('closed');
    }
  }, [work]);

  /* Close sequence */
  const handleClose = useCallback(() => {
    setPhase('closing');
    const t = setTimeout(() => {
      onClose();
      setPhase('closed');
      previousFocusRef.current?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, [onClose]);

  /* Keyboard handler */
  useEffect(() => {
    if (!work) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [work, handleClose]);

  /* Lock body scroll when open */
  useEffect(() => {
    if (work) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [work]);

  /* Focus trap */
  useEffect(() => {
    if (phase !== 'open' || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    panel.addEventListener('keydown', trap);
    return () => panel.removeEventListener('keydown', trap);
  }, [phase]);

  if (!mounted || !work) return null;

  const isOpen = phase === 'open' || phase === 'opening' || phase === 'closing';
  const isAnimatingIn = phase === 'opening';
  const isAnimatingOut = phase === 'closing';
  const caseSlug = work.caseStudySlug || work.slug;

  /* ── CSS transform for origin-morph on desktop ── */
  const initialTransform = !isMobile && originRect ? getModalTransform(originRect) : '';

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Case study: ${work.title}`}
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
    >
      {/* ── Scrim ── */}
      <div
        className="csm-scrim"
        data-visible={isOpen && !isAnimatingOut ? 'true' : 'false'}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ── Morph Panel ── */}
      <div
        ref={panelRef}
        className="csm-panel"
        data-phase={phase}
        style={isAnimatingIn ? { '--csm-origin': initialTransform } as React.CSSProperties : undefined}
      >
        {/* ── Close Button (Apple-style round ×) ── */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="csm-close-btn"
          aria-label="Close case study preview"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* ── Scrollable inner ── */}
        <div ref={scrollRef} className="csm-scroll">

          {/* ── Hero Image ── */}
          <div className="csm-hero" data-phase={phase}>
            {!imgError ? (
              <Image
                src={work.coverUrl}
                alt={work.title}
                fill
                className="object-cover"
                sizes="(max-width: 860px) 100vw, 860px"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="csm-hero-fallback">
                <BookOpen size={48} strokeWidth={1} />
              </div>
            )}
            {/* Gradient overlay on hero */}
            <div className="csm-hero-gradient" aria-hidden="true" />

            {/* Floating category + year pill on hero */}
            <div className="csm-hero-meta" data-phase={phase}>
              <span className="csm-meta-pill">
                <Sparkles size={10} />
                {work.category}
              </span>
              <span className="csm-meta-year">{work.year}</span>
            </div>
          </div>

          {/* ── Content Body ── */}
          <div className="csm-body">

            {/* Title */}
            <div className="csm-title-row" data-phase={phase}>
              <h2 className="csm-title">{work.title}</h2>
              {work.liveUrl && (
                <a
                  href={work.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="csm-live-btn"
                  aria-label={`Visit live site for ${work.title}`}
                >
                  <ArrowUpRight size={14} />
                  <span>Live</span>
                </a>
              )}
            </div>

            {/* Description */}
            <p className="csm-description" data-phase={phase}>
              {work.description}
            </p>

            {/* Tech stack */}
            {work.technologies && work.technologies.length > 0 && (
              <div className="csm-tech-row" data-phase={phase}>
                {work.technologies.slice(0, 6).map((tech) => {
                  const logo = getTechLogo(tech);
                  return (
                    <span key={tech} className="csm-tech-badge">
                      {logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo.url}
                          alt=""
                          width={11}
                          height={11}
                          className="csm-tech-logo"
                          style={logo.filter ? { filter: logo.filter } : undefined}
                        />
                      )}
                      {tech}
                    </span>
                  );
                })}
              </div>
            )}

            {/* ── Divider ── */}
            <div className="csm-divider" data-phase={phase} aria-hidden="true" />

            {/* ── Design Process Preview ── */}
            <div className="csm-process-section" data-phase={phase}>
              <div className="csm-section-header">
                <span className="csm-eyebrow">CASE STUDY</span>
                <h3 className="csm-section-title">Design Process</h3>
              </div>

              <div className="csm-process-grid">
                {PROCESS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="csm-process-card"
                      style={{ '--delay': `${idx * 50}ms` } as React.CSSProperties}
                      data-phase={phase}
                    >
                      <div className="csm-process-icon">
                        <Icon size={16} strokeWidth={1.8} />
                      </div>
                      <div className="csm-process-text">
                        <h4 className="csm-process-label">{step.label}</h4>
                        <p className="csm-process-desc">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CTA row ── */}
            <div className="csm-cta-row" data-phase={phase}>
              <Link
                href={`/case-studies/${caseSlug}`}
                className="csm-cta-primary"
                onClick={handleClose}
              >
                <BookOpen size={15} strokeWidth={2} />
                <span>View Full Case Study</span>
                <ChevronRight size={14} strokeWidth={2.5} className="csm-cta-arrow" />
              </Link>

              <Link
                href={`/works/${work.slug}`}
                className="csm-cta-secondary"
                onClick={handleClose}
              >
                <span>Project Details</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* ══════════════════════════════════════
           SCRIM
        ══════════════════════════════════════ */
        .csm-scrim {
          position: fixed; inset: 0; z-index: 1;
          background: rgba(0, 0, 0, 0.76);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          transition: opacity 0.28s ease;
          cursor: pointer;
        }
        .csm-scrim[data-visible='false'] { opacity: 0; pointer-events: none; }
        .csm-scrim[data-visible='true']  { opacity: 1; pointer-events: auto; }
        [data-theme='light'] .csm-scrim { background: rgba(0, 0, 0, 0.50); }

        /* ══════════════════════════════════════
           PANEL — the morphing card→modal
        ══════════════════════════════════════ */
        .csm-panel {
          position: fixed;
          z-index: 2;
          /* Centered target position */
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: min(860px, 94vw);
          max-height: min(820px, 90vh);
          border-radius: 20px;
          overflow: hidden;
          background: #0f1012;
          border: 1px solid rgba(255,255,255,0.09);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 24px 80px rgba(0,0,0,0.7),
            0 8px 24px rgba(0,0,0,0.4);
          outline: none;
          /* Default: invisible, will be overridden by phase */
          opacity: 0;
          pointer-events: none;
        }
        [data-theme='light'] .csm-panel {
          background: #f8f8fa;
          border-color: rgba(0,0,0,0.08);
          box-shadow:
            0 24px 80px rgba(0,0,0,0.22),
            0 8px 24px rgba(0,0,0,0.12);
        }

        /* ── Phase: opening (from card → center) ── */
        .csm-panel[data-phase='opening'] {
          opacity: 1;
          pointer-events: none;
          animation: csm-morph-in 0.38s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes csm-morph-in {
          from {
            opacity: 0.2;
            transform: translateX(-50%) translateY(-50%) var(--csm-origin, scale(0.85) translateY(40px));
            border-radius: 22px;
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-50%);
            border-radius: 20px;
          }
        }

        /* ── Phase: open (settled, fully interactive) ── */
        .csm-panel[data-phase='open'] {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(-50%);
        }

        /* ── Phase: closing (center → card position) ── */
        .csm-panel[data-phase='closing'] {
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%) translateY(-50%) var(--csm-origin, scale(0.85) translateY(40px));
          transition:
            opacity 0.24s ease,
            transform 0.30s cubic-bezier(0.4, 0, 1, 1),
            border-radius 0.28s ease;
          border-radius: 22px !important;
        }

        /* ── Phase: closed ── */
        .csm-panel[data-phase='closed'] {
          opacity: 0;
          pointer-events: none;
        }

        /* Mobile: slide up from bottom instead of morph */
        @media (max-width: 639px) {
          .csm-panel {
            left: 0; right: 0; bottom: 0; top: auto;
            transform: none !important;
            width: 100%;
            max-height: 92vh;
            border-radius: 24px 24px 0 0;
            border-bottom: none;
          }
          .csm-panel[data-phase='opening'] {
            animation: csm-slide-up 0.36s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          }
          @keyframes csm-slide-up {
            from { opacity: 0; transform: translateY(100%); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .csm-panel[data-phase='open'] {
            transform: translateY(0) !important;
          }
          .csm-panel[data-phase='closing'] {
            opacity: 0;
            transform: translateY(100%) !important;
            transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.4, 0, 1, 1) !important;
          }
        }

        /* ══════════════════════════════════════
           CLOSE BUTTON — Apple's round ×
        ══════════════════════════════════════ */
        .csm-close-btn {
          position: absolute;
          top: 14px; right: 14px;
          z-index: 10;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: none;
          color: #111;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.08);
        }
        [data-theme='light'] .csm-close-btn {
          background: rgba(30,30,30,0.88);
          color: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .csm-close-btn:hover {
          background: #fff;
          transform: scale(1.08);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1);
        }
        .csm-close-btn:active { transform: scale(0.94); }

        /* ══════════════════════════════════════
           SCROLL CONTAINER
        ══════════════════════════════════════ */
        .csm-scroll {
          height: 100%;
          max-height: min(820px, 90vh);
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }
        .csm-scroll::-webkit-scrollbar { width: 4px; }
        .csm-scroll::-webkit-scrollbar-track { background: transparent; }
        .csm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        [data-theme='light'] .csm-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }

        /* ══════════════════════════════════════
           HERO IMAGE
        ══════════════════════════════════════ */
        .csm-hero {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #1a1c20;
          overflow: hidden;
          transition: opacity 0.3s ease;
        }
        [data-theme='light'] .csm-hero { background: #e8eaed; }
        .csm-hero[data-phase='open'] { opacity: 1; }
        .csm-hero[data-phase='opening'] { opacity: 0; animation: csm-fade-in 0.3s 0.12s ease forwards; }
        @keyframes csm-fade-in { to { opacity: 1; } }
        @media (max-width: 639px) { .csm-hero { aspect-ratio: 4/3; } }

        .csm-hero-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.15);
        }
        [data-theme='light'] .csm-hero-fallback { color: rgba(0,0,0,0.12); }

        .csm-hero-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0.12) 70%,
            rgba(15,16,18,0.95) 100%
          );
          pointer-events: none;
        }
        [data-theme='light'] .csm-hero-gradient {
          background: linear-gradient(to bottom,
            rgba(0,0,0,0) 40%,
            rgba(248,248,250,0.8) 100%
          );
        }

        .csm-hero-meta {
          position: absolute; bottom: 16px; left: 18px;
          display: flex; align-items: center; gap: 8px;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .csm-hero-meta[data-phase='opening'] {
          opacity: 0; transform: translateY(8px);
          animation: csm-meta-in 0.28s 0.22s ease forwards;
        }
        .csm-hero-meta[data-phase='open'] { opacity: 1; transform: none; }
        @keyframes csm-meta-in { to { opacity: 1; transform: none; } }

        .csm-meta-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.16);
          font-size: 10.5px; font-family: ui-monospace, monospace;
          font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.9);
        }
        [data-theme='light'] .csm-meta-pill {
          background: rgba(0,0,0,0.12);
          border-color: rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.75);
        }
        .csm-meta-year {
          font-size: 10px; font-family: ui-monospace, monospace;
          color: rgba(255,255,255,0.55); font-weight: 500;
        }
        [data-theme='light'] .csm-meta-year { color: rgba(0,0,0,0.4); }

        /* ══════════════════════════════════════
           BODY CONTENT
        ══════════════════════════════════════ */
        .csm-body {
          padding: 22px 24px 32px;
          display: flex; flex-direction: column; gap: 0;
        }
        @media (max-width: 480px) { .csm-body { padding: 18px 16px 28px; } }

        /* Title row */
        .csm-title-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 10px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .csm-title-row[data-phase='opening'] {
          opacity: 0; transform: translateY(12px);
          animation: csm-row-in 0.3s 0.16s ease forwards;
        }
        .csm-title-row[data-phase='open'] { opacity: 1; transform: none; }
        @keyframes csm-row-in { to { opacity: 1; transform: none; } }

        .csm-title {
          font-size: clamp(22px, 3.5vw, 32px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text, #fff);
          font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
          flex: 1;
        }
        [data-theme='light'] .csm-title { color: #0f1012; }

        .csm-live-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 100px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 11.5px; font-weight: 600;
          text-decoration: none; white-space: nowrap;
          transition: all 0.18s ease; flex-shrink: 0; margin-top: 4px;
        }
        [data-theme='light'] .csm-live-btn {
          background: rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.6);
        }
        .csm-live-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }
        [data-theme='light'] .csm-live-btn:hover {
          background: rgba(0,0,0,0.09);
          color: #0f1012;
        }

        /* Description */
        .csm-description {
          font-size: 14px; line-height: 1.65;
          color: rgba(255,255,255,0.55);
          margin: 0 0 14px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        [data-theme='light'] .csm-description { color: rgba(0,0,0,0.5); }
        .csm-description[data-phase='opening'] {
          opacity: 0; transform: translateY(10px);
          animation: csm-row-in 0.3s 0.20s ease forwards;
        }
        .csm-description[data-phase='open'] { opacity: 1; transform: none; }

        /* Tech badges */
        .csm-tech-row {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin-bottom: 20px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .csm-tech-row[data-phase='opening'] {
          opacity: 0; transform: translateY(8px);
          animation: csm-row-in 0.3s 0.24s ease forwards;
        }
        .csm-tech-row[data-phase='open'] { opacity: 1; transform: none; }

        .csm-tech-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          font-size: 10.5px; font-family: ui-monospace, monospace;
          color: rgba(255,255,255,0.65); font-weight: 500;
        }
        [data-theme='light'] .csm-tech-badge {
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.08);
          color: rgba(0,0,0,0.55);
        }
        .csm-tech-logo {
          width: 11px; height: 11px;
          object-fit: contain; flex-shrink: 0;
        }

        /* Divider */
        .csm-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 4px 0 20px;
          transition: opacity 0.3s 0.26s ease;
        }
        [data-theme='light'] .csm-divider { background: rgba(0,0,0,0.07); }
        .csm-divider[data-phase='opening'] { opacity: 0; animation: csm-fade-in 0.3s 0.26s ease forwards; }
        .csm-divider[data-phase='open'] { opacity: 1; }

        /* ══════════════════════════════════════
           DESIGN PROCESS SECTION
        ══════════════════════════════════════ */
        .csm-process-section {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .csm-process-section[data-phase='opening'] {
          opacity: 0; transform: translateY(10px);
          animation: csm-row-in 0.3s 0.30s ease forwards;
        }
        .csm-process-section[data-phase='open'] { opacity: 1; transform: none; }

        .csm-section-header { margin-bottom: 14px; }
        .csm-eyebrow {
          font-size: 9px; font-family: ui-monospace, monospace;
          letter-spacing: 0.16em; color: #2DD4BF; font-weight: 700;
          text-transform: uppercase; display: block; margin-bottom: 3px;
        }
        [data-theme='light'] .csm-eyebrow { color: #0D9488; }
        .csm-section-title {
          font-size: 15px; font-weight: 700;
          color: var(--text, #fff); letter-spacing: -0.02em;
          font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
        }
        [data-theme='light'] .csm-section-title { color: #0f1012; }

        .csm-process-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (max-width: 500px) {
          .csm-process-grid { grid-template-columns: 1fr; }
        }

        .csm-process-card {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 13px; border-radius: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.18s ease, border-color 0.18s ease;
          animation: csm-card-in 0.3s calc(0.32s + var(--delay, 0ms)) ease both;
        }
        [data-theme='light'] .csm-process-card {
          background: rgba(0,0,0,0.025);
          border-color: rgba(0,0,0,0.07);
        }
        .csm-panel[data-phase='open'] .csm-process-card { animation: none; }
        .csm-process-card:hover {
          background: rgba(45,212,191,0.05);
          border-color: rgba(45,212,191,0.16);
        }
        [data-theme='light'] .csm-process-card:hover {
          background: rgba(13,148,136,0.04);
          border-color: rgba(13,148,136,0.14);
        }
        @keyframes csm-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }

        .csm-process-icon {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          background: rgba(45,212,191,0.1); border: 1px solid rgba(45,212,191,0.2);
          color: #2DD4BF;
        }
        [data-theme='light'] .csm-process-icon {
          background: rgba(13,148,136,0.08);
          border-color: rgba(13,148,136,0.18);
          color: #0D9488;
        }

        .csm-process-text { flex: 1; min-width: 0; }
        .csm-process-label {
          font-size: 11.5px; font-weight: 700;
          color: var(--text, #fff); letter-spacing: -0.01em;
          margin: 0 0 2px;
          font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
        }
        [data-theme='light'] .csm-process-label { color: #0f1012; }
        .csm-process-desc {
          font-size: 10.5px; color: rgba(255,255,255,0.4);
          line-height: 1.55; margin: 0;
        }
        [data-theme='light'] .csm-process-desc { color: rgba(0,0,0,0.45); }

        /* ══════════════════════════════════════
           CTA ROW
        ══════════════════════════════════════ */
        .csm-cta-row {
          display: flex; align-items: center; gap: 10px;
          margin-top: 22px; flex-wrap: wrap;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .csm-cta-row[data-phase='opening'] {
          opacity: 0; transform: translateY(8px);
          animation: csm-row-in 0.3s 0.38s ease forwards;
        }
        .csm-cta-row[data-phase='open'] { opacity: 1; transform: none; }

        .csm-cta-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 100px;
          background: #2DD4BF; color: #0a1a18;
          font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(45,212,191,0.32);
          white-space: nowrap;
        }
        [data-theme='light'] .csm-cta-primary {
          background: #0D9488; color: #fff;
          box-shadow: 0 4px 18px rgba(13,148,136,0.24);
        }
        .csm-cta-primary:hover {
          background: #5ee9d6;
          transform: scale(1.04) translateY(-1px);
          box-shadow: 0 8px 28px rgba(45,212,191,0.42);
        }
        [data-theme='light'] .csm-cta-primary:hover { background: #0f766e; }
        .csm-cta-primary:active { transform: scale(0.97); }
        .csm-cta-arrow { transition: transform 0.2s ease; }
        .csm-cta-primary:hover .csm-cta-arrow { transform: translateX(2px); }

        .csm-cta-secondary {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 10px 16px; border-radius: 100px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          font-size: 12.5px; font-weight: 600; letter-spacing: -0.01em;
          text-decoration: none;
          transition: all 0.18s ease; white-space: nowrap;
        }
        [data-theme='light'] .csm-cta-secondary {
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.1);
          color: rgba(0,0,0,0.55);
        }
        .csm-cta-secondary:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        [data-theme='light'] .csm-cta-secondary:hover {
          background: rgba(0,0,0,0.07);
          color: #0f1012;
        }
      `}</style>
    </div>
  );

  return isOpen ? createPortal(modal, document.body) : null;
}
