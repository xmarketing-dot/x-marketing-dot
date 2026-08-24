'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/bms-secure-portal')) {
      return;
    }

    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const referer = document.referrer || 'Direct';

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referer,
        isMobile,
        city: 'İstanbul', // Defaults to Istanbul or geo-located IP
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
