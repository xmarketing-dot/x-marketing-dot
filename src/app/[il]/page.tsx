import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import VipModel from '@/models/VipModel';
import { MapPin, ChevronRight, Sparkles, ShieldCheck, Globe } from 'lucide-react';
import { getLocationBySlug, getAllLocations, getListings, getAllCategories } from '@/lib/data';
import CompactListingCard from '@/components/common/CompactListingCard';
import CelebrityModelView from '@/components/model/CelebrityModelView';

interface Props {
  params: Promise<{ il: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map((loc: any) => ({ il: loc.ilSlug }));
}

async function findVipModel(slug: string) {
  await connectToDatabase();
  const vip = await VipModel.findOne({ slug }).lean();
  if (vip) return vip;
  return await ListingModel.findOne({ slug }).lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { il: ilSlug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://besteskort.com';

  // 1. Check if it's a VIP Celebrity / Influencer Model
  const model: any = await findVipModel(ilSlug);
  if (model) {
    const modelName = model.tamAd || model.baslik;
    return {
      title: `${modelName} — VIP Fenomen Model Biyografisi & Özel Fotoğrafları | Best Eskort`,
      description: `${modelName} resmi VIP profil sayfası. Doğrulanmış fotoğraf galerisi, fiziksel ölçüleri (boy, kilo, yaş) ve hayran değerlendirmeleri.`,
      keywords: [
        `${modelName}`,
        `${modelName} onlyfans`,
        `${modelName} twitter`,
        `${modelName} fotoğrafları`,
        `${modelName} boy kilo`,
        `${modelName} kimdir`,
        `${modelName} biyografi`,
        `${modelName} fenomen`,
      ],
      alternates: {
        canonical: `${siteUrl}/${ilSlug}`,
      },
      openGraph: {
        title: `${modelName} | VIP Fenomen & Model Portföyü`,
        description: `${modelName} teyitli fotoğrafları ve resmi biyografisi.`,
        url: `${siteUrl}/${ilSlug}`,
        images: [
          {
            url: model.anaFotografUrl || model.anaFotograf?.url || '',
            width: 800,
            height: 1000,
            alt: modelName,
          }
        ],
      }
    };
  }

  // 2. City Check
  const location = await getLocationBySlug(ilSlug);

  if (!location) {
    return { title: 'Sayfa Bulunamadı | Best Eskort' };
  }

  const canonicalUrl = `${siteUrl}/${location.ilSlug}`;

  return {
    title: `${location.il} Eskort İlanları & Bölgesel Rehber | Best Eskort`,
    description: `${location.il} ilindeki tüm doğrulanmış güncel eskort ilanları ve iletişim numaraları. ${location.il} ilçelerindeki bağımsız eskortları keşfedin.`,
    keywords: [
      `${location.il} eskort`,
      `${location.il} escort`,
      `${location.il} eskort ilanları`,
      `${location.il} escort ilanları`,
      `${location.il} eskort bayan`,
      `${location.il} escort bayan`,
      `${location.il} bağımsız eskort`,
      `${location.il} vip eskort`,
      `${location.il} vip escort`,
      `${location.il} whatsapp eskort`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${location.il} Eskort & Bölgesel İlanlar | Best Eskort`,
      description: `${location.il} genelinde eskort, araç, emlak ve bölgesel ilan rehberi.`,
      url: canonicalUrl,
    },
  };
}

export default async function CityOrModelPage({ params }: Props) {
  const { il: ilSlug } = await params;

  // 1. Check if it's a VIP Celebrity Model (e.g. /gizem-bagdacicek, /merve-ozdemir)
  const matchedModel: any = await findVipModel(ilSlug);
  if (matchedModel) {
    const formattedModel = {
      ...matchedModel,
      _id: matchedModel._id?.toString(),
      anaFotografUrl: matchedModel.anaFotografUrl || matchedModel.anaFotograf?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      fotograflar: matchedModel.fotograflar && matchedModel.fotograflar.length > 0
        ? matchedModel.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
        : [matchedModel.anaFotografUrl || matchedModel.anaFotograf?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'],
      anonimYorumlar: matchedModel.anonimYorumlar?.map((c: any) => ({
        yazar: c.yazar,
        yorum: c.yorum,
        puan: c.puan,
        createdAt: c.createdAt,
      })) || [],
    };

    return <CelebrityModelView model={formattedModel} />;
  }

  // 2. City Page
  const [location, listings, categories] = await Promise.all([
    getLocationBySlug(ilSlug),
    getListings({ ilSlug, limit: 30 }),
    getAllCategories(),
  ]);

  if (!location) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Schema.org BreadcrumbList for Googlebot
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Anasayfa',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${location.il} Eskort İlanları`,
        item: `${siteUrl}/${location.ilSlug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left">
      
      {/* Googlebot Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. HERO BAŞLIK & İSTATİSTİK ──────────────── */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#1c1408] via-[#161b22] to-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-heading text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Bölgesel İlan Rehberi</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          {location.il} Eskort İlanları
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed max-w-2xl font-medium">
          {location.il} merkez ve tüm ilçelerindeki doğrulanmış eskort bayan ilanları, bağımsız profiller ve VIP vitrin seçenekleri.
        </p>

        {/* İlçe Hapları (Desktop & Mobile) */}
        {location.ilceler && location.ilceler.length > 0 && (
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar py-1">
            {location.ilceler.map((ilce: any) => (
              <Link
                key={ilce.slug}
                href={`/${location.ilSlug}/${ilce.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs border border-[#363b42] transition-colors shrink-0 shadow-sm"
              >
                {ilce.ad}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. İLAN LİSTESİ (3 SÜTUNLU COMPACT GRID) ──────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-heading font-bold text-sm text-white">
            {location.il} İlanları ({listings.length})
          </span>
        </div>
        <span className="text-xs text-[#8b949e] font-mono">
          Aktif Yayınlar
        </span>
      </div>

      {listings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-bold text-white font-heading">
            {location.il} bölgesinde henüz ilan bulunmuyor.
          </p>
          <p className="text-xs text-[#8b949e]">
            İlk ilanı siz vererek bu ilde zirvede yer alabilirsiniz.
          </p>
          <Link
            href="/ilan-ver"
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg transition-all"
          >
            Hemen İlan Ver
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listings.map((item: any) => (
            <CompactListingCard key={item._id} listing={item} />
          ))}
        </div>
      )}

      {/* ── 3. SEO FOOTER METNİ ──────────────── */}
      <footer className="p-6 rounded-[28px] bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-3 text-xs text-[#8b949e] leading-relaxed">
        <h2 className="font-bold text-sm text-white font-heading">
          {location.il} Eskort Hizmetleri Hakkında
        </h2>
        <p>
          {location.il} genelinde hizmet veren bağımsız ve VIP eskort profillerine Best Eskort güvencesiyle ulaşabilirsiniz. İlan detaylarındaki doğrulanmış fotoğrafları inceleyebilir ve WhatsApp üzerinden güvenle randevu oluşturabilirsiniz.
        </p>
      </footer>

    </div>
  );
}
