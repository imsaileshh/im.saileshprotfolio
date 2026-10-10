'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useScrollProgress } from './ScrollProgressContext';

export function ScrollProgressBar() {
  const pathname = usePathname();
  const { activeModalElement, hideGlobalProgress } = useScrollProgress();
  const barRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const isRouteLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let targetEl: HTMLElement | Window | null = null;

    function getTarget(): HTMLElement | Window {
      if (activeModalElement && document.body.contains(activeModalElement)) {
        return activeModalElement;
      }
      if (targetEl && (targetEl === window || document.body.contains(targetEl as Node))) {
        return targetEl;
      }
      if (pathname.startsWith('/dashboard')) {
        const dMain = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
        if (dMain) {
          targetEl = dMain;
          return dMain;
        }
      }
      const desktopContainer = document.getElementById('scroll-container');
      if (desktopContainer) {
        targetEl = desktopContainer;
        return desktopContainer;
      }
      targetEl = window;
      return window;
    }

    function updateProgress() {
      if (!bar) return;

      if (hideGlobalProgress || isRouteLoadingRef.current) {
        bar.style.opacity = '0';
        return;
      }

      const target = getTarget();
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (target instanceof HTMLElement) {
        scrollTop = target.scrollTop;
        if (scrollTop <= 0) {
          bar.style.opacity = '0';
          bar.style.transform = 'scaleX(0)';
          return;
        }
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        if (scrollTop <= 0) {
          bar.style.opacity = '0';
          bar.style.transform = 'scaleX(0)';
          return;
        }
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      }

      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 2) {
        bar.style.opacity = '0';
        bar.style.transform = 'scaleX(0)';
        return;
      }

      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      bar.style.opacity = '1';
      bar.style.transform = `scaleX(${progress})`;
    }

    function scheduleUpdate() {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateProgress();
      });
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    const currentTarget = getTarget();
    if (currentTarget instanceof HTMLElement) {
      currentTarget.addEventListener('scroll', scheduleUpdate, { passive: true });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && activeModalElement && activeModalElement instanceof HTMLElement) {
      resizeObserver = new ResizeObserver(() => scheduleUpdate());
      resizeObserver.observe(activeModalElement);
    }

    const handleRouteStart = () => {
      isRouteLoadingRef.current = true;
      if (bar) bar.style.opacity = '0';
    };

    const handleRouteDone = () => {
      setTimeout(() => {
        isRouteLoadingRef.current = false;
        scheduleUpdate();
      }, 250);
    };

    window.addEventListener('route-progress-start', handleRouteStart);
    window.addEventListener('route-progress-done', handleRouteDone);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('route-progress-start', handleRouteStart);
      window.removeEventListener('route-progress-done', handleRouteDone);

      if (currentTarget instanceof HTMLElement) {
        currentTarget.removeEventListener('scroll', scheduleUpdate);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [activeModalElement, hideGlobalProgress, pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="scroll-progress-indicator pointer-events-none fixed top-0 left-0 z-[99990] h-[2px] w-full origin-left bg-accent shadow-[0_0_8px_var(--accent,#2dd4bf)]"
      style={{
        transform: 'scaleX(0)',
        opacity: 0,
        transition: 'transform 60ms linear, opacity 180ms ease-out',
      }}
    />
  );
}
