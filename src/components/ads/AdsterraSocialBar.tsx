'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdsterraSocialBar() {
  const pathname = usePathname();

  useEffect(() => {
    // Admin panelinde reklam gösterme
    if (pathname?.startsWith('/bms-secure-portal')) {
      return;
    }

    const scriptId = 'adsterra-socialbar-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://pl31198533.profitableratecpmnetwork.com/2f/3c/76/2f3c765a40b621b76ed53cd9f8d141c6.js';
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
