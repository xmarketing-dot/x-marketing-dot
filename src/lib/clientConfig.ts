/**
 * Shared Client-side Config Provider
 * Ensures /api/config is requested ONLY ONCE on page load,
 * deduplicating simultaneous requests from HeaderTicker, AdminWhatsAppSync, and SpecialAdPopup.
 */
import { setClientAdminWhatsApp } from '@/lib/siteConfig';

let configPromise: Promise<any> | null = null;
let cachedConfig: any = null;
let lastFetchTime = 0;
const CLIENT_TTL = 30000; // 30 saniye client-side cache

export async function fetchClientConfig(force = false): Promise<any> {
  const now = Date.now();
  if (!force && cachedConfig && (now - lastFetchTime < CLIENT_TTL)) {
    return cachedConfig;
  }

  if (configPromise && !force) {
    return configPromise;
  }

  configPromise = fetch('/api/config')
    .then((res) => {
      if (!res.ok) throw new Error('Config fetch failed');
      return res.json();
    })
    .then((data) => {
      cachedConfig = data;
      lastFetchTime = Date.now();
      configPromise = null;

      // Global WhatsApp senkronizasyonu
      const serverPhone = data?.config?.adminWhatsApp || data?.adminPhone?.raw;
      if (serverPhone && typeof serverPhone === 'string' && serverPhone.trim()) {
        setClientAdminWhatsApp(serverPhone.trim());
      }

      return data;
    })
    .catch((err) => {
      configPromise = null;
      return cachedConfig || null;
    });

  return configPromise;
}
