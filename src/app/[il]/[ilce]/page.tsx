import React from 'react';
import { getSiteUrl, getRequestSiteUrl, getCanonicalUrlForLocation } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings, getHomepageConfig } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import FaqAccordion from '@/components/seo/FaqAccordion';
import { generateLocationFaq, generateCombinedSeoGraph, generateLocationGuide } from '@/lib/seoData';
import { getActiveBanner } from '@/lib/data';
import HeroSlider from '@/components/home/HeroSlider';
import CategorizedListingsSection from '@/components/home/CategorizedListingsSection';
import { getTopShowcaseSlides } from '@/lib/showcaseHelper';

interface Props {
  params: Promise<{ il: string; ilce: string }>;
}

export const revalidate = 86400; // 24 saat önbellek (Vercel ISR kota patlamasını önler)

export async function generateStaticParams() {
  const locations = await getAllLocations();
  const params: { il: string; ilce: string }[] = [];

  for (const loc of locations) {
    for (const ilce of loc.ilceler) {
      params.push({ il: loc.ilSlug, ilce: ilce.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il: ilSlug, ilce: ilceSlug } = await params;
  const siteUrl = await getRequestSiteUrl();

  const location = await getLocationBySlug(ilSlug);

  if (!location) {
    return { title: 'Sayfa Bulunamadı | Best Eskort' };
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;
  const canonicalUrl = getCanonicalUrlForLocation(siteUrl, location.ilSlug, ilceSlug);
  const il = location.il;

  // Komşu ilçeler (semantik kümeleme — rakip stratejisi: bolgedeş ilçeleri title'da birleştir)
  const neighborDistricts = location.ilceler
    .filter((d: any) => d.slug !== ilceSlug)
    .slice(0, 2)
    .map((d: any) => d.ad);
  const neighborSuffix = neighborDistricts.length > 0
    ? ` | ${neighborDistricts.join(' Escort ')} Escort`
    : '';

  return {
    title: `${districtName} Escort ❤️ VIP Eskort Bayan | ${il} Best Eskort`,
    description: `⭐ ${il} ${districtName} escort ve eskort bayan ilanı 2026. Teyitli VIP, bağımsız, türbanlı, amatör, eve gelen, otele gelen escort. WhatsApp ile anında ulaşın. — Best Eskort`,
    keywords: [
      // Ana hedef kelimeler (kısa ve güçlü)
      `${districtName} escort`,
      `${districtName} eskort`,
      `${districtName} escort bayan`,
      `${districtName} eskort bayan`,
      `${districtName} vip escort`,
      `${districtName} vip eskort`,
      `${districtName} escort bayan ilanları`,
      `${districtName} eskort ilanları`,

      // İl + ilçe kombinasyonları
      `${il} ${districtName} escort`,
      `${il} ${districtName} eskort`,
      `${il} ${districtName} escort bayan`,

      // Hizmet odaklı
      `${districtName} eve gelen escort`,
      `${districtName} otele gelen escort`,
      `${districtName} whatsapp escort`,
      `${districtName} telegram escort`,
      `${districtName} türbanlı escort`,
      `${districtName} amatör escort`,
      `${districtName} rus escort`,
      `${districtName} bağımsız escort`,

      // 2026 varyasyonları
      `${districtName} escort 2026`,
      `${districtName} eskort 2026`,
      `${districtName} güncel escort`,
      `${districtName} teyitli escort`,

      // Marka + lokasyon
      `besteskort ${districtName}`,
      `best eskort ${districtName}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${districtName} Escort ❤️ | ${il} VIP Eskort Bayan — Best Eskort`,
      description: `${il} ${districtName} genelinde teyitli escort ilanları. VIP vitrin, bağımsız bayanlar, WhatsApp & Telegram. Eve gelen, otele gelen escort, türbanlı, amatör.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: `${siteUrl}/api/og/site?il=${location.ilSlug}&ilce=${ilceSlug}`,
          width: 1200,
          height: 630,
          alt: `${districtName} Escort Eskort Bayan VIP Teyitli`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${districtName} Escort ❤️ | ${il} VIP Eskort — Best Eskort`,
      description: `${il} ${districtName} teyitli escort ilanları. VIP, bağımsız, WhatsApp escort.`,
      images: [`${siteUrl}/api/og/site?il=${location.ilSlug}&ilce=${ilceSlug}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { il: ilSlug, ilce: ilceSlug } = await params;

  const [location, listings, activeBanner, homepageConfig] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, ilceSlug, limit: 120 }),
    getActiveBanner('ilan_detay'),
    getHomepageConfig(),
  ]);

  if (!location) {
    notFound();
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;

  // Bu ilçenin en çok görüntülenen 1-2 vitrin ilanı
  const districtShowcaseSlides = getTopShowcaseSlides(listings, 2);

  // Kategorilere göre listeleri ayır (VIP, Gold, Silver)
  const vipListings = listings.filter((l: any) => l.rozet === 'vip' || l.rozet === 'ultravip');
  const goldListings = listings.filter((l: any) => l.rozet === 'gold');
  const silverListings = listings.filter((l: any) => l.rozet === 'silver' || !l.rozet || l.rozet === 'standart');

  const siteUrl = await getRequestSiteUrl();
  const pageUrl = `${siteUrl}/${location.ilSlug}/${ilceSlug}`;
  const pageName = `${districtName} Eskort & Escort Bayan İlanları 2026`;
  const pageDescription = `${location.il} ${districtName} genelinde teyitli eskort bayan ilanları, bağımsız VIP profiller, WhatsApp ve Telegram hatları, eve gelen ve otele gelen escort seçenekleri.`;

  // 1. Dynamic FAQ Items (Deterministic Seed-based for uniqueness)
  const faqItems = generateLocationFaq(location.il, districtName);

  // 2. Rich Local SEO Article Guide (E-E-A-T & Anti-Thin-Content)
  const guide = generateLocationGuide(location.il, districtName);

  // 3. Combined Google Schema Graph (Breadcrumbs + FAQ + ItemList)
  const seoGraph = generateCombinedSeoGraph({
    pageUrl,
    pageName,
    pageDescription,
    breadcrumbs: [
      { name: 'Anasayfa', url: siteUrl },
      { name: `${location.il} Eskort`, url: `${siteUrl}/${location.ilSlug}` },
      { name: `${districtName} Eskort`, url: pageUrl },
    ],
    faqItems,
    itemCount: listings.length,
    models: listings,
    siteUrl,
    districtName,
  });

  // Komşu ilçeler
  const otherDistricts = location.ilceler.filter((d: any) => d.slug !== ilceSlug);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full pb-12 text-left">
      {/* Googlebot Schema.org Structured Data Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
      />

      {/* ── 0. İLÇE ÖZEL VİTRİN SLIDER (Edge-to-Edge Sıfır Kenar) ──────────────── */}
      <section className="w-full">
        <HeroSlider 
          slides={districtShowcaseSlides}
          promoSlides={homepageConfig?.bosVitrinSliderlar}
          banner={activeBanner}
        />
      </section>

      {/* ── İÇERİK GÖVDESİ (Padding & Max-Width) ──────────────── */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* ── 1. MOBİL-NATİVE ORTALANMIŞ İLÇE HERO KARTI ──────────────── */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] shadow-2xl flex flex-col items-center text-center gap-3.5">
          
          {/* Breadcrumb & Canlı Rozet (Ortalanmış) */}
          <div className="flex items-center justify-center flex-wrap gap-2 w-full pb-2.5 border-b border-white/10">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8b949e] font-heading">
              <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#484f58]" />
              <Link href={`/${location.ilSlug}`} className="hover:text-amber-400 transition-colors capitalize font-bold">
                {location.il}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#484f58]" />
              <span className="text-amber-400 font-black capitalize">{districtName}</span>
            </nav>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Doğrulanmış Bölge</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-800/80 text-amber-300 text-xs font-black font-heading border border-amber-500/20 shadow-sm">
              {listings.length} Aktif İlan
            </span>
          </div>

          {/* Ana Başlık ve Açıklama */}
          <div className="flex flex-col items-center gap-1.5 max-w-xl mx-auto">
            <h1 className="font-heading font-black text-xl sm:text-3xl text-white tracking-tight leading-tight">
              {districtName} <span className="text-amber-400">Escort</span> & Eskort İlanları
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              {location.il} {districtName} escort ve eskort bayan ilanları 2026. {listings.length > 0 ? `${listings.length} aktif ilan.` : ''} Teyitli VIP, bağımsız bayanlar, eve gelen & otele gelen escort. WhatsApp ile anında iletişim.
            </p>
          </div>

          {/* Diğer İlçeler Şeridi */}
          {otherDistricts.length > 0 && (
            <div className="flex flex-col items-center gap-2 pt-2.5 border-t border-[#30363d]/80 w-full">
              <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-wider font-heading">
                {location.il} Diğer İlçeleri ({otherDistricts.length})
              </span>
              <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
                {otherDistricts.map((d: any) => (
                  <Link
                    key={d.slug}
                    href={`/${location.ilSlug}/${d.slug}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-extrabold text-xs border border-[#363b42] transition-all shrink-0 shadow-sm active:scale-95"
                  >
                    {d.ad}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 1.25 ÖZEL SPONSORLU VIP BANNER REKLAMI (TÜM İLÇELERDE SABİT) ──────────────── */}
        <div className="w-full px-0">
          <SponsorBannerArea konum="her_ikisi" initialBanner={activeBanner} />
        </div>

        {/* ── 2. 3'LÜ YAN YANA İLAN GRID LİSTESİ VEYA KATEGORİLİ GÖSTERİM ──────────────── */}
        {listings.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3 shadow-xl">
            <p className="text-sm font-bold text-white font-heading">
              {districtName} ({location.il}) bölgesinde henüz eskort / escort ilanı bulunmuyor.
            </p>
            <p className="text-xs text-[#8b949e]">
              İlk {districtName} eskort ilanını siz vererek bu ilçede zirvede yer alabilirsiniz. Vip eskort, bağımsız escort, whatsapp eskort ilanı ekleyin.
            </p>
            <Link
              href="/ilan-ver"
              className="mt-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-xl active:scale-95 transition-all"
            >
              Hemen {districtName} Eskort İlanı Ver
            </Link>
          </div>
        ) : (
          <CategorizedListingsSection
            vipListings={vipListings}
            goldListings={goldListings}
            silverListings={silverListings}
            allListings={listings}
          />
        )}

        {/* ── 3. GOOGLE RICH SNIPPET FAQ ACCORDION ──────────────── */}
        <FaqAccordion
          title={`${districtName} Eskort Rehberi 2026 — Sıkça Sorulan Sorular | Vip Escort • Bağımsız Eskort • WhatsApp`}
          items={faqItems}
        />

        {/* ── 4. ZENGİN YEREL REHBER METNİ (Google Thin Content Önleyici) ──────────────── */}
        <div className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-4">
          <h2 className="font-black text-sm text-white font-heading">
            {guide.title} | {districtName} Vip Escort • Bağımsız Eskort • Eve Gelen • Otele Gelen
          </h2>
          <div className="flex flex-col gap-2.5 text-xs text-[#8b949e] leading-relaxed">
            {guide.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            <p>
              {location.il} {districtName} eskort ve escort arayanlar için 2026 güncel rehber: {districtName} vip eskort, {districtName} bağımsız eskort, {districtName} amatör eskort, {districtName} türbanlı eskort, {districtName} tango eskort, {districtName} eve gelen eskort, {districtName} otele gelen escort, {districtName} whatsapp eskort, {districtName} telegram eskort, {districtName} eskort numaraları ve teyitli ilanlar burada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#21262d]">
            {guide.bulletPoints.map((bp, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{bp}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{districtName} Vip Escort & Bağımsız Eskort İlanları</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{districtName} Eve Gelen & Otele Gelen Escort</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{districtName} WhatsApp & Telegram Eskort Hatları</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{districtName} Amatör • Türbanlı • Tango Eskort</span>
            </div>
          </div>
        </div>

        {/* ── 5. KOMŞU İLÇELER İÇ LİNK AĞI (Googlebot Internal Linking) ──────────────── */}
        {otherDistricts.length > 0 && (
          <div className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{location.il} Diğer İlçelerine Göre Eskort & Escort İlanları 2026</span>
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              {location.il} {districtName} dışındaki diğer ilçelerin özel eskort profillerini inceleyebilirsiniz:
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              {otherDistricts.map((d: any) => (
                <Link
                  key={d.slug}
                  href={`/${location.ilSlug}/${d.slug}`}
                  className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold border border-[#363b42] transition-colors"
                >
                  {location.il} {d.ad} Eskort & Escort
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. EK SEO KEYWORD BLOĞU (Görünür, doğal akış) ──────────────── */}
        <div className="p-5 rounded-[24px] bg-[#0d1117] border border-[#30363d] text-xs text-[#8b949e] leading-relaxed">
          <h3 className="font-bold text-white text-sm mb-2">
            {districtName} Eskort Arama Rehberi — Popüler Aramalar
          </h3>
          <p>
            {districtName} eskort, {districtName} escort, {districtName} eskort bayan, {districtName} escort bayan, {districtName} vip eskort, {districtName} vip escort, {districtName} bağımsız eskort, {districtName} bağımsız escort, {districtName} whatsapp eskort, {districtName} telegram eskort, {districtName} amatör eskort, {districtName} türbanlı eskort, {districtName} tango eskort, {districtName} eve gelen eskort, {districtName} otele gelen escort, {districtName} eskort numaraları, {districtName} escort numaraları, {districtName} lüks eskort, {districtName} premium escort, {districtName} ucuz eskort, {districtName} özel eskort, {districtName} masaj eskort, {districtName} companion, {districtName} call girl, {districtName} eskort 2026, {districtName} escort 2026, {districtName} güncel eskort ilanları, {districtName} teyitli escort, {districtName} doğrulanmış eskort bayan, {location.il} {districtName} eskort.
          </p>
        </div>
      </div>
    </div>
  );
}