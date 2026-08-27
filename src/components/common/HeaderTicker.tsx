'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface TickerItem {
  badge: string;
  text: string;
  link: string;
}

const DEFAULT_ANNOUNCEMENTS: TickerItem[] = [
  {
    badge: '👑 LİDER REHBER',
    text: '81 İl ve İlçede Türkiye\'nin En Büyük İlan Platformu',
    link: '/ilan-ver',
  },
  {
    badge: '🔥 ANINDA MÜŞTERİ',
    text: 'İlan Verin, WhatsApp ile Müşterilere Ulaşın!',
    link: '/ilan-ver',
  },
  {
    badge: '💎 VIP VİTRİN',
    text: 'Google Aramalarında En Üst Sırada Yer Alın',
    link: '/ilan-ver',
  },
  {
    badge: '⚡ CANLI DESTEK',
    text: '%100 Güvenli & 7/24 Canlı Müşteri Desteği',
    link: '/chat',
  },
];

export default function HeaderTicker() {
  const [announcements, setAnnouncements] = useState<TickerItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          const list: TickerItem[] = [];

          // 1. If active banner is enabled by admin, show it as first priority item
          if (data.config.aktifBanner?.aktif && data.config.aktifBanner?.metin) {
            list.push({
              badge: data.config.aktifBanner.rozet || '👑 VIP DUYURU',
              text: data.config.aktifBanner.metin,
              link: data.config.aktifBanner.link || '/ilan-ver',
            });
          }

          // 2. Custom ticker announcements from admin panel
          if (Array.isArray(data.config.duyurular) && data.config.duyurular.length > 0) {
            data.config.duyurular.forEach((d: any) => {
              if (d.text) {
                list.push({
                  badge: d.badge || '👑 DUYURU',
                  text: d.text,
                  link: d.link || '/ilan-ver',
                });
              }
            });
          }

          if (list.length > 0) {
            setAnnouncements(list);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

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
          <span className="text-[11px] font-extrabold text-white leading-tight font-heading flex-1 min-w-0 truncate">
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
