'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getActiveAdminPhone,
  parsePhoneNumber,
  getAdminWhatsAppUrl,
  setClientAdminWhatsApp,
  FormattedPhoneDetails,
} from './siteConfig';

export interface UseAdminWhatsAppReturn {
  phone: string;
  raw: string;
  formatted: string;
  display: string;
  waLink: string;
  details: FormattedPhoneDetails;
  getWaUrl: (customMessage?: string) => string;
  openWhatsApp: (customMessage?: string) => void;
  updatePhone: (newPhone: string) => void;
}

export function useAdminWhatsApp(): UseAdminWhatsAppReturn {
  const [phone, setPhone] = useState<string>(() => {
    return getActiveAdminPhone();
  });

  const details = parsePhoneNumber(phone);

  useEffect(() => {
    // 1. Storage & custom event listeners for instant sync across tabs / components
    const handleUpdate = (e: any) => {
      const updatedPhone = e?.detail !== undefined ? e.detail : getActiveAdminPhone();
      setPhone(updatedPhone || '');
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bms_admin_whatsapp') {
        setPhone(e.newValue || '');
      }
    };

    window.addEventListener('bms_admin_phone_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('bms_admin_phone_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const getWaUrl = useCallback(
    (customMessage?: string) => {
      return getAdminWhatsAppUrl(customMessage, phone);
    },
    [phone]
  );

  const openWhatsApp = useCallback(
    (customMessage?: string) => {
      const livePhone = getActiveAdminPhone() || phone;
      const url = getAdminWhatsAppUrl(customMessage, livePhone);
      if (typeof window !== 'undefined') {
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          alert('Admin WhatsApp iletişim hattı henüz tanımlanmamış.');
        }
      }
    },
    [phone]
  );

  const updatePhone = useCallback((newPhone: string) => {
    setClientAdminWhatsApp(newPhone);
    setPhone(newPhone);
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
    updatePhone,
  };
}
