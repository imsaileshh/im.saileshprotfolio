'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const logoSrc = '/images/brand/sailesh-logo-banner.png';
const ease = [0.22, 1, 0.36, 1] as const;

export function LogoPreloader() {
  const id = useId();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'playing' | 'exiting'>('idle');

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.portfolioIntro !== 'pending') return;

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
      try {
        sessionStorage.setItem('portfolio-logo-intro', 'played');
      } catch {
        // The preview still completes when storage is disabled.
      }
      setPhase('playing');
      hold = window.setTimeout(() => {
        root.dataset.portfolioIntro = 'exiting';
        setPhase('exiting');
        exit = window.setTimeout(finish, 600);
      }, 4000);
    };
    image.onerror = finish;
    const frame = requestAnimationFrame(() => {
      if (root.dataset.portfolioIntro !== 'pending') return;
      root.dataset.portfolioIntro = 'running';
      setPhase('loading');
      loadTimeout = window.setTimeout(finish, 2000);
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
        <svg viewBox="290 294 1229 253" className="block w-[86vw] max-w-[960px]">
          <defs>
            {/* Derive transparency from the dark banner matte while keeping the original RGB artwork. */}
            <filter id={`${id}-matte`} colorInterpolationFilters="sRGB">
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 4 2 0 -0.85" />
            </filter>
            <image id={`${id}-logo`} href={logoSrc} width="1774" height="887" />
            <mask id={`${id}-symbol`} maskUnits="userSpaceOnUse" x="290" y="294" width="270" height="253">
              <motion.rect
                x="290" y="294" height="253" fill="white"
                initial={{ width: 0 }}
                animate={{ width: 270 }}
                transition={{ delay: 0.5, duration: 1, ease }}
              />
            </mask>
            <clipPath id={`${id}-wordmark`}>
              <motion.rect
                x="560" y="294" height="253"
                initial={{ width: 0 }}
                animate={{ width: 959 }}
                transition={{ delay: 1.5, duration: 1, ease }}
              />
            </clipPath>
          </defs>
          <motion.circle
            cx="904.5" cy="420.5" r="11" fill="#2DD4BF"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0.85] }}
            transition={{ duration: 0.62, times: [0, 0.65, 0.81, 1], ease: 'easeInOut' }}
          />
          <motion.g initial={{ x: 479.5 }} animate={{ x: 0 }} transition={{ delay: 1.5, duration: 0.85, ease }}>
            <g mask={`url(#${id}-symbol)`}>
              <use href={`#${id}-logo`} filter={`url(#${id}-matte)`} />
            </g>
          </motion.g>
          <g clipPath={`url(#${id}-wordmark)`}>
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 1, ease }}
            >
              <use href={`#${id}-logo`} filter={`url(#${id}-matte)`} />
            </motion.g>
          </g>
        </svg>
      )}
    </motion.div>,
    document.body,
  );
}
