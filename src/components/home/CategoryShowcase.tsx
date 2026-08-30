'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Award, Medal, Sparkles, ChevronRight, Flame } from 'lucide-react';

interface CategoryShowcaseProps {
  ultraVipCovers?: string[];
  ultraVipCount?: number;
  vipCovers: string[];
  vipCount: number;
  goldCovers: string[];
  goldCount: number;
  silverCount?: number;
}

export default function CategoryShowcase({
  ultraVipCovers = [],
  ultraVipCount = 0,
  vipCovers,
  vipCount,
  goldCovers,
  goldCount,
  silverCount = 0,
}: CategoryShowcaseProps) {
  const combinedVipCount = (vipCount || 0) + (ultraVipCount || 0);
  const topVipCover = vipCovers[0] || ultraVipCovers[0] || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=600';

  const allCategories = [
    {
      id: 'vip',
      title: 'VIP Vitrin',
      tagline: 'Seçkin & Özel Hizmet',
      count: combinedVipCount,
      icon: Crown,
      href: '/kategori/vip',
      cover: topVipCover,
      accentGradient: 'from-amber-500 via-amber-400 to-yellow-300',
      borderGlow: 'border-amber-500/90 shadow-[0_0_25px_rgba(245,158,11,0.35)]',
      glowRing: 'ring-1 ring-amber-400/50',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950',
      badgeIconColor: 'fill-slate-950 text-slate-950',
      countBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      ribbonText: '👑 PREMIER',
    },
    {
      id: 'gold',
      title: 'Gold Vitrin',
      tagline: 'Popüler & Tercih Edilen',
      count: goldCount || 0,
      icon: Award,
      href: '/kategori/gold',
      cover: goldCovers[0] || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400',
      accentGradient: 'from-yellow-600 via-amber-600 to-yellow-500',
      borderGlow: 'border-amber-600/70 shadow-[0_0_20px_rgba(217,119,6,0.25)]',
      glowRing: 'ring-1 ring-amber-600/40',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950',
      badgeIconColor: 'fill-slate-950 text-slate-950',
      countBg: 'bg-amber-600/20 text-amber-300 border-amber-600/50',
      ribbonText: '⭐ POPÜLER',
    },
    {
      id: 'silver',
      title: 'Silver Standart',
      tagline: 'Yeni & Doğrulanmış',
      count: silverCount || 0,
      icon: Medal,
      href: '/kategori/silver',
      cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      accentGradient: 'from-slate-400 via-slate-300 to-slate-500',
      borderGlow: 'border-slate-600/60 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
      glowRing: 'ring-1 ring-slate-500/30',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950',
      badgeIconColor: 'fill-slate-950 text-slate-950',
      countBg: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
      ribbonText: '⚡ GÜNCEL',
    },
  ];

  // 1. İlan sayısı 0 olan kategorileri gizle
  const activeCategories = allCategories.filter((cat) => (cat.count || 0) > 0);

  // Hiç aktif kategori yoksa bölümü komple gizle
  if (activeCategories.length === 0) {
    return null;
  }

  // 2. Kalan kategori sayısına göre esnek ve responsive grid düzeni
  const gridClass =
    activeCategories.length === 1
      ? 'grid grid-cols-1 w-full max-w-xl mx-auto gap-3.5'
      : activeCategories.length === 2
      ? 'grid grid-cols-2 gap-3 sm:gap-4 w-full'
      : 'grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full';

  // Kalan karta göre kartın en boy oranını büyüterek ekrana kusursuz oturt
  const cardAspect =
    activeCategories.length === 1
      ? 'aspect-[16/9] sm:aspect-[21/9]'
      : activeCategories.length === 2
      ? 'aspect-[4/5] sm:aspect-[16/10]'
      : 'aspect-[9/13]';

  return (
    <div className="w-full flex flex-col gap-3.5 px-4 animate-in fade-in duration-200">
      {/* Vitrin Bölüm Başlığı */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <h2 className="font-black text-sm uppercase tracking-wider text-white font-heading">
            Özel İlan Vitrinleri
          </h2>
        </div>
        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 font-heading">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Tüm Kategoriler</span>
        </span>
      </div>

      {/* Dinamik ve Responsive Kartlar Grid */}
      <div className={gridClass}>
        {activeCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative rounded-3xl overflow-hidden ${cardAspect} border-2 ${cat.borderGlow} ${cat.glowRing} bg-[#161b22] flex flex-col justify-between p-3 sm:p-4 active:scale-95 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              {/* Arka Plan Vitrin Görseli */}
              <Image
                src={cat.cover}
                alt={cat.title}
                fill
                unoptimized
                loading="lazy"
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 brightness-[1.03] contrast-[1.05]"
              />

              {/* Lüks Gradyan Katmanı */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/35 to-black/60 z-0 group-hover:opacity-85 transition-opacity" />

              {/* Işıltı Animasyon Katmanı */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />

              {/* ÜST: İkon Rozeti ve Canlı İlan Sayısı */}
              <div className="relative z-20 flex items-center justify-between w-full">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${cat.badgeBg} flex items-center justify-center font-black shadow-lg shadow-black/50 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cat.badgeIconColor}`} />
                </div>

                <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-lg ${cat.countBg} backdrop-blur-md border shadow-md font-mono`}>
                  {cat.count} İlan
                </span>
              </div>

              {/* ALT: Temiz, şık ve okunabilir başlık */}
              <div className="relative z-20 flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-black text-sm sm:text-base text-white font-heading tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {cat.title}
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-medium">
                    {cat.tagline}
                  </span>
                </div>
                <div className="p-1.5 rounded-full bg-black/40 border border-white/10 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 shadow-lg">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
