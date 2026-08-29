import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Sparkles, Building2 } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import FaqAccordion from '@/components/seo/FaqAccordion';
import { generateLocationFaq, generateCombinedSeoGraph, generateLocationGuide } from '@/lib/seoData';

interface Props {
  params: Promise<{ il: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map((loc: any) => ({ il: loc.ilSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il: ilSlug } = await params;
  const siteUrl = getSiteUrl();

  const location = await getLocationBySlug(ilSlug);

  if (!location) {
    return { title: 'Sayfa Bulunamadı | Best Eskort' };
  }

  const canonicalUrl = `${siteUrl}/${location.ilSlug}`;

  return {
    title: `${location.il} Eskort & Escort Bayan İlanları (2026 Teyitli)`,
    description: `${location.il} eskort ve escort bayan ilanları. Doğrulanmış bağımsız eskort profilleri, VIP vitrin, doğrudan WhatsApp numaraları ve güncel ${location.il} eskort rehberi.`,
    keywords: [
      `${location.il} eskort`,
      `${location.il} escort`,
      `${location.il} eskort bayan`,
      `${location.il} escort bayan`,
      `${location.il} eskort ilanları`,
      `${location.il} escort ilanları`,
      `${location.il} bağımsız eskort`,
      `${location.il} vip eskort`,
      `${location.il} vip escort`,
      `${location.il} whatsapp eskort`,
      `${location.il} eve gelen eskort`,
      `${location.il} otele gelen escort`,
      `${location.il} eskort numaraları`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${location.il} Eskort & Escort Bayan İlanları | Best Eskort`,
      description: `${location.il} genelinde teyitli eskort ilanları ve WhatsApp iletişim hatları.`,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: `${siteUrl}/api/og/site`,
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
      images: [`${siteUrl}/api/og/site`],
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { il: ilSlug } = await params;

  const [location, listings] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, limit: 60 }),
  ]);

  if (!location) {
    notFound();
  }

  const siteUrl = getSiteUrl();
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
