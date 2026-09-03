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
    <div className="flex flex-col gap-6 px-4 py-4 pb-16 w-full max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8b949e] pt-2 font-heading" aria-label="Sayfa yolu">
        <Link href="/" className="hover:text-amber-400 transition-colors">Anasayfa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#484f58]" />
        <span className="text-white font-bold">{tierInfo.title}</span>
      </nav>

      {/* Hero Header Banner */}
      <div className={`p-6 sm:p-8 rounded-[32px] bg-[#161b22] border ${tierInfo.border} shadow-2xl flex flex-col gap-4 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider font-heading">
            <span className={`p-2 rounded-2xl ${tierInfo.badgeBg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 fill-current" />
            </span>
            <span className={tierInfo.color}>{tierInfo.subtitle}</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#21262d] text-white text-xs font-black border border-white/10 font-heading">
            {categoryListings.length} Aktif İlan
          </span>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            {tierInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-2xl font-medium">
            {tierInfo.desc}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center gap-4 text-[11px] text-[#8b949e] font-semibold flex-wrap">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            %100 Teyitli Fotoğraflar
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            Doğrudan WhatsApp İletişimi
          </span>
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

      {/* SEO Regional Internal Linking Footer */}
      <div className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-lg text-xs text-[#8b949e]">
        <h3 className="font-bold text-sm text-white font-heading flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Şehirlere Göre {tierInfo.title}</span>
        </h3>
        <p className="leading-relaxed">
          Türkiye geneli tüm büyükşehirler ve ilçelerdeki güncel {tierInfo.title.toLowerCase()} ve escort bayan listeleri.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
          {locations.slice(0, 18).map((loc: any) => (
            <Link
              key={loc.ilSlug}
              href={`/${loc.ilSlug}`}
              className="px-2.5 py-1 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-amber-400 hover:bg-[#30363d] font-bold text-[11px] border border-[#30363d] transition-colors"
            >
              {loc.il} Eskort
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
