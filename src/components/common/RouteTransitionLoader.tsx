'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteTransitionLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const lastPathRef = useRef(pathname);

  // When pathname changes, immediately dismiss top laser line
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      setIsNavigating(false);
    }
  }, [pathname]);

  // Click listener for internal route navigation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('https://wa.me') ||
        anchor.getAttribute('target') === '_blank'
      ) {
        return;
      }

      const cleanPath = href.split('?')[0].split('#')[0];
      if (cleanPath && cleanPath !== window.location.pathname) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // Failsafe auto-dismiss for top laser line
  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => setIsNavigating(false), 1200);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <>
      {/* ── TOP 3px NEON LASER LINE (Only during link-to-link transitions, 0% CPU, 0 visual disruption) ── */}
      <div className="fixed top-0 inset-x-0 h-[3px] bg-black overflow-hidden z-[100005] pointer-events-none shadow-[0_2px_12px_rgba(236,72,153,0.9)]">
        <div className="h-full bg-gradient-to-r from-amber-500 via-pink-500 to-amber-300 animate-hardwareLaser"></div>
      </div>

      <style jsx>{`
        @keyframes hardwareLaser {
          0% { width: 10%; }
          50% { width: 65%; }
          80% { width: 90%; }
          100% { width: 98%; }
        }
        .animate-hardwareLaser {
          animation: hardwareLaser 1.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
