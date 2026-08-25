import React from 'react';
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
import WhatsAppButton, { OfficialWhatsAppIcon, formatWhatsAppNumber } from '@/components/common/WhatsAppButton';
import CompactListingCard from '@/components/common/CompactListingCard';
import ImageSlider from '@/components/common/ImageSlider';
import LikeButton from '@/components/common/LikeButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return { title: 'İlan Bulunamadı | Best Eskort' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/ilan/${listing.slug}`;
  const coverImage = listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || '';

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
      images: coverImage ? [{ url: coverImage, alt: listing.baslik, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: coverImage ? [coverImage] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const ilAdi = listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1).replace(/-/g, ' ');
  const ilceAdi = listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1).replace(/-/g, ' ');

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
  const message = encodeURIComponent(`Merhaba, "${listing.baslik}" (${ilceAdi} / ${ilAdi}) ilanınız için yazıyorum.`);
  const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

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

      {/* ── 1. ÇİFT SÜTUNLU ZENGİN DETAY DÜZENİ ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start px-0 sm:px-0 lg:px-6 pt-0 lg:pt-6">
        
        {/* ── SOL SÜTUN (7 KOLON): DİKEY FOTOĞRAF GALERİSİ & AÇIKLAMA ──────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* HD Dikey Fotoğraf Slider'ı (Sağ, Sol ve Üst Tam Sıfır Oturan Çerçevesiz Galeri) */}
          <div className="w-full overflow-hidden bg-[#0d1117] relative rounded-none lg:rounded-[32px] border-0 lg:border-2 lg:border-[#30363d] shadow-none lg:shadow-2xl">
            <ImageSlider
              images={allImages}
              alt={`${listing.baslik} ${ilceAdi} eskort`}
              aspectRatio="aspect-[3/4] sm:aspect-[4/5] min-h-[500px] h-[70vh] max-h-[660px]"
              priority
              badge={`${rozet.toUpperCase()} VİTRİN`}
            />
          </div>

          {/* ── TEK & BİRLEŞİK İLAN AÇIKLAMASI VE BÖLGESEL BİLGİ KARTI ──────────────── */}
          <div className="mx-3.5 sm:mx-4 lg:mx-0 p-6 sm:p-7 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>İlan Açıklaması &amp; {ilAdi} / {ilceAdi} Bilgileri</span>
              </span>

              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>%100 Doğrulanmış Profil</span>
              </span>
            </div>

            {/* İlan Metni */}
            <div className="text-sm text-[#f0f6fc] leading-relaxed whitespace-pre-line font-medium">
              {listing.aciklama}
            </div>

            {/* Bölgesel Hızlı Yönlendirme Linkleri (Alt Kısım) */}
            <div className="pt-3 border-t border-[#30363d] flex flex-wrap gap-2 text-[11px] font-heading font-bold">
              <Link href={`/${listing.ilSlug}`} className="px-3 py-1.5 rounded-xl bg-[#21262d] text-amber-400 hover:bg-[#30363d] border border-white/5 transition-colors">
                📍 {ilAdi} Eskort İlanları
              </Link>
              <Link href={`/${listing.ilSlug}/${listing.ilceSlug}`} className="px-3 py-1.5 rounded-xl bg-[#21262d] text-amber-400 hover:bg-[#30363d] border border-white/5 transition-colors">
                📍 {ilceAdi} Eskort
              </Link>
              <Link href="/sehirler" className="px-3 py-1.5 rounded-xl bg-[#21262d] text-white hover:bg-[#30363d] border border-white/5 transition-colors">
                → Tüm 81 İl Listesi
              </Link>
            </div>

          </div>

        </div>

        {/* ── SAĞ SÜTUN (5 KOLON): BAŞLIK, TEYİT ROZETLERİ, ÖZELLİKLER & İLETİŞİM ──────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-4 px-3.5 sm:px-4 lg:px-0">
          
          <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-5">
            
            {/* Üst Konum & %100 TEYİTLİ Rozeti (Tek ve Net) */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Link 
                href={`/${listing.ilSlug}/${listing.ilceSlug}`}
                className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider font-heading bg-[#21262d] hover:bg-[#30363d] px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-sm transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{ilAdi} / {ilceAdi}</span>
              </Link>

              {/* %100 TEYİTLİ ROZETİ */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase font-heading border border-emerald-500/40 shadow-md">
                <BadgeCheck className="w-4 h-4 stroke-[2.5]" />
                <span>%100 Teyitli İlan</span>
              </div>
            </div>

            {/* Tek Ana H1 Başlığı & Facebook Tarzı Like / Öneri Butonu */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="font-black text-xl sm:text-2xl text-white leading-snug font-heading tracking-tight flex-1 min-w-[200px]">
                {listing.baslik}
              </h1>

              <LikeButton 
                listingId={listing._id.toString()} 
                initialLikes={
                  typeof listing.likeSayisi === 'number' && listing.likeSayisi > 0
                    ? listing.likeSayisi
                    : (isUltraVip ? 315 : isVip ? 218 : isGold ? 142 : 76)
                } 
              />
            </div>

            {/* Güven ve Teyit Kutusu */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border border-amber-500/40 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-heading font-black text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Doğrulanmış Profil Garantisi</span>
              </div>
              <p className="text-[11px] text-[#c9d1d9] leading-relaxed font-medium">
                🛡️ Bu ilanın fotoğrafları, telefon numarası ve konum bilgileri yöneticilerimiz tarafından %100 teyit edilmiş ve onaylanmıştır.
              </p>
            </div>

            {/* Özellik Tablosu */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase font-heading">Şehir &amp; Bölge</span>
                <span className="text-white font-bold">{ilAdi} / {ilceAdi}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase font-heading">Vitrin Paketi</span>
                <span className="text-amber-400 font-bold uppercase font-heading">{rozet}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase font-heading">Fotoğraf Sayısı</span>
                <span className="text-white font-bold">{allImages.length} Doğrulanmış Foto</span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase font-heading">Görüntülenme</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{listing.goruntulenmeSayisi || 1} kez incelendi</span>
                </span>
              </div>
            </div>

            {/* WhatsApp ve Arama Aksiyon Butonları */}
            <div className="pt-2">
              <WhatsAppButton
                numara={listing.whatsappNumara}
                baslik={listing.baslik}
                listingId={listing._id}
              />
            </div>

          </div>

        </div>

      </div>

      {/* ── 2. AYNI ŞEHİRDEKİ BENZER İLANLAR (3 SÜTUNLU KOMPAKT GRID) ──────────────── */}
      {filteredSimilar.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 px-3 sm:px-6">
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
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d1117]/95 backdrop-blur-xl border-t border-[#30363d] p-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[max(env(safe-area-inset-bottom),12px)] max-w-lg mx-auto md:max-w-4xl">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-sm shadow-2xl active:scale-98 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider font-heading cursor-pointer"
        >
          <OfficialWhatsAppIcon className="w-5 h-5 fill-slate-950 shrink-0" />
          <span>WhatsApp ile Hemen İletişime Geç</span>
        </a>
      </div>

    </div>
  );
}
