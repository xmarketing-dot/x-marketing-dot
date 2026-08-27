import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Award, 
  Star, 
  Medal, 
  ChevronRight, 
  Flame, 
  Globe,
  BadgeCheck,
  Heart,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { getHomepageConfig, getAllLocations, getListings } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import CompactListingCard from '@/components/common/CompactListingCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const ogImageUrl = `${siteUrl}/api/og/site`;

  return {
    title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu | 81 İl',
    description: '81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları. Bağımsız eskortlar, VIP vitrin ilanları ve doğrudan WhatsApp iletişim hatları.',
    keywords: [
      'eskort ilanları', 'escort ilanları', 'eskort bayan', 'escort bayan',
      'bağımsız eskort türkiye', 'vip eskort ilanları', 'vip escort',
      'istanbul eskort', 'istanbul escort', 'ankara eskort', 'ankara escort',
      'izmir eskort', 'antalya eskort', 'bursa eskort', 'adana eskort',
      'whatsapp eskort', 'eskort numaraları',
    ],
    metadataBase: new URL(siteUrl),
    alternates: { canonical: siteUrl },
    openGraph: {
      title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
      description: '81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları ve doğrudan WhatsApp iletişim hatları.',
      url: siteUrl,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Best Eskort Vitrin',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
      description: '81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları.',
      images: [ogImageUrl],
    },
  };
}

// Tier ranking priority score
const TIER_ORDER: Record<string, number> = {
  vip: 1,
  ultravip: 1,
  gold: 2,
  silver: 3,
  standart: 4,
};

export default async function HomePage() {
  await connectToDatabase();

  const [locations, rawListings, homepageConfig] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 60 }),
    getHomepageConfig(),
  ]);

  // Sort all listings strictly by Tier Priority (VIP -> Gold -> Silver) and then by Date
  const allSortedListings = [...rawListings].sort((a: any, b: any) => {
    const orderA = TIER_ORDER[a.rozet || 'silver'] || 4;
    const orderB = TIER_ORDER[b.rozet || 'silver'] || 4;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Group listings by package tier
  const vipListings = allSortedListings.filter((l: any) => l.rozet === 'vip' || l.rozet === 'ultravip');
  const goldListings = allSortedListings.filter((l: any) => l.rozet === 'gold');
  const silverListings = allSortedListings.filter((l: any) => l.rozet === 'silver' || !l.rozet || l.rozet === 'standart');

  // Fallback if none in specific tier, pick top available
  const displayVip = vipListings.length > 0 ? vipListings : allSortedListings.slice(0, 4);

  // Dynamic Selected Showcase from Admin Homepage Config
  const rawSliderIds = homepageConfig?.sliderIlanIds || homepageConfig?.selectedShowcaseIds || [];
  const selectedShowcaseIds: string[] = rawSliderIds.map((id: any) => (id?.toString ? id.toString() : String(id)));

  let dynamicShowcaseListings: any[] = [];
  if (selectedShowcaseIds.length > 0) {
    const missingIds = selectedShowcaseIds.filter((id) => !allSortedListings.some((l: any) => l._id.toString() === id));
    let extraListings: any[] = [];
    if (missingIds.length > 0) {
      extraListings = await ListingModel.find({ _id: { $in: missingIds }, status: 'yayinda' }).lean();
    }
    const pool = [...allSortedListings, ...extraListings];
    dynamicShowcaseListings = selectedShowcaseIds
      .map((id: string) => pool.find((l: any) => l._id.toString() === id))
      .filter(Boolean);
  }

  if (dynamicShowcaseListings.length === 0) {
    dynamicShowcaseListings = displayVip;
  }

  const formattedShowcaseListings = dynamicShowcaseListings.map((l: any) => ({
    _id: l._id?.toString() || l.id || '',
    slug: l.slug || '',
    baslik: l.baslik || '',
    aciklama: l.aciklama || '',
    ilSlug: l.ilSlug || 'istanbul',
    ilceSlug: l.ilceSlug || 'beylikduzu',
    anaFotograf: {
      url: l.anaFotograf?.url || (l.fotograflar && l.fotograflar[0]?.url) || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=1200',
    },
    rozet: l.rozet === 'ultravip' ? 'vip' : (l.rozet || 'vip'),
    whatsappNumara: l.whatsappNumara || '',
  }));

  // Grid listings
  const gridListings = allSortedListings.slice(0, 48);

  return (
    <div className="flex flex-col gap-6 pb-16 w-full max-w-full text-left">
      
      {/* 1. HERO BANNER SLIDER (Dinamik Vitrin İlanları) */}
      <section className="w-full">
        <HeroSlider slides={formattedShowcaseListings} />
      </section>

      {/* 2. TÜM TÜRKİYE İL LİSTESİ BUTONU */}
      <div className="px-4">
        <Link
          href="/sehirler"
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1c180e] via-[#161b22] to-[#1c180e] border border-amber-500/40 hover:border-amber-400 flex items-center justify-between shadow-xl group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm text-white font-heading group-hover:text-amber-400 transition-colors">
                Türkiye Geneli 81 İl Eskort Listesi
              </span>
              <span className="text-xs text-[#8b949e]">
                Bulunduğunuz ili ve ilçeyi seçerek en yakın ilanları listeleyin
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3. POPÜLER İLLER & KATEGORİ VİTRİNİ */}
      <section className="w-full">
        <CategoryShowcase
          vipCovers={vipListings.map((l: any) => l.anaFotograf?.url).filter(Boolean)}
          vipCount={vipListings.length}
          goldCovers={goldListings.map((l: any) => l.anaFotograf?.url).filter(Boolean)}
          goldCount={goldListings.length}
          silverCount={silverListings.length}
        />
      </section>

      {/* 4. TÜM İLANLAR GRID LİSTESİ */}
      <section className="px-4 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-1 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
              Günün Öne Çıkan Güncel İlanları
            </h2>
          </div>
          <span className="text-xs text-[#8b949e] font-mono">
            {gridListings.length} İlan
          </span>
        </div>

        {/* YAN YANA 2'Lİ DÜZENLİ LİSTE GRİDİ */}
        <div className="grid grid-cols-2 gap-3">
          {gridListings.map((listing: any) => (
            <CompactListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </section>


      {/* ── 6. GÜVEN & DOĞRULAMA BİLGİ KUTUSU ──────────────── */}
      <div className="px-4 mt-2">
        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-sm text-white font-heading">%100 Doğrulanmış Güvenilir İlanlar</h3>
            <p className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">
              Tüm ilanlar editörlerimizce manuel onaylanır. Doğrudan WhatsApp veya telefon ile güvenle iletişim kurabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* ── 7. EN ALTTTAKİ DÜZENLİ FOOTER (81 İL REHBERİ) ──────────────── */}
      <footer className="px-4 mt-6">
        <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-2xl text-xs text-[#8b949e] leading-relaxed">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-black text-sm text-white font-heading uppercase tracking-wider">
              Türkiye Genelinde Bölgesel Eskort Rehberi
            </h3>
            <span className="text-amber-400 font-mono text-[11px] font-bold">81 İl Tam Kapsam</span>
          </div>

          <p>
            Best Eskort; İstanbul, Ankara, İzmir, Bursa, Antalya, Adana, Konya ve Türkiye'nin tüm illerindeki en güncel bağımsız ve VIP eskort ilanlarını bir araya getiren güvenilir rehber platformudur.
          </p>

          <div className="pt-2 border-t border-[#30363d] flex flex-wrap gap-x-3.5 gap-y-2.5 text-[11px] font-semibold">
            <Link href="/istanbul" className="text-amber-400 hover:text-white transition-colors">İstanbul Eskort</Link>
            <Link href="/ankara" className="text-amber-400 hover:text-white transition-colors">Ankara Eskort</Link>
            <Link href="/izmir" className="text-amber-400 hover:text-white transition-colors">İzmir Eskort</Link>
            <Link href="/bursa" className="text-amber-400 hover:text-white transition-colors">Bursa Eskort</Link>
            <Link href="/antalya" className="text-amber-400 hover:text-white transition-colors">Antalya Eskort</Link>
            <Link href="/adana" className="text-amber-400 hover:text-white transition-colors">Adana Eskort</Link>
            <Link href="/konya" className="text-amber-400 hover:text-white transition-colors">Konya Eskort</Link>
            <Link href="/gizem-bagdacicek" className="text-rose-400 font-black hover:text-rose-300 transition-colors">🔥 Gizem Bağdaçiçek</Link>
            <Link href="/merve-ozdemir" className="text-amber-300 font-black hover:text-amber-200 transition-colors">👑 Merve Özdemir</Link>
            <Link href="/sehirler" className="text-white font-bold bg-[#21262d] px-2.5 py-1 rounded-lg border border-white/10 hover:bg-amber-500 hover:text-slate-950 transition-all">→ Tüm 81 İl Listesi</Link>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[#6e7681]">
            <span>&copy; {new Date().getFullYear()} Best Eskort. Tüm hakları saklıdır.</span>
            <span>Gizlilik &amp; Güvenlik Standartları</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

