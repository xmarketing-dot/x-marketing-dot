'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { X, Sparkles, Flame, ChevronRight, Crown } from 'lucide-react';

interface SpecialAdConfig {
  aktif: boolean;
  baslik: string;
  spotMetin: string;
  rozet: string;
  resimUrl: string;
  hedefUrl: string;
  gecikmeSaniye: number;
}

export default function SpecialAdPopup() {
  const [adConfig, setAdConfig] = useState<SpecialAdConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't show in admin portal or chat
    if (pathname?.startsWith('/bms-secure-portal') || pathname === '/chat') {
      return;
    }

    // Check if user already dismissed in this session
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('bms_special_ad_closed');
      if (isDismissed) return;
    }

    // Fetch config
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.ozelIlanReklam && data.config.ozelIlanReklam.aktif) {
          setAdConfig(data.config.ozelIlanReklam);
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (!adConfig || !adConfig.aktif) return;

    const delayMs = Math.max(2, adConfig.gecikmeSaniye || 4) * 1000;

    let timer: NodeJS.Timeout | null = null;
    let triggered = false;

    const showAd = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };

    // Trigger on timer (e.g. 4 seconds)
    timer = setTimeout(() => {
      showAd();
    }, delayMs);

    // Or trigger when user scrolls down 200px
    const handleScroll = () => {
      if (window.scrollY > 200) {
        showAd();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [adConfig]);

  if (!isOpen || !adConfig || !adConfig.aktif) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bms_special_ad_closed', 'true');
    }
  };

  const handleGoToAd = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bms_special_ad_closed', 'true');
      if ((window as any).trackEvent) {
        (window as any).trackEvent('special_ad_click', {
          title: adConfig.baslik,
          targetUrl: adConfig.hedefUrl,
        });
      }
    }
    router.push(adConfig.hedefUrl || '/ilan-ver');
  };

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-b from-[#161b22] via-[#0d1117] to-[#161b22] border-2 border-amber-400 shadow-[0_0_70px_rgba(245,158,11,0.55)] flex flex-col animate-in zoom-in-95 duration-300"
      >
        
        {/* Kapat Butonu (Sağ Üst) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/80 text-white hover:text-amber-400 border border-white/20 flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-lg"
          title="Kapat"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Büyük Özel İlan Görseli */}
        <div 
          onClick={handleGoToAd}
          className="relative aspect-[4/3] w-full bg-[#0d1117] overflow-hidden cursor-pointer group"
        >
          <Image
            src={adConfig.resimUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=800'}
            alt={adConfig.baslik}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[1.03]"
            priority
          />

          {/* Karartma Gradyanı */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-black/50" />

          {/* Sol Üst Rozet */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-[10px] uppercase font-heading tracking-wider shadow-lg flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>{adConfig.rozet || '🔥 SPONSORLU ÖZEL İLAN'}</span>
            </span>
          </div>
        </div>

        {/* İçerik & Aksiyon Alanı */}
        <div className="p-5 flex flex-col gap-3.5 text-center">
          
          <div className="flex flex-col gap-1">
            <h2 className="font-black text-lg sm:text-xl text-white font-heading tracking-tight leading-snug drop-shadow-md text-amber-300">
              {adConfig.baslik}
            </h2>
            <p className="text-xs text-[#8b949e] font-medium leading-relaxed">
              {adConfig.spotMetin}
            </p>
          </div>

          {/* Yanıp Sönen Lüks Aksiyon Butonu */}
          <button
            type="button"
            onClick={handleGoToAd}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-heading shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer animate-pulse-glow"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>Özel İlanı İncele &amp; Ulaş</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] text-[#8b949e] hover:text-white transition-colors"
          >
            Reklamı Kapat ve Devam Et
          </button>

        </div>

      </div>
    </div>
  );
}
