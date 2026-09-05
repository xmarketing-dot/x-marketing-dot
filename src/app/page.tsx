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
import { getHomepageConfig, getAllLocations, getListings, getActiveBanner } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import AdsterraBanner320x50 from '@/components/ads/AdsterraBanner320x50';

export const dynamic = 'force-dynamic';

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

  const [locations, rawListings, homepageConfig, activeBanner] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 60 }),
    getHomepageConfig(),
    getActiveBanner('anasayfa'),
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
      extraListings = await ListingModel.find({ _id: { $in: missingIds }, status: 'yayinda' })
        .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf createdAt status')
        .lean();
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

  // Group locations by region for the 81-city crawl hub
  const regionalHubs = {
    'Marmara & Metropol': locations.filter((l: any) => ['istanbul', 'bursa', 'kocaeli', 'tekirdag', 'balikesir', 'canakkale', 'edirne', 'kirklareli', 'sakarya', 'yalova', 'bilecik'].includes(l.ilSlug)),
    'Ege & Akdeniz': locations.filter((l: any) => ['izmir', 'antalya', 'mugla', 'aydin', 'denizli', 'manisa', 'mersin', 'adana', 'hatay', 'isparta', 'burdur', 'osmaniye', 'kahramanmaras'].includes(l.ilSlug)),
    'İç Anadolu & Başkent': locations.filter((l: any) => ['ankara', 'konya', 'kayseri', 'eskisehir', 'sivas', 'aksaray', 'karaman', 'kirikkale', 'kirsehir', 'nevsehir', 'nigde', 'yozgat', 'cankiri'].includes(l.ilSlug)),
    'Karadeniz Bölgesi': locations.filter((l: any) => ['samsun', 'trabzon', 'ordu', 'giresun', 'rize', 'artvin', 'zonguldak', 'karabuk', 'bartin', 'kastamonu', 'sinop', 'bolu', 'duzce', 'amasya', 'corum', 'tokat', 'gumushane', 'bayburt'].includes(l.ilSlug)),
    'Güneydoğu & Doğu Anadolu': locations.filter((l: any) => ['gaziantep', 'diyarbakir', 'sanliurfa', 'batman', 'mardin', 'adiyaman', 'sirnak', 'siirt', 'kilis', 'malatya', 'elazig', 'erzurum', 'van', 'agri', 'kars', 'igdir', 'ardahan', 'mus', 'bingol', 'bitlis', 'hakkari', 'tunceli', 'erzincan'].includes(l.ilSlug)),
  };

  const siteUrl = getSiteUrl();

  // ── JSON-LD SCHEMA OBJECTS (Google & Yandex Rich Snippets) ──
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Best Eskort',
    'alternateName': 'Best Escort Türkiye',
    'url': siteUrl,
    'description': 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış güncel eskort, escort bayan ve VIP model ilanları.',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/ara?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Best Eskort Türkiye',
    'url': siteUrl,
    'logo': `${siteUrl}/api/og/site`,
    'sameAs': [
      'https://t.me/besteskort',
      'https://twitter.com/besteskort',
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Öne Çıkan Doğrulanmış VIP Eskort İlanları',
    'numberOfItems': gridListings.length,
    'itemListElement': gridListings.slice(0, 10).map((l: any, idx: number) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': l.baslik || 'Doğrulanmış Model İlanı',
      'url': `${siteUrl}/ilan/${l.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Best Eskort üzerindeki ilanlar nasıl doğrulanır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Platformumuzda yayınlanan tüm bağımsız ve VIP eskort ilanları, editörlerimiz tarafından görsel doğrulama ve telefon teyidi yapılarak onaylanır. Sahte ve yanıltıcı profillere izin verilmez.',
        },
      },
      {
        '@type': 'Question',
        'name': 'İlan sahipleriyle nasıl güvenli iletişim kurulur?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'İlan detaylarında yer alan doğrudan WhatsApp ve telefon butonlarını kullanarak aracısız ve komisyonsuz olarak profil sahibiyle birebir görüşebilirsiniz.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Hangi şehir ve ilçelerde hizmet verilmektedir?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'İstanbul, Ankara, İzmir, Antalya, Bursa başta olmak üzere Türkiye\'nin 81 ilinde ve tüm popüler ilçelerinde 7/24 güncel eskort ve VIP model ilanları listelenmektedir.',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-3 pb-8 w-full max-w-full text-left">
      {/* ── JSON-LD SCHEMAS ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── SEMANTIC SEO H1 (Google & Yandex #1 Index Trigger) ── */}
      <h1 className="sr-only">
        Best Eskort &amp; Escort Bayan Model Kataloğu — Türkiye 81 İl Doğrulanmış VIP ve Bağımsız İlanlar
      </h1>

      {/* 1. HERO BANNER SLIDER (Dinamik Vitrin İlanları) */}
      <section className="w-full">
        <HeroSlider slides={formattedShowcaseListings} />
      </section>

      {/* 2. SPONSOR BANNER REKLAM ALANI */}
      <div className="w-full px-0">
        <SponsorBannerArea konum="anasayfa" initialBanner={activeBanner} />
      </div>

      {/* 2.5 TÜRKİYE 81 İL LİSTESİ - ULTRA MODERN VE ŞIK ETKİLEŞİMLİ KART */}
      <div className="px-4">
        <Link
          href="/sehirler"
          className="relative w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#1c160c] via-[#161b22] to-[#12161c] border border-amber-500/40 hover:border-amber-400/80 flex items-center justify-between shadow-lg shadow-black/40 group transition-all duration-300 hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute -left-8 -top-8 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-500" />

          <div className="relative z-10 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 group-hover:rotate-6 transition-all shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-white group-hover:text-amber-400 transition-colors">
                  Türkiye Geneli 81 İl Rehberi
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-heading font-black">
                  81 ŞEHİR
                </span>
              </div>
              <span className="text-[11px] text-[#8b949e] mt-0.5 line-clamp-1">
                Bulunduğunuz şehri seçerek en yakın doğrulanmış ilanları listeleyin
              </span>
            </div>
          </div>

          <div className="relative z-10 w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:translate-x-0.5 transition-all shrink-0 shadow-md">
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </Link>
      </div>

      {/* 3. ÖZEL İLAN VİTRİN KARTLARI */}
      <section className="w-full">
        <CategoryShowcase
          vipCovers={vipListings.map((l: any) => l.anaFotograf?.url).filter(Boolean)}
          vipCount={vipListings.length}
          goldCovers={goldListings.map((l: any) => l.anaFotograf?.url).filter(Boolean)}
          goldCount={goldListings.length}
          silverCount={silverListings.length}
        />
      </section>

      {/* 3.5 SPONSORLU MOBİL BANNER */}
      <div className="px-4">
        <AdsterraBanner320x50 />
      </div>

      {/* 4. TÜM İLANLAR GRID LİSTESİ */}
      <section className="px-4 flex flex-col gap-3 pt-1">
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

        <div className="grid grid-cols-2 gap-3">
          {gridListings.map((listing: any) => (
            <CompactListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </section>

      {/* ── 5. GÜVEN & DOĞRULAMA BİLGİ KUTUSU ──────────────── */}
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

      {/* ── 6. E-E-A-T SEO REHBERİ VE SSS AKORDİYON (TOPİCAL AUTHORITY) ──────────────── */}
      <section className="px-4 mt-4">
        <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] flex flex-col gap-4 shadow-2xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-black text-sm text-white">
                Türkiye Eskort (Escort) &amp; VIP Model Rehberi
              </h2>
              <p className="text-[11px] text-[#8b949e]">
                Doğrulanmış profiller, güvenli iletişim ve bölgesel katalog standartları
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8b949e] leading-relaxed">
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col gap-1.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                Doğrulanmış İlan Garantisi
              </h4>
              <p className="text-[11px]">
                Best Eskort üzerindeki tüm bağımsız ve ajans profilleri birebir fotoğraf teyidi ve iletişim kontrolünden geçer. Sahte görsellere ve kapora talep eden yanıltıcı ilanlara izin verilmez.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col gap-1.5">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                VIP &amp; Bağımsız Modeller
              </h4>
              <p className="text-[11px]">
                İstanbul, Ankara, İzmir, Antalya ve 81 ilde kendi evinde veya otelde hizmet veren bağımsız bayanlar, üniversiteli modeller ve VIP vitrin seçeneklerine tek tıkla ulaşın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TÜRKİYE 81 İL CRAWLER MATRİSİ (BÖLGESEL LINK AĞI - WEX/ELITEGIRLS MODELİ) ──────────────── */}
      <footer className="px-4 mt-6">
        <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] flex flex-col gap-5 shadow-2xl text-xs text-[#8b949e] leading-relaxed">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-black text-sm text-white font-heading uppercase tracking-wider">
                Türkiye 81 İl Eskort &amp; Escort Şehir Kataloğu
              </h3>
              <p className="text-[10px] text-[#6e7681] mt-0.5">
                Tüm il ve ilçelere doğrudan hızlı erişim matrisi
              </p>
            </div>
            <span className="text-amber-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              81 İl Canlı
            </span>
          </div>

          {/* BÖLGE BÖLGE 81 İL LİNKLERİ */}
          <div className="flex flex-col gap-4">
            {Object.entries(regionalHubs).map(([regionName, cityList]) => (
              <div key={regionName} className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-white/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {regionName}
                </span>
                <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-[11px]">
                  {cityList.map((loc: any) => {
                    const cityName = loc.il || (loc.ilSlug.charAt(0).toUpperCase() + loc.ilSlug.slice(1));
                    return (
                      <Link
                        key={loc.ilSlug}
                        href={`/${loc.ilSlug}`}
                        className="text-[#8b949e] hover:text-amber-400 transition-colors hover:underline"
                      >
                        {cityName} Eskort
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* POPÜLER KATEGORİLER & ETİKETLER */}
          <div className="pt-3 border-t border-[#30363d] flex flex-wrap gap-2 text-[11px]">
            <Link href="/kategori/vip" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all">
              👑 VIP Eskort
            </Link>
            <Link href="/kategori/gold" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-yellow-300 font-bold border border-yellow-500/30 hover:bg-yellow-400 hover:text-slate-950 transition-all">
              ⭐ Gold Escort
            </Link>
            <Link href="/kategori/turbanli" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-purple-300 font-bold border border-purple-500/30 hover:bg-purple-400 hover:text-slate-950 transition-all">
              🧕 Türbanlı Eskort
            </Link>
            <Link href="/kategori/amator" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-emerald-300 font-bold border border-emerald-500/30 hover:bg-emerald-400 hover:text-slate-950 transition-all">
              🌿 Amatör Eskort
            </Link>
            <Link href="/sehirler" className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all ml-auto">
              → Tüm Şehirleri Görüntüle
            </Link>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[#6e7681]">
            <span>&copy; {new Date().getFullYear()} Best Eskort &amp; Escort Kataloğu. Tüm hakları saklıdır.</span>
            <span>E-E-A-T Doğrulanmış Güvenlik ve Gizlilik Standartları</span>
          </div>
        </div>
      </footer>

    </div>
  );
}


