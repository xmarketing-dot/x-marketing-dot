'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ExternalLink, Flame, Zap } from 'lucide-react';

interface AnnouncementData {
  isActive: boolean;
  campaignId: string;
  title: string;
  description?: string;
  badgeText: string;
  buttonText: string;
  targetUrl: string;
  openInNewTab: boolean;
  stylePreset: 'fire' | 'emerald' | 'fuchsia' | 'cyber';
}

export default function GlobalAnnouncementBar() {
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/announcement-bar', { cache: 'no-store' });
        const json = await res.json();
        if (!json.success || !json.data || !json.data.isActive) return;

        const config: AnnouncementData = json.data;
        const storageKey = `announcement_seen_${config.campaignId}`;
        const hasSeen = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

        // Tek seferlik gösterim kuralı: Kullanıcı bu kampanyayı daha önce gördüyse/kapattıysa gösterme
        if (hasSeen) return;

        if (isMounted) {
          setData(config);
          setIsVisible(true);

          // Görüntülenme (View) logunu backend'e gönder
          const visitorId = localStorage.getItem('bms_vid') || undefined;
          fetch('/api/announcement-bar/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'view',
              campaignId: config.campaignId,
              visitorId,
              device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
            }),
          }).catch(() => {});
        }
      } catch (err) {
        // Sessizce geç
      }
    }

    loadAnnouncement();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isVisible || !data) return null;

  const markAsSeenAndClose = (eventType: 'click' | 'dismiss') => {
    try {
      localStorage.setItem(`announcement_seen_${data.campaignId}`, 'true');
      const visitorId = localStorage.getItem('bms_vid') || undefined;
      fetch('/api/announcement-bar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          campaignId: data.campaignId,
          visitorId,
          device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
        }),
      }).catch(() => {});
    } catch (e) {}

    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    markAsSeenAndClose('click');
    if (data.targetUrl) {
      if (data.openInNewTab) {
        window.open(data.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = data.targetUrl;
      }
    }
  };

  // Preset Stilleri
  const presetClasses = {
    fire: 'from-amber-600 via-rose-600 to-red-700 border-amber-400/50 shadow-red-900/40 text-amber-50',
    fuchsia: 'from-fuchsia-700 via-purple-700 to-pink-700 border-fuchsia-400/50 shadow-fuchsia-900/40 text-fuchsia-50',
    emerald: 'from-emerald-600 via-teal-700 to-cyan-800 border-emerald-400/50 shadow-emerald-900/40 text-emerald-50',
    cyber: 'from-indigo-700 via-violet-800 to-blue-900 border-indigo-400/50 shadow-indigo-900/40 text-indigo-50',
  };

  const currentPreset = presetClasses[data.stylePreset] || presetClasses.fire;

  return (
    <div
      className={`w-full bg-gradient-to-r ${currentPreset} border-b shadow-lg relative z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0 -translate-y-full max-h-0 py-0 overflow-hidden' : 'opacity-100 translate-y-0 py-2.5 px-3'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm">
        
        {/* Sol / Orta Kısım: Badge & Mesaj */}
        <div className="flex items-center gap-2 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 border border-white/20 font-black text-[10px] tracking-wider uppercase text-white shadow-inner shrink-0">
            <Flame className="w-3 h-3 text-amber-300 animate-bounce" />
            <span>{data.badgeText || '🚀 YENİ AĞ'}</span>
          </span>

          <span className="font-heading font-black tracking-tight text-white drop-shadow-sm">
            {data.title}
          </span>

          {data.description && (
            <span className="hidden md:inline text-white/85 text-xs font-medium">
              — {data.description}
            </span>
          )}
        </div>

        {/* Sağ Kısım: Aksiyon Butonu & Kapatma 'X' */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleActionClick}
            className="px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-amber-100 font-heading font-black text-xs transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>{data.buttonText || 'Hemen İncele →'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => markAsSeenAndClose('dismiss')}
            aria-label="Kapat"
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Duyuruyu Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
