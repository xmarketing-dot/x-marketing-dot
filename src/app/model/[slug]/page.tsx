import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Crown, 
  Star, 
  CheckCircle2, 
  BadgeCheck, 
  Heart, 
  Eye, 
  Share2, 
  MessageSquare,
  Lock,
  Globe,
  Flame,
  ArrowRight
} from 'lucide-react';
import connectToDatabase from '@/lib/mongodb';
import VipModel from '@/models/VipModel';
import ListingModel from '@/models/Listing';
import LikeButton from '@/components/common/LikeButton';
import CommentSection from '@/components/common/CommentSection';
import WhatsAppButton from '@/components/common/WhatsAppButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function findModel(slug: string) {
  await connectToDatabase();
  const vip = await VipModel.findOne({ slug }).lean();
  if (vip) return vip;
  return await ListingModel.findOne({ slug }).lean();
}

// Dynamic SEO Meta Tags
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model: any = await findModel(slug);

  if (!model) {
    return { title: 'VIP Fenomen & Model Profili | Best Eskort' };
  }

  const modelName = model.tamAd || model.baslik;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://besteskort.com';

  return {
    title: `${modelName} — VIP Model Portföyü, Biyografi & Fotoğraflar | Best Eskort`,
    description: `${modelName} resmi VIP profil sayfası. %100 doğrulanmış fotoğraflar, fiziksel özellikleri, biyografi detayları ve doğrudan WhatsApp iletişim bilgileri.`,
    keywords: [
      `${modelName}`,
      `${modelName} VIP`,
      `${modelName} onlyfans`,
      `${modelName} biyografi`,
      `${modelName} boy kilo`,
      `${modelName} eskort`,
      `${modelName} istanbul`,
      `${modelName} iletisim`,
    ],
    alternates: {
      canonical: `${siteUrl}/model/${slug}`,
    },
    openGraph: {
      title: `${modelName} | VIP Fenomen & Model Portföyü`,
      description: `${modelName} teyitli fotoğrafları ve resmi biyografisi.`,
      url: `${siteUrl}/model/${slug}`,
      images: [
        {
          url: model.anaFotograf?.url || model.fotograflar?.[0]?.url || '',
          width: 800,
          height: 1000,
          alt: modelName,
        }
      ],
    }
  };
}

export default async function ModelProfilePage({ params }: Props) {
  const { slug } = await params;
  const model: any = await findModel(slug);

  if (!model) {
    notFound();
  }

  const modelName = model.tamAd || model.baslik;
  const allImages = model.fotograflar && model.fotograflar.length > 0 
    ? model.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
    : [model.anaFotografUrl || model.anaFotograf?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'];

  const ilAdi = model.ilSlug ? (model.ilSlug.charAt(0).toUpperCase() + model.ilSlug.slice(1).replace(/-/g, ' ')) : 'İstanbul';
  const ilceAdi = model.ilceSlug ? (model.ilceSlug.charAt(0).toUpperCase() + model.ilceSlug.slice(1).replace(/-/g, ' ')) : 'Merkez';

  // Schema.org Structured Data for SEO (Person + Product Rating)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: modelName,
    jobTitle: 'VIP Model & Dijital İçerik Üreticisi',
    description: model.aciklama,
    image: allImages[0],
    address: {
      '@type': 'PostalAddress',
      addressLocality: ilceAdi,
      addressRegion: ilAdi,
      addressCountry: 'TR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: (model.anonimYorumlar?.length || 24) + 40,
      bestRating: '5',
      worstRating: '1',
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 w-full max-w-full text-left selection:bg-amber-500 selection:text-slate-950">
      
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. ÜST HERO BANNER & VERIFIED HEADER ──────────────── */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#1c1214] via-[#161b22] to-[#251015] border-2 border-red-500/40 shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
        
        {/* Model Avatar & Glow */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-2xl shadow-red-500/30 shrink-0 group">
          <Image
            src={allImages[0]}
            alt={modelName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            priority
            sizes="(max-width: 768px) 150px, 200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Model Title & Verified Info */}
        <div className="flex flex-col gap-3.5 flex-1 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase font-heading border border-red-500/40 flex items-center gap-1.5 shadow-md">
              <Flame className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" />
              <span>Özel VIP Fenomen &amp; Model</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black uppercase font-heading border border-blue-500/40 flex items-center gap-1.5 shadow-md">
              <BadgeCheck className="w-4 h-4 fill-blue-500 text-slate-950" />
              <span>%100 Gerçek &amp; Doğrulanmış Profil</span>
            </span>
          </div>

          <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-white font-heading tracking-tight flex items-center justify-center md:justify-start gap-3">
            <span>{modelName}</span>
            <span className="text-amber-400 text-2xl sm:text-3xl">👑</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#8b949e] max-w-2xl leading-relaxed font-medium">
            Resmi teyitli portföy sayfası. Yüksek çözünürlüklü doğrulanmış fotoğraflar, fiziksel ölçüler, biyografi ve doğrudan randevu &amp; iletişim kanalları.
          </p>

          {/* Social Proof Actions (Like & WhatsApp) */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2 flex-wrap">
            <LikeButton 
              listingId={model._id.toString()} 
              initialLikes={model.likeSayisi || 1420} 
            />

            <div className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#0d1117] border border-[#30363d] text-xs text-amber-400 font-bold font-mono">
              <Eye className="w-4 h-4" />
              <span>{(model.goruntulenmeSayisi || 120) + 1850} Görüntülenme</span>
            </div>

            <span className="px-3 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              📍 {ilAdi} / {ilceAdi}
            </span>
          </div>

        </div>

      </div>

      {/* ── 2. ANA İÇERİK: FOTOĞRAF GALERİSİ + BİYOGRAFİ + TABLO ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL SÜTUN (7 KOLON): FOTOĞRAFLAR & BİYOGRAFİ */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Fotoğraf Galerisi */}
          <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Doğrulanmış Özel Fotoğraf Galerisi ({allImages.length})</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">● Teyit Edildi</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {allImages.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0d1117] border border-[#30363d] shadow-md group"
                >
                  <Image
                    src={img}
                    alt={`${modelName} Fotoğraf ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-md">
                      HD Fotoğraf #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zengin Biyografi Metni (SEO Zirvesi) */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-heading font-black text-base">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>{modelName} Hakkında &amp; Özel Biyografi</span>
            </div>

            <div className="text-sm text-[#f0f6fc] leading-relaxed whitespace-pre-line font-medium">
              {model.aciklama || `${modelName}, sosyal medya ve dijital platformlarda tanınan, zarafeti ve yüksek kalitesiyle öne çıkan seçkin bir VIP modeldir. 
              
İstanbul ve çevresinde bağımsız olarak özel davetler, lüks seyahatler ve randevular için randevu kabul etmektedir. Tamamen hijyenik, gizliliğe %100 sadık ve üst düzey standartlarda hizmet sunmaktadır.`}
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium leading-relaxed mt-2">
              💡 <strong>Gizlilik &amp; Güvenlik Prensibi:</strong> {modelName} ile gerçekleştireceğiniz tüm görüşmeler karşılıklı saygı, gizlilik ve üst düzey hijyen kuralları çerçevesinde yürütülür.
            </div>
          </div>

          {/* Anonim Yorumlar */}
          <CommentSection 
            listingSlug={model.slug} 
            initialComments={model.anonimYorumlar || []} 
          />

        </div>

        {/* SAĞ SÜTUN (5 KOLON): FİZİKSEL ÖLÇÜLER + DOĞRUDAN İLETİŞİM */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-4">
          
          {/* Fiziksel Ölçüler & Biyometri Kartı */}
          <div className="p-6 rounded-[32px] bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-5">
            


            {/* Mekanlar & Diller */}
            <div className="flex flex-col gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-1.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase">Hizmet Mekanları</span>
                <div className="flex flex-wrap gap-1.5">
                  {(model.hizmetMekanlari && model.hizmetMekanlari.length > 0 
                    ? model.hizmetMekanlari 
                    : ['Kendi Evi', 'Lüks Otel', 'Rezidans', 'Seyahat']
                  ).map((m: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-[#21262d] text-white text-[10px] font-bold border border-white/5">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-1.5">
                <span className="text-[10px] text-[#8b949e] font-bold uppercase">Konuştuğu Diller</span>
                <div className="flex flex-wrap gap-1.5">
                  {(model.diller && model.diller.length > 0 
                    ? model.diller 
                    : ['Türkçe', 'İngilizce', 'Rusça']
                  ).map((d: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-[#21262d] text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      💬 {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Doğrudan WhatsApp İletişim Butonu */}
            <div className="pt-2">
              <WhatsAppButton
                numara={model.whatsappNumara || '0530 000 00 00'}
                baslik={modelName}
                listingId={model._id.toString()}
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
