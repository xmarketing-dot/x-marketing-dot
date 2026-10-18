'use client';

import { useEffect } from 'react';
import { fetchClientConfig } from '@/lib/clientConfig';

/**
 * Global Admin WhatsApp Synchronizer
 * Runs in RootLayout on ALL public and private pages.
 * Ensures the client always has the latest WhatsApp number from MongoDB in memory & localStorage.
 */
export default function AdminWhatsAppSync() {
  useEffect(() => {
    const syncPhone = () => {
      fetchClientConfig().catch(() => {});
    };

    // 1. Initial fast sync immediately on mount using deduplicated fetcher
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
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', syncPhone);
    };
  }, []);

  return null;
}
