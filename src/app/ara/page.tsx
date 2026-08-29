import React from 'react';
import { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import { getAllLocations, getListings } from '@/lib/data';
import SearchClient from '@/components/search/SearchClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: 'Eskort & Escort İlan Arama — 81 İl ve İlçe | Best Eskort',
    description: 'Türkiye genelinde 81 il ve ilçede en yakın eskort, escort bayan, VIP model ve bağımsız eskort ilanlarını anında arayın.',
    keywords: [
      'eskort ara', 'escort ara', 'eskort bul', 'escort bul',
      'istanbul eskort ara', 'istanbul escort ara', 'ankara eskort ara', 'izmir eskort ara',
      'vip eskort', 'vip escort', 'en yakın eskort', 'en yakın escort',
    ],
    alternates: { canonical: `${siteUrl}/ara` },
  };
}

export default async function SearchPage() {
  const [locations, allListings] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 200 }),
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-20 flex flex-col gap-6">
      <SearchClient locations={locations} initialListings={allListings} />
    </div>
  );
}
