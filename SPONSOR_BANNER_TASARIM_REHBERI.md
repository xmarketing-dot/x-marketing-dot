# 📐 Kesik Çizgili & Ultra Lüks Sponsor Reklam Billboard Tasarım Rehberi

Bu rehber, projedeki yüksek tıklama oranına (CTR) sahip, kesik çizgili (`border-dashed`), responsive ve dinamik 3D altın tipografili **Sponsor Reklam Alanı** bileşeninin diğer projelere doğrudan aktarılması için hazırlanmıştır.

---

## 1. Gerekli İkonlar ve Paketler (Lucide React)
```bash
npm install lucide-react
```

Kullanılan İkonlar:
- `Sparkles` (Parlayan Yıldız)
- `ArrowRight` (Sağa Ok)

---

## 2. Gerekli CSS Animasyonları (`globals.css`)
Aşağıdaki keyframe animasyonlarını projenizin ana CSS dosyasına (`globals.css` veya `app.css`) ekleyin:

```css
/* ── Billboard Lazer Işık Şeridi Animasyonu ── */
@keyframes bannerSheen {
  0% { left: -100%; }
  100% { left: 200%; }
}

.animate-banner-sheen {
  animation: bannerSheen 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Shimmer & Pulse Efektleri ── */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
```

---

## 3. `SponsorBannerArea.tsx` Bileşeni (Kopyala & Yapıştır)

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

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

  const isHero = konum === 'anasayfa_hero' || konum === 'anasayfa';

  // 1. REKLAM YÜKLENİYOR SKELETON'I
  if (isLoading) {
    return (
      <div className="w-full">
        <div
          className={`w-full ${
            isHero
              ? 'h-28 sm:h-36 md:h-44 lg:h-48 border-y sm:border border-amber-500/20 bg-slate-900/60 my-0.5 sm:rounded-2xl'
              : 'h-24 sm:h-32 md:h-36 border-y sm:border border-slate-200 dark:border-zinc-800 bg-slate-900/60 my-1 sm:rounded-2xl'
          } overflow-hidden relative flex items-center justify-center select-none shadow-xs`}
        >
          <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/30 text-amber-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Sponsor Reklam Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. YAYINDA DOLU REKLAM VARSA (Müşteri Banner'ı)
  if (banner) {
    return (
      <div className="w-full sponsor-banner-container no-safe-blur">
        <div
          className={`w-full ${
            isHero
              ? 'border-y sm:border border-amber-500/30 my-0.5 sm:rounded-2xl sm:my-2 shadow-md'
              : 'border-y sm:border border-[#e5e5ea] dark:border-white/10 my-1.5 sm:rounded-2xl sm:my-2 shadow-xs'
          } overflow-hidden bg-slate-950 group relative select-none`}
        >
          <a
            href={banner.hedefUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block relative w-full ${
              isHero
                ? 'h-24 sm:h-36 md:h-44 lg:h-52 xl:h-60'
                : 'h-24 sm:h-32 md:h-40'
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
              className="object-cover md:object-contain object-center group-hover:scale-[1.01] transition-transform duration-500 ease-out relative z-10 no-safe-blur sponsor-banner-img"
            />
          </a>
        </div>
      </div>
    );
  }

  // 3. REKLAM YOKSA -> KESİK ÇİZGİLİ, ULTRA LÜKS VE CANLI VIP PROMO BİLLBOARD
  return (
    <div className="w-full sponsor-banner-container no-safe-blur">
      <div className="w-full my-1 sm:my-2 select-none">
        <Link
          href="/reklam-ver"
          className={`relative block w-full ${
            isHero
              ? 'rounded-2xl h-28 sm:h-36 md:h-44 lg:h-48'
              : 'rounded-2xl h-24 sm:h-32 md:h-36'
          } border-2 border-dashed border-amber-400/80 dark:border-amber-400/70 hover:border-amber-300 bg-slate-950 shadow-[0_4px_30px_rgba(245,158,11,0.18)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.35)] group transition-all duration-300 overflow-hidden cursor-pointer`}
        >
          {/* Arka Plan Lüks Görseli */}
          <Image
            src="/images/promo/casino_banner_promo.webp"
            alt="Sponsor Reklam Alanı"
            fill
            priority
            loading="eager"
            unoptimized
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover object-[15%_20%] sm:object-[20%_25%] md:object-[22%_25%] group-hover:scale-[1.01] transition-transform duration-700 ease-out no-safe-blur sponsor-banner-img"
          />

          {/* İnce Okunurluk Gradyanı */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/75 pointer-events-none" />

          {/* Sağ Taraf: Altın Tipografi & Nabız Atan Buton */}
          <div className="absolute inset-y-0 right-0 w-[60%] sm:w-[55%] md:w-[50%] z-20 flex flex-col justify-center items-end text-right pr-3 sm:pr-6 md:pr-8 lg:pr-10">
            {/* Üst Rozet */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/60 text-amber-300 text-[8px] sm:text-[10px] md:text-xs font-black tracking-wider uppercase mb-0.5 sm:mb-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span>GÜNDE 50.000+ CANLI MÜŞTERİ</span>
            </div>

            {/* Altın Kabartma Başlık */}
            <h2 className="font-black text-xs sm:text-base md:text-xl lg:text-2xl text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">
              BU ALANA ÖZEL{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]">
                REKLAM VER!
              </span>
            </h2>

            {/* Açıklama */}
            <p className="hidden sm:block text-[11px] md:text-xs lg:text-sm text-slate-100 font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,1)] mt-0.5 mb-1 max-w-sm">
              Zirvedeki dev vitrinde yerinizi alın, telefonunuz hiç durmasın ⚡
            </p>

            {/* 3D Buton */}
            <div className="mt-1 sm:mt-0">
              <div className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.9)] group-hover:scale-105 active:scale-95 transition-all animate-pulse">
                <span>TIKLA REKLAM VER 👆</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3] group-hover:translate-x-1.5 transition-transform text-slate-950" />
              </div>
            </div>
          </div>

          {/* Hover Lazer Şeridi */}
          <div className="absolute top-0 -left-[100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-banner-sheen pointer-events-none z-30" />
        </Link>
      </div>
    </div>
  );
}
```

---

## 4. Sayfada Kullanım Örneği (`BannerFeedView.tsx` veya Sayfa Konteyneri)

Web'de 100vw taşmasını önlemek ve `max-w-7xl` ızgara düzenine tam oturtmak için dış konteyner şu şekilde sarılmalıdır:

```tsx
<div className="w-full max-w-7xl mx-auto px-0 md:px-6 lg:px-8 pt-0 pb-1">
  <SponsorBannerArea konum="anasayfa_hero" initialBanner={initialBanner} />
</div>
```

---

## 5. Güvenli Arama Bulanıklığından Muaf Tutma Kuralı (`globals.css`)

Eğer diğer projede de Güvenli Arama (+18 SafeSearch) varsa, reklam görselinin blurlanmaması için şu CSS kuralını ekleyin:

```css
@media (min-width: 769px) {
  html.safe-search-active .sponsor-banner-container,
  html.safe-search-active .sponsor-banner-container img,
  html.safe-search-active img.sponsor-banner-img,
  html.safe-search-active .no-safe-blur,
  html.safe-search-active .no-safe-blur img {
    filter: none !important;
    -webkit-filter: none !important;
  }
}
```
