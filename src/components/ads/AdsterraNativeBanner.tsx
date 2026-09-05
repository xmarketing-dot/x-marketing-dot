'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Props {
  className?: string;
}

export default function AdsterraNativeBanner({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Admin panelinde reklam gösterme
  if (pathname?.startsWith('/bms-secure-portal')) {
    return null;
  }

  useEffect(() => {
    if (!containerRef.current) return;

    // Eğer zaten script yüklendiyse tekrar yükleme
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl31198532.profitableratecpmnetwork.com/67fb70cfd547bd484057daf3b46c5fda/invoke.js';

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className={`my-4 w-full overflow-hidden rounded-2xl border border-white/5 bg-[#161b22]/40 p-2 sm:p-3 ${className}`}>
      <div className="mb-1.5 flex items-center justify-between px-1 text-[10px] text-gray-500 font-medium tracking-wide">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-500/60 animate-pulse"></span>
          SPONSORLU VİTRİN
        </span>
        <span className="text-gray-600">Reklam</span>
      </div>
      <div ref={containerRef} id="container-67fb70cfd547bd484057daf3b46c5fda" className="w-full min-h-[100px] flex items-center justify-center text-xs text-gray-600">
        {/* Adsterra Native 4:1 Widget will render here */}
      </div>
    </div>
  );
}
