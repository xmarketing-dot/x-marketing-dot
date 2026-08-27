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

  const categories = [
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

  return (
    <div className="w-full flex flex-col gap-3.5 px-4">
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

      {/* 3'lü Lüks Vitrin Kartları Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative rounded-3xl overflow-hidden aspect-[9/13] border-2 ${cat.borderGlow} ${cat.glowRing} bg-[#161b22] flex flex-col justify-between p-2.5 sm:p-3.5 active:scale-95 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              {/* Arka Plan Vitrin Görseli */}
              <Image
                src={cat.cover}
                alt={cat.title}
                fill
                unoptimized
                loading="lazy"
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover object-top group-hover:scale-110 transition-transform duration-700 brightness-[1.03] contrast-[1.05]"
              />

              {/* Lüks Gradyan Katmanı (Görseli karartmadan metinleri kristal netliğinde öne çıkarır) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/30 to-black/60 z-0 group-hover:opacity-85 transition-opacity" />

              {/* Işıltı Animasyon Katmanı */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />

              {/* ÜST: İkon Rozeti ve Canlı İlan Sayısı */}
              <div className="relative z-20 flex items-center justify-between w-full">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${cat.badgeBg} flex items-center justify-center font-black shadow-lg shadow-black/50 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${cat.badgeIconColor}`} />
                </div>

                <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg ${cat.countBg} backdrop-blur-md border shadow-md font-mono`}>
                  {cat.count} İlan
                </span>
              </div>

              {/* ALT: Vitrin Başlık Kartı */}
              <div className="relative z-20 flex flex-col gap-0.5 p-2 sm:p-2.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-xl group-hover:border-amber-400/50 transition-colors">
                <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-400 uppercase tracking-wider font-heading leading-tight truncate">
                  {cat.ribbonText}
                </span>

                <span className="font-black text-[12px] sm:text-[13px] text-white font-heading tracking-tight leading-tight group-hover:text-amber-300 transition-colors truncate">
                  {cat.title}
                </span>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
                  <span className="text-[8px] sm:text-[9px] text-[#8b949e] font-semibold truncate">
                    {cat.tagline}
                  </span>
                  <ChevronRight className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
