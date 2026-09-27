'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import NProgress from 'nprogress';

/**
 * Programmatic triggers if needed anywhere across the app
 */
export function startRouteProgress() {
  if (typeof window !== 'undefined') {
    NProgress.start();
  }
}

export function stopRouteProgress() {
  if (typeof window !== 'undefined') {
    NProgress.done();
  }
}

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Route change completed: finish and fade out the top progress bar
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Browser back / forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      NProgress.start();
    };

    const handleCustomStart = () => {
      NProgress.start();
    };

    const handleCustomDone = () => {
      NProgress.done();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('route-progress-start', handleCustomStart);
    window.addEventListener('route-progress-done', handleCustomDone);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('route-progress-start', handleCustomStart);
      window.removeEventListener('route-progress-done', handleCustomDone);
    };
  }, []);

  return null;
}

export function RouteProgressBar() {
  return (
    <>
      <NextTopLoader
        color="#2DD4BF"
        initialPosition={0.15}
        crawlSpeed={180}
        height={2.5}
        crawl={true}
        showSpinner={false}
        easing="ease-out"
        speed={250}
        shadow="0 0 10px rgba(45, 212, 191, 0.8), 0 0 5px rgba(45, 212, 191, 0.5)"
        zIndex={99999}
        showForHashAnchor={false}
      />
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>
    </>
  );
}
