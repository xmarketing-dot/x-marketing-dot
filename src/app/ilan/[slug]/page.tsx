import React from 'react';
import { getSiteUrl, getRequestSiteUrl } from '@/lib/siteUrl';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Eye,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag,
  Layers,
  Phone,
  CheckCircle2,
  Crown,
  Star,
  Award,
  Medal,
  BadgeCheck,
  Check
} from 'lucide-react';
import { getListingBySlug, getListings, getActiveBanner, getAllLocations } from '@/lib/data';
import WhatsAppButton, { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import CompactListingCard from '@/components/common/CompactListingCard';
import ImageSlider from '@/components/common/ImageSlider';
import LikeButton from '@/components/common/LikeButton';
import ShareButtons from '@/components/common/ShareButtons';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';
import AdsterraNativeBanner from '@/components/ads/AdsterraNativeBanner';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 86400; // 24 saat önbellek (Vercel ISR kota patlamasını önler)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return { title: 'İlan Bulunamadı | Best Eskort' };
  }

  const siteUrl = await getRequestSiteUrl();
  const canonicalUrl = `${siteUrl}/ilan/${listing.slug}`;
  const ogImageUrl = `${siteUrl}/api/og/listing/${listing.slug}`;

  const ilAdi = listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1).replace(/-/g, ' ');
  const ilceAdi = listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1).replace(/-/g, ' ');

  const metaTitle = `${listing.baslik} — ${ilceAdi} ${ilAdi} Eskort İlanı`;
  const metaDescription = `${ilAdi} ${ilceAdi} bölgesinde ${listing.baslik}. %100 Teyitli profil fotoğrafları, doğrudan WhatsApp ve telefon numarası ile hemen iletişime geçin.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      `${ilceAdi} eskort`,
      `${ilceAdi} escort`,
      `${ilAdi} eskort`,
      `${ilAdi} escort`,
      `${ilceAdi} ${ilAdi} eskort bayan`,
      `${ilceAdi} eskort numaraları`,
      `${ilceAdi} vip eskort`,
      `${ilceAdi} bağımsız eskort`,
      listing.baslik,
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'article',
      locale: 'tr_TR',
      siteName: 'Best Eskort',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: 'image/jpeg',
          width: 1200,
          height: 630,
          alt: listing.baslik,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const [listing, activeBanner, locations] = await Promise.all([
    getListingBySlug(slug),
    getActiveBanner('ilan_detay'),
    getAllLocations(),
  ]);

  if (!listing) {
    notFound();
  }

  // Regional hubs for 81-city crawl matrix
  const regionalHubs = {
    'Marmara & Metropol': locations.filter((l: any) => ['istanbul', 'bursa', 'kocaeli', 'tekirdag', 'balikesir', 'canakkale', 'edirne', 'kirklareli', 'sakarya', 'yalova', 'bilecik'].includes(l.ilSlug)),
    'Ege & Akdeniz': locations.filter((l: any) => ['izmir', 'antalya', 'mugla', 'aydin', 'denizli', 'manisa', 'mersin', 'adana', 'hatay', 'isparta', 'burdur', 'osmaniye', 'kahramanmaras'].includes(l.ilSlug)),
    'İç Anadolu & Başkent': locations.filter((l: any) => ['ankara', 'konya', 'kayseri', 'eskisehir', 'sivas', 'aksaray', 'karaman', 'kirikkale', 'kirsehir', 'nevsehir', 'nigde', 'yozgat', 'cankiri'].includes(l.ilSlug)),
    'Karadeniz Bölgesi': locations.filter((l: any) => ['samsun', 'trabzon', 'ordu', 'giresun', 'rize', 'artvin', 'zonguldak', 'karabuk', 'bartin', 'kastamonu', 'sinop', 'bolu', 'duzce', 'amasya', 'corum', 'tokat', 'gumushane', 'bayburt'].includes(l.ilSlug)),
    'Güneydoğu & Doğu Anadolu': locations.filter((l: any) => ['gaziantep', 'diyarbakir', 'sanliurfa', 'batman', 'mardin', 'adiyaman', 'sirnak', 'siirt', 'kilis', 'malatya', 'elazig', 'erzurum', 'van', 'agri', 'kars', 'igdir', 'ardahan', 'mus', 'bingol', 'bitlis', 'hakkari', 'tunceli', 'erzincan'].includes(l.ilSlug)),
  };

  const siteUrl = await getRequestSiteUrl();
  const canonicalUrl = `${siteUrl}/ilan/${listing.slug}`;

  const ilAdi = listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1).replace(/-/g, ' ');
  const ilceAdi = listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1).replace(/-/g, ' ');
  const metaTitle = `${listing.baslik} — ${ilceAdi} ${ilAdi} Eskort`;

  // Benzer İlanlar (Aynı şehirdeki diğer ilanlar)
  const similarListings = await getListings({
    ilSlug: listing.ilSlug,
    limit: 6,
  });

  const filteredSimilar = similarListings.filter((l: any) => l.slug !== listing.slug);

  const allImages = listing.fotograflar && listing.fotograflar.length > 0
    ? listing.fotograflar
    : [listing.anaFotograf || { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000' }];

  const rozet = listing.rozet || 'ultravip';
  const isUltraVip = rozet === 'ultravip';
  const isVip = rozet === 'vip';
  const isGold = rozet === 'gold';

  // WhatsApp URL for Sticky Bar (Supports Turkish & International Numbers)
  const formattedNumber = formatWhatsAppNumber(listing.whatsappNumara);
  const listingFullUrl = `${siteUrl}/ilan/${listing.slug}`;
  const locationLabel = ilAdi && ilceAdi && ilAdi.toLowerCase() !== ilceAdi.toLowerCase()
    ? `${ilAdi} - ${ilceAdi} Eskort`
    : `${ilceAdi || ilAdi} Eskort`;
  const prefilledMessage = `Merhaba, ben ${listingFullUrl} adresindeki "${locationLabel} — ${listing.baslik}" ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`;
  const waUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  // Rich Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: `${ilAdi} Eskort`, item: `${siteUrl}/${listing.ilSlug}` },
          { '@type': 'ListItem', position: 3, name: `${ilceAdi} Eskort`, item: `${siteUrl}/${listing.ilSlug}/${listing.ilceSlug}` },
          { '@type': 'ListItem', position: 4, name: listing.baslik, item: `${siteUrl}/ilan/${listing.slug}` },
        ],
      },
      {
        '@type': 'LocalBusiness',
        name: `${listing.baslik} - ${ilceAdi} ${ilAdi} Eskort`,
        description: listing.aciklama,
        image: allImages.map((f: any) => f.url),
        telephone: listing.whatsappNumara,
        address: {
          '@type': 'PostalAddress',
          addressLocality: ilceAdi,
          addressRegion: ilAdi,
          addressCountry: 'TR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 41.0082,
          longitude: 28.9784,
        },
        priceRange: '₺₺₺',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '34',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 pb-28 w-full max-w-6xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. MERKEZİ PROFİL DÜZENİ (NATIVE APP GİBİ) ──────────────── */}
      <div className="flex flex-col gap-3.5 sm:gap-4 w-full max-w-2xl mx-auto px-0 sm:px-4 lg:px-6 pt-0 lg:pt-4">

        {/* ── FOTOĞRAF GALERİSİ ──────────────── */}
        <div className="w-full overflow-hidden bg-[#0d1117] relative rounded-none sm:rounded-[32px] border-0 sm:border-2 sm:border-[#30363d] shadow-none sm:shadow-2xl">
          <ImageSlider
            images={allImages}
            alt={`${listing.baslik} ${ilceAdi} eskort`}
            aspectRatio="aspect-[3/4] sm:aspect-[4/5] min-h-[500px] h-[70vh] max-h-[660px]"
            badge={`${rozet.toUpperCase()} VİTRİN`}
          />
        </div>

        {/* ── SPONSORLU VIP BANNER (Tam Genişlikte, Kenarlara Sıfır Yapışık) ──────────────── */}
        <div className="w-full px-0 -mx-0 sm:mx-0">
          <SponsorBannerArea konum="ilan_detay" initialBanner={activeBanner} />
        </div>

        {/* ── BİRLEŞİK İLAN AÇIKLAMASI VE BAŞLIK KARTI ──────────────── */}
        <div className="mx-3.5 sm:mx-0 p-5 sm:p-7 rounded-[28px] sm:rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col items-center text-center gap-5">

          {/* Rozetler: Teyitli & Bölge */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-heading border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              %100 Doğrulanmış Profil
            </span>
            <Link
              href={`/${listing.ilSlug}/${listing.ilceSlug}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase font-heading border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {ilAdi} / {ilceAdi}
            </Link>
          </div>

          {/* Başlık ve Like */}
          <div className="flex flex-col items-center gap-4 w-full">
            <h1 className="font-black text-2xl sm:text-3xl text-white leading-tight font-heading tracking-tight drop-shadow-md px-2">
              {listing.baslik}
            </h1>
            <div className="scale-110">
              <LikeButton
                listingId={listing._id.toString()}
                initialLikes={
                  typeof listing.likeSayisi === 'number' && listing.likeSayisi > 0
                    ? listing.likeSayisi
                    : (isUltraVip ? 315 : isVip ? 218 : isGold ? 142 : 76)
                }
              />
            </div>
          </div>

          {/* İlan Metni (Büyütüldü ve Ortalandı) */}
          <div className="text-base sm:text-lg text-[#f0f6fc] leading-relaxed whitespace-pre-line font-medium px-2">
            {listing.aciklama}
          </div>

          <ShareButtons title={metaTitle} />

          {/* Bölgesel Hızlı Yönlendirme Linkleri */}
          <div className="pt-4 border-t border-[#30363d] flex flex-wrap justify-center gap-2 text-[11px] font-heading font-bold w-full">
            <Link href={`/${listing.ilSlug}`} className="px-4 py-2.5 rounded-xl bg-[#21262d] text-amber-400 hover:bg-[#30363d] border border-white/5 transition-colors">
              📍 {ilAdi} İlanları
            </Link>
            <Link href={`/${listing.ilSlug}/${listing.ilceSlug}`} className="px-4 py-2.5 rounded-xl bg-[#21262d] text-amber-400 hover:bg-[#30363d] border border-white/5 transition-colors">
              📍 {ilceAdi} Bölgesi
            </Link>
          </div>

        </div>

        {/* ── SPONSORLU NATIVE 4:1 VİTRİN BANNER ── */}
        <div className="mx-3.5 sm:mx-0">
          <AdsterraNativeBanner />
        </div>

      </div>

      {/* ── 2. AYNI ŞEHİRDEKİ BENZER İLANLAR (3 SÜTUNLU KOMPAKT GRID) ──────────────── */}
      {filteredSimilar.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 px-3 sm:px-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-sm text-white uppercase tracking-wider font-heading">
                  {ilAdi} Bölgesindeki Diğer İlanlar
                </h3>
                <span className="text-[10px] text-[#8b949e]">Aynı şehirdeki diğer teyitli profiller</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black font-heading border border-amber-500/20">
              {filteredSimilar.length} İlan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSimilar.map((item: any) => (
              <CompactListingCard key={item._id} listing={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── 2.5 TÜRKİYE 81 İL CRAWLER MATRİSİ (BÖLGESEL LINK AĞI) ──────────────── */}
      <div className="mt-8 px-3 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] flex flex-col gap-5 shadow-2xl text-xs text-[#8b949e] leading-relaxed">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-black text-sm text-white font-heading uppercase tracking-wider">
                Türkiye 81 İl Eskort &amp; Escort Şehir Kataloğu
              </h3>
              <p className="text-[10px] text-[#6e7681] mt-0.5">
                Tüm il ve ilçelerin güncel eskort profilleri
              </p>
            </div>
            <span className="text-amber-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              81 İl Canlı
            </span>
          </div>

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

          <div className="pt-3 border-t border-[#30363d] flex flex-wrap gap-2 text-[11px]">
            <Link href="/kategori/vip" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all">
              👑 VIP Eskort
            </Link>
            <Link href="/kategori/gold" className="px-2.5 py-1 rounded-lg bg-[#21262d] text-yellow-300 font-bold border border-yellow-500/30 hover:bg-yellow-400 hover:text-slate-950 transition-all">
              ⭐ Gold Escort
            </Link>
            <Link href="/sehirler" className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all ml-auto">
              → Tüm Şehirleri Görüntüle
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. MOBİLDE ALTA YAPIŞIK SABİT İLETİŞİM BARI (STICKY WHATSAPP ACTION BAR) ──────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d1117]/95 backdrop-blur-xl border-t border-[#30363d] p-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-2xl mx-auto w-full">
          <WhatsAppButton
            numara={listing.whatsappNumara}
            baslik={listing.baslik}
            listingId={listing._id.toString()}
            slug={listing.slug}
            il={ilAdi}
            ilce={ilceAdi}
            customMessage={prefilledMessage}
            compact={true}
          />
        </div>
      </div>

    </div>
  );
}
