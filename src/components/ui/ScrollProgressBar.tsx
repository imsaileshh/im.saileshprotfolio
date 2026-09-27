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

    // Helper to find the active scrolling element
    function resolveTarget(): HTMLElement | Window {
      // 1. If a modal/popup is open, track its scroll container
      if (activeModalElement && document.body.contains(activeModalElement)) {
        return activeModalElement;
      }

      // 2. Check for protected dashboard main scroll container
      const dashboardMain = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
      if (dashboardMain && dashboardMain.scrollHeight > dashboardMain.clientHeight + 1) {
        return dashboardMain;
      }

      // 3. Check for desktop custom panel scroll container (#scroll-container)
      const desktopContainer = document.getElementById('scroll-container');
      if (desktopContainer && window.innerWidth >= 768) {
        return desktopContainer;
      }

      // 4. Check for mobile scroll container if scrollable
      const mobileContainer = document.querySelector('[data-mobile-scroll]') as HTMLElement | null;
      if (mobileContainer && mobileContainer.scrollHeight > mobileContainer.clientHeight + 10) {
        return mobileContainer;
      }

      // 5. Fallback to standard window scrolling
      return window;
    }

    // Function to calculate and apply scroll progress directly to the DOM
    function updateProgress() {
      if (!bar) return;

      // Hide scroll bar while route navigation loader is active or when modal prefers its own local progress
      if (hideGlobalProgress || isRouteLoadingRef.current) {
        bar.style.opacity = '0';
        return;
      }

      const target = resolveTarget();
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (target instanceof HTMLElement) {
        scrollTop = target.scrollTop;
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        clientHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      }

      const maxScroll = scrollHeight - clientHeight;
      const isScrollable = maxScroll > 2;

      if (!isScrollable) {
        bar.style.opacity = '0';
        bar.style.transform = 'scaleX(0)';
        return;
      }

      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      bar.style.opacity = '1';
      bar.style.transform = `scaleX(${progress})`;
    }

    // RequestAnimationFrame throttled scheduler
    function scheduleUpdate() {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateProgress();
      });
    }

    // ── Listeners ──

    // Capture-phase scroll listener catches scrolls on window, custom containers, and modals
    window.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    // Target-specific direct scroll listener
    const currentTarget = resolveTarget();
    if (currentTarget instanceof HTMLElement) {
      currentTarget.addEventListener('scroll', scheduleUpdate, { passive: true });
    }

    // ResizeObserver to detect dynamic content loading (images, async data)
    let resizeObserver: ResizeObserver | null = null;
    const observedElement = currentTarget instanceof HTMLElement ? currentTarget : document.documentElement;
    if (typeof ResizeObserver !== 'undefined' && observedElement) {
      resizeObserver = new ResizeObserver(() => {
        scheduleUpdate();
      });
      resizeObserver.observe(observedElement);
      // If modal is active, also observe its direct child for content height growth
      if (currentTarget instanceof HTMLElement && currentTarget.firstElementChild) {
        resizeObserver.observe(currentTarget.firstElementChild);
      }
    }

    // ── Route Loader Coordination ──
    const handleRouteStart = () => {
      isRouteLoadingRef.current = true;
      if (bar) bar.style.opacity = '0';
    };

    const handleRouteDone = () => {
      // Allow route loader to finish and fade out smoothly before restoring scroll progress
      setTimeout(() => {
        isRouteLoadingRef.current = false;
        scheduleUpdate();
      }, 250);
    };

    window.addEventListener('route-progress-start', handleRouteStart);
    window.addEventListener('route-progress-done', handleRouteDone);

    // Initial measurement
    scheduleUpdate();

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

  // Recalculate on route changes after next paint
  useEffect(() => {
    const timer = setTimeout(() => {
      if (barRef.current) {
        const isBusy = typeof document !== 'undefined' && document.documentElement.classList.contains('nprogress-busy');
        if (!isBusy) {
          isRouteLoadingRef.current = false;
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="scroll-progress-indicator pointer-events-none fixed top-0 left-0 z-[99990] h-[2px] w-full origin-left bg-accent shadow-[0_0_8px_var(--accent,#2dd4bf)]"
      style={{
        transform: 'scaleX(0)',
        opacity: 0,
        willChange: 'transform, opacity',
        transition: 'transform 60ms linear, opacity 180ms ease-out',
      }}
    />
  );
}
