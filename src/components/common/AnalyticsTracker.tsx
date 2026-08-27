'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Declare global tracking window function
declare global {
  interface Window {
    trackEvent?: (eventType: string, payload?: Record<string, any>) => void;
  }
}

function getOrSetVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  let vid = localStorage.getItem('bms_vid');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('bms_vid', vid);
  }
  return vid;
}

function getOrSetSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem('bms_sid');
  if (!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    sessionStorage.setItem('bms_sid', sid);
  }
  return sid;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPathRef = useRef<string>('');
  const lastTrackedTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeRecordIdRef = useRef<string | null>(null);

  // Global event tracker function attached to window
  useEffect(() => {
    window.trackEvent = (eventType: string, payload: Record<string, any> = {}) => {
      try {
        const vid = getOrSetVisitorId();
        const sid = getOrSetSessionId();

        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: vid,
            sessionId: sid,
            eventType,
            targetId: payload.listingId || payload.targetId,
            targetTitle: payload.title || payload.targetTitle,
            targetCity: payload.city || payload.targetCity,
            path: window.location.pathname,
            metadata: payload,
          }),
        }).catch(() => {});
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/bms-secure-portal')) {
      return;
    }

    const now = Date.now();
    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Deduplication: Avoid double-counting the exact same URL within 15 seconds
    if (lastTrackedPathRef.current === fullPath && now - lastTrackedTimeRef.current < 15000) {
      return;
    }

    lastTrackedPathRef.current = fullPath;
    lastTrackedTimeRef.current = now;

    const vid = getOrSetVisitorId();
    const sid = getOrSetSessionId();
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const referer = document.referrer || 'Direct';

    // Parse Search and Source Parameters
    let searchKeyword = searchParams?.get('q') || searchParams?.get('query') || searchParams?.get('search') || searchParams?.get('utm_term') || '';
    const utmSource = searchParams?.get('utm_source') || '';
    const utmMedium = searchParams?.get('utm_medium') || '';
    const utmCampaign = searchParams?.get('utm_campaign') || '';

    // If coming from Google referrer, try extracting query if passed
    if (!searchKeyword && referer.includes('google.')) {
      try {
        const refUrl = new URL(referer);
        searchKeyword = refUrl.searchParams.get('q') || '';
      } catch (e) {}
    }

    // Detect browser and OS
    let browser = 'Chrome';
    const ua = navigator.userAgent;
    if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';

    let os = 'Desktop';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh/i.test(ua)) os = 'macOS';

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: vid,
        sessionId: sid,
        path: fullPath,
        pageTitle: document.title || 'Best Eskort',
        referer,
        searchKeyword,
        utmSource,
        utmMedium,
        utmCampaign,
        isMobile,
        browser,
        os,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.visitorId) {
          activeRecordIdRef.current = data.visitorId;
        }
      })
      .catch(() => {});

    // Track on-page duration heartbeat (every 15s, up to 3 minutes)
    let secondsSpent = 0;
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);

    durationIntervalRef.current = setInterval(() => {
      secondsSpent += 15;
      if (secondsSpent <= 180 && activeRecordIdRef.current) {
        fetch('/api/analytics/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: activeRecordIdRef.current,
            durationSeconds: secondsSpent,
          }),
        }).catch(() => {});
      } else if (secondsSpent > 180 && durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }, 15000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [pathname, searchParams]);

  return null;
}
