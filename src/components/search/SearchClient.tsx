'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, X } from 'lucide-react';
import CompactListingCard from '@/components/common/CompactListingCard';

interface SearchClientProps {
  locations: any[];
  initialListings: any[];
  initialQuery?: string;
}

export default function SearchClient({ locations, initialListings, initialQuery = '' }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIl, setSelectedIl] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  // Turkish character normalization + synonym matching
  const normalize = (str: string) => {
    const trMap: Record<string, string> = {
      ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u'
    };
    return (str || '')
      .split('')
      .map((c) => trMap[c] || c)
      .join('')
      .toLowerCase()
      .trim();
  };

  const filteredListings = useMemo(() => {
    let result = [...initialListings];

    if (selectedIl) {
      result = result.filter((l) => l.ilSlug === selectedIl);
    }

    if (selectedTier !== 'all') {
      if (selectedTier === 'vip') {
        result = result.filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip');
      } else {
        result = result.filter((l) => l.rozet === selectedTier);
      }
    }

    if (query.trim()) {
      // Normalize query and treat eskort == escort as synonyms
      let cleanQuery = normalize(query);
      cleanQuery = cleanQuery.replace(/\bescort\b/g, 'eskort');

      result = result.filter((l) => {
        let text = `${l.baslik || ''} ${l.tamAd || ''} ${l.aciklama || ''} ${l.ilSlug || ''} ${l.ilceSlug || ''}`;
        let cleanText = normalize(text).replace(/\bescort\b/g, 'eskort');
        return cleanText.includes(cleanQuery);
      });
    }

    return result;
  }, [query, selectedIl, selectedTier, initialListings]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-heading font-black text-xs uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>81 İl &amp; İlçe İlan Arama Motoru</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
          Eskort &amp; Escort İlanlarında Ara
        </h1>
        <p className="text-xs text-[#8b949e]">
          İsim, il, ilçe veya anahtar kelime girerek Türkiye genelindeki teyitli VIP profilleri anında bulun.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Örn: Beylikdüzü Merve, Kadıköy VIP eskort, İzmir escort..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 text-white text-xs sm:text-sm focus:outline-none transition-all placeholder:text-[#6e7681]"
          />
          <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-[#8b949e] hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* İl Seçimi */}
          <div className="relative">
            <select
              value={selectedIl}
              onChange={(e) => setSelectedIl(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="">🗺️ Tüm İller (81 İl)</option>
              {locations.map((loc) => (
                <option key={loc.ilSlug} value={loc.ilSlug}>
                  {loc.il} ({loc.toplamIlan || 0} İlan)
                </option>
              ))}
            </select>
          </div>

          {/* Vitrin Rozeti */}
          <div className="relative">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="all">⭐ Tüm Vitrin Kademeleri</option>
              <option value="vip">👑 VIP Vitrin</option>
              <option value="gold">🥇 Gold Vitrin</option>
              <option value="silver">🥈 Silver Standart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="font-heading font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Arama Sonuçları</span>
        </span>
        <span className="text-xs text-[#8b949e] font-mono">
          {filteredListings.length} İlan Bulundu
        </span>
      </div>

      {/* Results Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredListings.map((listing) => (
            <CompactListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center gap-3">
          <Search className="w-10 h-10 text-[#484f58]" />
          <h3 className="font-bold text-sm text-white font-heading">
            Aramanıza uygun ilan bulunamadı.
          </h3>
          <p className="text-xs text-[#8b949e] max-w-md">
            Farklı bir il seçebilir veya arama kelimenizi değiştirerek tekrar deneyebilirsiniz.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedIl('');
              setSelectedTier('all');
            }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}
