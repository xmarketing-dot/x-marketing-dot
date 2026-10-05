'use client';

import { useEffect } from 'react';
import { setClientAdminWhatsApp } from '@/lib/siteConfig';

/**
 * Global Admin WhatsApp Synchronizer
 * Runs in RootLayout on ALL public and private pages.
 * Ensures the client always has the latest WhatsApp number from MongoDB in memory & localStorage.
 */
export default function AdminWhatsAppSync() {
  useEffect(() => {
    let isMounted = true;

    const syncPhone = async () => {
      try {
        const res = await fetch(`/api/config?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverPhone = data?.config?.adminWhatsApp || data?.adminPhone?.raw;
        if (isMounted && serverPhone && typeof serverPhone === 'string' && serverPhone.trim()) {
          setClientAdminWhatsApp(serverPhone.trim());
        }
      } catch (e) {
        // Silent network retry failure
      }
    };

    // 1. Initial fast sync immediately on mount
    syncPhone();

    // 2. Re-verify when tab becomes active / visible
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPhone();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', syncPhone);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', syncPhone);
    };
  }, []);

  return null;
}
