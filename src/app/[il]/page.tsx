import React from 'react';
import { getSiteUrl, getRequestSiteUrl, getCanonicalUrlForLocation } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Sparkles, Building2 } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import FaqAccordion from '@/components/seo/FaqAccordion';
import { generateLocationFaq, generateCombinedSeoGraph, generateLocationGuide } from '@/lib/seoData';
import { getActiveBanner } from '@/lib/data';

interface Props {
  params: Promise<{ il: string }>;
}

export const revalidate = 86400; // 24 saat önbellek (Vercel ISR kota patlamasını önler)

export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map((loc: any) => ({ il: loc.ilSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il: ilSlug } = await params;
  const siteUrl = await getRequestSiteUrl();

  const location = await getLocationBySlug(ilSlug);

  if (!location) {
    return { title: 'Sayfa Bulunamadı | Best Eskort' };
  }

  const canonicalUrl = getCanonicalUrlForLocation(siteUrl, location.ilSlug);
  const il = location.il;

  return {
    title: `${il} Escort Eskort Bayan İlanları 2026 | ${il} Vip Escort | ${il} Bağımsız Eskort | ${il} WhatsApp Eskort | Best Eskort`,
    description: `${il} eskort ve escort bayan ilanları 2026. Doğrulanmış bağımsız eskort, VIP vitrin, ${il} vip eskort, ${il} amatör eskort, ${il} türbanlı eskort, ${il} tango eskort, ${il} eve gelen eskort, ${il} otele gelen escort, ${il} whatsapp eskort, ${il} telegram eskort, ${il} eskort numaraları, ${il} escort bayan, ${il} eskort bayan ilanları, ${il} lüks eskort, ${il} premium escort, ${il} ucuz eskort, ${il} özel eskort, ${il} masaj eskort, ${il} companion bayan, ${il} call girl, güncel teyitli ${il} eskort rehberi.`,
    keywords: [
      // Ana varyasyonlar
      `${il} eskort`,
      `${il} escort`,
      `${il} eskort bayan`,
      `${il} escort bayan`,
      `${il} eskort ilanları`,
      `${il} escort ilanları`,
      `${il} eskort bayan ilanları`,
      `${il} escort bayan ilanları`,
      `${il} bağımsız eskort`,
      `${il} bağımsız escort`,
      `${il} vip eskort`,
      `${il} vip escort`,
      `${il} vip eskort bayan`,
      `${il} vip escort bayan`,
      `${il} whatsapp eskort`,
      `${il} whatsapp escort`,
      `${il} telegram eskort`,
      `${il} telegram escort`,
      `${il} amatör eskort`,
      `${il} amatör escort`,
      `${il} türbanlı eskort`,
      `${il} türbanlı escort`,
      `${il} tango eskort`,
      `${il} tango escort`,
      `${il} eve gelen eskort`,
      `${il} eve gelen escort`,
      `${il} otele gelen eskort`,
      `${il} otele gelen escort`,
      `${il} eskort numaraları`,
      `${il} escort numaraları`,
      `${il} eskort numarası`,
      `${il} escort numarası`,

      // 2026 + güncel + teyitli
      `${il} eskort 2026`,
      `${il} escort 2026`,
      `${il} eskort ilanları 2026`,
      `${il} escort ilanları 2026`,
      `${il} güncel eskort`,
      `${il} güncel escort`,
      `${il} teyitli eskort`,
      `${il} teyitli escort`,
      `${il} doğrulanmış eskort`,
      `${il} doğrulanmış escort`,
      `${il} gerçek eskort`,
      `${il} gerçek escort`,

      // Lüks / Premium / Ucuz / Özel
      `${il} lüks eskort`,
      `${il} lüks escort`,
      `${il} premium eskort`,
      `${il} premium escort`,
      `${il} ucuz eskort`,
      `${il} ucuz escort`,
      `${il} özel eskort`,
      `${il} özel escort`,
      `${il} elit eskort`,
      `${il} elit escort`,
      `${il} kaliteli eskort`,
      `${il} kaliteli escort`,

      // Masaj / Companion / Call girl
      `${il} masaj eskort`,
      `${il} masaj escort`,
      `${il} companion`,
      `${il} companion bayan`,
      `${il} call girl`,
      `${il} callgirl`,
      `${il} escort girl`,
      `${il} eskort girl`,

      // İlçe ve bölge varyasyonları (genel)
      `${il} merkez eskort`,
      `${il} merkez escort`,
      `${il} ilçe eskort`,
      `${il} ilçe escort`,
      `${il} bölgesel eskort`,
      `${il} bölgesel escort`,

      // İletişim odaklı
      `${il} eskort whatsapp`,
      `${il} escort whatsapp`,
      `${il} eskort telegram`,
      `${il} escort telegram`,
      `${il} eskort telefon`,
      `${il} escort telefon`,
      `${il} eskort iletişim`,
      `${il} escort iletişim`,
      `${il} eskort hattı`,
      `${il} escort hattı`,

      // Hizmet odaklı
      `${il} eve gelen eskort bayan`,
      `${il} otele gelen eskort bayan`,
      `${il} eve gelen escort bayan`,
      `${il} otele gelen escort bayan`,
      `${il} otel eskort`,
      `${il} otel escort`,
      `${il} ev eskort`,
      `${il} ev escort`,
      `${il} buluşma eskort`,
      `${il} buluşma escort`,

      // Popüler aramalar
      `${il} eskort sitesi`,
      `${il} escort sitesi`,
      `${il} eskort rehberi`,
      `${il} escort rehberi`,
      `${il} eskort listesi`,
      `${il} escort listesi`,
      `${il} eskort profil`,
      `${il} escort profil`,
      `${il} eskort ilanı`,
      `${il} escort ilanı`,
      `${il} yeni eskort`,
      `${il} yeni escort`,
      `${il} genç eskort`,
      `${il} genç escort`,
      `${il} olgun eskort`,
      `${il} olgun escort`,
      `${il} yabancı eskort`,
      `${il} yabancı escort`,
      `${il} rus eskort`,
      `${il} rus escort`,
      `${il} ukraynalı eskort`,
      `${il} ukraynalı escort`,

      // Marka + lokasyon
      `best eskort ${il}`,
      `best escort ${il}`,
      `besteskort ${il}`,
      `${il} best eskort`,
      `${il} best escort`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${location.il} Escort Eskort Bayan İlanları | Best Eskort`,
      description: `${location.il} genelinde teyitli eskort ilanları ve WhatsApp iletişim hatları.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: `${siteUrl}/api/og/site?il=${location.ilSlug}`,
          width: 1200,
          height: 630,
          alt: `${location.il} Eskort`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${location.il} Eskort İlanları | Best Eskort`,
      description: `${location.il} genelinde teyitli eskort ilanları.`,
      images: [`${siteUrl}/api/og/site?il=${location.ilSlug}`],
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { il: ilSlug } = await params;

  const [location, listings, activeBanner] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, limit: 120 }),
    getActiveBanner('ilan_detay'),
  ]);

  if (!location) {
    notFound();
  }

  const siteUrl = await getRequestSiteUrl();
  const pageUrl = `${siteUrl}/${location.ilSlug}`;
  const pageName = `${location.il} Eskort & Escort Bayan İlanları`;
  const pageDescription = `${location.il} genelinde teyitli eskort bayan ilanları, bağımsız VIP profiller ve WhatsApp hatları.`;

  // 1. Dynamic FAQ Items (Deterministic Seed-based for uniqueness)
  const faqItems = generateLocationFaq(location.il);

  // 2. Rich Local SEO Article Guide (E-E-A-T & Anti-Thin-Content)
  const guide = generateLocationGuide(location.il);

  // 3. Combined Google Schema Graph (Breadcrumbs + FAQ + ⭐⭐⭐⭐⭐ AggregateRating Stars)
  const seoGraph = generateCombinedSeoGraph({
    pageUrl,
    pageName,
    pageDescription,
    breadcrumbs: [
      { name: 'Anasayfa', url: siteUrl },
      { name: `${location.il} Eskort`, url: pageUrl },
    ],
    faqItems,
    itemCount: listings.length,
    models: listings,
    siteUrl,
    districtName: location.il,
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left">
      {/* Googlebot Schema.org Structured Data Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
      />

      {/* ── 1. HERO BAŞLIK & İSTATİSTİK ──────────────── */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#1c1408] via-[#161b22] to-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-heading text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Bölgesel İlan Rehberi</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          {location.il} Eskort & Escort İlanları
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-2xl font-medium">
          {location.il} ili ve tüm ilçelerindeki doğrulanmış eskort ve escort bayan profilleri. VIP vitrin, bağımsız bayanlar ve doğrudan WhatsApp irtibat hatları.
        </p>

        {/* İlçe Hapları */}
        {location.ilceler && location.ilceler.length > 0 && (
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar py-1">
            {location.ilceler.map((ilce: any) => (
              <Link
                key={ilce.slug}
                href={`/${location.ilSlug}/${ilce.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs border border-[#363b42] transition-colors shrink-0 shadow-sm"
              >
                {ilce.ad}
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
            {location.il} Güncel İlanları ({listings.length})
          </h2>
        </div>
        <span className="text-xs text-[#8b949e] font-mono">
          Aktif Yayınlar
        </span>
      </div>

      {listings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-bold text-white font-heading">
            {location.il} bölgesinde henüz ilan bulunmuyor.
          </p>
          <p className="text-xs text-[#8b949e]">
            İlk ilanı siz vererek bu ilde zirvede yer alabilirsiniz.
          </p>
          <Link
            href="/ilan-ver"
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg transition-all"
          >
            Hemen İlan Ver
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.map((item: any) => (
            <CompactListingCard key={item._id} listing={item} />
          ))}
        </div>
      )}

      {/* ── 3. GOOGLE RICH SNIPPET FAQ ACCORDION ──────────────── */}
      <FaqAccordion
        title={`${location.il} Eskort Rehberi — Sıkça Sorulan Sorular`}
        items={faqItems}
      />

      {/* ── 4. ZENGİN YEREL REHBER METNİ (Google Thin Content Önleyici) ──────────────── */}
      <div className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-4">
        <h2 className="font-black text-sm text-white font-heading">
          {guide.title}
        </h2>
        <div className="flex flex-col gap-2.5 text-xs text-[#8b949e] leading-relaxed">
          {guide.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#21262d]">
          {guide.bulletPoints.map((bp, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{bp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. TÜM İLÇELER İÇ LİNK AĞI (Googlebot Internal Linking) ──────────────── */}
      {location.ilceler && location.ilceler.length > 0 && (
        <div className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-3">
          <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{location.il} İlçelerine Göre Eskort İlanları</span>
          </h3>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Aşağıdaki bağlantılardan {location.il} iline bağlı tüm ilçelerin özel eskort ve escort bayan profillerini inceleyebilirsiniz:
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            {location.ilceler.map((ilce: any) => (
              <Link
                key={ilce.slug}
                href={`/${location.ilSlug}/${ilce.slug}`}
                className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold border border-[#363b42] transition-colors"
              >
                {location.il} {ilce.ad} Eskort
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
