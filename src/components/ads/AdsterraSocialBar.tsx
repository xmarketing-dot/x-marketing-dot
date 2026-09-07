'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdsterraSocialBar() {
  const pathname = usePathname();

  // Admin panelinde veya bms portalında kesinlikle reklam scripti yükleme
  const isExcluded = pathname?.startsWith('/bms-secure-portal') || pathname?.startsWith('/admin');

  useEffect(() => {
    if (isExcluded) return;

    // Script daha önce eklenmemişse yükle
    const existingScript = document.querySelector('script[src*="profitableratecpmnetwork.com/2f/3c/76/2f3c765a40b621b76ed53cd9f8d141c6.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://pl31198533.profitableratecpmnetwork.com/2f/3c/76/2f3c765a40b621b76ed53cd9f8d141c6.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isExcluded]);

  return null;
}
