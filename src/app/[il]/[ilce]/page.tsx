import React from 'react';
import { getSiteUrl, getRequestSiteUrl, getCanonicalUrlForLocation } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import AdsterraNativeBanner from '@/components/ads/AdsterraNativeBanner';
import FaqAccordion from '@/components/seo/FaqAccordion';
import { generateLocationFaq, generateCombinedSeoGraph, generateLocationGuide } from '@/lib/seoData';
import { getActiveBanner } from '@/lib/data';

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

  return {
    title: `${districtName} Escort Eskort Bayan İlanları 2026 | ${il} ${districtName} Vip Escort | ${districtName} Bağımsız Eskort | ${districtName} WhatsApp Eskort | Best Eskort`,
    description: `${il} ${districtName} eskort ve escort bayan ilanları 2026. Doğrulanmış bağımsız eskort, VIP vitrin, ${districtName} vip eskort, ${districtName} amatör eskort, ${districtName} türbanlı eskort, ${districtName} tango eskort, ${districtName} eve gelen eskort, ${districtName} otele gelen escort, ${districtName} whatsapp eskort, ${districtName} telegram eskort, ${districtName} eskort numaraları, ${districtName} escort bayan, ${districtName} eskort bayan ilanları, ${districtName} lüks eskort, ${districtName} premium escort, ${districtName} ucuz eskort, ${districtName} özel eskort, ${districtName} masaj eskort, ${districtName} companion bayan, ${districtName} call girl, güncel teyitli ${il} ${districtName} eskort rehberi.`,
    keywords: [
      // İlçe Ana varyasyonlar
      `${districtName} eskort`,
      `${districtName} escort`,
      `${districtName} eskort bayan`,
      `${districtName} escort bayan`,
      `${districtName} eskort ilanları`,
      `${districtName} escort ilanları`,
      `${districtName} eskort bayan ilanları`,
      `${districtName} escort bayan ilanları`,
      `${districtName} bağımsız eskort`,
      `${districtName} bağımsız escort`,
      `${districtName} vip eskort`,
      `${districtName} vip escort`,
      `${districtName} vip eskort bayan`,
      `${districtName} vip escort bayan`,
      `${districtName} whatsapp eskort`,
      `${districtName} whatsapp escort`,
      `${districtName} telegram eskort`,
      `${districtName} telegram escort`,
      `${districtName} amatör eskort`,
      `${districtName} amatör escort`,
      `${districtName} türbanlı eskort`,
      `${districtName} türbanlı escort`,
      `${districtName} tango eskort`,
      `${districtName} tango escort`,
      `${districtName} eve gelen eskort`,
      `${districtName} eve gelen escort`,
      `${districtName} otele gelen eskort`,
      `${districtName} otele gelen escort`,
      `${districtName} eskort numaraları`,
      `${districtName} escort numaraları`,
      `${districtName} eskort numarası`,
      `${districtName} escort numarası`,

      // İl + İlçe kombinasyonları
      `${il} ${districtName} eskort`,
      `${il} ${districtName} escort`,
      `${il} ${districtName} eskort bayan`,
      `${il} ${districtName} escort bayan`,
      `${districtName} ${il} eskort`,
      `${districtName} ${il} escort`,

      // 2026 + güncel + teyitli
      `${districtName} eskort 2026`,
      `${districtName} escort 2026`,
      `${districtName} eskort ilanları 2026`,
      `${districtName} escort ilanları 2026`,
      `${districtName} güncel eskort`,
      `${districtName} güncel escort`,
      `${districtName} teyitli eskort`,
      `${districtName} teyitli escort`,
      `${districtName} doğrulanmış eskort`,
      `${districtName} doğrulanmış escort`,
      `${districtName} gerçek eskort`,
      `${districtName} gerçek escort`,

      // Lüks / Premium / Ucuz / Özel
      `${districtName} lüks eskort`,
      `${districtName} lüks escort`,
      `${districtName} premium eskort`,
      `${districtName} premium escort`,
      `${districtName} ucuz eskort`,
      `${districtName} ucuz escort`,
      `${districtName} özel eskort`,
      `${districtName} özel escort`,
      `${districtName} elit eskort`,
      `${districtName} elit escort`,
      `${districtName} kaliteli eskort`,
      `${districtName} kaliteli escort`,

      // Masaj / Companion / Call girl
      `${districtName} masaj eskort`,
      `${districtName} masaj escort`,
      `${districtName} companion`,
      `${districtName} companion bayan`,
      `${districtName} call girl`,
      `${districtName} callgirl`,
      `${districtName} escort girl`,
      `${districtName} eskort girl`,

      // İletişim odaklı
      `${districtName} eskort whatsapp`,
      `${districtName} escort whatsapp`,
      `${districtName} eskort telegram`,
      `${districtName} escort telegram`,
      `${districtName} eskort telefon`,
      `${districtName} escort telefon`,
      `${districtName} eskort iletişim`,
      `${districtName} escort iletişim`,
      `${districtName} eskort hattı`,
      `${districtName} escort hattı`,

      // Hizmet odaklı
      `${districtName} eve gelen eskort bayan`,
      `${districtName} otele gelen eskort bayan`,
      `${districtName} eve gelen escort bayan`,
      `${districtName} otele gelen escort bayan`,
      `${districtName} otel eskort`,
      `${districtName} otel escort`,
      `${districtName} ev eskort`,
      `${districtName} ev escort`,
      `${districtName} buluşma eskort`,
      `${districtName} buluşma escort`,

      // Popüler aramalar
      `${districtName} eskort sitesi`,
      `${districtName} escort sitesi`,
      `${districtName} eskort rehberi`,
      `${districtName} escort rehberi`,
      `${districtName} eskort listesi`,
      `${districtName} escort listesi`,
      `${districtName} eskort profil`,
      `${districtName} escort profil`,
      `${districtName} eskort ilanı`,
      `${districtName} escort ilanı`,
      `${districtName} yeni eskort`,
      `${districtName} yeni escort`,
      `${districtName} genç eskort`,
      `${districtName} genç escort`,
      `${districtName} olgun eskort`,
      `${districtName} olgun escort`,
      `${districtName} yabancı eskort`,
      `${districtName} yabancı escort`,
      `${districtName} rus eskort`,
      `${districtName} rus escort`,
      `${districtName} ukraynalı eskort`,
      `${districtName} ukraynalı escort`,

      // Marka + lokasyon
      `best eskort ${districtName}`,
      `best escort ${districtName}`,
      `besteskort ${districtName}`,
      `${districtName} best eskort`,
      `${districtName} best escort`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${districtName} Escort Eskort Bayan İlanları 2026 | ${il} Vip Escort | ${districtName} Bağımsız Eskort | Best Eskort`,
      description: `${il} ${districtName} genelinde teyitli eskort ilanları, VIP vitrin, bağımsız bayanlar, WhatsApp ve Telegram iletişim hatları. ${districtName} eve gelen eskort, otele gelen escort, amatör, türbanlı, tango eskort seçenekleri.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: `${siteUrl}/api/og/site?il=${location.ilSlug}&ilce=${ilceSlug}`,
          width: 1200,
          height: 630,
          alt: `${districtName} Eskort Escort Bayan İlanları 2026 Vip Bağımsız WhatsApp`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${districtName} Eskort İlanları 2026 | ${il} ${districtName} Vip Escort | Best Eskort`,
      description: `${il} ${districtName} genelinde teyitli eskort, vip escort, bağımsız bayan, whatsapp eskort, eve gelen ve otele gelen escort ilanları.`,
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

  const [location, listings, activeBanner] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, ilceSlug, limit: 120 }),
    getActiveBanner('ilan_detay'),
  ]);

  if (!location) {
    notFound();
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;

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
    <div className="flex flex-col gap-6 w-full max-w-full text-left">
      {/* Googlebot Schema.org Structured Data Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8b949e] font-heading">
        <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${location.ilSlug}`} className="hover:text-amber-400 transition-colors capitalize font-bold">
          {location.il}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-black capitalize">{districtName}</span>
      </nav>

      {/* ── 1. HERO BAŞLIK & İSTATİSTİK ──────────────── */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#1c1408] via-[#161b22] to-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-heading text-xs font-bold uppercase tracking-wider bg-[#21262d] px-3 py-1 rounded-full border border-[#30363d]">
            <MapPin className="w-4 h-4" />
            <span>{location.il} / {districtName} Bölgesi • 2026 Güncel</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-heading">
            Teyitli İlçe Vitrini
          </span>
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          {districtName} Eskort & Escort Bayan İlanları 2026 | {location.il} Vip Escort | Bağımsız Eskort | WhatsApp Eskort
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-2xl font-medium">
          {location.il} ili {districtName} ilçesindeki tüm doğrulanmış eskort ve escort bayan profilleri. VIP vitrin, bağımsız bayanlar, {districtName} vip eskort, {districtName} amatör eskort, {districtName} türbanlı eskort, {districtName} tango eskort, {districtName} eve gelen eskort, {districtName} otele gelen escort, doğrudan WhatsApp ve Telegram irtibat hatları. 2026 güncel teyitli {districtName} eskort rehberi.
        </p>

        {/* Diğer İlçeler Hapları */}
        {otherDistricts.length > 0 && (
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar py-1">
            {otherDistricts.map((d: any) => (
              <Link
                key={d.slug}
                href={`/${location.ilSlug}/${d.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs border border-[#363b42] transition-colors shrink-0 shadow-sm"
              >
                {d.ad} Eskort
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 1.5 SPONSORLU VIP BANNER REKLAM ALANI ──────────────── */}
      <div className="w-full px-0">
        <SponsorBannerArea konum="ilan_detay" initialBanner={activeBanner} />
      </div>

      {/* ── 2. İLAN LİSTESİ (3 SÜTUNLU COMPACT GRID) ──────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="font-heading font-bold text-sm text-white">
            {districtName} Güncel Eskort & Escort İlanları 2026 ({listings.length}) | Vip • Bağımsız • WhatsApp
          </h2>
        </div>
        <span className="text-xs text-[#8b949e] font-mono">
          {location.il} / {districtName} Aktif
        </span>
      </div>

      {listings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-bold text-white font-heading">
            {districtName} ({location.il}) bölgesinde henüz eskort / escort ilanı bulunmuyor.
          </p>
          <p className="text-xs text-[#8b949e]">
            İlk {districtName} eskort ilanını siz vererek bu ilçede zirvede yer alabilirsiniz. Vip eskort, bağımsız escort, whatsapp eskort ilanı ekleyin.
          </p>
          <Link
            href="/ilan-ver"
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg transition-all"
          >
            Hemen {districtName} Eskort İlanı Ver
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.map((item: any) => (
            <CompactListingCard key={item._id} listing={item} />
          ))}
        </div>
      )}

      {/* ── 2.5 SPONSORLU NATIVE 4:1 VİTRİN ──────────────── */}
      <AdsterraNativeBanner />

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
  );
}