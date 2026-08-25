import React from 'react';
import { Metadata } from 'next';
import { Globe, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { getAllLocations, getListings } from '@/lib/data';
import CityExplorer from '@/components/locations/CityExplorer';

export const revalidate = 60; // Refresh every minute for real-time counts

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://` : 'http://localhost:3000');

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
  const [locations, allListings] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 500 }),
  ]);

  // Calculate actual listing count per province
  const cityListingCounts: Record<string, number> = {};
  allListings.forEach((listing: any) => {
    if (listing.ilSlug) {
      cityListingCounts[listing.ilSlug] = (cityListingCounts[listing.ilSlug] || 0) + 1;
    }
  });

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
    <div className="flex flex-col gap-6 px-4 py-4 pb-16 w-full max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 1. SAYFA BAŞLIĞI & HERO ALANI ──────────────── */}
      <div className="flex flex-col gap-2 pt-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="w-8 h-8 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-heading">
            81 İl &amp; 970+ İlçe Keşif Merkezi
          </span>
        </div>
        
        <h1 className="font-black text-2xl sm:text-3xl text-white font-heading tracking-tight leading-snug">
          Türkiye Genelinde <span className="text-amber-400">Şehir ve İlçe İlanları</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-xl">
          Aktif ilanı olan şehirleri filtreleyin, ilçeleri listeleyin ve doğrudan aradığınız bölgenin doğrulanmış ilanlarına ulaşın.
        </p>
      </div>

      {/* ── 2. İNTERAKTİF ŞEHİR VE İLÇE KEŞİF BİLEŞENİ ──────────────── */}
      <CityExplorer 
        cityListingCounts={cityListingCounts} 
        totalListingsCount={allListings.length} 
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
  );
}

