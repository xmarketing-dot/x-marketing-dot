import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import { Globe, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { getAllLocations, getListings, getActiveBanner, getHomepageConfig } from '@/lib/data';
import CityExplorer from '@/components/locations/CityExplorer';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import HeroSlider from '@/components/home/HeroSlider';
import { getTopShowcaseSlides } from '@/lib/showcaseHelper';

export const dynamic = 'force-dynamic';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Türkiye Şehirleri Eskort İlanları — Tüm İller ve İlçeler | Best Eskort',
  description: 'Türkiye\'nin 81 ilinde doğrulanmış güncel eskort ilanları. İstanbul, Ankara, İzmir, Bursa, Antalya ve tüm şehirlerde bağımsız eskort ve VIP ilanlar.',
  keywords: [
    'türkiye eskort ilanları',
    'türkiye escort',
    'şehirlere göre eskort',
    'istanbul eskort', 'ankara eskort', 'izmir eskort',
    'antalya eskort', 'bursa eskort', 'adana eskort',
    'all cities escort turkey',
  ],
  alternates: { canonical: `${siteUrl}/sehirler` },
};

export default async function SehirlerPage() {
  const [locations, allListings, activeBanner, homepageConfig] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 500 }),
    getActiveBanner('anasayfa'),
    getHomepageConfig(),
  ]);

  // Calculate actual listing count per province
  const cityListingCounts: Record<string, number> = {};
  allListings.forEach((listing: any) => {
    if (listing.ilSlug) {
      cityListingCounts[listing.ilSlug] = (cityListingCounts[listing.ilSlug] || 0) + 1;
    }
  });

  // Türkiye genelinde en çok görüntülenen 1-2 vitrin ilanı
  const sehirlerShowcaseSlides = getTopShowcaseSlides(allListings, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Türkiye Şehirleri Eskort Rehberi',
    description: 'Türkiye\'nin 81 ilinde eskort ilanları rehberi.',
    numberOfItems: locations.length,
    itemListElement: locations.map((loc: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `${loc.il} Eskort İlanları`,
      url: `${siteUrl}/${loc.ilSlug}`,
    })),
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full pb-20 text-left">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 0. ŞEHİRLER MERKEZİ VİTRİN SLIDER (Edge-to-Edge Sıfır Kenar) ──────────────── */}
      <section className="w-full">
        <HeroSlider 
          slides={sehirlerShowcaseSlides}
          promoSlides={homepageConfig?.bosVitrinSliderlar}
          banner={activeBanner}
        />
      </section>

      {/* ── İÇERİK GÖVDESİ (Padding & Max-Width) ──────────────── */}
      <div className="flex flex-col gap-4 sm:gap-6 px-2 sm:px-4 w-full max-w-5xl mx-auto">
        {/* ── 1. SAYFA BAŞLIĞI & HERO KARTI (ORTALANMIŞ MOBİL-NATİVE) ──────────────── */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] shadow-2xl flex flex-col items-center text-center gap-3.5">
          <div className="flex items-center justify-center flex-wrap gap-2 pb-2 border-b border-white/10 w-full">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-black uppercase tracking-widest font-heading border border-amber-500/30">
              <Globe className="w-3.5 h-3.5" />
              <span>81 İl &amp; 970+ İlçe Keşif Merkezi</span>
            </span>

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Canlı Rehber</span>
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 max-w-xl mx-auto">
            <h1 className="font-black text-2xl sm:text-3xl text-white font-heading tracking-tight leading-tight">
              Türkiye Genelinde <span className="text-amber-400">Şehir ve İlçe İlanları</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              Türkiye genelindeki 81 il ve tüm popüler ilçelerde doğrulanmış eskort ve VIP model ilanları. Şehrinizi seçerek doğrudan teyitli profillerle WhatsApp üzerinden iletişim kurun.
            </p>
          </div>

          {/* 3'lü Hızlı Özet Şerit */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#30363d]/60 text-center font-heading w-full max-w-md">
            <div className="p-2.5 rounded-xl bg-[#21262d]/50 border border-white/5">
              <span className="text-xs sm:text-sm font-black text-white">81 İl</span>
              <span className="block text-[10px] text-[#8b949e]">Tüm Türkiye</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#21262d]/50 border border-white/5">
              <span className="text-xs sm:text-sm font-black text-amber-400">970+ İlçe</span>
              <span className="block text-[10px] text-[#8b949e]">Bölgesel Ağ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#21262d]/50 border border-white/5">
              <span className="text-xs sm:text-sm font-black text-emerald-400">%100 Teyitli</span>
              <span className="block text-[10px] text-[#8b949e]">Manuel Onay</span>
            </div>
          </div>
        </div>

        {/* ── 1.5 SPONSOR BANNER REKLAM ALANI ──────────────── */}
        <div className="w-full px-0">
          <SponsorBannerArea konum="anasayfa" initialBanner={activeBanner} />
        </div>

        {/* ── 2. İNTERAKTİF ŞEHİR VE İLÇE KEŞİF BİLEŞENİ ──────────────── */}
        <CityExplorer 
          cityListingCounts={cityListingCounts} 
          totalListingsCount={allListings.length} 
          allListings={allListings}
        />

        {/* ── 3. GÜVEN BİLGİLENDİRME PANELİ ──────────────── */}
        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-4 shadow-xl mt-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-sm text-white font-heading">%100 Doğrulanmış Bölgesel İlanlar</h2>
            <p className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">
              Türkiye genelindeki tüm profiller teyit edilmiştir. Şehir ve ilçe seçerek anında WhatsApp veya telefon ile doğrudan iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}


