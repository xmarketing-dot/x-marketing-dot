import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Tag, Sparkles, ShieldCheck, Globe } from 'lucide-react';
import { getLocationBySlug, getCategoryBySlug, getListings, getAllLocations, getAllCategories } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';

interface Props {
  params: Promise<{ il: string; ilce: string; kategori: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const [locations, categories] = await Promise.all([
    getAllLocations(),
    getAllCategories(),
  ]);

  const params: { il: string; ilce: string; kategori: string }[] = [];

  for (const loc of locations) {
    for (const ilce of loc.ilceler) {
      for (const cat of categories) {
        params.push({ il: loc.ilSlug, ilce: ilce.slug, kategori: cat.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il: ilSlug, ilce: ilceSlug, kategori: kategoriSlug } = await params;
  const [location, category] = await Promise.all([
    getLocationBySlug(ilSlug),
    getCategoryBySlug(kategoriSlug),
  ]);

  if (!location || !category) {
    return { title: 'Sayfa Bulunamadı | Best Eskort' };
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://` : 'http://localhost:3000');
  const canonicalUrl = `${siteUrl}/${location.ilSlug}/${ilceSlug}/${kategoriSlug}`;

  return {
    title: `${districtName} ${category.ad} Eskort İlanları | ${location.il} | Best Eskort`,
    description: `${location.il} ili ${districtName} ilçesinde ${category.ad} kategorisindeki tüm doğrulanmış güncel eskort ilanları. WhatsApp ile tek tıkla iletişim.`,
    keywords: [
      `${districtName} ${category.ad} eskort`,
      `${districtName} ${category.ad}`,
      `${location.il} ${districtName} ${category.ad}`,
      `${districtName} eskort ${category.ad}`,
      `${location.il} ${category.ad} eskort`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${districtName} ${category.ad} Eskort İlanları | Best Eskort`,
      description: `${location.il} ili ${districtName} ilçesinde ${category.ad} kategorisindeki eskort ilanları.`,
      url: canonicalUrl,
      locale: 'tr_TR',
      siteName: 'Best Eskort',
    },
  };
}

export default async function CategoryDistrictPage({ params }: Props) {
  const { il: ilSlug, ilce: ilceSlug, kategori: kategoriSlug } = await params;
  const [location, category, listings] = await Promise.all([
    getLocationBySlug(ilSlug),
    getCategoryBySlug(kategoriSlug),
    getListings({ ilSlug, ilceSlug, kategoriSlug, limit: 30 }),
  ]);

  if (!location || !category) {
    notFound();
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://` : 'http://localhost:3000');

  // Schema.org BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: location.il, item: `${siteUrl}/${location.ilSlug}` },
      { '@type': 'ListItem', position: 3, name: districtName, item: `${siteUrl}/${location.ilSlug}/${ilceSlug}` },
      { '@type': 'ListItem', position: 4, name: category.ad, item: `${siteUrl}/${location.ilSlug}/${ilceSlug}/${kategoriSlug}` },
    ],
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-4 pb-12">
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8b949e] font-heading flex-wrap" aria-label="Sayfa yolu">
        <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${location.ilSlug}`} className="hover:text-amber-400 transition-colors capitalize font-bold">
          {location.il}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${location.ilSlug}/${ilceSlug}`} className="hover:text-amber-400 transition-colors capitalize font-bold">
          {districtName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-black capitalize">{category.ad}</span>
      </nav>

      {/* Hero */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs font-heading bg-[#21262d] px-3 py-1 rounded-full border border-[#30363d]">
            <Tag className="w-3.5 h-3.5" />
            <span>{location.il} / {districtName} / {category.ad}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-heading">
            Doğrulanmış Bölge
          </span>
        </div>

        <h1 className="font-black text-2xl text-white font-heading tracking-tight">
          {districtName} {category.ad} Eskort İlanları
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          {location.il} ili {districtName} ilçesinde {category.ad} kategorisinde hizmet veren doğrulanmış eskortlar ve doğrudan WhatsApp iletişim hatları.
        </p>
      </div>

      {/* Listings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-base text-white font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{districtName} {category.ad} İlanları</span>
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
                {districtName} {category.ad} Kategorisinde İlan Bulunmuyor
              </h3>
              <p className="text-xs text-[#8b949e] max-w-xs">
                Bu kategoride ilk ilanı yayınlayarak rakiplerinizin önüne geçin!
              </p>
            </div>
            <Link
              href="/ilan-ver"
              className="mt-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              {category.ad} İlanı Ver
            </Link>
          </div>
        )}
      </div>

      {/* SEO Rich Text Box */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl text-xs text-[#8b949e] leading-relaxed">
        <h3 className="font-black text-sm text-white font-heading flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>{districtName} {category.ad} Eskort Rehberi</span>
        </h3>
        <p>
          Best Eskort; {location.il} iline bağlı {districtName} ilçesinde {category.ad} kategorisindeki doğrulanmış tüm eskort ilanlarını tek platformda sunar. 7/24 kesintisiz yayın, anlık WhatsApp iletişim ve güvenli ilan altyapısı ile hizmetinizdeyiz.
        </p>
        <div className="pt-3 border-t border-[#30363d] flex flex-wrap gap-2">
          <Link href={`/${location.ilSlug}/${ilceSlug}`} className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold border border-[#363b42] transition-colors">
            {districtName} Tüm İlanlar
          </Link>
          <Link href={`/${location.ilSlug}`} className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold border border-[#363b42] transition-colors">
            {location.il} İl Portalı
          </Link>
        </div>
      </div>
    </div>
  );
}
