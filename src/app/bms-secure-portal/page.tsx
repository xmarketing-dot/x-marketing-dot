'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, 
  Zap, ArrowUpRight, Loader2, Sparkles, MapPin, Activity, Calendar, Link as LinkIcon 
} from 'lucide-react';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all'); // all, today, yesterday, week

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
    totalVisitors = 0,
    mobileCount = 0,
    desktopCount = 0,
    mobilePercentage = 75,
    desktopPercentage = 25,
    googleCount = 0,
    directCount = 0,
    activeUsers = 0,
    popularPages = [],
    totalListingViews = 0,
    totalWhatsappClicks = 0,
    recentVisitors = [],
  } = data || {};

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading tracking-tight">Trafik & Ziyaretçi Analizleri</h1>
            <p className="text-xs text-[#8b949e]">Gerçek zamanlı trafik, popüler sayfalar ve Google organik verileri.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filters */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-xl p-1 shrink-0">
            {[
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: 'week', label: 'Son 1 Hafta' },
              { id: 'all', label: 'Tüm Zamanlar' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  range === r.id 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Users Banner */}
      <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
            <div className="relative bg-emerald-500 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 font-black" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-emerald-400 text-lg uppercase tracking-wider font-heading">
              Şu An Sitede {activeUsers} Kişi Var
            </span>
            <span className="text-xs text-[#8b949e]">Son 5 dakika içerisinde aktif olan ziyaretçiler</span>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Visitors */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Toplam Ziyaretçi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{totalVisitors.toLocaleString()}</span>
          <span className="text-[11px] text-[#8b949e] flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Seçilen Tarih Aralığı
          </span>
        </div>

        {/* Mobile vs Desktop Split */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Mobil Trafik Oranı</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">%{mobilePercentage} Mobil</span>
          <span className="text-[11px] text-[#8b949e]">📱 {mobileCount} / 💻 {desktopCount}</span>
        </div>

        {/* Google Search Traffic */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Google Aramaları</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{googleCount}</span>
          <span className="text-[11px] text-emerald-400 font-bold">SEO Organik Ziyaretler</span>
        </div>

        {/* Total Listing Views & WhatsApp Clicks */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">İlan & WhatsApp</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{totalListingViews.toLocaleString()}</span>
          <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {totalWhatsappClicks} WhatsApp Tıklaması
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages Table */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-amber-400" />
            <span>En Çok Ziyaret Edilen Sayfalar</span>
          </h2>

          <div className="flex flex-col gap-3">
            {popularPages.map((page: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#21262d] border border-[#363b42]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xs">
                    #{idx + 1}
                  </div>
                  <span className="text-sm font-bold text-white truncate" title={page._id}>
                    {page._id === '/' ? '🏠 Anasayfa' : page._id}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <Eye className="w-4 h-4 text-[#8b949e]" />
                  <span className="font-black text-amber-400">{page.count}</span>
                </div>
              </div>
            ))}
            {popularPages.length === 0 && (
              <div className="text-sm text-[#8b949e] py-4 text-center">Bu tarih aralığında veri bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Traffic Sources & Device Progress */}
        <div className="flex flex-col gap-8">
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Cihaz Dağılımı (Mobil vs Masaüstü)</span>
            </h2>

            <div className="w-full h-5 rounded-full bg-[#21262d] overflow-hidden flex border border-[#363b42]">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all" style={{ width: `${mobilePercentage}%` }}></div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 h-full transition-all" style={{ width: `${desktopPercentage}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-amber-400">
                <Smartphone className="w-4 h-4" />
                <span>Mobil: %{mobilePercentage}</span>
              </div>

              <div className="flex items-center gap-2 text-purple-300">
                <Monitor className="w-4 h-4" />
                <span>Masaüstü: %{desktopPercentage}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-amber-400" />
              <span>Trafik Kaynakları (Referer)</span>
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Search className="w-4 h-4" /> Google Aramaları
                </div>
                <span className="font-black text-emerald-400">{googleCount} Ziyaret</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#21262d] border border-[#363b42]">
                <div className="flex items-center gap-2 text-[#8b949e] font-bold">
                  <Globe className="w-4 h-4" /> Doğrudan (Direkt / Link Tıklama)
                </div>
                <span className="font-black text-white">{directCount} Ziyaret</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Live Visitors Table */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4 mb-2">
          <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Detaylı Ziyaretçi Log Akışı (Son 100)</span>
          </h2>
        </div>

        <div className="overflow-x-auto w-full pb-4">
          <table className="w-full text-left text-sm text-[#8b949e]">
            <thead className="text-xs text-[#8b949e] uppercase bg-[#0d1117] border-y border-[#30363d]">
              <tr>
                <th scope="col" className="px-4 py-3 font-heading font-black">Tarih / Saat</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Kaynak (Referer)</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Sayfa</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Cihaz</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Konum / IP</th>
              </tr>
            </thead>
            <tbody>
              {recentVisitors.map((v: any) => (
                <tr key={v._id} className="border-b border-[#30363d]/50 hover:bg-[#21262d] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#c9d1d9] whitespace-nowrap">
                    {new Date(v.createdAt).toLocaleDateString('tr-TR')} <br/>
                    <span className="text-amber-400">{new Date(v.createdAt).toLocaleTimeString('tr-TR')}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {v.referer === 'Google Search' ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/> Google</span>
                    ) : v.referer === 'Direct' ? (
                      <span className="text-[#8b949e]">Doğrudan</span>
                    ) : (
                      <span className="text-cyan-400 text-xs truncate max-w-[150px] inline-block" title={v.referer}>{v.referer}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white max-w-[200px] truncate" title={v.path}>
                    {v.path}
                  </td>
                  <td className="px-4 py-3">
                    {v.device === 'mobile' ? (
                      <span className="text-purple-400 flex items-center gap-1"><Smartphone className="w-4 h-4"/> Mobil</span>
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1"><Monitor className="w-4 h-4"/> Masaüstü</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="text-white flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400"/> {v.city || 'İstanbul'}</span>
                    <span className="text-[#8b949e] text-[10px]">{v.ip || 'Gizli'}</span>
                  </td>
                </tr>
              ))}
              {recentVisitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

