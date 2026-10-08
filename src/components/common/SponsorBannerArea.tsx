'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Flame, Zap } from 'lucide-react';
import ExoClickBanner from '@/components/ads/ExoClickBanner';

export interface BannerAdData {
  _id: string;
  baslik: string;
  gorselUrl: string;
  hedefUrl: string;
  konum: string;
  fitMode?: 'cover' | 'contain';
}

interface Props {
  konum?: 'anasayfa' | 'ilan_detay' | string;
  initialBanner?: BannerAdData | null;
}

export default function SponsorBannerArea({ konum = 'anasayfa', initialBanner }: Props) {
  const [banner, setBanner] = useState<BannerAdData | null>(initialBanner || null);
  const [isLoading, setIsLoading] = useState<boolean>(initialBanner === undefined);

  useEffect(() => {
    if (initialBanner !== undefined) {
      setBanner(initialBanner);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/banners?konum=${encodeURIComponent(konum === 'ilan_detay' ? 'ilan_detay' : 'anasayfa')}`, {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setBanner(data?.success && data?.banner ? data.banner : null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [konum, initialBanner]);

  const handleBannerClick = () => {
    if (!banner?._id) return;
    fetch('/api/banners/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerId: banner._id }),
    }).catch(() => { });
  };

  const handleEmptyBannerClick = () => {
    fetch('/api/banners/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBoşAlan: true, konum }),
    }).catch(() => { });
  };

  const isHero = konum === 'anasayfa_hero' || konum === 'anasayfa' || konum === 'her_ikisi';

  // 1. REKLAM YÜKLENİYOR SKELETON'I
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="w-full h-20 sm:h-24 bg-slate-950/80 border border-[#30363d] rounded-2xl animate-pulse my-1" />
      </div>
    );
  }

  // 2. YAYINDA DOLU REKLAM VARSA (Müşteri Banner'ı)
  if (banner) {
    return (
      <div className="w-full sponsor-banner-container no-safe-blur my-1.5 sm:my-2">
        <div
          className={`w-full ${isHero ? 'border-y sm:border border-amber-500/30 sm:rounded-2xl shadow-md' : 'border-y sm:border border-[#30363d] sm:rounded-2xl'
            } overflow-hidden bg-slate-950 group relative select-none`}
        >
          <a
            href={banner.hedefUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBannerClick}
            className={`block relative w-full ${isHero ? 'h-24 sm:h-32 md:h-36 lg:h-40' : 'h-20 sm:h-28 md:h-32'
              } overflow-hidden cursor-pointer bg-slate-950`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 pointer-events-none" />

            <Image
              src={banner.gorselUrl}
              alt={banner.baslik || 'Sponsor Reklam'}
              fill
              priority
              loading="eager"
              unoptimized
              sizes="(max-width: 768px) 100vw, 1280px"
              className={`${banner.fitMode === 'contain' ? 'object-contain' : 'object-cover'
                } md:object-contain object-center group-hover:scale-[1.01] transition-transform duration-500 ease-out relative z-10 no-safe-blur sponsor-banner-img`}
            />
          </a>
        </div>
      </div>
    );
  }

  // 3. REKLAM YOKSA -> EXOCLICK BANNER + REKLAM VER ALANI
  return (
    <div className="w-full sponsor-banner-container no-safe-blur my-1.5 sm:my-2 select-none flex flex-col items-center gap-1.5">
      {/* ExoClick 6050980 Casino/Adult Banner */}
      <ExoClickBanner zoneId="6050980" className="w-full" />

      <Link
        href="/reklam-ver"
        onClick={handleEmptyBannerClick}
        className="group relative block w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed animate-rgb-neon-border bg-gradient-to-r from-[#0d0714] via-[#170a24] to-[#0d0714] transition-all duration-300"
      >
        {/* ── SÜREKLİ KAYAN LAZER IŞIK ŞERİDİ (Continuous Laser Sweep) ── */}
        <div className="absolute top-0 left-0 w-[40%] h-full bg-gradient-to-r from-transparent via-amber-300/25 to-transparent skew-x-[-25deg] animate-continuous-laser pointer-events-none z-30" />

        {/* Arka Plan Dinamik Neon Işık Yayılımları */}
        <div className="absolute -left-8 -top-8 w-40 h-40 bg-fuchsia-600/30 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/30 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

        {/* ── KOMPAKT VE YOĞUN İÇERİK ŞERİDİ ───────────────────────────── */}
        <div className="relative z-20 px-3 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">

          {/* Sol: Casino / Bahis / Adult Rozeti & Ana Başlık */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full sm:w-auto text-left">

            {/* Yanıp Sönen Casino Rozeti */}
            <div className="shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-amber-500 text-white font-mono font-black text-[10px] sm:text-xs flex items-center gap-1.5 animate-badge-fire shadow-md">
              <span className="animate-spin text-xs">🎰</span>
              <span className="tracking-tight whitespace-nowrap">CASINO &amp; ADULT</span>
            </div>

            {/* Başlık ve Trafik Vurgusu */}
            <div className="flex flex-col min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading font-black text-xs sm:text-sm md:text-base text-white tracking-tight drop-shadow-md truncate">
                  BU ALANA ÖZEL REKLAM VER!
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.2 rounded-full border border-amber-500/30">
                  <Zap className="w-2.5 h-2.5 fill-amber-400" />
                  <span>50.000+ Canlı Oyuncu/Müşteri</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                Casino, Bahis ve VIP Hizmetlerinizi zirveye taşıyın • Anında yayına girin
              </p>
            </div>

          </div>

          {/* Sağ: Parlayan 3D Neon Buton */}
          <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
            <div className="w-full sm:w-auto px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.9)] group-hover:scale-105 active:scale-95 transition-all">
              <span>TIKLA REKLAM VER 👆</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </Link>
    </div>
  );
}
