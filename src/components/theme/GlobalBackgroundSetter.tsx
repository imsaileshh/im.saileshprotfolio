'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Module-level cache so repeated route navigations don't re-fetch.
// Populated on first mount; null means "not yet fetched".
let cachedThemeConfig: Record<string, string> | null | undefined = undefined;

function applyBackground(themeConfig: Record<string, string> | null | undefined, pathname: string) {
  if (!themeConfig) {
    // Remove any previously-applied inline style; CSS defaults take over.
    document.documentElement.style.removeProperty('--bg');
    document.body.style.backgroundColor = '';
    return;
  }

  if (pathname.startsWith('/dashboard')) {
    document.documentElement.style.removeProperty('--bg');
    document.body.style.backgroundColor = '';
    return;
  }

  let targetBg = '';

  if (pathname === '/') {
    targetBg = themeConfig.homeBackground;
  } else if (pathname === '/works') {
    targetBg = themeConfig.worksBackground;
  } else if (pathname.startsWith('/works/')) {
    targetBg = themeConfig.workDetailBackground;
  } else if (pathname === '/personal-projects') {
    targetBg = themeConfig.personalProjectsBackground;
  } else if (pathname.startsWith('/personal-projects/')) {
    targetBg = themeConfig.personalProjectDetailBackground;
  } else if (pathname === '/case-studies') {
    targetBg = themeConfig.caseStudiesBackground;
  } else if (pathname.startsWith('/case-studies/')) {
    targetBg = themeConfig.caseStudyDetailBackground;
  } else if (pathname === '/about') {
    targetBg = themeConfig.aboutBackground;
  } else if (pathname === '/stack') {
    targetBg = themeConfig.stackBackground;
  } else if (pathname === '/experience') {
    targetBg = themeConfig.experienceBackground;
  } else if (pathname === '/hire-me') {
    targetBg = themeConfig.hireMeBackground;
  } else if (pathname === '/resume') {
    targetBg = themeConfig.resumeBackground;
  }

  if (targetBg) {
    document.documentElement.style.setProperty('--bg', targetBg);
    document.body.style.backgroundColor = targetBg;
  } else {
    document.documentElement.style.removeProperty('--bg');
    document.body.style.backgroundColor = '';
  }
}

/**
 * Applies per-route custom background colors from the DB themeConfig.
 * Self-fetches after mount so it never blocks the server render or delays LCP.
 * The CSS default in globals.css (--bg: #111214) is the correct fallback for
 * most users, so removing the server-side await introduces no visual regression.
 */
export function GlobalBackgroundSetter() {
  const pathname = usePathname();

  useEffect(() => {
    // If already cached (including null = "no custom config"), apply immediately.
    if (cachedThemeConfig !== undefined) {
      applyBackground(cachedThemeConfig, pathname);
      return () => {
        document.documentElement.style.removeProperty('--bg');
        document.body.style.backgroundColor = '';
      };
    }

    // First mount: fetch themeConfig once, then cache and apply.
    let cancelled = false;
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        cachedThemeConfig = data?.themeConfig ?? null;
        applyBackground(cachedThemeConfig, pathname);
      })
      .catch(() => {
        if (cancelled) return;
        cachedThemeConfig = null; // mark as fetched (no config)
      });

    return () => {
      cancelled = true;
      document.documentElement.style.removeProperty('--bg');
      document.body.style.backgroundColor = '';
    };
  }, [pathname]);

  return null;
}
