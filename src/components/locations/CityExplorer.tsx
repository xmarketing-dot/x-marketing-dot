'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  ChevronRight, 
  Crown, 
  Flame, 
  Sparkles, 
  ChevronDown, 
  Globe, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

interface CityExplorerProps {
  cityListingCounts: Record<string, number>;
  totalListingsCount: number;
}

export default function CityExplorer({ cityListingCounts, totalListingsCount }: CityExplorerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIlSlug, setSelectedIlSlug] = useState('istanbul');
  const [selectedIlceSlug, setSelectedIlceSlug] = useState('');
  const [onlyWithListings, setOnlyWithListings] = useState(true);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  const selectedProvince = useMemo(() => {
    return turkeyProvinces.find((p) => p.ilSlug === selectedIlSlug) || turkeyProvinces[0];
  }, [selectedIlSlug]);

  // Filter provinces based on search term and "only with listings" toggle
  const filteredProvinces = useMemo(() => {
    return turkeyProvinces.filter((prov) => {
      const count = cityListingCounts[prov.ilSlug] || 0;
      
      if (onlyWithListings && count === 0) {
        return false;
      }

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase().trim();
      const nameMatch = prov.il.toLowerCase().includes(term);
      const districtMatch = prov.ilceler.some((d) => d.ad.toLowerCase().includes(term));

      return nameMatch || districtMatch;
    });
  }, [searchTerm, onlyWithListings, cityListingCounts]);

  // Active cities with listings
  const activeCitiesCount = Object.keys(cityListingCounts).filter((k) => cityListingCounts[k] > 0).length;

  const handleQuickNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIlceSlug) {
      router.push(`/${selectedIlSlug}/${selectedIlceSlug}`);
    } else {
      router.push(`/${selectedIlSlug}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ── 1. İNTERAKTİF İL & İLÇE HIZLI SEÇİCİ KUTUSU ──────────────── */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border-2 border-amber-500/50 shadow-2xl flex flex-col gap-4">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-heading font-black text-sm">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Hızlı İl ve İlçe Seçimi</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase font-heading">
            81 İl &amp; 970+ İlçe
          </span>
        </div>

        <form onSubmit={handleQuickNavigate} className="flex flex-col sm:flex-row gap-2.5">
          {/* İl Seçimi */}
          <div className="flex-1">
            <select
              value={selectedIlSlug}
              onChange={(e) => {
                const newIl = e.target.value;
                setSelectedIlSlug(newIl);
                setSelectedIlceSlug('');
              }}
              className="w-full px-4 py-3 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-colors"
            >
              {turkeyProvinces.map((p) => {
                const count = cityListingCounts[p.ilSlug] || 0;
                return (
                  <option key={p.ilSlug} value={p.ilSlug}>
                    {p.il} {count > 0 ? `🔥 (${count} İlan)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* İlçe Seçimi */}
          <div className="flex-1">
            <select
              value={selectedIlceSlug}
              onChange={(e) => setSelectedIlceSlug(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="">Tüm İlçeler ({selectedProvince.il})</option>
              {selectedProvince.ilceler.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.ad}
                </option>
              ))}
            </select>
          </div>

          {/* Git Butonu */}
          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>İlanları Gör</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </form>
      </div>

      {/* ── 2. ARAMA VE FİLTRELEME ÇUBUĞU ──────────────── */}
      <div className="flex flex-col gap-3">
        
        <div className="flex items-center gap-2">
          {/* Canlı Arama Inputu */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Şehir veya ilçe ara (Örn: Beylikdüzü, Kadıköy, İzmir)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#161b22] border border-[#30363d] text-white text-xs placeholder-[#8b949e] focus:outline-none focus:border-amber-400 font-medium transition-colors"
            />
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Sadece İlanı Olanlar Filtresi Toggle */}
          <button
            type="button"
            onClick={() => setOnlyWithListings(!onlyWithListings)}
            className={`px-3.5 py-3 rounded-2xl border text-xs font-black font-heading flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
              onlyWithListings
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white'
            }`}
            title="Sadece Aktif İlanı Olan Şehirleri Göster"
          >
            <Flame className={`w-3.5 h-3.5 ${onlyWithListings ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sadece Aktif İlanlılar</span>
            <span className="sm:hidden">Aktifler</span>
          </button>
        </div>

        {/* Durum İstatistiği */}
        <div className="flex items-center justify-between text-xs text-[#8b949e] px-1 font-bold">
          <span>
            {onlyWithListings ? (
              <span className="text-amber-400 font-heading">
                🔥 {filteredProvinces.length} İlde Aktif İlan Bulunuyor
              </span>
            ) : (
              <span>81 İl Listeleniyor</span>
            )}
          </span>
          <span className="text-emerald-400">
            Toplam {totalListingsCount} Doğrulanmış İlan
          </span>
        </div>
      </div>

      {/* ── 3. ŞEHİRLER LİSTESİ VE İLÇE GENİŞLETME KARTLARI ──────────────── */}
      {filteredProvinces.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-2">
          <MapPin className="w-8 h-8 text-[#8b949e]" />
          <span className="font-bold text-sm text-white">Bu kriterde şehir bulunamadı</span>
          <p className="text-xs text-[#8b949e]">
            Arama filtrenizi temizleyerek veya "Sadece Aktif İlanlılar" filtresini kapatıp tüm 81 ili görebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setOnlyWithListings(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-heading"
          >
            Tüm 81 İli Göster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProvinces.map((prov) => {
            const count = cityListingCounts[prov.ilSlug] || 0;
            const hasListings = count > 0;
            const isExpanded = expandedCity === prov.ilSlug;

            return (
              <div
                key={prov.ilSlug}
                className={`rounded-3xl border transition-all shadow-xl overflow-hidden flex flex-col justify-between ${
                  hasListings
                    ? 'bg-gradient-to-br from-[#161b22] to-[#1c2128] border-amber-500/50 shadow-amber-500/5'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                {/* Şehir Başlık Kartı */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <Link
                    href={`/${prov.ilSlug}`}
                    className="flex items-center gap-3 flex-1 min-w-0 group"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md shrink-0 ${
                      hasListings 
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-500/30' 
                        : 'bg-[#21262d] text-[#8b949e]'
                    }`}>
                      {prov.il.charAt(0)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-base text-white font-heading group-hover:text-amber-400 transition-colors truncate">
                        {prov.il}
                      </span>
                      <span className="text-[11px] text-[#8b949e] font-medium">
                        {prov.ilceler.length} İlçe Rehberi
                      </span>
                    </div>
                  </Link>

                  {/* İlan Sayısı Rozeti & İlçe Açma Butonu */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/${prov.ilSlug}`}
                      className={`px-3 py-1 rounded-xl text-xs font-black font-heading flex items-center gap-1 transition-all ${
                        hasListings
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                          : 'bg-[#21262d] text-[#8b949e]'
                      }`}
                    >
                      {hasListings ? `🔥 ${count} İlan` : 'İncele'}
                    </Link>

                    {/* İlçe Açılır Menü Butonu */}
                    <button
                      type="button"
                      onClick={() => setExpandedCity(isExpanded ? null : prov.ilSlug)}
                      className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors"
                      title="İlçeleri Göster"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* ── İLÇELER AÇILIR LİSTESİ ──────────────── */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#30363d] bg-[#0d1117]/60 flex flex-col gap-2 animate-in fade-in duration-150">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-heading mt-1">
                      {prov.il} İlçeleri ({prov.ilceler.length}):
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {prov.ilceler.map((ilce) => (
                        <Link
                          key={ilce.slug}
                          href={`/${prov.ilSlug}/${ilce.slug}`}
                          className="px-2.5 py-1 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-bold border border-[#363b42] transition-all font-heading"
                        >
                          {ilce.ad}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
