'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/data/navigation';

const navItems = navigation.map((item) => ({
  id: item.label.toLowerCase().replace(/\s+/g, '-'),
  icon: item.icon,
  label: item.label === 'Personal Projects' ? 'Projects' : item.label === 'Experience' ? 'Exp.' : item.label,
  ariaLabel: item.label,
  href: item.href,
}));

interface MobileBottomNavProps {
  onOpenResume?: () => void;
  onOpenHireMe?: () => void;
}

export function MobileBottomNav({}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const isExpandedRef = useRef(false);
  const isMouseOverRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Sync ref with state
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Reset state on route change
  useEffect(() => {
    setIsExpanded(false);
    isExpandedRef.current = false;
    setHoveredId(null);
  }, [pathname]);

  // ── High-performance scroll direction detection (cancelable RAF, passive, zero duplicate ticks) ──
  useEffect(() => {
    if (!hasMounted) return;

    const scrollContainer = document.querySelector('[data-mobile-scroll]');

    const getScrollY = () => {
      if (scrollContainer && scrollContainer.scrollTop > 0) {
        return scrollContainer.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const updateScrollDirection = () => {
      rafId.current = null;
      const currentScrollY = getScrollY();
      const delta = currentScrollY - lastScrollY.current;

      // Don't auto-collapse if user is interacting with the island
      if (!isMouseOverRef.current) {
        // Top of page -> Collapsed (minimal single dot)
        if (currentScrollY < 24) {
          if (isExpandedRef.current) {
            isExpandedRef.current = false;
            setIsExpanded(false);
          }
          lastScrollY.current = currentScrollY;
        } else if (Math.abs(delta) >= 25) {
          // 25px threshold before changing state — only update when state actually flips
          if (delta > 0 && !isExpandedRef.current) {
            // Scrolling DOWN -> Full menu open
            isExpandedRef.current = true;
            setIsExpanded(true);
            lastScrollY.current = currentScrollY;
          } else if (delta < 0 && isExpandedRef.current) {
            // Scrolling UP -> Full menu closed
            isExpandedRef.current = false;
            setIsExpanded(false);
            lastScrollY.current = currentScrollY;
          }
        }
      }
    };

    const onScroll = () => {
      // Deduplicate: schedule only one RAF callback per animation frame regardless of how many scroll events fire
      if (rafId.current === null) {
        rafId.current = window.requestAnimationFrame(updateScrollDirection);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      window.removeEventListener('scroll', onScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', onScroll);
      }
    };
  }, [hasMounted]);

  // Touch outside handler (to close on mobile tap outside)
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        isExpandedRef.current = false;
        setHoveredId(null);
      }
    };
    document.addEventListener('touchstart', handleTouchOutside, { passive: true });
    document.addEventListener('mousedown', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
      document.removeEventListener('mousedown', handleTouchOutside);
    };
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  // Hover handlers for the floating island container (with stable debounce to prevent flicker)
  const handleContainerMouseEnter = useCallback(() => {
    isMouseOverRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsExpanded(true);
    isExpandedRef.current = true;
  }, []);

  const handleContainerMouseLeave = useCallback(() => {
    isMouseOverRef.current = false;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      isExpandedRef.current = false;
      setHoveredId(null);
    }, 280);
  }, []);

  // Auto-close timer for touch devices
  const resetTouchTimer = useCallback(() => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      isExpandedRef.current = false;
      setHoveredId(null);
    }, 4500);
  }, []);

  const handleDotClick = useCallback(() => {
    setIsExpanded(true);
    isExpandedRef.current = true;
    resetTouchTimer();
  }, [resetTouchTimer]);

  if (!hasMounted) return null;

  return (
    <div
      className="md:hidden fixed z-[90] bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none px-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav
        ref={containerRef}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
        onClick={() => {
          if (!isExpanded) handleDotClick();
        }}
        aria-label="Mobile Navigation"
        className={`pointer-events-auto relative flex items-center justify-center bg-[var(--panel)]/95 border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.32),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-[8px] select-none transition-[width,height,border-radius,padding,border-color,background-color] duration-350 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [contain:layout_style] overflow-hidden ${
          isExpanded
            ? 'h-[62px] w-[min(320px,calc(100vw-16px))] p-1 rounded-[30px]'
            : 'h-[44px] w-[44px] rounded-full cursor-pointer hover:border-[var(--accent)]/50'
        }`}
      >
        {/* Minimal Collapsed State: Single Floating Dot (in same container) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
            isExpanded ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
          }`}
          aria-hidden={isExpanded}
        >
          <span className="absolute w-4 h-4 rounded-full bg-[var(--accent)]/20 pointer-events-none" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        </div>

        {/* Expanded State: Full Navigation Menu (fades/slides in after container expands) */}
        <div
          className={`flex items-center gap-0 transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            isExpanded
              ? 'opacity-100 scale-100 pointer-events-auto delay-100'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
          onTouchStart={resetTouchTimer}
          aria-hidden={!isExpanded}
        >
              {/* ── Regular nav items ── */}
              {navItems.map((item) => {
                let isActive = false;
                if (item.id !== 'resume') {
                  isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                }

                const isHovered = hoveredId === item.id;

                const itemContent = (
                  <div className="relative flex flex-col items-center justify-center gap-[2px] w-[48px] h-[54px] rounded-[24px] select-none overflow-hidden">
                    {/* Active/Hover pill background — Telegram-style solid fill */}
                    <div
                      className={`absolute inset-0 rounded-[24px] transition-[opacity,background-color] duration-[160ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                        isActive
                          ? 'bg-[var(--accent)]/[0.13] opacity-100'
                          : isHovered
                          ? 'bg-[var(--text)]/[0.06] opacity-100'
                          : 'opacity-0'
                      }`}
                    />

                    {/* Icon — stroke (default) fades out, fill (active/hover) fades in */}
                    <div className="relative z-10 flex items-center justify-center shrink-0 w-[19px] h-[19px]">
                      {/* Stroke icon — visible when inactive and not hovered */}
                      <item.icon
                        size={19}
                        strokeWidth={1.75}
                        fill="none"
                        className={`absolute inset-0 transition-[opacity,color] duration-[160ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                          isActive || isHovered ? 'opacity-0' : 'opacity-100 text-[var(--muted)]'
                        }`}
                      />
                      {/* Filled icon — visible on active or hover */}
                      <item.icon
                        size={19}
                        strokeWidth={0}
                        fill="currentColor"
                        className={`absolute inset-0 transition-[opacity,color] duration-[160ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                          isActive
                            ? 'opacity-100 text-[var(--accent)]'
                            : isHovered
                            ? 'opacity-100 text-[var(--text)]'
                            : 'opacity-0 text-[var(--muted)]'
                        }`}
                      />
                    </div>

                    {/* Label — always visible, Telegram-style */}
                    <span
                      className={`relative z-10 text-[9px] leading-none font-medium tracking-tight text-center whitespace-nowrap pointer-events-none select-none transition-colors duration-[160ms] ${
                        isActive
                          ? 'text-[var(--accent)] font-semibold'
                          : isHovered
                          ? 'text-[var(--text)]'
                          : 'text-[var(--muted)]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );


                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      if (isActive) {
                        const mobileScroll = document.querySelector('[data-mobile-scroll]');
                        if (mobileScroll) {
                          mobileScroll.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }
                      setIsExpanded(false);
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(item.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative flex items-center justify-center rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shrink-0 cursor-pointer"
                  >
                    {itemContent}
                  </Link>
                );
              })}


        </div>
      </nav>
    </div>
  );
}
