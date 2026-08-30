'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

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

function getOrSetEntryReferrer(): string {
  if (typeof window === 'undefined') return 'Direct';
  const currentRef = document.referrer || '';
  const currentHost = window.location.hostname;
  let entryRef = sessionStorage.getItem('bms_entry_ref');

  // Harici bir siteden (Google, FB, X, IG vb.) geldiyse oturumun giriş referansını kaydet
  if (currentRef && !currentRef.includes(currentHost)) {
    sessionStorage.setItem('bms_entry_ref', currentRef);
    return currentRef;
  }

  // Daha önce oturumda kaydedilmiş harici referans varsa onu koru
  if (entryRef) {
    return entryRef;
  }

  // İlk giriş direkt ise direkt olarak işaretle
  const fallback = currentRef && !currentRef.includes(currentHost) ? currentRef : 'Direct';
  sessionStorage.setItem('bms_entry_ref', fallback);
  return fallback;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
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
        const entryRef = getOrSetEntryReferrer();

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
            entryReferer: entryRef,
            metadata: payload,
          }),
        }).catch(() => {});
      } catch (e) {}
    };
  }, []);

  // Track Pageview & Duration
  useEffect(() => {
    if (!pathname) return;

    // Ignore Admin Panel Views from bloating real traffic
    if (pathname.startsWith('/bms-secure-portal') || pathname.startsWith('/admin')) {
      return;
    }

    const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
    const fullPath = currentSearch ? `${pathname}${currentSearch}` : pathname;
    const now = Date.now();

    // Prevent duplicated rapid hits on identical URL within 10 seconds
    if (lastTrackedPathRef.current === fullPath && now - lastTrackedTimeRef.current < 10000) {
      return;
    }

    lastTrackedPathRef.current = fullPath;
    lastTrackedTimeRef.current = now;

    const vid = getOrSetVisitorId();
    const sid = getOrSetSessionId();
    const entryReferer = getOrSetEntryReferrer();
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const referer = document.referrer || 'Direct';

    // Parse Search and Source Parameters from window.location.search
    const params = new URLSearchParams(currentSearch);
    const rawKeyword = params.get('q') || params.get('query') || params.get('search') || params.get('utm_term') || params.get('keyword') || params.get('kw') || params.get('kelime') || params.get('arama') || '';
    let searchKeyword = '';
    if (rawKeyword) {
      try {
        searchKeyword = decodeURIComponent(rawKeyword).trim();
      } catch (e) {
        searchKeyword = rawKeyword.trim();
      }
    }
    const utmSource = params.get('utm_source') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';

    // If coming from Google referrer, try extracting query if passed
    if (!searchKeyword && (referer.includes('google.') || entryReferer.includes('google.'))) {
      try {
        const refUrl = new URL(referer.includes('google.') ? referer : entryReferer);
        const gQ = refUrl.searchParams.get('q') || '';
        if (gQ) searchKeyword = decodeURIComponent(gQ).trim();
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
        entryReferer,
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

    // Duration ping interval
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    let secondsSpent = 5;

    durationIntervalRef.current = setInterval(() => {
      secondsSpent += 10;
      if (secondsSpent > 600) {
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
        return;
      }

      if (activeRecordIdRef.current) {
        fetch('/api/analytics/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: activeRecordIdRef.current,
            durationSeconds: secondsSpent,
          }),
        }).catch(() => {});
      }
    }, 10000);

    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [pathname]);

  return null;
}
