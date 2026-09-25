'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Declare global tracking window function
declare global {
  interface Window {
    trackEvent?: (eventType: string, payload?: Record<string, any>) => void;
    trackListingImpression?: (item: { listingId: string; slug?: string; title?: string; city?: string }) => void;
    trackListingImpressions?: (items: Array<{ listingId: string; slug?: string; title?: string; city?: string }>) => void;
  }
}

let memoryVid = '';
let memorySid = '';

function getOrSetVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let vid = localStorage.getItem('bms_vid');
    if (!vid) {
      vid = memoryVid || ('v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36));
      try { localStorage.setItem('bms_vid', vid); } catch (e) {}
    }
    memoryVid = vid;
    return vid;
  } catch (e) {
    if (!memoryVid) memoryVid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    return memoryVid;
  }
}

function getOrSetSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let sid = sessionStorage.getItem('bms_sid');
    if (!sid) {
      sid = memorySid || ('s_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36));
      try { sessionStorage.setItem('bms_sid', sid); } catch (e) {}
    }
    memorySid = sid;
    return sid;
  } catch (e) {
    if (!memorySid) memorySid = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    return memorySid;
  }
}

function getOrSetEntryReferrer(): string {
  if (typeof window === 'undefined') return 'Direct';
  try {
    const currentRef = document.referrer || '';
    const currentHost = window.location.hostname;
    let entryRef = sessionStorage.getItem('bms_entry_ref');

    if (currentRef && !currentRef.includes(currentHost)) {
      try { sessionStorage.setItem('bms_entry_ref', currentRef); } catch (e) {}
      return currentRef;
    }

    if (entryRef) return entryRef;

    const fallback = currentRef && !currentRef.includes(currentHost) ? currentRef : 'Direct';
    try { sessionStorage.setItem('bms_entry_ref', fallback); } catch (e) {}
    return fallback;
  } catch (e) {
    return 'Direct';
  }
}

export function trackEvent(eventType: string, payload: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    const vid = getOrSetVisitorId();
    const sid = getOrSetSessionId();
    const entryRef = getOrSetEntryReferrer();

    const bodyString = JSON.stringify({
      visitorId: vid,
      sessionId: sid,
      eventType,
      targetId: payload.listingId || payload.targetId || payload.slug || '',
      targetTitle: payload.title || payload.targetTitle || '',
      targetCity: payload.city || payload.targetCity || '',
      path: window.location.pathname,
      entryReferer: entryRef,
      metadata: payload,
    });

    // Mobile external redirect dostu sendBeacon (veri asla kaybolmaz)
    let beaconSent = false;
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'application/json' });
        beaconSent = navigator.sendBeacon('/api/analytics/event', blob);
      } catch (err) {}
    }

    // Yandex Metrika Hedef Takibi (reachGoal)
    if (typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
      try {
        (window as any).ym(113056145, 'reachGoal', eventType, payload);
        (window as any).ym(112120217, 'reachGoal', eventType, payload);
      } catch (ymErr) {}
    }

    if (!beaconSent) {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    try {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          targetId: payload.listingId || payload.targetId || payload.slug,
          targetTitle: payload.title || payload.targetTitle,
          path: window.location.pathname,
          metadata: payload,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {}
  }
}

// Script yüklendiği anda window'a bağla (useEffect beklemez, 0ms hazır)
if (typeof window !== 'undefined') {
  (window as any).trackEvent = trackEvent;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string>('');
  const lastTrackedTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeRecordIdRef = useRef<string | null>(null);

  // Gösterim (Impression) Takipçisi İçin Kuyruk ve Mükerrer Kontrolü
  const trackedListingsInPageRef = useRef<Set<string>>(new Set());
  const pendingImpressionsRef = useRef<Array<{ listingId: string; slug?: string; title?: string; city?: string }>>([]);
  const impressionBatchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sayfa değiştiğinde mükerrer gösterim setini sıfırla
  useEffect(() => {
    trackedListingsInPageRef.current = new Set();
  }, [pathname]);

  // Global event & impression tracker function attached to window
  useEffect(() => {
    const flushImpressions = () => {
      if (pendingImpressionsRef.current.length === 0) return;
      const toSend = [...pendingImpressionsRef.current];
      pendingImpressionsRef.current = [];

      try {
        const vid = getOrSetVisitorId();
        const sid = getOrSetSessionId();

        fetch('/api/analytics/impressions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: vid,
            sessionId: sid,
            path: window.location.pathname,
            impressions: toSend,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch (e) {}
    };

    window.trackListingImpression = (item) => {
      if (!item || !item.listingId) return;
      // Admin sayfalarında impression sayma
      if (window.location.pathname.startsWith('/bms-secure-portal') || window.location.pathname.startsWith('/admin')) {
        return;
      }
      if (trackedListingsInPageRef.current.has(item.listingId)) return;
      trackedListingsInPageRef.current.add(item.listingId);
      pendingImpressionsRef.current.push(item);

      if (pendingImpressionsRef.current.length >= 3) {
        if (impressionBatchTimerRef.current) clearTimeout(impressionBatchTimerRef.current);
        flushImpressions();
      } else {
        if (impressionBatchTimerRef.current) clearTimeout(impressionBatchTimerRef.current);
        impressionBatchTimerRef.current = setTimeout(flushImpressions, 150);
      }
    };

    window.trackListingImpressions = (items) => {
      if (!Array.isArray(items) || items.length === 0) return;
      if (window.location.pathname.startsWith('/bms-secure-portal') || window.location.pathname.startsWith('/admin')) {
        return;
      }
      let added = false;
      for (const item of items) {
        if (!item || !item.listingId) continue;
        if (trackedListingsInPageRef.current.has(item.listingId)) continue;
        trackedListingsInPageRef.current.add(item.listingId);
        pendingImpressionsRef.current.push(item);
        added = true;
      }

      if (added) {
        if (pendingImpressionsRef.current.length >= 3) {
          if (impressionBatchTimerRef.current) clearTimeout(impressionBatchTimerRef.current);
          flushImpressions();
        } else {
          if (impressionBatchTimerRef.current) clearTimeout(impressionBatchTimerRef.current);
          impressionBatchTimerRef.current = setTimeout(flushImpressions, 150);
        }
      }
    };

    const handleBeforeUnload = () => {
      flushImpressions();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    window.trackEvent = trackEvent;

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (impressionBatchTimerRef.current) clearTimeout(impressionBatchTimerRef.current);
      flushImpressions();
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

    // Sadece aynı saniye içindeki çift render tetiklemelerini önle (1 saniye)
    if (lastTrackedPathRef.current === fullPath && now - lastTrackedTimeRef.current < 1000) {
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

    // Yandex Metrika SPA Hit Gönderimi (Next.js sayfa geçişleri için)
    if (typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
      try {
        const fullUrl = window.location.href;
        (window as any).ym(113056145, 'hit', fullUrl, {
          title: document.title || 'Best Eskort',
          referer: referer !== 'Direct' ? referer : undefined,
        });
        (window as any).ym(112120217, 'hit', fullUrl, {
          title: document.title || 'Best Eskort',
          referer: referer !== 'Direct' ? referer : undefined,
        });
      } catch (ymErr) {}
    }

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
        fetch('/api/analytics/heartbeat', {
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
