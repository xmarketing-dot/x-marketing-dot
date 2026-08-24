import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronRight, Sparkles, ShieldCheck, Tag, Layers, Globe } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings, getAllCategories } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';

interface Props {
  params: Promise<{ il: string; ilce: string }>;
}

export const revalidate = 3600;

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/${location.ilSlug}/${ilceSlug}`;

  return {
    title: `${districtName} Eskort & ${location.il} Bölgesel İlanlar | Best Eskort`,
    description: `${location.il} ili ${districtName} ilçesindeki tüm doğrulanmış güncel eskort ilanları, bağımsız bayanlar ve doğrudan WhatsApp iletişim numaraları.`,
    keywords: [
      `${districtName} eskort`,
      `${districtName} escort`,
      `${districtName} ${location.il} eskort`,
      `${districtName} ${location.il} escort`,
      `${location.il} ${districtName} eskort`,
      `${districtName} eskort ilanları`,
      `${districtName} escort bayan`,
      `${districtName} eskort bayan`,
      `${districtName} bağımsız eskort`,
      `${districtName} vip eskort`,
      `${districtName} vip escort`,
      `${districtName} whatsapp eskort`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${districtName} Eskort & (${location.il}) Bölgesel İlanlar | Best Eskort`,
      description: `${districtName} bölgesindeki tüm doğrulanmış eskort ve hizmet ilanları.`,
      url: canonicalUrl,
    },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { il: ilSlug, ilce: ilceSlug } = await params;
  const [location, listings, categories] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, ilceSlug, limit: 30 }),
    getAllCategories(),
  ]);

  if (!location) {
    notFound();
  }

  const district = location.ilceler.find((d: any) => d.slug === ilceSlug);
  const districtName = district ? district.ad : ilceSlug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Schema.org BreadcrumbList for Googlebot
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Anasayfa',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: location.il,
        item: `${siteUrl}/${location.ilSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: districtName,
        item: `${siteUrl}/${location.ilSlug}/${ilceSlug}`,
      },
    ],
  };

  const otherDistricts = location.ilceler.filter((d: any) => d.slug !== ilceSlug).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 px-4 py-4 pb-12">
      {/* Schema.org BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation for Googlebot Internal Linking */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8b949e] font-heading">
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
          {districtName} ({location.il}) Bölgesel İlanlar & Hizmet Rehberi
        </h1>
        
        <p className="text-xs text-[#8b949e] leading-relaxed">
          {location.il} ili {districtName} ilçesinde hizmet veren doğrulanmış satıcılar, bölgesel ilanlar ve tek tıkla doğrudan WhatsApp iletişim hatları.
        </p>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/${location.ilSlug}/${ilceSlug}/${cat.slug}`}
              className="px-3.5 py-2 rounded-xl bg-[#161b22] text-[#8b949e] hover:text-white hover:border-amber-400 font-extrabold text-xs whitespace-nowrap border border-[#30363d] transition-all font-heading"
            >
              {cat.ad}
            </Link>
          ))}
        </div>
      )}

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
                {districtName} bölgesindeki binlerce müşteriye ulaşmak için ilk ilanı siz oluşturun!
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

      {/* RICH LOCAL SEO TEXT CONTENT (Prevents Google Thin Content Penalty) */}
      <div className="mt-4 p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
        <h3 className="font-black text-sm text-white font-heading flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>{districtName} Bölgesel Pazarlama Hakkında</span>
        </h3>
        
        <p className="text-xs text-[#8b949e] leading-relaxed font-medium">
          Best Eskort platformu; {location.il} iline bağlı {districtName} ilçesinde en yüksek Google arama görünürlüğünü sağlar. {districtName} genelindeki güncel bölgesel fırsatlar, ilanlar ve temsilci iletişim hatları 7/24 kesintisiz olarak yayınlanır.
        </p>

        {/* Neighboring Districts Internal Linking Matrix for Googlebot */}
        {otherDistricts.length > 0 && (
          <div className="pt-3 border-t border-[#30363d] flex flex-col gap-2">
            <span className="text-[11px] font-extrabold text-white font-heading">
              {location.il} İlinin Diğer İlgili İlçeleri:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {otherDistricts.map((d: any) => (
                <Link
                  key={d.slug}
                  href={`/${location.ilSlug}/${d.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold border border-[#363b42] transition-colors"
                >
                  {d.ad} İlanları
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
