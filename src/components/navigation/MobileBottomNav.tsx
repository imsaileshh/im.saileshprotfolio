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
  const dotButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const isExpandedRef = useRef(false);
  const isMouseOverRef = useRef(false);
  const isTouchingRef = useRef(false);
  const lastTouchTimeRef = useRef(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Sync ref with state
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  // Helper: check if device supports true mouse hover and fine pointer
  const isHoverSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  // Strict route matching: exactly ONE active item determined solely by usePathname()
  const isPathActive = useCallback(
    (href: string) => {
      if (!pathname) return false;
      const current =
        pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

      // Root path: ONLY active at '/'
      if (href === '/') {
        return current === '/';
      }

      // Works section: active at '/works', '/works/...', and case studies
      if (href === '/works') {
        return (
          current === '/works' ||
          current.startsWith('/works/') ||
          current.startsWith('/case-studies/')
        );
      }

      // Other routes: exact match or direct sub-routes (e.g. /stack, /about, /experience)
      return current === href || current.startsWith(`${href}/`);
    },
    [pathname]
  );

  // Helper: clear all pending close timeouts
  const clearAllCloseTimers = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  // Safely collapse navigation and restore keyboard focus if needed
  const collapseNavigation = useCallback(
    (restoreFocus = false) => {
      clearAllCloseTimers();
      const hadFocusInside = Boolean(
        containerRef.current &&
          document.activeElement &&
          containerRef.current.contains(document.activeElement) &&
          document.activeElement !== dotButtonRef.current
      );

      isExpandedRef.current = false;
      setIsExpanded(false);
      setHoveredId(null);

      if ((restoreFocus || hadFocusInside) && dotButtonRef.current) {
        dotButtonRef.current.focus({ preventScroll: true });
      }
    },
    [clearAllCloseTimers]
  );

  // Auto-close timer for touch devices (resets on active interaction)
  const resetTouchTimer = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    touchTimerRef.current = setTimeout(() => {
      // Check if user is still actively interacting
      const hasFocusInside = Boolean(
        containerRef.current &&
          document.activeElement &&
          containerRef.current.contains(document.activeElement)
      );
      if (isTouchingRef.current || isMouseOverRef.current || hasFocusInside) {
        resetTouchTimer();
        return;
      }
      collapseNavigation();
    }, 4500);
  }, [collapseNavigation]);

  // Expand navigation
  const expandNavigation = useCallback(
    (focusFirstItem = false) => {
      clearAllCloseTimers();
      isExpandedRef.current = true;
      setIsExpanded(true);

      if (focusFirstItem) {
        setTimeout(() => {
          firstLinkRef.current?.focus({ preventScroll: true });
        }, 80);
      }
    },
    [clearAllCloseTimers]
  );

  // Reset state and clear timers on route change
  useEffect(() => {
    clearAllCloseTimers();
    setIsExpanded(false);
    isExpandedRef.current = false;
    setHoveredId(null);
  }, [pathname, clearAllCloseTimers]);

  // ── High-performance scroll direction detection (cancelable RAF, passive, zero duplicate ticks) ──
  useEffect(() => {
    if (!hasMounted) return;

    const scrollContainer = document.querySelector('[data-mobile-scroll]');

    const getScrollY = () => {
      const winScroll = window.scrollY;
      if (winScroll > 0) return winScroll;
      if (scrollContainer && scrollContainer.scrollTop > 0) {
        return scrollContainer.scrollTop;
      }
      return document.documentElement?.scrollTop || 0;
    };

    const updateScrollDirection = () => {
      rafId.current = null;
      const currentScrollY = getScrollY();
      const delta = currentScrollY - lastScrollY.current;

      // Check whether user is actively interacting with the navigation island
      const hasFocusInside = Boolean(
        containerRef.current &&
          document.activeElement &&
          containerRef.current.contains(document.activeElement)
      );
      const isInteracting = isTouchingRef.current || isMouseOverRef.current || hasFocusInside;

      if (isInteracting) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Top of page -> Collapsed (minimal single dot)
      if (currentScrollY < 24) {
        if (isExpandedRef.current) {
          collapseNavigation();
        }
        lastScrollY.current = currentScrollY;
      } else if (Math.abs(delta) >= 25) {
        // 25px threshold before changing state — only update when state actually flips
        if (delta > 0 && !isExpandedRef.current) {
          // Scrolling DOWN -> Full menu open
          expandNavigation(false);
          resetTouchTimer();
          lastScrollY.current = currentScrollY;
        } else if (delta < 0 && isExpandedRef.current) {
          // Scrolling UP -> Full menu closed
          collapseNavigation();
          lastScrollY.current = currentScrollY;
        }
      }
    };

    if (window.innerWidth >= 768) {
      return;
    }

    const onScroll = () => {
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
  }, [hasMounted, collapseNavigation, expandNavigation, resetTouchTimer]);

  // Touch outside & click outside handler
  useEffect(() => {
    const handlePointerOutside = (e: Event) => {
      if (!isExpandedRef.current) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        collapseNavigation();
      }
    };

    document.addEventListener('touchstart', handlePointerOutside, { passive: true });
    document.addEventListener('mousedown', handlePointerOutside);
    return () => {
      document.removeEventListener('touchstart', handlePointerOutside);
      document.removeEventListener('mousedown', handlePointerOutside);
    };
  }, [collapseNavigation]);

  // Cleanup timers and RAF on unmount
  useEffect(() => {
    return () => {
      clearAllCloseTimers();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [clearAllCloseTimers]);

  // Hover handlers for the floating island container (desktop mouse only)
  const handleContainerMouseEnter = useCallback(() => {
    // Ignore synthetic mouse events on touch devices
    if (Date.now() - lastTouchTimeRef.current < 800) return;
    if (!isHoverSupported()) return;

    isMouseOverRef.current = true;
    clearAllCloseTimers();
    expandNavigation(false);
  }, [clearAllCloseTimers, expandNavigation, isHoverSupported]);

  const handleContainerMouseLeave = useCallback(() => {
    // Ignore synthetic mouse events on touch devices
    if (Date.now() - lastTouchTimeRef.current < 800) return;
    if (!isHoverSupported()) return;

    isMouseOverRef.current = false;
    setHoveredId(null);

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // Do not collapse if focus is currently inside
    const hasFocusInside = Boolean(
      containerRef.current &&
        document.activeElement &&
        containerRef.current.contains(document.activeElement)
    );
    if (hasFocusInside) return;

    closeTimeoutRef.current = setTimeout(() => {
      const stillHasFocus = Boolean(
        containerRef.current &&
          document.activeElement &&
          containerRef.current.contains(document.activeElement)
      );
      if (isMouseOverRef.current || isTouchingRef.current || stillHasFocus) {
        return;
      }
      collapseNavigation();
    }, 280);
  }, [collapseNavigation, isHoverSupported]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault();
        collapseNavigation(true);
      }
    },
    [isExpanded, collapseNavigation]
  );

  return (
    <div
      className="md:hidden fixed z-[90] bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none px-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav
        ref={containerRef}
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
        onKeyDown={handleKeyDown}
        onTouchStart={() => {
          lastTouchTimeRef.current = Date.now();
          isTouchingRef.current = true;
          // Clear any stale hover state immediately upon touching
          setHoveredId(null);
          resetTouchTimer();
        }}
        onTouchEnd={() => {
          lastTouchTimeRef.current = Date.now();
          isTouchingRef.current = false;
          resetTouchTimer();
        }}
        onTouchCancel={() => {
          lastTouchTimeRef.current = Date.now();
          isTouchingRef.current = false;
          resetTouchTimer();
        }}
        onBlur={(e) => {
          // If focus leaves the nav and user is not hovering or touching, collapse safely
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            if (!isMouseOverRef.current && !isTouchingRef.current) {
              collapseNavigation();
            }
          }
        }}
        aria-label="Mobile Navigation"
        className={`pointer-events-auto relative flex items-center justify-center bg-[var(--panel)]/95 border border-[var(--border)] shadow-[0_12px_32px_rgba(0,0,0,0.32),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-[8px] select-none transition-[width,height,border-radius,padding,border-color,background-color] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [contain:paint_layout] transform-gpu overflow-hidden will-change-[width,height] ${
          isExpanded
            ? 'h-[62px] w-[min(320px,calc(100vw-16px))] p-1 rounded-[30px]'
            : 'h-[44px] w-[44px] rounded-full hover:border-[var(--accent)]/50'
        }`}
      >
        {/* Minimal Collapsed State: Single Floating Dot button */}
        <button
          ref={dotButtonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // If clicked via keyboard (e.detail === 0), move focus to first link.
            // If clicked via touch/mouse (e.detail > 0), do NOT autofocus Home!
            const isKeyboardActivation = e.detail === 0;
            expandNavigation(isKeyboardActivation);
            resetTouchTimer();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              expandNavigation(true);
              resetTouchTimer();
            }
          }}
          aria-label="Open mobile navigation menu"
          aria-expanded={isExpanded}
          aria-controls="mobile-nav-menu"
          tabIndex={isExpanded ? -1 : 0}
          aria-hidden={isExpanded ? true : undefined}
          className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-full ${
            isExpanded ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto cursor-pointer'
          }`}
        >
          <span className="absolute w-4 h-4 rounded-full bg-[var(--accent)]/20 pointer-events-none" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        </button>

        {/* Expanded State: Full Navigation Menu */}
        <div
          id="mobile-nav-menu"
          role="region"
          aria-label="Navigation Links"
          aria-hidden={!isExpanded ? true : undefined}
          inert={!isExpanded ? true : undefined}
          className={`flex items-center gap-0 transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            isExpanded
              ? 'opacity-100 scale-100 pointer-events-auto delay-100'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* ── Regular nav items ── */}
          {navItems.map((item, index) => {
            const isActive = isPathActive(item.href);
            // Strict hover: only on devices supporting hover, and never overrides active state
            const isHovered = hoveredId === item.id && !isActive;

            const itemContent = (
              <div className="relative flex flex-col items-center justify-center gap-[2px] w-[48px] h-[54px] rounded-[24px] select-none overflow-hidden">
                {/* Active/Hover pill background — Telegram-style solid fill */}
                <div
                  className={`absolute inset-0 rounded-[24px] transition-[opacity,background-color] duration-150 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] pointer-events-none ${
                    isActive
                      ? 'bg-[var(--accent)]/[0.13] opacity-100'
                      : isHovered
                      ? 'bg-[var(--text)]/[0.05] opacity-100'
                      : 'opacity-0'
                  }`}
                />

                {/* Single Icon — strictly teal for active, subtle for hover, muted for inactive */}
                <div className="relative z-10 flex items-center justify-center shrink-0 w-[19px] h-[19px]">
                  <item.icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : isHovered ? 1.9 : 1.75}
                    className={`transition-[color,stroke-width] duration-150 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'text-[var(--accent)]'
                        : isHovered
                        ? 'text-[var(--text)]'
                        : 'text-[var(--muted)]'
                    }`}
                  />
                </div>

                {/* Label — always visible, Telegram-style */}
                <span
                  className={`relative z-10 text-[9px] leading-none tracking-tight text-center whitespace-nowrap pointer-events-none select-none transition-colors duration-150 ${
                    isActive
                      ? 'text-[var(--accent)] font-semibold'
                      : isHovered
                      ? 'text-[var(--text)] font-medium'
                      : 'text-[var(--muted)] font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );

            return (
              <Link
                key={item.id}
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                tabIndex={isExpanded ? 0 : -1}
                aria-hidden={!isExpanded ? true : undefined}
                onClick={() => {
                  clearAllCloseTimers();
                  setHoveredId(null);
                  if (isActive) {
                    const mobileScroll = document.querySelector('[data-mobile-scroll]');
                    if (mobileScroll) {
                      mobileScroll.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                  // Blur tapped element immediately to prevent mobile browser sticky focus
                  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  collapseNavigation();
                }}
                onMouseEnter={() => {
                  if (Date.now() - lastTouchTimeRef.current < 800) return;
                  if (isHoverSupported()) setHoveredId(item.id);
                }}
                onMouseLeave={() => {
                  if (Date.now() - lastTouchTimeRef.current < 800) return;
                  if (isHoverSupported()) setHoveredId(null);
                }}
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
