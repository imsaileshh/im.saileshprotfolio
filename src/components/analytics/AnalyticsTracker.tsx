'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';

function eventForLink(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    const host = url.hostname.toLowerCase();
    if (host.includes('linkedin.com')) return 'linkedin_click' as const;
    if (host.includes('github.com')) return 'github_click' as const;
    if (host.includes('behance.net')) return 'behance_click' as const;
    if (url.origin === window.location.origin && url.pathname.startsWith('/')) return 'portfolio_url_click' as const;
  } catch {
    return null;
  }
  return null;
}

export function AnalyticsTracker({ disabled = false }: { disabled?: boolean }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (disabled || !pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent('page_view');
  }, [disabled, pathname, trackEvent]);

  useEffect(() => {
    if (disabled) return;

    const handleClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      const eventType = eventForLink(href);
      if (!eventType) return;
      trackEvent(eventType, { href, label: link.textContent?.trim().slice(0, 120) || undefined });
    };

    const handleHireClick = () => trackEvent('hire_click', { label: 'Hire me' });
    document.addEventListener('click', handleClick, true);
    window.addEventListener('open-hire-me', handleHireClick);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('open-hire-me', handleHireClick);
    };
  }, [disabled, trackEvent]);

  return null;
}
