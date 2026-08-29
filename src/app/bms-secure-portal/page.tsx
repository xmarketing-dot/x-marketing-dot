'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, 
  Zap, ArrowUpRight, Loader2, Sparkles, MapPin, Activity, Calendar, Share2,
  Clock, ShieldCheck, Flame, ExternalLink, Filter, ChevronDown, ChevronUp,
  Link2, TrendingUp, Crown, Tag, MousePointerClick
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all'); // all, today, yesterday, week, month
  const [searchTermFilter, setSearchTermFilter] = useState('');
  const [listingSearchTerm, setListingSearchTerm] = useState('');
  const [listingSortBy, setListingSortBy] = useState<'views' | 'whatsapp' | 'ctr' | 'shares' | 'facebook' | 'google' | 'x'>('views');
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.analytics) {
        setData(json.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const {
    totalPageviews = 0,
    uniqueVisitors = 0,
    activeUsers = 0,
    mobileCount = 0,
    desktopCount = 0,
    mobilePercentage = 80,
    desktopPercentage = 20,
    sources = { google: 0, whatsapp: 0, direct: 0, instagram: 0, x: 0, facebook: 0 },
    searchTerms = [],
    popularPages = [],
    topCities = [],
    eventCounts = { whatsappClicks: 0, shares: 0, categoryClicks: 0, cityFilters: 0, searches: 0 },
    topContactedListings = [],
    detailedListingReports = [],
    totalListingViews = 0,
    totalWhatsappClicks = 0,
    totalShares = 0,
    recentVisitors = [],
  } = data || {};

  const filteredListings = (detailedListingReports as any[])
    .filter((item: any) => {
      if (!listingSearchTerm) return true;
      const term = listingSearchTerm.toLowerCase();
      return (
        (item.baslik || '').toLowerCase().includes(term) ||
        (item.ilSlug || '').toLowerCase().includes(term) ||
        (item.ilceSlug || '').toLowerCase().includes(term) ||
        (item.rozet || '').toLowerCase().includes(term)
      );
    })
    .sort((a: any, b: any) => {
      if (listingSortBy === 'whatsapp') {
        return (b.whatsappClicks || 0) - (a.whatsappClicks || 0);
      }
      if (listingSortBy === 'ctr') {
        return parseFloat(b.conversionRate || '0') - parseFloat(a.conversionRate || '0');
      }
      if (listingSortBy === 'shares') {
        return (b.shares || 0) - (a.shares || 0);
      }
      if (listingSortBy === 'facebook') {
        return (b.referrers?.facebook || 0) - (a.referrers?.facebook || 0);
      }
      if (listingSortBy === 'google') {
        return (b.referrers?.google || 0) - (a.referrers?.google || 0);
      }
      if (listingSortBy === 'x') {
        return (b.referrers?.x || 0) - (a.referrers?.x || 0);
      }
      return (b.totalViews || 0) - (a.totalViews || 0);
    });

  const filteredVisitors = recentVisitors.filter((v: any) => {
    if (!searchTermFilter) return true;
    const term = searchTermFilter.toLowerCase();
    return (
      (v.ip || '').toLowerCase().includes(term) ||
      (v.city || '').toLowerCase().includes(term) ||
      (v.path || '').toLowerCase().includes(term) ||
      (v.referer || '').toLowerCase().includes(term) ||
      (v.searchKeyword || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-full text-left">
      
      {/* ── 1. HEADER BAR & ZAMAN FİLTRELERİ ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading tracking-tight">
              Trafik &amp; Ziyaretçi Analizleri
            </h1>
            <p className="text-xs text-[#8b949e]">
              Tekil ziyaretçiler, Google arama kelimeleri, WhatsApp paylaşımları ve detaylı tıklama haritası.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tarih Filtresi Butonları */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-xl p-1 shrink-0">
            {[
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: 'week', label: 'Son 1 Hafta' },
              { id: 'month', label: 'Son 30 Gün' },
              { id: 'all', label: 'Tüm Zamanlar' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  range === r.id 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Yenile Butonu */}
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg shrink-0"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. CANLI ANLIK KULLANICI BANNERI ──────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#161b22] to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
            <div className="relative bg-emerald-500 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center font-black">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-emerald-400 text-base sm:text-lg uppercase tracking-wider font-heading flex items-center gap-2">
              <span>Şu An Sitede {activeUsers} Tekil Ziyaretçi Aktif</span>
            </span>
            <span className="text-xs text-[#8b949e]">Son 5 dakika içerisinde sayfaları gezen gerçek kullanıcılar</span>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black font-heading">
          CANLI AKIŞ
        </span>
      </div>

      {/* ── 3. ANA METRİK KARTLARI (TEKİL KULLANICI, GÖRÜNTÜLEME, WHATSAPP, MOBİL) ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Tekil Ziyaretçi (Deduplicated) */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Tekil Ziyaretçi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-3xl text-white font-heading">{uniqueVisitors.toLocaleString()}</span>
            <span className="text-xs text-amber-400 font-bold">Tekil Kişi</span>
          </div>
          <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
            Toplam {totalPageviews.toLocaleString()} sayfa görüntülendi
          </span>
        </div>

        {/* WhatsApp İletişim Tıklamaları */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">WhatsApp Tıklamaları</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center">
              <OfficialWhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-3xl text-[#25D366] font-heading">{eventCounts.whatsappClicks.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold">Dönüşüm</span>
          </div>
          <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
            Genel toplam: {totalWhatsappClicks.toLocaleString()} WhatsApp iletişimi
          </span>
        </div>

        {/* Google Organik Arama Trafiği */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Google Organik Arama</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-3xl text-blue-400 font-heading">{sources.google.toLocaleString()}</span>
            <span className="text-xs text-blue-300 font-bold">Google Girişi</span>
          </div>
          <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
            {searchTerms.length} Farklı arama kelimesi tespit edildi
          </span>
        </div>

        {/* WhatsApp & Sosyal Paylaşım Trafiği */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">WhatsApp Gelen Trafik</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-3xl text-purple-400 font-heading">{sources.whatsapp.toLocaleString()}</span>
            <span className="text-xs text-purple-300 font-bold">Paylaşım Tıklaması</span>
          </div>
          <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
            WhatsApp üzerinden linke tıklayan kullanıcılar
          </span>
        </div>

      </div>

      {/* ── 3.5 ÖZEL SPONSORLU POPUP REKLAM PERFORMANSI ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1c1813] to-[#161b22] border-2 border-amber-500/50 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-base sm:text-lg text-white font-heading flex items-center gap-2">
                <span>👑 Özel Sponsorlu Popup Reklam Performansı</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase font-heading">
                  CANLI METRİKLER
                </span>
              </h2>
              <p className="text-xs text-[#8b949e]">
                Seçilen tarih aralığında popup reklamın kaç farklı kişiye gösterildiği, tıklanma sayısı ve WhatsApp dönüşüm oranı.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-amber-400 font-bold self-start sm:self-auto bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
            Dönüşüm Oranı: %{data?.specialAdStats?.ctr || '0.0'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Kaç Farklı Kişiye Gösterildi */}
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8b949e]">Tekil Kişilere Gösterim</span>
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-white font-heading">
                {(data?.specialAdStats?.uniqueVisitors || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-amber-400 font-bold">Farklı Kişi</span>
            </div>
            <span className="text-[10px] text-[#8b949e]">
              Toplam {(data?.specialAdStats?.impressions || 0).toLocaleString()} kez popup açıldı
            </span>
          </div>

          {/* Kaç Kere Tıklandı */}
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8b949e]">İlan Detayı Tıklanması</span>
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-blue-400 font-heading">
                {(data?.specialAdStats?.clicks || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-blue-300 font-bold">Tıklama</span>
            </div>
            <span className="text-[10px] text-[#8b949e]">
              Popup'tan ilanın profiline gidenler
            </span>
          </div>

          {/* Doğrudan WhatsApp Tıklaması */}
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8b949e]">Doğrudan WhatsApp İletişimi</span>
              <OfficialWhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-[#25D366] font-heading">
                {(data?.specialAdStats?.whatsappClicks || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">WhatsApp Mesajı</span>
            </div>
            <span className="text-[10px] text-[#8b949e]">
              Popup üzerinden hemen yaz butonuna basanlar
            </span>
          </div>

          {/* Performans (CTR) */}
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-purple-500/30 flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8b949e]">Reklam Performansı (CTR)</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-purple-400 font-heading">
                %{data?.specialAdStats?.ctr || '0.0'}
              </span>
              <span className="text-[11px] text-purple-300 font-bold">Dönüşüm</span>
            </div>
            <span className="text-[10px] text-[#8b949e]">
              Gösterim başına toplam tıklama oranı
            </span>
          </div>

        </div>
      </div>

      {/* ── 4. TRAFİK KAYNAKLARI DETAYLI DAĞILIMI ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">Trafik Kaynakları (Referrer Kanalları)</h2>
          </div>
          <span className="text-xs text-[#8b949e]">Kullanıcıların siteye geliş yolları</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Google Arama</span>
            <span className="font-black text-xl text-blue-400 font-heading">{sources.google}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">WhatsApp Paylaşım</span>
            <span className="font-black text-xl text-[#25D366] font-heading">{sources.whatsapp}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-sky-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Telegram Paylaşım</span>
            <span className="font-black text-xl text-sky-400 font-heading">{sources.telegram || 0}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Doğrudan (Direct)</span>
            <span className="font-black text-xl text-white font-heading">{sources.direct}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-pink-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Instagram</span>
            <span className="font-black text-xl text-pink-400 font-heading">{sources.instagram}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-cyan-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">X (Twitter)</span>
            <span className="font-black text-xl text-cyan-400 font-heading">{sources.x}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-indigo-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Facebook</span>
            <span className="font-black text-xl text-indigo-400 font-heading">{sources.facebook}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── 5. GOOGLE VE SİTE İÇİ ARAMA KELİMELERİ (NE ARAMIŞ?) ──────────────── */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white font-heading">
                Arama Terimleri (Ne Aramışlar?)
              </h2>
            </div>
            <span className="text-xs text-[#8b949e] font-mono">{searchTerms.length} Terim</span>
          </div>

          {searchTerms.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b949e]">
              Bu tarih aralığında henüz özel bir arama kelimesi kaydedilmedi.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {searchTerms.map((term: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#21262d] text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white truncate">
                      "{term._id}"
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs shrink-0 font-heading">
                    {term.count} Kez
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 6. EN ÇOK WHATSAPP TIKLAMASI & ETKİLEŞİM ALAN İLANLAR ──────────────── */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white font-heading">
                En Çok WhatsApp &amp; Etkileşim Alan İlanlar
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold">Top İlanlar</span>
          </div>

          {topContactedListings.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b949e]">
              Bu tarih aralığında henüz ilan etkileşim verisi bulunmuyor.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {topContactedListings.map((item: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white truncate font-heading">
                      {item._id || 'İsimsiz İlan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-black font-heading flex items-center gap-1">
                      <OfficialWhatsAppIcon className="w-3 h-3 fill-emerald-300" />
                      {item.whatsappClicks || 0}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-black font-heading flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {item.shares || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── 7. EN ÇOK GEZİLEN SAYFALAR & KALMA SÜRESİ ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">
              En Çok Ziyaret Edilen Sayfalar
            </h2>
          </div>
          <span className="text-xs text-[#8b949e]">Görüntülenme ve ortalama kalma süresi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularPages.map((p: any, idx: number) => {
            const avgSec = Math.round(p.avgDuration || 0);
            return (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400 font-bold truncate max-w-[200px]">
                    {p._id}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#21262d] text-white font-black text-xs font-heading">
                    {p.count} Hit
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
                  <span className="truncate">{p.pageTitle || 'Sayfa'}</span>
                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <Clock className="w-3 h-3" /> {avgSec}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7.5 HER İLAN İÇİN DETAYLI ANALİZ, TIKLAMA & REFERRER (NEREDEN GELDİ) RAPORU ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-amber-500/40 shadow-2xl flex flex-col gap-6">
        
        {/* Başlık ve İstatistik Özeti */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-lg sm:text-xl text-white font-heading tracking-tight flex items-center gap-2">
                <span>Her İlan İçin Detaylı Analiz &amp; Referrer (Trafik Kaynağı) Raporu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {filteredListings.length} İlan
                </span>
              </h2>
              <p className="text-xs text-[#8b949e]">
                Hangi ilan kaç kez görüntülendi, kaç kez WhatsApp'a tıklandı, Facebook, Google, Twitter veya nereden referans aldı ve gelen gerçek linkler.
              </p>
            </div>
          </div>

          {/* Hızlı Arama & Filtreleme Kutusu */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="İlan adı veya şehir ara..."
                value={listingSearchTerm}
                onChange={(e) => setListingSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Sıralama Butonları */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[#8b949e] font-bold shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Sırala:
          </span>
          {[
            { id: 'views', label: '👁️ En Çok Görüntülenen' },
            { id: 'whatsapp', label: '💬 En Çok WhatsApp Tıklaması' },
            { id: 'ctr', label: '🎯 En Yüksek Dönüşüm (%)' },
            { id: 'facebook', label: '🟦 Facebook Trafiği' },
            { id: 'x', label: '🐦 X (Twitter) Trafiği' },
            { id: 'google', label: '🔍 Google Trafiği' },
            { id: 'shares', label: '🔗 En Çok Paylaşılan' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setListingSortBy(btn.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                listingSortBy === btn.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-[#0d1117] text-[#8b949e] hover:text-white border border-[#30363d]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* İlan Detay Tablosu */}
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8b949e] bg-[#0d1117] rounded-2xl border border-[#30363d]">
            Arama kriterine uygun ilan bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#30363d] bg-[#0d1117]">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-[#8b949e] font-heading font-black text-[11px]">
                  <th className="py-3 px-4">İLAN BİLGİSİ</th>
                  <th className="py-3 px-3">GÖRÜNTÜLENME</th>
                  <th className="py-3 px-3">WHATSAPP &amp; DÖNÜŞÜM</th>
                  <th className="py-3 px-3">PAYLAŞIM</th>
                  <th className="py-3 px-3">TRAFİK KAYNAKLARI (REFERRER)</th>
                  <th className="py-3 px-4 text-right">DETAY &amp; LİNK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {filteredListings.map((item: any) => {
                  const isExpanded = expandedListingId === item.id;
                  const totalReferralTraffic = 
                    (item.referrers?.google || 0) +
                    (item.referrers?.facebook || 0) +
                    (item.referrers?.x || 0) +
                    (item.referrers?.whatsapp || 0) +
                    (item.referrers?.instagram || 0) +
                    (item.referrers?.direct || 0);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-[#21262d]/50 transition-colors">
                        
                        {/* İlan Bilgisi */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                              <Image
                                src={item.fotoUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                                alt={item.baslik}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[240px]">
                              <span className="font-black text-xs text-white truncate font-heading hover:text-amber-400 transition-colors">
                                {item.baslik}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                                  {item.ilSlug?.toUpperCase() || 'TR'} {item.ilceSlug ? `• ${item.ilceSlug?.toUpperCase()}` : ''}
                                </span>
                                {item.rozet && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                                    {item.rozet?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Görüntülenme */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-white font-heading">
                              {(item.totalViews || 0).toLocaleString()} Kez
                            </span>
                            <span className="text-[10px] text-[#8b949e]">
                              {item.uniqueVisitors > 0 ? `${item.uniqueVisitors} tekil ziyaretçi` : 'Tüm zamanlar'}
                            </span>
                          </div>
                        </td>

                        {/* WhatsApp Tıklama & CTR */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-sm text-emerald-400 font-heading flex items-center gap-1">
                              <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                              {(item.whatsappClicks || 0).toLocaleString()} Tıklama
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-black text-[10px] w-fit font-mono">
                              %{item.conversionRate} Dönüşüm
                            </span>
                          </div>
                        </td>

                        {/* Paylaşım */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 text-slate-300 font-bold">
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{item.shares || 0}</span>
                          </div>
                        </td>

                        {/* Referrer Rozetleri */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                            {item.referrers?.facebook > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono" title="Facebook'tan gelen ziyaretçiler">
                                🟦 FB: {item.referrers.facebook}
                              </span>
                            )}
                            {item.referrers?.x > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono" title="X / Twitter'dan gelenler">
                                🐦 X: {item.referrers.x}
                              </span>
                            )}
                            {item.referrers?.google > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono" title="Google aramalarından gelenler">
                                🔍 Google: {item.referrers.google}
                              </span>
                            )}
                            {item.referrers?.whatsapp > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono" title="WhatsApp bağlantılarından gelenler">
                                🟢 WA: {item.referrers.whatsapp}
                              </span>
                            )}
                            {item.referrers?.instagram > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-bold font-mono" title="Instagram'dan gelenler">
                                📸 IG: {item.referrers.instagram}
                              </span>
                            )}
                            {item.referrers?.direct > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-[#21262d] text-[#8b949e] border border-[#30363d] text-[10px] font-bold font-mono" title="Doğrudan veya yer imlerinden girenler">
                                🔗 Doğrudan: {item.referrers.direct}
                              </span>
                            )}
                            {totalReferralTraffic === 0 && (
                              <span className="text-[10px] text-[#484f58] italic font-mono">
                                Henüz referans trafiği yok
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Detay & Link */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedListingId(isExpanded ? null : item.id)}
                              className={`p-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                                isExpanded
                                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                                  : 'bg-[#21262d] text-[#8b949e] hover:text-white border-[#30363d]'
                              }`}
                              title="Trafik ve Referrer Linklerini Gör"
                            >
                              <span>Referrer</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <Link
                              href={`/ilan/${item.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl bg-[#21262d] hover:bg-amber-500 text-[#8b949e] hover:text-slate-950 transition-colors"
                              title="İlanı Sitede Aç"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>

                      </tr>

                      {/* Akordeon Çekmece: Gelen Tam Referrer Linkleri */}
                      {isExpanded && (
                        <tr className="bg-[#0d1117] border-b border-[#30363d]">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                                  <Link2 className="w-4 h-4" />
                                  <span>"{item.baslik}" — Gerçek Referrer (Gelen Bağlantı) Günlüğü</span>
                                </span>
                                <span className="text-[11px] text-[#8b949e] font-mono">
                                  Son Ziyaret: {item.lastVisitedAt ? new Date(item.lastVisitedAt).toLocaleString('tr-TR') : 'Kayıtlı veri yok'}
                                </span>
                              </div>

                              {item.rawReferrers && item.rawReferrers.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  <span className="text-[11px] text-[#8b949e]">Bu ilana dışarıdan yönlendiren tam web adresleri (Referrer Headers):</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {item.rawReferrers.map((refUrl: string, refIdx: number) => (
                                      <div key={refIdx} className="p-2 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-2">
                                        <span className="font-mono text-[11px] text-amber-300 truncate max-w-[320px]">
                                          {refUrl}
                                        </span>
                                        <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono shrink-0">
                                          Kaynak
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-[#8b949e] italic">
                                  Bu ilan için henüz dış kaynaklı HTTP referer adresi kaydedilmedi (kullanıcılar doğrudan linke veya site içi aramadan girmiş).
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── 8. CANLI VE DETAYLI ZİYARETÇİ LOGLARI (SON 100 İSTEK) ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">
              Canlı Ziyaretçi Akış Günlüğü (Son 100 İstek)
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="IP, Şehir, Sayfa veya Referer ara..."
              value={searchTermFilter}
              onChange={(e) => setSearchTermFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#30363d] text-[#8b949e] font-heading font-black">
                <th className="py-2.5 px-3">IP / ŞEHİR</th>
                <th className="py-2.5 px-3">GEZİLEN SAYFA</th>
                <th className="py-2.5 px-3">TRAFİK KAYNAĞI</th>
                <th className="py-2.5 px-3">ARAMA KELİMESİ</th>
                <th className="py-2.5 px-3">CİHAZ / TARAYICI</th>
                <th className="py-2.5 px-3">SÜRE</th>
                <th className="py-2.5 px-3">ZAMAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filteredVisitors.slice(0, 50).map((v: any) => {
                const isGoogle = v.refererSource === 'google';
                const isWa = v.refererSource === 'whatsapp';

                return (
                  <tr key={v._id} className="hover:bg-[#21262d]/50 transition-colors">
                    
                    {/* IP & Şehir */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-white text-[11px]">{v.ip || 'Anonim'}</span>
                        <span className="text-[10px] text-amber-400 font-medium">{v.city || 'İstanbul'}</span>
                      </div>
                    </td>

                    {/* Gezilen Sayfa */}
                    <td className="py-3 px-3 font-mono text-white text-[11px] max-w-[180px] truncate">
                      {v.path}
                    </td>

                    {/* Trafik Kaynağı */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-heading ${
                        isGoogle ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                        isWa ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {v.refererSource?.toUpperCase() || 'DIRECT'}
                      </span>
                    </td>

                    {/* Arama Kelimesi */}
                    <td className="py-3 px-3 text-[11px]">
                      {v.searchKeyword ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                          "{v.searchKeyword}"
                        </span>
                      ) : (
                        <span className="text-[#484f58]">—</span>
                      )}
                    </td>

                    {/* Cihaz & Tarayıcı */}
                    <td className="py-3 px-3 text-[11px] text-[#8b949e]">
                      <span>{v.device === 'mobile' ? '📱 Mobil' : '💻 Masaüstü'}</span>
                      <span className="text-[10px] block text-[#484f58]">{v.browser} / {v.os}</span>
                    </td>

                    {/* Sayfada Kalma Süresi */}
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold text-[11px]">
                      {v.durationSeconds > 0 ? `${v.durationSeconds}s` : '<15s'}
                    </td>

                    {/* Zaman */}
                    <td className="py-3 px-3 text-[10px] text-[#8b949e] font-mono whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
