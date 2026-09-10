import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Crown, Award, Medal, Sparkles, ChevronRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { getListings, getAllLocations, getActiveBanner, getHomepageConfig } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import HeroSlider from '@/components/home/HeroSlider';
import { getTopShowcaseSlides } from '@/lib/showcaseHelper';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400; // 24 saat önbellek (Vercel ISR kota patlamasını önler)

const TIER_META: Record<string, { title: string; subtitle: string; desc: string; icon: any; badgeBg: string; color: string; border: string; limit?: number }> = {
  vip: {
    title: 'VIP KATEGORİ',
    subtitle: '50 İlan Sınırı • En Yüksek Öncelikli VIP İlanlar',
    desc: 'Türkiye genelinde 81 il ve tüm ilçelerde %100 doğrulanmış VIP eskort profilleri.',
    icon: Crown,
    badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950',
    color: 'text-amber-400',
    border: 'border-amber-500/70',
    limit: 50,
  },
  gold: {
    title: 'GOLD KATEGORİ',
    subtitle: '100 İlan Sınırı • Popüler Gold Kategori İlanları',
    desc: 'Maksimum 100 kontenjanla sınırlandırılmış güncel ve teyitli Gold kategori ilanları.',
    icon: Award,
    badgeBg: 'bg-amber-600 text-white',
    color: 'text-amber-300',
    border: 'border-amber-600/50',
    limit: 100,
  },
  silver: {
    title: 'SILVER KATEGORİ',
    subtitle: '200 İlan Sınırı • Standart Silver Kategori İlanları',
    desc: 'Maksimum 200 kontenjanla sınırlandırılmış güncel Silver kategori ilanları.',
    icon: Medal,
    badgeBg: 'bg-slate-700 text-slate-200',
    color: 'text-slate-300',
    border: 'border-slate-600/50',
    limit: 200,
  },
  turbanli: {
    title: 'TÜRBANLI KATEGORİ',
    subtitle: 'Doğrulanmış Türbanlı Modeller',
    desc: 'Türkiye genelinde hizmet veren doğrulanmış türbanlı eskort profilleri.',
    icon: Sparkles,
    badgeBg: 'bg-rose-600 text-white',
    color: 'text-rose-400',
    border: 'border-rose-500/50',
  },
  amator: {
    title: 'AMATÖR KATEGORİ',
    subtitle: 'Bireysel & Bağımsız Modeller',
    desc: 'Kendi evinde ve otelde hizmet veren bağımsız gerçek amatör profiller.',
    icon: ShieldCheck,
    badgeBg: 'bg-emerald-600 text-white',
    color: 'text-emerald-400',
    border: 'border-emerald-500/50',
  },
  tango: {
    title: 'TANGO KATEGORİ',
    subtitle: 'Tango Yayıncıları & Modeller',
    desc: 'Tango canlı yayın modelleri ve özel davet eşlik profilleri.',
    icon: Globe,
    badgeBg: 'bg-purple-600 text-white',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = slug === 'ultravip' ? 'vip' : slug;
  const tierInfo = TIER_META[targetSlug];

  if (!tierInfo) {
    return { title: 'Kategori Bulunamadı | Best Eskort' };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/kategori/${targetSlug}`;
  const ogImageUrl = `${siteUrl}/api/og/site`;

  return {
    title: `${tierInfo.title} & Escort Vitrini | Best Eskort`,
    description: tierInfo.desc,
    keywords: [
      `${targetSlug} eskort`,
      `${targetSlug} escort`,
      `${targetSlug} eskort ilanları`,
      `${targetSlug} escort ilanları`,
      'türkiye eskort ilanları',
      'türkiye escort ilanları',
      'vip eskort',
      'vip escort',
      'gold eskort',
      'gold escort',
      'doğrulanmış eskort bayan',
      'doğrulanmış escort bayan',
      'whatsapp eskort',
      'whatsapp escort',
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${tierInfo.title} | Best Eskort`,
      description: tierInfo.desc,
      url: canonicalUrl,
      type: 'website',
      locale: 'tr_TR',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: tierInfo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tierInfo.title} | Best Eskort`,
      description: tierInfo.desc,
      images: [ogImageUrl],
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  // Gracefully redirect legacy /kategori/ultravip to /kategori/vip
  if (slug === 'ultravip') {
    redirect('/kategori/vip');
  }

  const tierInfo = TIER_META[slug];

  if (!tierInfo) {
    notFound();
  }

  const [allListings, locations, activeBanner, homepageConfig] = await Promise.all([
    getListings({ limit: 150 }),
    getAllLocations(),
    getActiveBanner('ilan_detay'),
    getHomepageConfig(),
  ]);

  // Filter listings by this specific tier (combining ultravip into vip)
  const categoryListings = allListings.filter((l: any) => {
    if (slug === 'vip') return l.rozet === 'vip' || l.rozet === 'ultravip';
    if (slug === 'silver') return l.rozet === 'silver' || !l.rozet || l.rozet === 'standart';
    return l.rozet === slug;
  });

  // Bu kategorinin en çok görüntülenen 1-2 vitrin ilanı
  const showcaseSlides = getTopShowcaseSlides(categoryListings, 2);

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
    <div className="flex flex-col gap-3 pb-12 w-full max-w-full text-left">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 1. KATEGORİ ÖZEL VİTRİN SLIDER (Edge-to-Edge Sıfır Kenar) ──────────────── */}
      <section className="w-full">
        <HeroSlider 
          slides={showcaseSlides}
          promoSlides={homepageConfig?.bosVitrinSliderlar}
          banner={activeBanner}
        />
      </section>

      {/* ── 2. SPONSORLU VIP BANNER REKLAM ALANI (Reklam Üstte) ──────────────── */}
      <div className="w-full px-0">
        <SponsorBannerArea konum="ilan_detay" initialBanner={activeBanner} />
      </div>

      {/* ── 3. PREMİUM LÜKS VİTRİN KARTI ──────────────── */}
      <div className="w-full px-2 sm:px-4 max-w-4xl mx-auto">
        <div className={`relative w-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 shadow-2xl overflow-hidden ${
          slug === 'vip'
            ? 'bg-gradient-to-br from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0d1117] shadow-amber-500/25'
            : slug === 'gold'
            ? 'bg-gradient-to-br from-[#2b210a] via-[#1a1406] to-[#0f0b02] text-amber-200 border-2 border-amber-500/50 shadow-amber-950/40'
            : slug === 'silver'
            ? 'bg-gradient-to-br from-[#222a36] via-[#161c24] to-[#0d1218] text-slate-100 border-2 border-slate-400/40 shadow-slate-950/40'
            : 'bg-gradient-to-br from-[#1c160c] via-[#161b22] to-[#12161c] text-white border-2 border-amber-500/40'
        }`}>
          {/* VIP İçin Özel Arka Plan Parlama Efekti */}
          {slug === 'vip' && (
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2">
            {/* İkon (Arka plansız, doğrudan solda) + Başlık + İlan Sayacı */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5] shrink-0 ${
                slug === 'vip' ? 'text-slate-950' : slug === 'gold' ? 'text-amber-400' : 'text-slate-200'
              }`} />

              <h1 className={`font-heading font-black text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none ${
                slug === 'vip' ? 'text-slate-950 drop-shadow-sm' : slug === 'gold' ? 'text-amber-300' : 'text-white'
              }`}>
                {tierInfo.title}
              </h1>

              {/* BAŞLIĞIN YANINDAKİ İLAN SAYACI */}
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-mono font-black shadow-md tracking-wider flex items-center gap-1.5 shrink-0 ${
                slug === 'vip'
                  ? 'bg-slate-950 text-amber-300 border border-slate-900'
                  : slug === 'gold'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-white/10 text-slate-200 border border-white/15'
              }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{categoryListings.length}{tierInfo.limit ? ` / ${tierInfo.limit}` : ''} İLAN</span>
              </span>
            </div>

            {/* Açıklama Alt Başlık (Ortalı) */}
            <p className={`text-xs sm:text-sm font-semibold max-w-xl text-center leading-relaxed ${
              slug === 'vip' ? 'text-slate-950/85 font-bold' : slug === 'gold' ? 'text-amber-200/80' : 'text-slate-300'
            }`}>
              {tierInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── İÇERİK GÖVDESİ (Padding & Max-Width) ──────────────── */}
      <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-4 w-full max-w-4xl mx-auto">

        {/* ── 4. 3'LÜ YAN YANA İLAN GRID LİSTESİ ──────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-black text-xs uppercase tracking-wider text-white font-heading flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{tierInfo.title} Listesi</span>
            </span>
            <span className="text-xs text-[#8b949e] font-mono">Toplam {categoryListings.length} İlan</span>
          </div>

          {categoryListings.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {categoryListings.map((listing: any) => (
                <CompactListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center gap-3">
              <Icon className="w-10 h-10 text-[#484f58]" />
              <h3 className="font-bold text-sm text-white font-heading">Bu kademede henüz ilan bulunmuyor.</h3>
              <p className="text-xs text-[#8b949e]">İlk ilanı siz ekleyerek bu vitrinde en üst sırada yer alabilirsiniz.</p>
              <Link
                href="/ilan-ver"
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg"
              >
                Hemen İlan Ver
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

