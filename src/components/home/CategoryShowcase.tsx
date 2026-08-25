'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Star, Award, Medal, Sparkles, ChevronRight } from 'lucide-react';

interface CategoryShowcaseProps {
  ultraVipCovers: string[];
  ultraVipCount: number;
  vipCovers: string[];
  vipCount: number;
  goldCovers: string[];
  goldCount: number;
  silverCount?: number;
}

export default function CategoryShowcase({
  ultraVipCovers,
  ultraVipCount,
  vipCovers,
  vipCount,
  goldCovers,
  goldCount,
  silverCount = 0,
}: CategoryShowcaseProps) {
  const categories = [
    {
      id: 'ultravip',
      title: 'Ultra VIP',
      label: 'Ana Vitrin',
      count: ultraVipCount || 0,
      icon: Crown,
      href: '/kategori/ultravip',
      cover: ultraVipCovers[0] || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=400',
      border: 'border-amber-500/70 hover:border-amber-400',
      badgeBg: 'bg-amber-500 text-slate-950',
      color: 'text-amber-400',
    },
    {
      id: 'vip',
      title: 'VIP Vitrin',
      label: 'Öne Çıkanlar',
      count: vipCount || 0,
      icon: Star,
      href: '/kategori/vip',
      cover: vipCovers[0] || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      border: 'border-purple-500/60 hover:border-purple-400',
      badgeBg: 'bg-purple-600 text-white',
      color: 'text-purple-300',
    },
    {
      id: 'gold',
      title: 'Gold Vitrin',
      label: 'Popüler',
      count: goldCount || 0,
      icon: Award,
      href: '/kategori/gold',
      cover: goldCovers[0] || 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400',
      border: 'border-amber-600/60 hover:border-amber-500',
      badgeBg: 'bg-amber-600 text-white',
      color: 'text-amber-300',
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
            Vitrin Kategorileri
          </h2>
        </div>
        <span className="text-[11px] text-[#8b949e] font-semibold">Tüm Kademeler</span>
      </div>

      {/* 4-Column Showcase Grid (Parlak, Net, Karartmasız) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={`group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] border ${cat.border} bg-[#161b22] shadow-lg flex flex-col justify-between p-2.5 active:scale-95 transition-all duration-200`}
            >
              {/* Background Image - %100 Parlak ve Net */}
              <Image
                src={cat.cover}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-105 contrast-105"
                sizes="150px"
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className={`p-1.5 rounded-xl ${cat.badgeBg} shadow-md`}>
                  <Icon className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-black/80 text-amber-400 backdrop-blur-md border border-amber-400/30 shadow-md">
                  {cat.count} İlan
                </span>
              </div>

              {/* Bottom Title with Glass Background for Clarity */}
              <div className="relative z-10 flex flex-col p-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
                <span className="text-[9px] text-[#8b949e] font-bold leading-tight">{cat.label}</span>
                <span className={`font-black text-xs font-heading tracking-tight ${cat.color}`}>
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

