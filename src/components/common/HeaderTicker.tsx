'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Crown, Flame, Sparkles, ShieldCheck } from 'lucide-react';

export default function HeaderTicker() {
  const announcements = [
    {
      id: 1,
      badge: '👑 LİDER REHBER',
      text: '81 İl ve İlçede Türkiye\'nin En Büyük İlan Platformu',
      link: '/ilan-ver',
    },
    {
      id: 2,
      badge: '🔥 ANINDA MÜŞTERİ',
      text: 'İlan Verin, WhatsApp ile Müşterilere Ulaşın!',
      link: '/ilan-ver',
    },
    {
      id: 3,
      badge: '💎 ULTRA VIP',
      text: 'Google Aramalarında En Üst Sırada Yer Alın',
      link: '/ilan-ver',
    },
    {
      id: 4,
      badge: '⚡ DOĞRULANMIŞ',
      text: '%100 Güvenli & 7/24 Canlı Müşteri Desteği',
      link: '/chat',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [announcements.length]);

  const current = announcements[currentIndex];

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-[#161b22] to-amber-500/20 border-b border-amber-500/40 px-3 py-2 flex items-center justify-between shadow-md relative overflow-hidden font-heading">
      <Link
        href={current.link}
        className="w-full flex items-center justify-between gap-2 transition-all duration-500 ease-in-out"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0 shadow-sm">
            {current.badge}
          </span>
          <span className="text-[11px] font-extrabold text-white leading-tight font-heading flex-1 min-w-0">
            {current.text}
          </span>
        </div>

        <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-400 shrink-0 bg-[#21262d] px-2 py-1 rounded-lg border border-[#30363d]">
          <span>Git</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </Link>
    </div>
  );
}
