'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getActiveAdminPhone, 
  parsePhoneNumber, 
  getAdminWhatsAppUrl, 
  setClientAdminWhatsApp,
  FormattedPhoneDetails 
} from '@/lib/siteConfig';

export interface UseAdminWhatsAppReturn {
  phone: string;
  raw: string;
  formatted: string;
  display: string;
  waLink: string;
  details: FormattedPhoneDetails;
  getWaUrl: (customMessage?: string) => string;
  openWhatsApp: (customMessage?: string) => void;
  syncWithServer: () => Promise<string | null>;
}

/**
 * React Hook for Real-Time Admin WhatsApp Number
 * Automatically re-renders when admin number changes via BMS portal, localStorage or custom events.
 */
export function useAdminWhatsApp(): UseAdminWhatsAppReturn {
  const [phone, setPhone] = useState<string>(() => getActiveAdminPhone());

  useEffect(() => {
    // 1. Initial check from memory or localStorage
    const current = getActiveAdminPhone();
    if (current && current !== phone) {
      setPhone(current);
    }

    // 2. Real-time update listeners (across components, pages and tabs)
    const handleUpdate = () => {
      const fresh = getActiveAdminPhone();
      setPhone(fresh);
    };

    window.addEventListener('bms_admin_phone_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bms_admin_phone_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [phone]);

  const details = useMemo(() => parsePhoneNumber(phone), [phone]);

  const getWaUrl = useCallback((customMessage?: string) => {
    return getAdminWhatsAppUrl(customMessage, phone);
  }, [phone]);

  const openWhatsApp = useCallback((customMessage?: string) => {
    const livePhone = getActiveAdminPhone(phone);
    const url = getAdminWhatsAppUrl(customMessage, livePhone);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [phone]);

  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const serverPhone = data?.config?.adminWhatsApp || data?.adminPhone?.raw;
      if (serverPhone) {
        setClientAdminWhatsApp(serverPhone);
        setPhone(serverPhone);
        return serverPhone;
      }
    } catch (e) {}
    return null;
  }, []);

  return {
    phone,
    raw: details.raw,
    formatted: details.formatted,
    display: details.display,
    waLink: details.waLink,
    details,
    getWaUrl,
    openWhatsApp,
    syncWithServer,
  };
}
