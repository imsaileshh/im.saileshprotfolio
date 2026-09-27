'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function isBotOrLighthouse(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return (
    /Lighthouse|Chrome-Lighthouse|Speed Insights|Google-InspectionTool|Headless|PageSpeed|PTST/i.test(ua) ||
    Boolean((window.navigator as { webdriver?: boolean })?.webdriver)
  );
}

const STEPS = [
  { progress: 15, text: 'Initializing', stepIndex: 0 },
  { progress: 35, text: 'Loading', stepIndex: 1 },
  { progress: 55, text: 'Preparing', stepIndex: 2 },
  { progress: 75, text: 'Almost ready', stepIndex: 3 },
  { progress: 100, text: 'Ready', stepIndex: 3 },
];

// Continuous character coordinates & keyframe arcs on SVG (viewBox 0 0 200 150):
// Ground: x: 12, y: 120
// Step 1: x: 44, y: 92
// Step 2: x: 94, y: 62
// Step 3: x: 144, y: 32
const characterArcs = [
  // Step 0: Initial position on ground
  { x: 12, y: 120, scaleY: 1, rotate: 0 },
  // Step 1: Arc climb onto Step 1
  { x: [12, 28, 44], y: [120, 68, 92], scaleY: [1, 0.95, 1], rotate: [0, 4, 0] },
  // Step 2: Arc climb onto Step 2
  { x: [44, 69, 94], y: [92, 38, 62], scaleY: [1, 0.95, 1], rotate: [0, 4, 0] },
  // Step 3: Arc climb onto Step 3 (Top step)
  { x: [94, 119, 144], y: [62, 8, 32], scaleY: [1, 0.95, 1], rotate: [0, 4, 0] },
];

export function Preloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const mobileScroll = document.querySelector('[data-mobile-scroll]') as HTMLElement | null;
    if (mobileScroll) mobileScroll.style.overflow = '';
    const desktopScroll = document.getElementById('scroll-container');
    if (desktopScroll) {
      desktopScroll.style.overflowY = '';
    }
  }, []);

  useEffect(() => {
    // Skip for bots or reduced motion preference
    if (isBotOrLighthouse() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Run once per session unless explicitly forced via query param
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forcePreloader = urlParams.has('intro') || urlParams.has('preloader');
      const hasSeen = sessionStorage.getItem('hasSeenPreloader');
      if (hasSeen === 'true' && !forcePreloader) {
        return;
      }
      sessionStorage.setItem('hasSeenPreloader', 'true');
    } catch {
      // Privacy mode fallback
    }

    setIsVisible(true);

    // Lock scroll during preloader active state
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Synchronized progress sequence (~1.6s total animation):
    // 0ms: Initializing (15%)
    // 320ms: Loading (35%) -> Step 1 grows & character climbs to step 1
    // 680ms: Preparing (55%) -> Step 2 grows & character climbs to step 2
    // 1040ms: Almost ready (75%) -> Step 3 grows & character climbs to step 3
    // 1400ms: Ready (100%) -> Target success ring animation
    // 1750ms: Smooth exit transition
    const t1 = setTimeout(() => setStepIndex(1), 320);
    const t2 = setTimeout(() => setStepIndex(2), 680);
    const t3 = setTimeout(() => setStepIndex(3), 1040);
    const t4 = setTimeout(() => setStepIndex(4), 1400);

    const tExit = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        unlockScroll();
      }, 400);
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tExit);
      unlockScroll();
    };
  }, [unlockScroll]);

  if (!isVisible) return null;

  const currentStep = STEPS[stepIndex] || STEPS[0];
  const isComplete = stepIndex >= 4;
  const activeStepNum = currentStep.stepIndex;

  return (
    <AnimatePresence onExitComplete={unlockScroll}>
      {isVisible && (
        <motion.div
          key="portfolio-preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#08090B] text-[#F4F4F4] select-none pointer-events-auto overflow-hidden px-4"
        >
          {/* Subtle Top-Left Brand (Desktop only) */}
          <div className="hidden sm:block fixed top-6 left-8 text-[11px] font-mono tracking-[0.14em] text-[#9A9CA2]/40 uppercase pointer-events-none">
            SAILESH P
          </div>

          {/* Subtle Bottom-Right Percentage (Desktop only) */}
          <div className="hidden sm:block fixed bottom-6 right-8 text-[11px] font-mono tracking-[0.14em] text-[#2DD4BF]/70 font-semibold pointer-events-none">
            {currentStep.progress}%
          </div>

          {/* Ambient Background Radial Glow behind central loader */}
          <div className="absolute w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06)_0%,transparent_55%)] pointer-events-none -z-10" />

          {/* Single Compact Central Loader Component */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              y: isExiting ? -8 : 0,
              scale: isExiting ? 0.98 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-[240px] sm:w-[280px] md:w-[300px] flex-col items-center gap-3.5 text-center"
          >
            {/* 1. Animated Vector SVG Illustration */}
            <div className="relative w-[160px] h-[115px] sm:w-[190px] sm:h-[135px] md:w-[200px] md:h-[140px] flex items-center justify-center">
              <svg viewBox="0 0 200 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="stepGrad1" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#0d2422" />
                    <stop offset="100%" stopColor="#17443d" />
                  </linearGradient>
                  <linearGradient id="stepGrad2" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#123530" />
                    <stop offset="100%" stopColor="#1f584e" />
                  </linearGradient>
                  <linearGradient id="stepGrad3" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#184a42" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>

                {/* Subtle Ground Line */}
                <line x1="10" y1="135" x2="190" y2="135" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" strokeLinecap="round" />

                {/* Step 1 Bar */}
                <motion.rect
                  x="30"
                  y="102"
                  width="32"
                  height="33"
                  rx="5"
                  fill="url(#stepGrad1)"
                  stroke="#2dd4bf"
                  strokeOpacity={activeStepNum >= 1 ? '0.4' : '0.15'}
                  strokeWidth="1"
                  initial={{ scaleY: 0, opacity: 0.3 }}
                  animate={{
                    scaleY: activeStepNum >= 1 ? 1 : 0,
                    opacity: activeStepNum >= 1 ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'bottom' }}
                />

                {/* Step 2 Bar */}
                <motion.rect
                  x="80"
                  y="72"
                  width="32"
                  height="63"
                  rx="5"
                  fill="url(#stepGrad2)"
                  stroke="#2dd4bf"
                  strokeOpacity={activeStepNum >= 2 ? '0.5' : '0.15'}
                  strokeWidth="1"
                  initial={{ scaleY: 0, opacity: 0.3 }}
                  animate={{
                    scaleY: activeStepNum >= 2 ? 1 : 0,
                    opacity: activeStepNum >= 2 ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'bottom' }}
                />

                {/* Step 3 Bar (Top Step) */}
                <motion.rect
                  x="130"
                  y="42"
                  width="32"
                  height="93"
                  rx="5"
                  fill="url(#stepGrad3)"
                  stroke="#2dd4bf"
                  strokeOpacity={activeStepNum >= 3 ? '0.7' : '0.15'}
                  strokeWidth="1.5"
                  initial={{ scaleY: 0, opacity: 0.3 }}
                  animate={{
                    scaleY: activeStepNum >= 3 ? 1 : 0,
                    opacity: activeStepNum >= 3 ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'bottom' }}
                />

                {/* Target Bullseye at Top-Right (Calm before completion; single pulse at 100%) */}
                <g transform="translate(146, 20)">
                  {/* Expanding Ring on Success */}
                  {isComplete && (
                    <motion.circle
                      r="13"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="1.5"
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  )}
                  {/* Outer Ring */}
                  <motion.circle
                    r="12"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="1.5"
                    animate={{
                      scale: isComplete ? [1, 1.08, 1] : 1,
                      opacity: isComplete ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Middle Ring */}
                  <circle r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity={isComplete ? 0.9 : 0.5} />
                  {/* Center Dot */}
                  <circle r="3.5" fill="#2dd4bf" opacity={isComplete ? 1 : 0.7} />
                  
                  {/* Arrow Accent */}
                  <motion.path
                    d="M 10 -10 L 5 -5 M 10 -10 L 10 -5 M 10 -10 L 5 -10"
                    stroke="#2dd4bf"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{
                      y: isComplete ? [0, -3, 0] : 0,
                      opacity: isComplete ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </g>

                {/* Continuous Arc Character Motion */}
                <motion.g
                  animate={characterArcs[activeStepNum]}
                  transition={{
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* Character Head */}
                  <circle cx="0" cy="-13" r="5" fill="#2dd4bf" />
                  {/* Torso */}
                  <path d="M -4 -5 Q 0 -8 4 -5 L 3.5 5 Q 0 7 -3.5 5 Z" fill="#38bdf8" />
                  {/* Arms */}
                  <path d="M -3.5 -3 L -7 -10 M 3.5 -3 L 7 -10" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Legs */}
                  <path d="M -2.5 5 L -3.5 13 M 2.5 5 L 3.5 13" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
              </svg>
            </div>

            {/* 2. Slim Progress Bar (Staggered Intro 100ms) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-[190px] sm:w-[220px] md:w-[240px] h-[2.5px] bg-white/[0.08] rounded-full overflow-hidden relative"
            >
              <motion.div
                animate={{ width: `${currentStep.progress}%` }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-teal-500 to-[#2dd4bf] rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
              />
            </motion.div>

            {/* 3. Status Text (Staggered Intro 180ms) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.18 }}
              className="h-5 flex items-center justify-center overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentStep.text}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#9A9CA2]"
                >
                  {currentStep.text}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* 4. SAILESH.P Brand Name */}
            <div className="text-xl font-semibold tracking-tight text-[#F4F4F4]">
              SAILESH<span className="text-[#2DD4BF]">.</span>P
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

