'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MessageCircle } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import dynamic from 'next/dynamic';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileFooter } from './MobileFooter';
import { AnalyticsTracker } from '../analytics/AnalyticsTracker';

const Preloader = dynamic(() => import('../ui/Preloader').then((m) => m.Preloader));
const ResumeModal = dynamic(() => import('../resume/ResumeModal').then((m) => m.ResumeModal));
const HireMeModal = dynamic(() => import('../hire/HireMeModal').then((m) => m.HireMeModal));
const MoltenCursor = dynamic(() => import('../ui/MoltenCursor').then((m) => m.MoltenCursor));

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isHireMeOpen, setIsHireMeOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [shouldRenderPreloader, setShouldRenderPreloader] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('intro') || search.includes('preloader')) {
        setShouldRenderPreloader(true);
      }
      setIsDesktop(window.innerWidth >= 1024);
    }
  }, []);

  const mainPanelRef = useRef<HTMLDivElement>(null);

  const analyticsDisabled = Boolean(isDashboard);

  // ── MANUAL TOGGLE (sidebar toggle button) ───────────────────────────────
  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // ── MODAL EVENT BUS ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleOpenResume = () => setIsResumeOpen(true);
    const handleOpenHireMe = () => setIsHireMeOpen(true);
    window.addEventListener('open-resume', handleOpenResume);
    window.addEventListener('open-hire-me', handleOpenHireMe);
    return () => {
      window.removeEventListener('open-resume', handleOpenResume);
      window.removeEventListener('open-hire-me', handleOpenHireMe);
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
    const dashboardMain = document.querySelector('main.overflow-y-auto');
    if (dashboardMain) dashboardMain.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (isDashboard) {
    return (
      <>
        <AnalyticsTracker disabled={analyticsDisabled} />
        {children}
      </>
    );
  }

  return (
    <>
      <AnalyticsTracker />
      {shouldRenderPreloader && <Preloader />}
      {isResumeOpen && <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />}
      {isHireMeOpen && <HireMeModal isOpen={isHireMeOpen} onClose={() => setIsHireMeOpen(false)} />}

      {/* ── UNIFIED RESPONSIVE APP SHELL (Single children tree) ── */}
      <div className="flex flex-col md:flex-row min-h-[100dvh] md:h-[100dvh] w-full bg-[var(--bg)] md:overflow-hidden md:p-5 lg:p-6 md:gap-5 lg:gap-6 relative">
        {isDesktop && <MoltenCursor />}

        {/* Mobile Header: fixed at top 0, hidden on desktop */}
        <Sidebar
          mobile
          onOpenResume={() => setIsResumeOpen(true)}
        />

        {/* Desktop Sidebar: left column on desktop (hidden on mobile) */}
        <div
          style={{ width: isSidebarCollapsed ? 72 : 275 }}
          className="hidden md:block shrink-0 h-full relative z-40 transition-[width] duration-300 ease-in-out"
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onOpenResume={() => setIsResumeOpen(true)}
          />
        </div>

        {/* Main Content Area (Rendered once for both Mobile and Desktop) */}
        <main className="flex-1 min-w-0 min-h-0 w-full md:h-full flex flex-col md:overflow-hidden relative px-3.5 md:px-0 pt-[80px] md:pt-0 pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-0">
          {/* Desktop-only Theme Toggle (top right corner of content area) */}
          <div className="hidden md:block absolute top-5 right-5 lg:top-6 lg:right-6 z-50">
            <ThemeToggle />
          </div>

          {/* Floating Contact/Hire-Me Button */}
          <div className="fixed md:absolute bottom-24 md:bottom-5 lg:bottom-6 right-4 md:right-5 lg:right-6 z-50">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-hire-me'))}
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent text-[#111214] shadow-[0_8px_28px_rgba(45,212,191,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              aria-label="Contact Me"
            >
              <MessageCircle size={22} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Scrollable / Content Panel */}
          <div
            id="scroll-container"
            ref={mainPanelRef}
            data-mobile-scroll
            className="w-full h-auto md:h-full min-h-0 md:overflow-y-auto md:overflow-x-hidden relative border border-border-subtle rounded-[16px] md:rounded-2xl bg-[var(--panel)] main-panel"
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

        {/* Mobile Bottom Navigation (fixed at bottom, hidden on desktop) */}
        <MobileBottomNav
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </div>
    </>
  );
}
