'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';

import { ThemeToggle } from '../theme/ThemeToggle';
import dynamic from 'next/dynamic';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileFooter } from './MobileFooter';
import { Preloader } from '../ui/Preloader';
import { AnalyticsTracker } from '../analytics/AnalyticsTracker';

const ResumeModal = dynamic(() => import('../resume/ResumeModal').then((m) => m.ResumeModal), { ssr: false });
const MoltenCursor = dynamic(() => import('../ui/MoltenCursor').then((m) => m.MoltenCursor), { ssr: false });
const ReactLenis = dynamic(() => import('lenis/react').then((m) => m.ReactLenis), { ssr: false });

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  // Clean, stable sidebar state (starts wide / standard or user toggled, NO scroll-down auto opening)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const mainPanelRef = useRef<HTMLDivElement>(null);

  const analyticsDisabled = Boolean(isDashboard);

  // ── MANUAL TOGGLE (sidebar toggle button) ───────────────────────────────
  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // ── MODAL EVENT BUS ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleOpenResume = () => setIsResumeOpen(true);
    window.addEventListener('open-resume', handleOpenResume);
    return () => {
      window.removeEventListener('open-resume', handleOpenResume);
    };
  }, []);

  // ── ANCHOR LINK SMOOTH SCROLLING ──────────────────────────────────────────
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#') return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // ── SCROLL TO TOP ON ROUTE CHANGE ───────────────────────────────────────
  useEffect(() => {
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mobileMain = document.querySelector('[data-mobile-scroll]');
    if (mobileMain) mobileMain.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (isDashboard) {
    return (
      <>
        <AnalyticsTracker disabled={analyticsDisabled} />
        <ReactLenis root>
          <div className="min-h-screen">{children}</div>
        </ReactLenis>
      </>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      <MoltenCursor />
      <Preloader />
      {isResumeOpen && <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />}

      {/* Mobile: Native Body Scroll Shell */}
      <div className="md:hidden flex flex-col min-h-[100dvh] w-full bg-[var(--bg)] relative mobile-layout">
        <Sidebar
          mobile
          onOpenResume={() => setIsResumeOpen(true)}
        />
        <main
          className="flex-1 w-full overflow-x-hidden mobile-main"
          style={{
            padding: '80px 14px calc(88px + env(safe-area-inset-bottom)) 14px',
            WebkitOverflowScrolling: 'touch',
          }}
          data-mobile-scroll
        >
          <div className="w-full h-auto m-0 border border-border-subtle rounded-[16px] bg-[var(--panel)] overflow-visible block mobile-content-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-auto min-h-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <MobileFooter />
        </main>
        <MobileBottomNav
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </div>

      {/* Desktop: Steady Sidebar Shell (NO scroll-down auto expansion) */}
      <div className="hidden md:flex h-[100dvh] w-full bg-[var(--bg)] overflow-hidden p-5 lg:p-6 gap-5 lg:gap-6">

        {/* ── SIDEBAR ── */}
        <div
          style={{ width: isSidebarCollapsed ? 72 : 275 }}
          className="shrink-0 h-full relative z-40 transition-[width] duration-300 ease-in-out"
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onOpenResume={() => setIsResumeOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 min-h-0 h-full flex flex-col overflow-hidden relative">
          <div className="absolute top-5 right-5 lg:top-6 lg:right-6 z-50">
            <ThemeToggle />
          </div>
          <div
            id="scroll-container"
            ref={mainPanelRef}
            className="main-panel rounded-2xl w-full h-full min-h-0 overflow-y-auto overflow-x-hidden relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full min-h-full flex flex-col justify-between"
              >
                <div className="flex-1 w-full">{children}</div>
                <MobileFooter />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
