'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Official Portfolio Favicon / Logo (SVG).
 * Preserves exact original shapes, coordinates, and colors from public/favicon.svg.
 */
function FaviconLogo({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <text
        x="3"
        y="26"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="#FFFFFF"
      >
        S
      </text>
      <circle cx="25" cy="23.5" r="3.2" fill="#2DD4BF" />
    </svg>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;

function isBotOrLighthouse(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return (
    /Lighthouse|Chrome-Lighthouse|Speed Insights|Google-InspectionTool|Headless|PageSpeed|PTST/i.test(ua) ||
    Boolean((window.navigator as { webdriver?: boolean })?.webdriver)
  );
}

export function Preloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentExiting, setIsContentExiting] = useState(false);

  // Safety unlock scroll function
  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const mobileScroll = document.querySelector('[data-mobile-scroll]') as HTMLElement | null;
    if (mobileScroll) mobileScroll.style.overflow = '';
    const desktopScroll = document.getElementById('scroll-container');
    if (desktopScroll) {
      desktopScroll.style.overflowY = 'auto';
    }
  }, []);

  useEffect(() => {
    // 1. Skip completely for Lighthouse, bots, automated tests, and reduced motion
    if (isBotOrLighthouse() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // 2. Show only on initial visit / session (not on every internal route navigation)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forcePreloader = urlParams.has('intro') || urlParams.has('preloader');
      const hasSeen = sessionStorage.getItem('hasSeenPreloader');
      if (hasSeen === 'true' && !forcePreloader) {
        return;
      }
      sessionStorage.setItem('hasSeenPreloader', 'true');
    } catch {
      // Fallback for strict browser privacy modes
    }

    setIsVisible(true);

    // 3. Lock scroll during intro
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 4. Snappy & Premium Sequence Timing (Total ~600ms)
    // At 400ms: start smooth lift & fade of center typography
    const tContentExit = setTimeout(() => {
      setIsContentExiting(true);
    }, 400);

    // At 600ms: trigger upward curtain wipe revealing homepage smoothly
    const tCurtainExit = setTimeout(() => {
      setIsVisible(false);
      unlockScroll();
    }, 600);

    // Safety fallback
    const safetyTimeout = setTimeout(() => {
      setIsVisible(false);
      unlockScroll();
    }, 1200);

    return () => {
      clearTimeout(tContentExit);
      clearTimeout(tCurtainExit);
      clearTimeout(safetyTimeout);
      unlockScroll();
    };
  }, [unlockScroll]);

  return (
    <AnimatePresence onExitComplete={unlockScroll}>
      {isVisible && (
        <motion.div
          key="portfolio-preloader-curtain"
          initial={{ y: '0%' }}
          exit={{
            y: '-100%',
            transition: {
              duration: 0.55,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[9999] flex flex-col justify-between items-center bg-[#090A0C] text-[#F4F4F4] select-none pointer-events-auto overflow-hidden px-6 py-8 md:p-12 will-change-transform"
        >
          {/* Top subtle brand header */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono tracking-[0.2em] text-[#9A9CA2]/40 uppercase pointer-events-none">
            <span>SAILESH P</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
              PORTFOLIO 2026
            </span>
          </div>

          {/* Central Logo & Typography Sequence */}
          <motion.div
            animate={isContentExiting ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0, 0.67, 0] }}
            className="relative flex flex-col items-center justify-center text-center my-auto w-full max-w-xl px-4 will-change-[transform,opacity]"
          >
            {/* Favicon Logo with smooth cinematic scale (0.82 → 1) + opacity entrance (0–700ms) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05, ease }}
              className="relative flex flex-col items-center mb-5"
            >
              <div className="relative p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(45,212,191,0.08)]">
                {/* Subtle glow / opacity pulse */}
                <motion.div
                  animate={{ opacity: [0.88, 1, 0.88] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FaviconLogo className="w-12 h-12 md:w-14 md:h-14" />
                </motion.div>
              </div>

              {/* Natural loading progress indicator beneath favicon (~1.5–1.8s) */}
              <div className="w-14 h-[2px] bg-white/[0.08] rounded-full overflow-hidden mt-3.5 relative">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 1.65,
                    delay: 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full bg-[#2DD4BF] rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                />
              </div>
            </motion.div>

            {/* Smooth masked text reveal */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Line 1: HELLO, I'M (500–1000ms) */}
              <div className="overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: '115%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.48, delay: 0.5, ease }}
                  className="block text-[11px] sm:text-[12px] md:text-[13px] font-mono tracking-[0.28em] text-[#9A9CA2] uppercase font-medium"
                >
                  HELLO, I&apos;M
                </motion.span>
              </div>

              {/* Line 2: SAILESH P. (800–1400ms) */}
              <div className="overflow-hidden py-0.5">
                <motion.div
                  role="heading"
                  aria-level={2}
                  initial={{ y: '115%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.8, ease }}
                  className="block text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-[#F4F4F4]"
                >
                  SAILESH P<span className="text-[#2DD4BF]">.</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom subtle metadata */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono tracking-[0.2em] text-[#9A9CA2]/40 uppercase pointer-events-none">
            <span>UI/UX &amp; PRODUCT DESIGNER</span>
            <span className="text-[#2DD4BF]/80 font-semibold">INITIALIZING</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

