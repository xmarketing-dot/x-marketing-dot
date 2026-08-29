import React from 'react';
import { getSiteUrl } from '@/lib/siteUrl';
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
import { getListingBySlug, getListings } from '@/lib/data';
import WhatsAppButton, { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import CompactListingCard from '@/components/common/CompactListingCard';
import ImageSlider from '@/components/common/ImageSlider';
import LikeButton from '@/components/common/LikeButton';
import ShareButtons from '@/components/common/ShareButtons';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 180;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return { title: 'İlan Bulunamadı | Best Eskort' };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/ilan/${listing.slug}`;
  const ogImageUrl = `${siteUrl}/api/og/listing/${listing.slug}`;

  const ilAdi = listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1).replace(/-/g, ' ');
  const ilceAdi = listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1).replace(/-/g, ' ');

  const metaTitle = `${listing.baslik} — ${ilceAdi} ${ilAdi} Eskort İlanı | Best Eskort`;
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
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const siteUrl = getSiteUrl();
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
  const prefilledMessage = `Merhaba, ben ${listingFullUrl} adresindeki "${ilceAdi} Eskort — ${listing.baslik}" ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`;
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
      <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto px-0 sm:px-4 lg:px-6 pt-0 lg:pt-6">

        {/* ── FOTOĞRAF GALERİSİ ──────────────── */}
        <div className="w-full overflow-hidden bg-[#0d1117] relative rounded-none sm:rounded-[32px] border-0 sm:border-2 sm:border-[#30363d] shadow-none sm:shadow-2xl">
          <ImageSlider
            images={allImages}
            alt={`${listing.baslik} ${ilceAdi} eskort`}
            aspectRatio="aspect-[3/4] sm:aspect-[4/5] min-h-[500px] h-[70vh] max-h-[660px]"
            badge={`${rozet.toUpperCase()} VİTRİN`}
          />
        </div>

        {/* ── BİRLEŞİK İLAN AÇIKLAMASI VE BAŞLIK KARTI ──────────────── */}
        <div className="mx-3.5 sm:mx-0 p-6 sm:p-8 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col items-center text-center gap-6">

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
          />
        </div>
      </div>

    </div>
  );
}
