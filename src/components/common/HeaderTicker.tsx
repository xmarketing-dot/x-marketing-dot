'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Crown, Sparkles, ShieldCheck, Flame, MessageCircle, ChevronRight } from 'lucide-react';
import { setClientAdminWhatsApp } from '@/lib/siteConfig';
import { fetchClientConfig } from '@/lib/clientConfig';

interface TickerItem {
  badge: string;
  text: string;
  link: string;
  highlight?: boolean;
  isTelegram?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: TickerItem[] = [
  {
    badge: '✈️ TELEGRAM',
    text: 'Resmi Telegram Kanalımız Açıldı! Günlük Teyitli VIP İlanlar İçin Katılın: @besteskortagency',
    link: 'https://t.me/besteskortagency',
    highlight: true,
    isTelegram: true,
  },
  {
    badge: '👑 BEST ESKORT',
    text: "81 İl ve KKTC Kıbrıs'ta Türkiye'nin En Büyük VIP Eskort Platformu",
    link: '/ilan-ver',
    highlight: true,
  },
  {
    badge: '💎 VIP VİTRİN',
    text: 'Google ve Yandex Aramalarında En Üst Sırada Yer Alın, Müşterilerinizi Katlayın',
    link: '/ilan-ver',
    highlight: false,
  },
  {
    badge: '🛡️ GÜVENLİ İLETİŞİM',
    text: 'Teyitli WhatsApp Hatları & Kapora Talep Etmeyen Doğrulanmış Profiller',
    link: '/ilan-ver',
    highlight: false,
  },
  {
    badge: '🔥 ANINDA MÜŞTERİ',
    text: 'İlanınızı Şimdi Yayınlayın, Dakikalar İçinde Doğrudan WhatsApp Müşterisi Kazanın',
    link: '/ilan-ver',
    highlight: true,
  },
  {
    badge: '⚡ CANLI DESTEK',
    text: '%100 Güvenli & 7/24 Canlı Müşteri Destek Masası',
    link: '/chat',
    highlight: false,
  },
];

const isNotFreePromo = (badge?: string, text?: string) => {
  const str = `${badge || ''} ${text || ''}`.toLowerCase();
  return !str.includes('ücretsiz') && !str.includes('ucretsiz');
};

export default function HeaderTicker() {
  const [announcements, setAnnouncements] = useState<TickerItem[]>(DEFAULT_ANNOUNCEMENTS);

  useEffect(() => {
    fetchClientConfig()
      .then((data) => {
        if (!data) return;
        if (data.config) {
          if (data.config.adminWhatsApp) {
            setClientAdminWhatsApp(data.config.adminWhatsApp);
          }
          // Admin panelinden gelen duyurular listesi varsa Telegram'ı koruyarak birleştir
          if (Array.isArray(data.config.duyurular) && data.config.duyurular.length > 0) {
            const list: TickerItem[] = data.config.duyurular
              .filter((d: any) => d && d.text && String(d.text).trim() && isNotFreePromo(d.badge, d.text))
              .map((d: any) => ({
                badge: d.badge || '👑 BEST ESKORT',
                text: String(d.text).trim(),
                link: d.link || '/ilan-ver',
                highlight: true,
              }));

            if (list.length > 0) {
              setAnnouncements([DEFAULT_ANNOUNCEMENTS[0], ...list]);
              return;
            }
          }

          // Eğer duyurular boşsa ve aktif banner varsa
          if (data.config.aktifBanner?.aktif && data.config.aktifBanner?.metin && isNotFreePromo(data.config.aktifBanner.rozet, data.config.aktifBanner.metin)) {
            setAnnouncements([
              DEFAULT_ANNOUNCEMENTS[0],
              {
                badge: data.config.aktifBanner.rozet || '👑 VIP DUYURU',
                text: data.config.aktifBanner.metin,
                link: data.config.aktifBanner.link || '/ilan-ver',
                highlight: true,
              },
            ]);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (announcements.length === 0) return null;

  // Marquee track içine eklenen blok
  const renderItemTrack = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center gap-6 shrink-0 pr-6">
      {announcements.map((item, idx) => {
        const isExt = item.link.startsWith('http');
        const isTg = item.isTelegram || item.link.includes('t.me');

        const content = (
          <div className="flex items-center gap-2 group/item cursor-pointer">
            <span
              className={`px-2 py-0.5 rounded-md font-heading font-black text-[9px] uppercase tracking-wider shrink-0 shadow-sm flex items-center gap-1 transition-transform group-hover/item:scale-105 ${
                isTg
                  ? 'bg-gradient-to-r from-[#229ED9] to-[#0088cc] text-white shadow-[#229ED9]/30 shadow-md ring-1 ring-[#229ED9]/50'
                  : item.highlight
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-[#21262d] text-amber-400 border border-[#30363d]'
              }`}
            >
              {isTg && <Send className="w-2.5 h-2.5 stroke-[2.5]" />}
              <span>{item.badge}</span>
            </span>

            <span
              className={`text-[11px] font-heading font-extrabold whitespace-nowrap tracking-wide transition-colors ${
                isTg
                  ? 'text-cyan-200 group-hover/item:text-cyan-100'
                  : item.highlight
                  ? 'text-amber-200 group-hover/item:text-amber-300'
                  : 'text-slate-200 group-hover/item:text-white'
              }`}
            >
              {item.text}
            </span>

            <span className="text-amber-400/30 text-[10px] ml-2 select-none">✦</span>
          </div>
        );

        if (isExt) {
          return (
            <a
              key={`${keyPrefix}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              {content}
            </a>
          );
        }

        return (
          <Link
            key={`${keyPrefix}-${idx}`}
            href={item.link}
            prefetch={false}
            className="inline-flex items-center"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      aria-label="Güncel Duyurular ve Telegram Kanalı"
      className="w-full h-8 bg-gradient-to-r from-[#161b22] via-[#0d1117] to-[#161b22] border-b border-amber-500/30 overflow-hidden select-none flex items-center relative group"
    >
      <div className="flex w-max animate-marquee-track group-hover:[animation-play-state:paused] active:[animation-play-state:paused]">
        {renderItemTrack('track-1')}
        {renderItemTrack('track-2')}
        {renderItemTrack('track-3')}
      </div>
    </aside>
  );
}
