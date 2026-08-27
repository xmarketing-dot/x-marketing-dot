'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Award, Medal, Sparkles } from 'lucide-react';

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
      label: 'Ana Vitrin & Seçkinler',
      count: combinedVipCount,
      icon: Crown,
      href: '/kategori/vip',
      cover: topVipCover,
      border: 'border-amber-500/80 hover:border-amber-400 shadow-amber-500/10',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950',
      color: 'text-amber-400',
    },
    {
      id: 'gold',
      title: 'Gold Vitrin',
      label: 'Popüler İlanlar',
      count: goldCount || 0,
      icon: Award,
      href: '/kategori/gold',
      cover: goldCovers[0] || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400',
      border: 'border-yellow-600/60 hover:border-yellow-500',
      badgeBg: 'bg-yellow-600 text-white',
      color: 'text-yellow-300',
    },
    {
      id: 'silver',
      title: 'Silver Standart',
      label: 'Güncel İlanlar',
      count: silverCount || 0,
      icon: Medal,
      href: '/kategori/silver',
      cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      border: 'border-slate-600/60 hover:border-slate-500',
      badgeBg: 'bg-slate-700 text-slate-200',
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="font-black text-xs uppercase tracking-wider text-white font-heading">
            Vitrin Kademeleri
          </h2>
        </div>
        <span className="text-[11px] text-amber-400 font-bold">Öne Çıkanlar</span>
      </div>

      {/* 3-Column Showcase Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative rounded-2xl overflow-hidden aspect-[3/4] border-2 ${cat.border} bg-[#161b22] shadow-xl flex flex-col justify-between p-2 sm:p-3 active:scale-95 transition-all duration-200`}
            >
              {/* Background Image */}
              <Image
                src={cat.cover}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-105 contrast-105"
                sizes="200px"
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className={`p-1.5 rounded-xl ${cat.badgeBg} shadow-md`}>
                  <Icon className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-lg bg-black/85 text-amber-400 backdrop-blur-md border border-amber-400/30 shadow-md">
                  {cat.count} İlan
                </span>
              </div>

              {/* Bottom Title with Glass Background */}
              <div className="relative z-10 flex flex-col p-1.5 sm:p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-lg">
                <span className="text-[8px] sm:text-[9px] text-[#8b949e] font-bold leading-tight truncate">{cat.label}</span>
                <span className={`font-black text-[11px] sm:text-xs font-heading tracking-tight truncate ${cat.color}`}>
                  {cat.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
