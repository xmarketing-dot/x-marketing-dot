import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Crown, Star, Award, Medal, Sparkles, ChevronRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { getListings, getAllLocations } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const TIER_META: Record<string, { title: string; subtitle: string; desc: string; icon: any; badgeBg: string; color: string; border: string }> = {
  ultravip: {
    title: 'Ultra VIP Eskort İlanları',
    subtitle: 'Türkiye Geneli En Popüler & En Üst Sıra İlanlar',
    desc: 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış Ultra VIP eskort ilanları. Anasayfada ve aramalarda en üst sırada yer alan seçkin profiller.',
    icon: Crown,
    badgeBg: 'bg-amber-500 text-slate-950',
    color: 'text-amber-400',
    border: 'border-amber-500/60',
  },
  vip: {
    title: 'VIP Eskort İlanları',
    subtitle: 'Öne Çıkan Seçkin Bölgesel İlanlar',
    desc: 'VIP vitrin kademesindeki tüm bağımsız eskort ve bayan ilanları. İl ve ilçe kategorilerinde öne çıkan doğrulanmış profiller.',
    icon: Star,
    badgeBg: 'bg-purple-600 text-white',
    color: 'text-purple-300',
    border: 'border-purple-500/50',
  },
  gold: {
    title: 'Gold Vitrin Eskort İlanları',
    subtitle: 'Popüler & Yüksek Dönüşümlü İlanlar',
    desc: 'Gold vitrin kategorisinde yer alan güncel ve teyitli eskort ilanları rehberi. WhatsApp ve telefon hatlarıyla anında iletişim.',
    icon: Award,
    badgeBg: 'bg-amber-600 text-white',
    color: 'text-amber-300',
    border: 'border-amber-600/50',
  },
  silver: {
    title: 'Silver Standart Eskort İlanları',
    subtitle: 'Güncel Doğrulanmış Üye İlanları',
    desc: 'Türkiye genelindeki standart liste ve güncel eskort ilanları. Bölgesel aramalar ve doğrudan iletişim.',
    icon: Medal,
    badgeBg: 'bg-slate-700 text-slate-200',
    color: 'text-slate-300',
    border: 'border-slate-600/50',
  },
};

export async function generateStaticParams() {
  return [
    { slug: 'ultravip' },
    { slug: 'vip' },
    { slug: 'gold' },
    { slug: 'silver' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tierInfo = TIER_META[slug];

  if (!tierInfo) {
    return { title: 'Kategori Bulunamadı | Best Eskort' };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/kategori/${slug}`;

  return {
    title: `${tierInfo.title} — Türkiye Geneli Vitrin | Best Eskort`,
    description: tierInfo.desc,
    keywords: [
      `${slug} eskort`,
      `${slug} eskort ilanları`,
      'türkiye eskort ilanları',
      'vip eskort',
      'ultra vip eskort',
      'gold eskort',
      'doğrulanmış eskort bayan',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${tierInfo.title} | Best Eskort`,
      description: tierInfo.desc,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const tierInfo = TIER_META[slug];

  if (!tierInfo) {
    notFound();
  }

  const [allListings, locations] = await Promise.all([
    getListings({ limit: 100 }),
    getAllLocations(),
  ]);

  // Filter listings by this specific tier
  const categoryListings = allListings.filter((l: any) => {
    if (slug === 'silver') return l.rozet === 'silver' || !l.rozet || l.rozet === 'standart';
    return l.rozet === slug;
  });

  const Icon = tierInfo.icon;
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: tierInfo.title,
    description: tierInfo.desc,
    url: `${siteUrl}/kategori/${slug}`,
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-4 pb-16 w-full max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8b949e] pt-2 font-heading" aria-label="Sayfa yolu">
        <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3 h-3 text-[#484f58]" />
        <span className="text-white font-bold">{tierInfo.title}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className={`p-6 sm:p-8 rounded-[32px] bg-[#161b22] border ${tierInfo.border} shadow-2xl flex flex-col gap-4 relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-2xl ${tierInfo.badgeBg} shadow-lg flex items-center gap-2`}>
            <Icon className="w-6 h-6 fill-current" />
            <span className="font-black text-xs uppercase tracking-wider font-heading">
              {slug.toUpperCase()} VİTRİN
            </span>
          </div>

          <span className="px-3 py-1.5 rounded-full bg-[#0d1117] text-amber-400 font-mono font-black text-xs border border-[#30363d] shadow-md">
            {categoryListings.length} Aktif İlan
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-black text-2xl sm:text-3xl text-white font-heading tracking-tight">
            {tierInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed font-medium">
            {tierInfo.desc}
          </p>
        </div>
      </div>

      {/* 3-Column Listings Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
              {tierInfo.title} Listesi
            </h2>
          </div>
          <span className="text-xs text-[#8b949e] font-bold">
            {categoryListings.length} İlan Bulundu
          </span>
        </div>

        {categoryListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryListings.map((listing: any) => (
              <CompactListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center gap-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#21262d] text-amber-400 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-black text-base text-white font-heading">
                Bu Vitrinde Henüz İlan Bulunmuyor
              </h3>
              <p className="text-xs text-[#8b949e] max-w-sm">
                Bu kademede yer alarak Türkiye genelinde en üst sırada listelenmek için hemen ilanınızı oluşturun!
              </p>
            </div>
            <Link
              href="/ilan-ver"
              className="mt-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Hemen Bu Vitrine İlan Ver
            </Link>
          </div>
        )}
      </div>

      {/* SEO Güven Bilgisi */}
      <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-4 shadow-xl mt-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-sm text-white font-heading">%100 Teyitli {tierInfo.title}</h3>
          <p className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">
            Bu kategorideki tüm profillerin fotoğrafları ve telefon numaraları onaylanmıştır. Doğrudan WhatsApp veya arama ile hızlıca iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
