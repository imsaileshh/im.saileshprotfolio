'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Loader2, 
  Lock, 
  RotateCw, 
  X,
  AlertCircle,
  ShieldAlert,
  Monitor
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';
import { ProjectCover, DEFAULT_PROJECT_COVER } from '@/components/projects/ProjectCover';

export interface LivePreviewModalProps {
  open?: boolean;
  isOpen?: boolean;
  title: string;
  url: string;
  previewMode?: 'iframe' | 'external' | string;
  previewImageUrl?: string | null;
  onClose: () => void;
}

export function LivePreviewModal({
  open,
  isOpen: propIsOpen,
  title,
  url,
  previewMode = 'iframe',
  previewImageUrl,
  onClose,
}: LivePreviewModalProps) {
  const isOpen = Boolean(open ?? propIsOpen);

  const initialMode = previewMode === 'external' ? 'external' : 'iframe';
  const [activeMode, setActiveMode] = useState<'iframe' | 'external'>(initialMode);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  // Sync mode if prop changes
  useEffect(() => {
    setActiveMode(previewMode === 'external' ? 'external' : 'iframe');
  }, [previewMode, url]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number>(0);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const progressTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Tell global scroll progress system to track this modal and hide the global ceiling bar
  useModalScrollProgress(isOpen, modalContainerRef, { hideGlobalBar: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize URL and auto-embed Figma if a Figma prototype is used
  const normalizedLiveUrl = (() => {
    if (!url) return '';
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    if (finalUrl.includes('figma.com') && !finalUrl.includes('embed')) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(finalUrl)}`;
    }
    return finalUrl;
  })();

  // Clean domain display for the address bar
  const displayUrl = (() => {
    try {
      if (!url) return '';
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = parsed.hostname.replace(/^www\./, '');
      const path = parsed.pathname !== '/' ? parsed.pathname : '';
      return host + path;
    } catch {
      return (url || '').replace(/^https?:\/\//, '').replace(/^www\./, '');
    }
  })();

  // ── Animated 2px Loading Progress Bar ──────────────────────────────────────
  const clearProgressTimers = useCallback(() => {
    progressTimersRef.current.forEach((t) => clearTimeout(t));
    progressTimersRef.current = [];
  }, []);

  const setBarTransform = useCallback((scale: number, opacity: number = 1) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.opacity = `${opacity}`;
      progressBarRef.current.style.transform = `scaleX(${scale})`;
    }
  }, []);

  const startProgressSimulation = useCallback(() => {
    clearProgressTimers();
    setBarTransform(0, 1);

    const t1 = setTimeout(() => setBarTransform(0.25, 1), 60);
    const t2 = setTimeout(() => setBarTransform(0.55, 1), 350);
    const t3 = setTimeout(() => setBarTransform(0.80, 1), 850);

    progressTimersRef.current = [t1, t2, t3];
  }, [clearProgressTimers, setBarTransform]);

  const finishProgress = useCallback(() => {
    clearProgressTimers();
    setBarTransform(1, 1);

    const tFade = setTimeout(() => {
      setBarTransform(1, 0);
      setIsLoading(false);
    }, 220);

    progressTimersRef.current = [tFade];
  }, [clearProgressTimers, setBarTransform]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    finishProgress();
  };

  // Safe Back button handler (controls iframe history without navigating main page)
  const handleBack = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.back();
      }
    } catch {
      // Cross-origin restriction safely handled
    }
  };

  // Safe Forward button handler
  const handleForward = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.forward();
      }
    } catch {
      // Cross-origin restriction safely handled
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    if (activeMode === 'iframe') {
      setIsLoading(true);
      setShowSlowNotice(false);
      startProgressSimulation();
      setIframeKey((k) => k + 1);
    }
  };

  // ── Scroll Lock, Escape key, and Focus Management ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Capture exact scroll position
    const scrollContainer = document.getElementById('scroll-container');
    const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    savedScrollPositionRef.current = scrollY;

    // Lock body scrolling
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (activeMode === 'iframe') {
      setIsLoading(true);
      setShowSlowNotice(false);
      startProgressSimulation();

      // Timer to notify if page takes long to respond or has frame restrictions
      const slowNoticeTimer = setTimeout(() => {
        setShowSlowNotice(true);
        finishProgress();
      }, 5000);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(slowNoticeTimer);
        clearProgressTimers();
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalBodyOverflow;

        // Restore scroll position
        if (scrollContainer) {
          scrollContainer.scrollTop = savedScrollPositionRef.current;
        } else {
          window.scrollTo({ top: savedScrollPositionRef.current, behavior: 'instant' });
        }

        // Restore focus
        if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
          lastActiveElementRef.current.focus();
        }
      };
    } else {
      setIsLoading(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearProgressTimers();
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalBodyOverflow;

        if (scrollContainer) {
          scrollContainer.scrollTop = savedScrollPositionRef.current;
        } else {
          window.scrollTo({ top: savedScrollPositionRef.current, behavior: 'instant' });
        }

        if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
          lastActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, activeMode, onClose, startProgressSimulation, finishProgress, clearProgressTimers]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} — Live Preview` : 'Live Preview'}
      >
        {/* ── Dimmed & Blurred Backdrop ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        {/* ── Browser Window Container ── */}
        <motion.div
          ref={modalContainerRef}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex flex-col bg-[#0f1013] border border-white/10 sm:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden w-full h-[100dvh] sm:w-[95vw] sm:max-w-[1450px] sm:h-[90vh]"
        >
          {/* ── Fixed Top Browser Navbar ── */}
          <header className="shrink-0 bg-[#141519] border-b border-white/[0.08] z-20 flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 h-12 sm:h-14 gap-2 sm:gap-4">
              
              {/* Left: Navigation Controls (Back, Forward, Reload) */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={activeMode !== 'iframe'}
                  aria-label="Back"
                  title="Back (if supported by page)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleForward}
                  disabled={activeMode !== 'iframe'}
                  aria-label="Forward"
                  title="Forward (if supported by page)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={activeMode !== 'iframe'}
                  aria-label="Refresh preview"
                  title="Reload live website"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {/* Title on larger screens */}
                {title && (
                  <span className="hidden lg:inline-block ml-2 text-xs font-mono text-zinc-400 font-medium truncate max-w-[160px]">
                    {title}
                  </span>
                )}
              </div>

              {/* Center: Address Bar Pill */}
              <div className="flex-1 max-w-lg mx-auto flex items-center justify-center min-w-0">
                <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-300">
                  <Lock size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate flex-1 text-center font-mono text-[11px] sm:text-xs text-zinc-300">
                    {displayUrl}
                  </span>
                  {activeMode === 'iframe' && isLoading && (
                    <Loader2 size={12} className="animate-spin text-accent shrink-0" />
                  )}
                </div>
              </div>

              {/* Right: Open in New Tab & Close Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-200 hover:text-accent hover:bg-white/10 transition-colors"
                  title="Open site in new tab"
                  aria-label="Open site in new tab"
                >
                  <span className="hidden sm:inline text-xs">Open Site</span>
                  <ArrowUpRight size={14} />
                </a>

                <div className="w-px h-4 bg-white/10 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close live preview"
                  title="Close (Esc)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

            </div>

            {/* ── 2px Navbar Loading Progress Line ── */}
            {activeMode === 'iframe' && (
              <div className="h-[2px] w-full overflow-hidden bg-black/40 relative shrink-0" aria-hidden="true">
                <div
                  ref={progressBarRef}
                  className="h-full w-full origin-left bg-[var(--accent,#2dd4bf)] shadow-[0_0_8px_var(--accent,#2dd4bf)]"
                  style={{
                    transform: 'scaleX(0)',
                    opacity: 0,
                    willChange: 'transform, opacity',
                    transition: 'transform 120ms ease-out, opacity 200ms ease-out',
                  }}
                />
              </div>
            )}
          </header>

          {/* ── Viewport Area ── */}
          {activeMode === 'iframe' ? (
            /* ── MODE A: REAL INTERACTIVE LIVE WEBSITE (IFRAME) ── */
            <div className="min-h-0 flex-1 w-full h-full relative bg-white flex flex-col overflow-hidden">
              
              {/* Subtle Loading Spinner Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090a0d]/80 backdrop-blur-xs gap-3 pointer-events-none">
                  <Loader2 size={26} className="animate-spin text-accent" />
                  <span className="text-xs font-mono text-zinc-400">Loading website...</span>
                </div>
              )}

              {/* Floating Banner if site is taking long to load or blocks iframe embedding */}
              {showSlowNotice && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#141519]/95 border border-white/15 text-xs text-zinc-300 shadow-2xl backdrop-blur-md max-w-lg w-[92%] animate-fade-in">
                  <AlertCircle size={15} className="text-amber-400 shrink-0" />
                  <span className="flex-1 truncate text-[11.5px]">
                    Site taking long or blocking in-frame embed?
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMode('external')}
                      className="text-xs font-mono text-zinc-300 hover:text-white underline cursor-pointer"
                    >
                      Show Preview Card
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      Open Site <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Actual Live Website Running Inside Iframe */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={normalizedLiveUrl}
                title={title || 'Live Website Preview'}
                onLoad={handleIframeLoad}
                className="w-full h-full flex-1 border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

            </div>
          ) : (
            /* ── MODE B: FALLBACK BROWSER-STYLE SCREENSHOT PREVIEW ── */
            <div className="min-h-0 flex-1 w-full h-full relative bg-[#090a0d] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
              
              {/* Blurred ambient background glow from the project cover */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 filter blur-3xl">
                <ProjectCover
                  src={previewImageUrl || DEFAULT_PROJECT_COVER}
                  alt=""
                  aspectRatio="auto"
                  className="w-full h-full scale-125 object-cover"
                />
              </div>

              {/* High-Fidelity Browser Mockup Card */}
              <div className="relative z-10 max-w-4xl w-full flex flex-col rounded-2xl border border-white/10 bg-[#121316]/95 backdrop-blur-md shadow-2xl overflow-hidden my-auto">
                
                {/* Mockup Top Sub-Header */}
                <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#16171c] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px]">
                      <ShieldAlert size={12} />
                      Preview Mode
                    </span>
                    <span className="font-mono text-zinc-300 text-xs hidden sm:inline">
                      {displayUrl}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Direct embed restricted by target site security headers
                  </span>
                </div>

                {/* Screenshot / Cover Preview Image */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] bg-zinc-950 overflow-hidden border-b border-white/[0.08]">
                  <ProjectCover
                    src={previewImageUrl || DEFAULT_PROJECT_COVER}
                    alt={title}
                    aspectRatio="auto"
                    className="w-full h-full"
                    imageClassName="object-cover object-top"
                  />
                  {/* Subtle dark bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent pointer-events-none opacity-60" />
                </div>

                {/* Footer Action Area */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121316]">
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {title || 'Live Website Preview'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md">
                      This website protects its interface with security policies (<code className="text-zinc-300 font-mono text-[11px]">X-Frame-Options: DENY</code>). Click below to view the live interactive site.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        setShowSlowNotice(false);
                        startProgressSimulation();
                        setActiveMode('iframe');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
                      title="Try loading interactive iframe anyway"
                    >
                      <Monitor size={13} />
                      <span>Try Live Embed</span>
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent,#2dd4bf)] text-black text-xs font-semibold hover:brightness-110 shadow-lg shadow-[var(--accent,#2dd4bf)]/20 transition-all cursor-pointer"
                    >
                      <span>Open Live Website</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>

              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
