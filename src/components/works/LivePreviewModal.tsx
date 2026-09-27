'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Lock, 
  RotateCw, 
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModalScrollProgress } from '@/components/ui/ScrollProgressContext';

export interface LivePreviewModalProps {
  open?: boolean;
  isOpen?: boolean;
  title: string;
  url: string;
  onClose: () => void;
}

export function LivePreviewModal({
  open,
  isOpen: propIsOpen,
  title,
  url,
  onClose,
}: LivePreviewModalProps) {
  const isOpen = Boolean(open ?? propIsOpen);

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number>(0);
  const progressTimersRef = useRef<NodeJS.Timeout[]>([]);

  useModalScrollProgress(isOpen, modalContainerRef, { hideGlobalBar: true });

  useEffect(() => {
    setMounted(true);
  }, []);

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

    const t1 = setTimeout(() => setBarTransform(0.3, 1), 60);
    const t2 = setTimeout(() => setBarTransform(0.65, 1), 350);
    const t3 = setTimeout(() => setBarTransform(0.85, 1), 850);

    progressTimersRef.current = [t1, t2, t3];
  }, [clearProgressTimers, setBarTransform]);

  const finishProgress = useCallback(() => {
    clearProgressTimers();
    setBarTransform(1, 1);

    const tFade = setTimeout(() => {
      setBarTransform(1, 0);
      setIsLoading(false);
    }, 200);

    progressTimersRef.current = [tFade];
  }, [clearProgressTimers, setBarTransform]);

  const handleIframeLoad = () => {
    finishProgress();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    startProgressSimulation();
    setIframeKey((k) => k + 1);
  };

  useEffect(() => {
    if (!isOpen) return;

    const scrollContainer = document.getElementById('scroll-container');
    const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    savedScrollPositionRef.current = scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setIsLoading(true);
    setHasError(false);
    startProgressSimulation();

    const iframeTimeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        finishProgress();
      }
    }, 6000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(iframeTimeout);
      clearProgressTimers();
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;

      if (scrollContainer) {
        scrollContainer.scrollTop = savedScrollPositionRef.current;
      } else {
        window.scrollTo({ top: savedScrollPositionRef.current, behavior: 'instant' });
      }
    };
  }, [isOpen, onClose, startProgressSimulation, finishProgress, clearProgressTimers, isLoading]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} — Live Preview` : 'Live Preview'}
      >
        {/* Dimmed Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        {/* Browser Window Container */}
        <motion.div
          ref={modalContainerRef}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex flex-col bg-[#0f1013] border border-white/10 sm:rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden w-full h-[100dvh] sm:w-[95vw] sm:max-w-[1450px] sm:h-[90vh]"
        >
          {/* Top Browser Navbar */}
          <header className="shrink-0 bg-[#141519] border-b border-white/[0.08] z-20 flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 h-12 sm:h-14 gap-2 sm:gap-4">
              
              {/* Left Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  aria-label="Refresh preview"
                  title="Reload live website"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {title && (
                  <span className="hidden sm:inline-block ml-1 text-xs font-mono text-zinc-400 font-medium truncate max-w-[160px]">
                    {title}
                  </span>
                )}
              </div>

              {/* Center Address Bar Pill */}
              <div className="flex-1 max-w-lg mx-auto flex items-center justify-center min-w-0">
                <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-300">
                  <Lock size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate flex-1 text-center font-mono text-[11px] sm:text-xs text-zinc-300">
                    {displayUrl}
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href={normalizedLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-200 hover:text-accent hover:bg-white/10 transition-colors"
                  title="Open site in new tab"
                >
                  <span>Open Site</span>
                  <ArrowUpRight size={14} />
                </a>

                <div className="w-px h-4 bg-white/10 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close live preview"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

            </div>

            {/* 2px Navbar Loading Progress Line */}
            <div className="h-[2px] w-full overflow-hidden bg-black/40 relative shrink-0" aria-hidden="true">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-left bg-accent shadow-[0_0_8px_var(--accent,#2dd4bf)]"
                style={{
                  transform: 'scaleX(0)',
                  opacity: 0,
                  willChange: 'transform, opacity',
                  transition: 'transform 120ms ease-out, opacity 200ms ease-out',
                }}
              />
            </div>
          </header>

          {/* Viewport Area */}
          <div className="min-h-0 flex-1 w-full h-full relative bg-[#090a0d] flex flex-col overflow-hidden">
            {!hasError ? (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={normalizedLiveUrl}
                title={title || 'Live Website Preview'}
                onLoad={handleIframeLoad}
                onError={() => {
                  setHasError(true);
                  finishProgress();
                }}
                className="w-full h-full flex-1 border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              /* Minimal Blocked Website Fallback */
              <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center text-zinc-300 my-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 mb-4 text-accent">
                  <Globe size={24} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">
                  Embedded viewing unavailable
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
                  This website restricts direct iframe embedding via security policies (<code className="text-zinc-300 font-mono text-[11px]">X-Frame-Options</code>).
                </p>
                <a
                  href={normalizedLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs sm:text-sm hover:brightness-110 transition-all shadow-md shadow-accent/20"
                >
                  <span>Open Site</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
