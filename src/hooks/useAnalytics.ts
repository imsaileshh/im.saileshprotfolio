'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

type AnalyticsEventType =
  | 'page_view'
  | 'project_view'
  | 'project_live_click'
  | 'github_click'
  | 'linkedin_click'
  | 'behance_click'
  | 'portfolio_url_click'
  | 'hire_click'
  | 'resume_view'
  | 'resume_download'
  | 'contact_submit'
  | 'nav_click'
  | 'scroll_depth';

export function useAnalytics() {
  const pathname = usePathname();

  const trackEvent = useCallback(
    (eventType: AnalyticsEventType, metadata: Record<string, unknown> = {}) => {
      if (typeof window === 'undefined') return;

      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventType,
          pagePath: pathname || window.location.pathname,
          metadata,
        }),
        keepalive: true,
      }).catch(() => undefined);
    },
    [pathname],
  );

  return { trackEvent };
}
