import React from 'react';
import { getSiteUrl, getRequestSiteUrl, getCanonicalUrlForLocation } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Sparkles, ShieldCheck, Globe, Building2 } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
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
  const location = await getLocationBySlug(ilSlug);

  if (!location) {
    return { title: 'İlçe Bulunamadı | Best Eskort' };
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;

  const siteUrl = await getRequestSiteUrl();
  const canonicalUrl = getCanonicalUrlForLocation(siteUrl, location.ilSlug, ilceSlug);

  return {
    title: `${districtName} Escort Eskort Bayan İlanları (2026 Teyitli) | ${location.il} Vip Escort`,
    description: `${location.il} ${districtName} eskort ve escort bayan profilleri. WhatsApp numaraları, doğrulanmış VIP fotoğraflar ve 7/24 güncel ${districtName} eskort ilanları.`,
    keywords: [
      `${districtName} eskort`,
      `${districtName} escort`,
      `${districtName} eskort bayan`,
      `${districtName} escort bayan`,
      `${districtName} ${location.il} eskort`,
      `${districtName} ${location.il} escort`,
      `${location.il} ${districtName} eskort`,
      `${districtName} eskort ilanları`,
      `${districtName} escort ilanları`,
      `${districtName} bağımsız eskort`,
      `${districtName} bağımsız escort`,
      `${districtName} vip eskort`,
      `${districtName} vip escort`,
      `${districtName} whatsapp eskort`,
      `${districtName} telegram eskort`,
      `${districtName} amatör eskort`,
      `${districtName} türbanlı eskort`,
      `${districtName} tango eskort`,
      `${districtName} eve gelen eskort`,
      `${districtName} otele gelen escort`,
      `${districtName} eskort numaraları`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${districtName} Escort Eskort Bayan İlanları | Best Eskort`,
      description: `${districtName} genelinde teyitli eskort ilanları ve WhatsApp iletişim hatları.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: `${siteUrl}/api/og/site?il=${location.ilSlug}&ilce=${ilceSlug}`,
          width: 1200,
          height: 630,
          alt: `${districtName} Eskort`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${districtName} Eskort & Escort İlanları | Best Eskort`,
      description: `${districtName} bölgesindeki tüm doğrulanmış eskort bayan ilanları.`,
      images: [`${siteUrl}/api/og/site?il=${location.ilSlug}&ilce=${ilceSlug}`],
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
  const pageName = `${districtName} Eskort & Escort Bayan İlanları`;
  const pageDescription = `${location.il} ${districtName} eskort ve escort bayan profilleri, doğrulanmış VIP fotoğraflar ve doğrudan WhatsApp iletişim hatları.`;

  // 1. Dynamic FAQ Items (Deterministic Seed-based for uniqueness)
  const faqItems = generateLocationFaq(location.il, districtName);

  // 2. Rich Local SEO Article Guide (E-E-A-T & Anti-Thin-Content)
  const guide = generateLocationGuide(location.il, districtName);

  // 3. Combined Google Schema Graph (Breadcrumbs + FAQ + ⭐⭐⭐⭐⭐ AggregateRating Stars)
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

  // Neighboring districts (excluding current)
  const otherDistricts = location.ilceler.filter((d: any) => d.slug !== ilceSlug).slice(0, 10);

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-12 text-left">
      {/* Schema.org Structured Data Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
      />

      {/* Breadcrumb Navigation for Googlebot Internal Linking */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#8b949e] font-heading">
        <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${location.ilSlug}`} className="hover:text-amber-400 transition-colors capitalize font-bold">
          {location.il}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-black capitalize">{districtName}</span>
      </nav>

      {/* District Header Card */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs font-heading bg-[#21262d] px-3 py-1 rounded-full border border-[#30363d]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location.il} / {districtName} Bölgesi</span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-heading">
            Doğrulanmış Bölge
          </span>
        </div>

        <h1 className="font-black text-2xl text-white font-heading tracking-tight">
          {districtName} Eskort &amp; Escort İlanları
        </h1>

        <p className="text-xs text-[#8b949e] leading-relaxed max-w-xl font-medium">
          {location.il} ili {districtName} ilçesindeki tüm doğrulanmış eskort ve escort bayan profilleri. Bağımsız ilanlar, VIP vitrin ve doğrudan WhatsApp iletişim hatları.
        </p>
      </div>

      {/* ── SPONSORLU VIP BANNER REKLAM ALANI ──────────────── */}
      <div className="w-full -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full">
        <SponsorBannerArea konum="ilan_detay" initialBanner={activeBanner} />
      </div>

      {/* Listings Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base text-white font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{districtName} Güncel İlan Listesi</span>
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-[#161b22] text-amber-400 text-xs font-black border border-[#30363d]">
            {listings.length} İlan
          </span>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {listings.map((listing: any) => (
              <CompactListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center gap-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#21262d] text-amber-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-black text-sm text-white font-heading">
                {districtName} ({location.il}) Bölgesinde İlan Bulunmuyor
              </h3>
              <p className="text-xs text-[#8b949e] max-w-xs">
                {districtName} bölgesindeki müşterilere ulaşmak için ilk ilanı hemen oluşturun!
              </p>
            </div>
            <Link
              href="/ilan-ver"
              className="mt-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              {districtName} İçin İlan Ver
            </Link>
          </div>
        )}
      </div>

      {/* ── GOOGLE RICH SNIPPET FAQ ACCORDION ──────────────── */}
      <FaqAccordion
        title={`${districtName} Eskort Rehberi — Sıkça Sorulan Sorular`}
        items={faqItems}
      />

      {/* ── RICH LOCAL SEO CONTENT & NEIGHBORING DISTRICTS ──────────────── */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
        <h2 className="font-black text-sm text-white font-heading flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>{guide.title}</span>
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

        {/* Neighboring Districts Internal Linking Matrix for Googlebot & YandexBot */}
        {otherDistricts.length > 0 && (
          <div className="pt-3 border-t border-[#30363d] flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-white font-heading flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              {location.il} İlinin Popüler İlçeleri &amp; Eskort Bölgeleri:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {location.ilceler.filter((d: any) => d.slug !== ilceSlug).map((d: any) => (
                <Link
                  key={d.slug}
                  href={`/${location.ilSlug}/${d.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold border border-[#363b42] transition-all text-[11px]"
                >
                  {d.ad} Eskort
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
