'use client';

import React from 'react';

interface ListingGridSkeletonProps {
  count?: number;
}

export default function ListingGridSkeleton({
  count = 6,
}: ListingGridSkeletonProps) {
  const cards = Array.from({ length: count });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 w-full">
      {cards.map((_, idx) => (
        <div
          key={idx}
          className="group relative rounded-2xl overflow-hidden bg-[#161b22] border border-[#30363d]/60 flex flex-col justify-between shadow-md select-none"
        >
          {/* ── FOTOĞRAF ALANI SKELETON (aspect-[3/4] tam boyut, asla ufalmaz) ── */}
          <div className="relative aspect-[3/4] w-full bg-[#0d1117] flex items-center justify-center overflow-hidden">
            {/* Top Fake Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
              <div className="h-4 w-12 rounded-lg bg-[#21262d]"></div>
              <div className="h-4 w-4 rounded-full bg-[#21262d]/80"></div>
            </div>

            {/* Ortada Zarif Circular Progress Spinner */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20"></div>
              <svg className="w-full h-full animate-spin text-amber-400" viewBox="0 0 36 36">
                <circle
                  className="opacity-20"
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="45 100"
                  d="M18 4 a 14 14 0 0 1 0 28 a 14 14 0 0 1 0 -28"
                />
              </svg>
            </div>

            {/* Bottom Counter Bar */}
            <div className="absolute bottom-2 right-2 z-10">
              <div className="h-3.5 w-8 rounded-full bg-[#21262d]/70"></div>
            </div>
          </div>

          {/* ── BİLGİ ALANI SKELETON ── */}
          <div className="p-2 sm:p-2.5 flex flex-col gap-2 bg-[#161b22] border-t border-[#30363d]/40">
            {/* Title Line */}
            <div className="h-3.5 w-4/5 rounded bg-[#21262d] animate-pulse"></div>

            {/* Location & Meta Line */}
            <div className="h-2.5 w-1/2 rounded bg-[#21262d]/70 animate-pulse"></div>

            {/* WhatsApp Buton Alanı */}
            <div className="h-7 w-full rounded-xl bg-[#21262d] mt-0.5 flex items-center justify-center gap-1.5 opacity-75">
              <div className="w-3 h-3 rounded-full bg-[#30363d]"></div>
              <div className="w-16 h-2 rounded bg-[#30363d]"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
