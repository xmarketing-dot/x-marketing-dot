'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import VipRentalBanner from './VipRentalBanner';

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

  const isHero = konum === 'anasayfa_hero' || konum === 'anasayfa' || konum === 'her_ikisi';

  // 1. REKLAM YÜKLENİYOR SKELETON'I
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="w-full h-20 sm:h-24 bg-slate-950/80 border border-[#30363d] rounded-2xl animate-pulse my-1" />
      </div>
    );
  }

  // 2. YAYINDA DOLU REKLAM VARSA (Müşteri Satın Almış Banner)
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

  // 3. AKTİF BANNER YOKSA -> ULTRA PRESTİJLİ "BU ALAN KİRALIKTIR / VIP SPONSOR ALANI" (WhatsApp İle Direkt Satış)
  return <VipRentalBanner konum={konum} />;
}
