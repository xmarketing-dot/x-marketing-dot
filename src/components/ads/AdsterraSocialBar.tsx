'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function AdsterraSocialBar() {
  const pathname = usePathname();

  // Admin panelinde reklam gösterme
  if (pathname?.startsWith('/bms-secure-portal')) {
    return null;
  }

  return (
    <Script
      id="adsterra-social-bar"
      src="https://pl31198533.profitableratecpmnetwork.com/2f/3c/76/2f3c765a40b621b76ed53cd9f8d141c6.js"
      strategy="afterInteractive"
    />
  );
}
