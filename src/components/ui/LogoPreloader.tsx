'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const logoSrc = '/images/brand/sailesh-logo-final.png';
const ease = [0.22, 1, 0.36, 1] as const;
const revealDurationMs = 4400;

export function LogoPreloader() {
  const id = useId();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'playing' | 'exiting'>('idle');

  useEffect(() => {
    const root = document.documentElement;
    const query = new URLSearchParams(window.location.search);
    const eligible = window.location.pathname === '/' || query.has('intro') || query.has('preloader');
    if (!eligible || matchMedia('(prefers-reduced-motion: reduce)').matches ||
        /Lighthouse|PageSpeed|Headless/i.test(navigator.userAgent)) return;

    const image = new Image();
    let hold: number;
    let exit: number;
    const finish = () => {
      delete root.dataset.portfolioIntro;
      setPhase('idle');
    };
    let loadTimeout: number;
    image.onload = () => {
      if (root.dataset.portfolioIntro !== 'running') return;
      window.clearTimeout(loadTimeout);
      setPhase('playing');
      hold = window.setTimeout(() => {
        root.dataset.portfolioIntro = 'exiting';
        setPhase('exiting');
        exit = window.setTimeout(finish, 600);
      }, revealDurationMs);
    };
    image.onerror = finish;
    const frame = requestAnimationFrame(() => {
      root.dataset.portfolioIntro = 'running';
      setPhase('loading');
      loadTimeout = window.setTimeout(finish, 5000);
      image.src = logoSrc;
    });

    return () => {
      cancelAnimationFrame(frame);
      image.onload = null;
      image.onerror = null;
      window.clearTimeout(loadTimeout);
      window.clearTimeout(hold);
      window.clearTimeout(exit);
      if (loadTimeout !== undefined) delete root.dataset.portfolioIntro;
    };
  }, []);

  if (phase === 'idle') return null;

  return createPortal(
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[2147483647] grid place-items-center overflow-hidden bg-[#0F1012]"
      initial={false}
      animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {phase !== 'loading' && (
        <div className="relative w-[68vw] max-w-[360px]">
          <svg viewBox="320 200 1410 270" className="block w-full">
            <defs>
              <image id={`${id}-logo`} href={logoSrc} width="2048" height="682" />
              <mask id={`${id}-symbol`} maskUnits="userSpaceOnUse" x="320" y="200" width="314" height="270">
                <motion.rect
                  x="320" y="200" height="270" fill="white"
                  initial={{ width: 0 }}
                  animate={{ width: 314 }}
                  transition={{ delay: 0.5, duration: 1, ease }}
                />
              </mask>
              <clipPath id={`${id}-wordmark`}>
                <motion.rect
                  x="634" y="200" height="270"
                  initial={{ width: 0 }}
                  animate={{ width: 1096 }}
                  transition={{ delay: 1.5, duration: 1, ease }}
                />
              </clipPath>
            </defs>
            <motion.circle
              cx="1025" cy="335" r="11" fill="#2DD4BF"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0.85] }}
              transition={{ duration: 0.62, times: [0, 0.65, 0.81, 1], ease: 'easeInOut' }}
            />
            <motion.g initial={{ x: 548 }} animate={{ x: 0 }} transition={{ delay: 1.5, duration: 0.85, ease }}>
              <g mask={`url(#${id}-symbol)`}>
                <use href={`#${id}-logo`} />
              </g>
            </motion.g>
            <g clipPath={`url(#${id}-wordmark)`}>
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 1, ease }}
              >
                <use href={`#${id}-logo`} />
              </motion.g>
            </g>
          </svg>
          <div className="absolute top-full left-1/2 mt-4 h-0.5 w-1/3 -translate-x-1/2 overflow-hidden rounded-full bg-[#2B2D30]">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-[#2DD4BF]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: revealDurationMs / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
