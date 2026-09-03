'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame
} from 'lucide-react';

interface CategoryShowcaseProps {
  ultraVipCovers?: string[];
  ultraVipCount?: number;
  vipCovers?: string[];
  vipCount: number;
  goldCovers?: string[];
  goldCount: number;
  silverCount?: number;
}

export default function CategoryShowcase({
  ultraVipCount = 0,
  vipCount,
  goldCount,
  silverCount = 0,
}: CategoryShowcaseProps) {
  const combinedVipCount = (vipCount || 0) + (ultraVipCount || 0);

  // Sade, net, lüks ve doğrudan:
  // VIP İLAN -> ESKORTLAR -> 10 İLAN
  // Sıralama: GOLD (Sol) - VIP (Ortada & Parlayan Merkez) - SILVER (Sağ)
  const categories = [
    {
      id: 'gold',
      badgeTop: 'GOLD İLAN',
      title: 'GOLD',
      subtitle: 'ESKORTLAR',
      count: goldCount || 0,
      href: '/kategori/gold',
      theme: 'gold', // Lüks sıcak altın/dore zemin
      icon: '⭐',
    },
    {
      id: 'vip',
      badgeTop: 'VIP İLAN',
      title: 'VIP',
      subtitle: 'ESKORTLAR',
      count: combinedVipCount,
      href: '/kategori/vip',
      theme: 'vip', // Ortada, en parlak, göz alıcı sıvı altın-kehribar kraliyet teması
      icon: '👑',
    },
    {
      id: 'silver',
      badgeTop: 'SILVER İLAN',
      title: 'SILVER',
      subtitle: 'ESKORTLAR',
      count: silverCount || 0,
      href: '/kategori/silver',
      theme: 'silver', // Lüks platin/çelik gümüş
      icon: '⚡',
    },
  ];

  return (
    <div className="w-full px-2 sm:px-4 animate-fadeIn">
      {/* 3'LÜ YAN YANA LÜKS VİTRİN KARTLARI (VIP En Baskın & Parlayan Merkez) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full items-center">
        {categories.map((cat) => {
          const isVip = cat.theme === 'vip';
          const isGold = cat.theme === 'gold';

          // VIP: Parlak Sıvı Altın/Amber Royal (Merkez & En Parlak)
          // GOLD: Sıcak Şampanya / Varak Altın (Göz alıcı ama VIP'nin altında)
          // SILVER: Platin Gümüş / Çelik Parlaklığı
          const cardBg = isVip
            ? 'bg-gradient-to-b from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 shadow-2xl shadow-amber-500/40 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0d1117] transform sm:scale-105 z-10'
            : isGold
            ? 'bg-gradient-to-b from-[#2b210a] via-[#1a1406] to-[#0f0b02] text-amber-200 shadow-xl shadow-amber-950/40 border border-amber-500/50'
            : 'bg-gradient-to-b from-[#222a36] via-[#161c24] to-[#0d1218] text-slate-100 shadow-xl shadow-slate-950/40 border border-slate-400/40';

          const innerBorder = isVip
            ? 'border-slate-950/60'
            : isGold
            ? 'border-amber-400/50'
            : 'border-slate-300/40';

          const ornamentColor = isVip ? 'text-slate-950' : isGold ? 'text-amber-400' : 'text-slate-300';
          const titleColor = isVip ? 'text-slate-950' : isGold ? 'text-amber-300' : 'text-slate-100';
          const subColor = isVip ? 'text-slate-950/90' : isGold ? 'text-amber-400/80' : 'text-slate-400';

          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-95 shadow-xl select-none ${cardBg}`}
            >
              {/* VIP İçin Özel Arka Plan Parlama Efekti */}
              {isVip && (
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none -z-10 animate-pulse" />
              )}

              {/* İÇ ALTIN ÇERÇEVE */}
              <div className={`relative w-full h-full rounded-xl sm:rounded-2xl border-2 ${innerBorder} p-2 sm:p-3 flex flex-col items-center justify-between text-center overflow-hidden min-h-[160px] sm:min-h-[190px]`}>

                {/* 1. ÜST: [👑 ULTRA VIP VİTRİN] / [GOLD İLAN] / [SILVER İLAN] */}
                <div className="flex flex-col items-center gap-0.5 w-full">
                  <span className={`text-[8px] sm:text-[10px] font-heading font-black tracking-[0.16em] uppercase truncate max-w-full ${subColor}`}>
                    {cat.badgeTop}
                  </span>

                  {/* Vintage Barok Süs Çizgisi */}
                  <div className={`flex items-center justify-center gap-1.5 w-full my-0.5 opacity-90 ${ornamentColor}`}>
                    <span className="h-[1.5px] w-4 sm:w-8 bg-current opacity-60"></span>
                    <span className="text-[10px] sm:text-xs">✦</span>
                    <span className="h-[1.5px] w-4 sm:w-8 bg-current opacity-60"></span>
                  </div>
                </div>

                {/* 2. ORTA: BÜYÜK BAŞLIK & ESKORTLAR */}
                <div className="flex flex-col items-center justify-center my-auto py-0.5">
                  <div className={`text-base sm:text-2xl mb-0.5 group-hover:scale-125 transition-transform ${isVip ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : 'drop-shadow-sm'}`}>
                    {cat.icon}
                  </div>

                  {/* VIP / GOLD / SILVER */}
                  <span className={`font-heading font-black text-2xl sm:text-4xl tracking-wider leading-none ${titleColor} ${isVip ? 'drop-shadow-md' : 'drop-shadow-sm'}`}>
                    {cat.title}
                  </span>

                  {/* ESKORTLAR */}
                  <span className={`font-heading font-black text-[11px] sm:text-sm tracking-[0.2em] uppercase mt-1 ${subColor}`}>
                    {cat.subtitle}
                  </span>
                </div>

                {/* 3. ALT: NET İLAN SAYISI [X İLAN] */}
                <div className="flex flex-col items-center w-full pt-1">
                  {/* Ayırıcı Çizgi */}
                  <div className={`flex items-center justify-center gap-1.5 w-full mb-1.5 opacity-80 ${ornamentColor}`}>
                    <span className="h-[1px] flex-1 bg-current opacity-40"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span className="h-[1px] flex-1 bg-current opacity-40"></span>
                  </div>

                  {/* X İLAN KAPSÜLÜ */}
                  <span className={`text-[10px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider ${isVip
                    ? 'bg-slate-950 text-amber-300 border-2 border-slate-950'
                    : isGold
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-200 border border-white/10'
                    }`}>
                    {cat.count > 0 ? `${cat.count} İLAN` : '0 İLAN'}
                  </span>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


