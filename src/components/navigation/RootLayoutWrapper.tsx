'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MessageCircle } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { ReactLenis } from 'lenis/react';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileFooter } from './MobileFooter';
import { ResumeModal } from '../resume/ResumeModal';
import { HireMeModal } from '../hire/HireMeModal';
import { Preloader } from '../ui/Preloader';
import { MoltenCursor } from '../ui/MoltenCursor';
import { AnalyticsTracker } from '../analytics/AnalyticsTracker';

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isHireMeOpen, setIsHireMeOpen] = useState(false);

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
    const handleOpenHireMe = () => setIsHireMeOpen(true);
    const handleOpenResume = () => setIsResumeOpen(true);
    window.addEventListener('open-hire-me', handleOpenHireMe);
    window.addEventListener('open-resume', handleOpenResume);
    return () => {
      window.removeEventListener('open-hire-me', handleOpenHireMe);
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
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
      <HireMeModal isOpen={isHireMeOpen} onClose={() => setIsHireMeOpen(false)} />

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
            <AnimatePresence>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-auto min-h-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <MobileFooter />
          
          {/* Mobile FAB */}
          <div className="fixed bottom-[100px] right-4 z-50">
            <button
              onClick={() => setIsHireMeOpen(true)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-[0_8px_16px_rgba(45,212,191,0.25)] hover:shadow-[0_12px_24px_rgba(45,212,191,0.4)] active:scale-95 transition-all duration-300 focus:outline-none"
              aria-label="Contact Me"
              title="Contact Me"
            >
              <MessageCircle size={22} strokeWidth={2.5} />
            </button>
          </div>
        </main>
        <MobileBottomNav
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenHireMe={() => setIsHireMeOpen(true)}
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
          <div className="absolute bottom-5 right-5 lg:bottom-8 lg:right-8 z-50">
            <button
              onClick={() => setIsHireMeOpen(true)}
              className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-accent text-white shadow-[0_8px_16px_rgba(45,212,191,0.25)] hover:shadow-[0_12px_24px_rgba(45,212,191,0.4)] hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Contact Me"
              title="Contact Me"
            >
              <MessageCircle size={22} className="lg:w-6 lg:h-6" strokeWidth={2.5} />
            </button>
          </div>
          <div
            id="scroll-container"
            ref={mainPanelRef}
            className="main-panel rounded-2xl w-full h-full min-h-0 overflow-y-auto overflow-x-hidden relative"
          >
            <AnimatePresence>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
