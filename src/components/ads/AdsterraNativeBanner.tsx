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
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl31198532.profitableratecpmnetwork.com/67fb70cfd547bd484057daf3b46c5fda/invoke.js';

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className={`my-4 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-3 sm:p-4 shadow-xl ${className}`}>
      <div className="mb-2 flex items-center justify-between px-1 text-[10px] text-gray-400 font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-sm shadow-pink-500/50"></span>
          SPONSORLU VIP VİTRİN
        </span>
        <span className="text-gray-500 text-[9px] uppercase tracking-wider font-mono">Tanıtım</span>
      </div>
      <div
        ref={containerRef}
        id="container-67fb70cfd547bd484057daf3b46c5fda"
        className="w-full min-h-[120px] flex items-center justify-center text-xs text-gray-500"
      >
        {/* Adsterra Native 4:1 Widget */}
      </div>
    </div>
  );
}
