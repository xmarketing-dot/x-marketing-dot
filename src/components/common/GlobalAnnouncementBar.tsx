'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Flame, Sparkles, ChevronRight, ArrowUpRight, Zap, Crown } from 'lucide-react';

interface AnnouncementData {
  isActive: boolean;
  campaignId: string;
  displayType?: 'drawer' | 'bar';
  delaySeconds?: number;
  mediaUrl?: string;
  mediaType?: 'gif' | 'image' | 'none';
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

  // Swipe / Drag to dismiss states
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    let timerId: any = null;

    // Arama motoru botlarına asla drawer/duyuru açma
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|crawler|spider|robot/i.test(ua)) {
        return;
      }
    }

    // Masaüstünde (Web / Desktop) kesinlikle çalıştırma ve gösterme
    const isMobileDevice = () => typeof window !== 'undefined' && window.innerWidth < 768;

    if (!isMobileDevice()) {
      return;
    }

    const handleResize = () => {
      if (!isMobileDevice()) {
        setIsVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);

    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/announcement-bar', { cache: 'no-store' });
        const json = await res.json();
        if (!json.success || !json.data || !json.data.isActive) return;

        // Masaüstünde (Web / Desktop) asla gösterme - Sadece Mobilde göster
        if (!isMobileDevice()) {
          return;
        }

        const config: AnnouncementData = json.data;
        const storageKey = `announcement_seen_${config.campaignId}`;
        const hasSeen = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

        // Tek seferlik gösterim kuralı: Kullanıcı bu kampanyayı daha önce gördüyse/kapattıysa gösterme
        if (hasSeen) return;

        const delay = (typeof config.delaySeconds === 'number' ? config.delaySeconds : 3) * 1000;

        timerId = setTimeout(() => {
          if (!isMounted || !isMobileDevice()) return;

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
              device: 'mobile',
            }),
          }).catch(() => {});
        }, delay);
      } catch (err) {
        // Sessizce geç
      }
    }

    loadAnnouncement();
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (timerId) clearTimeout(timerId);
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

  // Touch Swipe Down Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 75) {
      markAsSeenAndClose('dismiss');
    } else {
      setDragY(0);
    }
  };

  // Preset Stilleri (İlan Ver & VIP Reklam Formatı)
  const presetTheme = {
    fire: {
      pillBg: 'from-amber-500/20 via-rose-500/20 to-red-500/20 border-amber-500/50 text-amber-300',
      titleGrad: 'from-amber-400 via-amber-200 to-yellow-300',
      btn: 'from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/50',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.2)]',
      border: 'border-amber-500/40',
    },
    fuchsia: {
      pillBg: 'from-fuchsia-500/20 via-purple-500/20 to-pink-500/20 border-fuchsia-500/50 text-fuchsia-300',
      titleGrad: 'from-fuchsia-400 via-purple-200 to-pink-300',
      btn: 'from-fuchsia-500 via-purple-500 to-pink-500 text-white shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50',
      glow: 'shadow-[0_0_50px_rgba(217,70,239,0.2)]',
      border: 'border-fuchsia-500/40',
    },
    emerald: {
      pillBg: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/50 text-emerald-300',
      titleGrad: 'from-emerald-400 via-teal-200 to-cyan-300',
      btn: 'from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/30 hover:shadow-emerald-500/50',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
      border: 'border-emerald-500/40',
    },
    cyber: {
      pillBg: 'from-blue-500/20 via-indigo-500/20 to-violet-500/20 border-blue-500/50 text-blue-300',
      titleGrad: 'from-blue-400 via-indigo-200 to-cyan-300',
      btn: 'from-blue-500 via-indigo-500 to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
      border: 'border-blue-500/40',
    },
  };

  const theme = presetTheme[data.stylePreset] || presetTheme.fire;

  // ════════════════════════════════════════════════════════════════
  // 1. PREMIUM VIP SWIPEABLE HALF-SCREEN DRAWER (ORTALANMIŞ & ULTRA KALİTE)
  // ════════════════════════════════════════════════════════════════
  if (data.displayType !== 'bar') {
    return (
      <div className="fixed inset-0 z-[999999] flex flex-col justify-end items-center pointer-events-none md:hidden">
        {/* Fullscreen Backdrop — Hafif Blur & Sayfa Arkası Görünür (Tap to dismiss) */}
        <div
          onClick={() => markAsSeenAndClose('dismiss')}
          className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300 ease-out ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Swipeable Drawer Sheet */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isClosing
              ? 'translateY(100%)'
              : dragY > 0
              ? `translateY(${dragY}px)`
              : 'translateY(0)',
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className={`pointer-events-auto relative w-full sm:max-w-md md:max-w-lg min-h-[48vh] sm:min-h-[440px] max-h-[75vh] bg-[#141824]/95 sm:bg-[#141824]/90 backdrop-blur-2xl border-t sm:border ${theme.border} rounded-t-[32px] sm:rounded-[36px] ${theme.glow} p-5 sm:p-7 flex flex-col justify-between items-center text-center overflow-y-auto no-scrollbar shadow-[0_-20px_60px_rgba(0,0,0,0.85)] select-none`}
        >
          {/* Swipe Indicator Bar (Aşağı Kaydırma Tutamacı) */}
          <div className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing pb-2 pt-0.5">
            <div className="w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/50 transition-colors" />
            <span className="text-[9px] text-[#9AA3B2] font-mono mt-1 tracking-wider uppercase sm:hidden">
              Kapatmak için aşağı kaydırın
            </span>
          </div>

          {/* Kapat Butonu (Sağ Üst) */}
          <button
            type="button"
            onClick={() => markAsSeenAndClose('dismiss')}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F5F6FA] flex items-center justify-center transition-all cursor-pointer z-10 shadow-md"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ORTA GÖVDE: %100 ORTALANMIŞ İLGİ ÇEKİCİ İÇERİK */}
          <div className="flex flex-col items-center justify-center text-center gap-3.5 my-auto w-full max-w-sm mx-auto">
            
            {/* 1. Rozet (İlan Ver / VIP Banner Tarzı) */}
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${theme.pillBg} border shadow-lg backdrop-blur-md`}>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-heading font-black text-xs tracking-wider uppercase drop-shadow text-amber-300">
                {data.badgeText || '👑 VIP DUYURU'}
              </span>
            </div>

            {/* 2. Medya (GIF / Görsel - Doğrudan HTML5 img ile %100 Görünür) */}
            {data.mediaUrl && (
              <div
                onClick={handleActionClick}
                className="relative w-full h-44 sm:h-56 max-h-[35vh] rounded-2xl overflow-hidden border border-[#252B3B] shadow-2xl group cursor-pointer bg-black/90 mx-auto transition-transform hover:scale-[1.01] active:scale-98 flex items-center justify-center p-1.5"
              >
                {/* Native img etiketi tüm GIF'lerin animasyonunu %100 kesintisiz oynatır */}
                <img
                  src={data.mediaUrl}
                  alt={data.title}
                  className="w-full h-full object-contain max-h-[34vh] rounded-xl"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center p-1.5 opacity-95">
                  <span className="text-[10px] font-heading font-black text-amber-300 flex items-center gap-1 drop-shadow-md">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> İncelemek için dokunun <ChevronRight className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>
            )}

            {/* 3. Başlık (İlan Ver / Reklam Ver font-heading font-black degrade stili) */}
            <h2
              onClick={handleActionClick}
              className={`text-xl sm:text-2xl font-heading font-black tracking-tight leading-snug cursor-pointer bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGrad} px-2 drop-shadow-md hover:brightness-110 transition-all`}
            >
              {data.title}
            </h2>

            {/* 4. Alt Açıklama (text-[#9AA3B2] okunaklı & temiz) */}
            {data.description && (
              <p className="text-xs sm:text-sm text-[#9AA3B2] font-medium leading-relaxed tracking-normal max-w-xs sm:max-w-sm mx-auto px-1">
                {data.description}
              </p>
            )}

          </div>

          {/* ALT KISIM: PARLAYAN & İLGİ ÇEKİCİ AKSİYON BUTONU */}
          <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2.5 pt-3 shrink-0">
            <button
              type="button"
              onClick={handleActionClick}
              className={`w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r ${theme.btn} font-heading font-black text-sm uppercase tracking-wider shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01]`}
            >
              <span>{data.buttonText || 'Hemen İncele'}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => markAsSeenAndClose('dismiss')}
              className="text-xs text-[#9AA3B2] hover:text-[#F5F6FA] font-medium py-1 transition-colors cursor-pointer"
            >
              Daha sonra hatırlat veya kapat
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // 2. SABİT TEK SATIR BAR (TOP BAR) GÖRÜNÜMÜ
  // ════════════════════════════════════════════════════════════════
  return (
    <aside
      aria-label="Duyuru Bildirim Çubuğu"
      className={`w-full md:hidden bg-gradient-to-r from-amber-600 via-rose-600 to-red-700 border-b shadow-sm relative z-50 transition-all duration-200 select-none overflow-hidden ${
        isClosing ? 'opacity-0 -translate-y-full max-h-0 h-0 py-0' : 'opacity-100 translate-y-0 h-8 sm:h-9'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 flex-nowrap overflow-hidden">
        
        {/* Sol / Orta Kısım */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden flex-nowrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/35 border border-white/25 font-heading font-black text-[9px] tracking-wider uppercase text-white shadow-inner shrink-0 whitespace-nowrap">
            <Flame className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
            <span>{data.badgeText || '🚀 YENİ'}</span>
          </span>

          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden truncate flex-nowrap">
            <span className="font-heading font-black text-[11px] sm:text-xs text-white drop-shadow-sm truncate whitespace-nowrap">
              {data.title}
            </span>

            {data.description && (
              <span className="hidden md:inline text-white/80 text-[11px] font-medium truncate whitespace-nowrap">
                — {data.description}
              </span>
            )}
          </div>
        </div>

        {/* Sağ Kısım */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={handleActionClick}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white text-slate-950 hover:bg-amber-50 font-heading font-black text-[10px] sm:text-[11px] transition-transform active:scale-95 shadow-sm flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{data.buttonText || 'İncele →'}</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>

          <button
            type="button"
            onClick={() => markAsSeenAndClose('dismiss')}
            aria-label="Duyuruyu Kapat"
            className="p-1 rounded bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Kapat"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}
