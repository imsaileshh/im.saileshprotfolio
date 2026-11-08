'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const logoSrc = '/images/brand/sailesh-logo-transparent.png';
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
        <svg viewBox="0 0 1283 309" className="block w-[86vw] max-w-[960px]">
          <defs>
            <image id={`${id}-logo`} href={logoSrc} width="1283" height="309" />
            <mask id={`${id}-symbol`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="309">
              <motion.rect
                x="0" y="0" height="309" fill="white"
                initial={{ width: 0 }}
                animate={{ width: 300 }}
                transition={{ delay: 0.5, duration: 1, ease }}
              />
            </mask>
            <clipPath id={`${id}-wordmark`}>
              <motion.rect
                x="300" y="0" height="309"
                initial={{ width: 0 }}
                animate={{ width: 983 }}
                transition={{ delay: 1.5, duration: 1, ease }}
              />
            </clipPath>
          </defs>
          <motion.circle
            cx="641.5" cy="154.5" r="11" fill="#2DD4BF"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0.85] }}
            transition={{ duration: 0.62, times: [0, 0.65, 0.81, 1], ease: 'easeInOut' }}
          />
          <motion.g initial={{ x: 478 }} animate={{ x: 0 }} transition={{ delay: 1.5, duration: 0.85, ease }}>
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
      )}
    </motion.div>,
    document.body,
  );
}
