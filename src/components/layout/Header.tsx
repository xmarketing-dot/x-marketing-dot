'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#161b22]/95 backdrop-blur-2xl border-b border-[#30363d] px-4 py-3.5 flex items-center justify-between shadow-md">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <CorporateLogo className="text-2xl sm:text-3xl" />
        <div className="flex flex-col">
          <span className="font-black text-base leading-none tracking-tight text-white group-hover:text-amber-400 transition-colors font-heading">
            Best Eskort
          </span>
          <span className="text-[10px] text-amber-400 mt-1 leading-none font-bold uppercase tracking-wider">
            Bölgesel İlan Rehberi
          </span>
        </div>
      </Link>

      {/* Action Button */}
      <Link
        href="/ilan-ver"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 font-heading uppercase tracking-wider"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>İlan Ver</span>
      </Link>
    </header>
  );
}
