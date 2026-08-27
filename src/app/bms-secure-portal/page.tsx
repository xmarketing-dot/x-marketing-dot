'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, 
  Zap, ArrowUpRight, Loader2, Sparkles, MapPin, Activity, Calendar, Share2,
  Clock, ShieldCheck, Flame, ExternalLink, Filter
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all'); // all, today, yesterday, week, month
  const [searchTermFilter, setSearchTermFilter] = useState('');

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
    totalListingViews = 0,
    totalWhatsappClicks = 0,
    totalShares = 0,
    recentVisitors = [],
  } = data || {};

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

      {/* ── 4. TRAFİK KAYNAKLARI DETAYLI DAĞILIMI ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">Trafik Kaynakları (Referrer Kanalları)</h2>
          </div>
          <span className="text-xs text-[#8b949e]">Kullanıcıların siteye geliş yolları</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">Google Arama</span>
            <span className="font-black text-xl text-blue-400 font-heading">{sources.google}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8b949e]">WhatsApp Paylaşım</span>
            <span className="font-black text-xl text-[#25D366] font-heading">{sources.whatsapp}</span>
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
