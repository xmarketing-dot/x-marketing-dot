import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Crown, Award, Medal, Sparkles, ChevronRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { getListings, getAllLocations } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400; // 24 saat önbellek (Vercel ISR kota patlamasını önler)

const TIER_META: Record<string, { title: string; subtitle: string; desc: string; icon: any; badgeBg: string; color: string; border: string }> = {
  vip: {
    title: 'VIP Eskort İlanları',
    subtitle: 'Türkiye Geneli En Seçkin & En Üst Sıra VIP Vitrin İlanları',
    desc: 'Türkiye genelinde 81 il ve tüm ilçelerde %100 doğrulanmış VIP eskort ve escort bayan ilanları. Anasayfada ve aramalarda en üst sırada yer alan seçkin bağımsız profiller.',
    icon: Crown,
    badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950',
    color: 'text-amber-400',
    border: 'border-amber-500/70',
  },
  gold: {
    title: 'Gold Vitrin Eskort İlanları',
    subtitle: 'Popüler & Yüksek Dönüşümlü İlanlar',
    desc: 'Gold vitrin kategorisinde yer alan güncel ve teyitli eskort ve escort ilanları rehberi. WhatsApp ve telefon hatlarıyla anında doğrudan iletişim.',
    icon: Award,
    badgeBg: 'bg-amber-600 text-white',
    color: 'text-amber-300',
    border: 'border-amber-600/50',
  },
  silver: {
    title: 'Silver Standart Eskort İlanları',
    subtitle: 'Güncel Doğrulanmış Üye İlanları',
    desc: 'Türkiye genelindeki standart liste ve güncel eskort / escort ilanları. Bölgesel aramalar ve doğrudan WhatsApp ile iletişim.',
    icon: Medal,
    badgeBg: 'bg-slate-700 text-slate-200',
    color: 'text-slate-300',
    border: 'border-slate-600/50',
  },
  turbanli: {
    title: 'Türbanlı Eskort Bayan İlanları',
    subtitle: 'Doğrulanmış ve Teyitli Türbanlı Modeller',
    desc: 'Türkiye genelinde 81 ilde hizmet veren bağımsız ve doğrulanmış türbanlı eskort bayan ilanları. WhatsApp ve doğrudan iletişim numaraları.',
    icon: Sparkles,
    badgeBg: 'bg-rose-600 text-white',
    color: 'text-rose-400',
    border: 'border-rose-500/50',
  },
  amator: {
    title: 'Amatör & Bağımsız Eskort İlanları',
    subtitle: 'Bireysel ve Ajanssız Gerçek İlanlar',
    desc: 'Kendi evinde, otelde ve rezidansta hizmet veren bağımsız amatör Türk eskort bayan profilleri. Güvenilir ve aracısız iletişim.',
    icon: ShieldCheck,
    badgeBg: 'bg-emerald-600 text-white',
    color: 'text-emerald-400',
    border: 'border-emerald-500/50',
  },
  tango: {
    title: 'Tango & Canlı Yayın Eskort İlanları',
    subtitle: 'Tango Yayıncıları & Özel Eşlik Modelleri',
    desc: 'Tango canlı yayın modelleri ve özel davet eşlik bayanları. WhatsApp ile doğrudan randevu ve görüşme detayları.',
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

  const [allListings, locations] = await Promise.all([
    getListings({ limit: 120 }),
    getAllLocations(),
  ]);

  // Filter listings by this specific tier (combining ultravip into vip)
  const categoryListings = allListings.filter((l: any) => {
    if (slug === 'vip') return l.rozet === 'vip' || l.rozet === 'ultravip';
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
    <div className="flex flex-col gap-4 px-4 py-2 pb-16 w-full max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Header Banner (Entegre, Dengeli & Lüks Kartvizit Başlık) */}
      <div className={`relative p-3 sm:p-4 rounded-2xl ${
        slug === 'vip'
          ? 'bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 shadow-xl shadow-amber-500/30 border border-amber-300'
          : slug === 'gold'
          ? 'bg-gradient-to-r from-[#2b210a] via-[#1a1406] to-[#0f0b02] text-amber-200 shadow-lg shadow-black/80 border border-amber-500/60'
          : 'bg-gradient-to-r from-[#222a36] via-[#161c24] to-[#0d1218] text-slate-100 shadow-lg shadow-black/80 border border-slate-400/50'
      } overflow-hidden`}>
        {/* İÇ ÇİFT ÇERÇEVE */}
        <div className={`rounded-xl border-2 ${
          slug === 'vip'
            ? 'border-slate-950/60'
            : slug === 'gold'
            ? 'border-amber-400/50'
            : 'border-slate-300/40'
        } p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden text-left`}>
          
          {/* ÜST SATIR: İkon + Başlık + Sağda İlan Sayacı (Mobilde de masaüstünde de tek satırda hizalı) */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                slug === 'vip'
                  ? 'bg-slate-950 text-amber-400 border-slate-950 shadow-md'
                  : slug === 'gold'
                  ? 'bg-black/60 text-amber-400 border-amber-400/40 shadow-md'
                  : 'bg-black/60 text-slate-200 border-slate-400/40 shadow-md'
              }`}>
                <span className="text-base sm:text-lg">{slug === 'vip' ? '👑' : slug === 'gold' ? '⭐' : '⚡'}</span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] sm:text-[9px] font-heading font-black tracking-[0.16em] uppercase truncate ${
                    slug === 'vip' ? 'text-slate-950' : slug === 'gold' ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {slug === 'vip' ? 'VIP İLAN' : slug === 'gold' ? 'GOLD İLAN' : 'SILVER İLAN'}
                  </span>
                  <span className="text-[9px] opacity-60">✦</span>
                </div>
                <h1 className={`font-heading font-black text-base sm:text-xl tracking-tight leading-none truncate ${
                  slug === 'vip' ? 'text-slate-950' : slug === 'gold' ? 'text-amber-200' : 'text-white'
                }`}>
                  {tierInfo.title}
                </h1>
              </div>
            </div>

            {/* İlan Sayısı Kapsülü: Üst sağ köşede jilet gibi sabit */}
            <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-black shrink-0 shadow-md ${
              slug === 'vip'
                ? 'bg-slate-950 text-amber-300 border-2 border-slate-950'
                : slug === 'gold'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/10 text-slate-200 border border-white/10'
            }`}>
              {categoryListings.length} AKTİF İLAN
            </span>
          </div>

          {/* ALT SATIR: Açıklama Metni */}
          <p className={`text-xs leading-relaxed font-medium line-clamp-2 pt-1 border-t border-current/10 ${
            slug === 'vip' ? 'text-slate-950/85' : slug === 'gold' ? 'text-amber-300/80' : 'text-[#8b949e]'
          }`}>
            {tierInfo.desc}
          </p>

        </div>
      </div>

      {/* Listings Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-black text-xs uppercase tracking-wider text-white font-heading flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{tierInfo.title} Listesi</span>
          </span>
          <span className="text-xs text-[#8b949e] font-mono">Toplam {categoryListings.length} İlan</span>
        </div>

        {categoryListings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
  );
}
