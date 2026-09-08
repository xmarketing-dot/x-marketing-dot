'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdsterraPopunder() {
  const pathname = usePathname();

  // Admin veya bms portalında kesinlikle reklam scripti yükleme
  const isExcluded = pathname?.startsWith('/bms-secure-portal') || pathname?.startsWith('/admin');

  useEffect(() => {
    if (isExcluded) return;

    const scriptSrc = 'https://pl31240943.profitableratecpmnetwork.com/c5/9d/07/c59d076c984e590062f0a5ea7ca60715.js';
    const existingScript = document.querySelector(`script[src*="c59d076c984e590062f0a5ea7ca60715.js"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isExcluded]);

  return null;
}
