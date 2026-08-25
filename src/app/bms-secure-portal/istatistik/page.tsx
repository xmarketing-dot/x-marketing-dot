'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Loader2, RefreshCw, Smartphone, Monitor, Globe, Search, ArrowUpRight, Calendar, ExternalLink, MapPin
} from 'lucide-react';

export default function IstatistikPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedAnalytics();
  }, []);

  const fetchDetailedAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/detailed');
      const json = await res.json();
      if (json.visitors) {
        setVisitors(json.visitors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && visitors.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Summary Metrics
  const total = visitors.length;
  const fromGoogle = visitors.filter(v => v.referer === 'Google Search').length;
  const googlePercentage = total > 0 ? Math.round((fromGoogle / total) * 100) : 0;
  
  const fromDirect = visitors.filter(v => v.referer === 'Direct').length;
  
  const mobileCount = visitors.filter(v => v.device === 'mobile').length;
  const desktopCount = visitors.filter(v => v.device === 'desktop').length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Detaylı İstatistikler</h1>
            <p className="text-xs text-[#8b949e]">Son 500 ziyaretçinin tam kaynağı, tarih ve detaylı cihaz verileri.</p>
          </div>
        </div>

        <button
          onClick={fetchDetailedAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Google Traffic */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Google'dan Gelenler</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{fromGoogle}</span>
          <span className="text-[11px] text-emerald-400 font-bold">Son 500 kişide %{googlePercentage} organik</span>
        </div>

        {/* Direct Traffic */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Doğrudan Girişler</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{fromDirect}</span>
          <span className="text-[11px] text-[#8b949e]">Direkt link yazarak veya yer imlerinden</span>
        </div>

        {/* Mobile Users */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Mobil Trafik</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{mobileCount}</span>
          <span className="text-[11px] text-purple-400 font-bold">Telefondan Girenler</span>
        </div>

        {/* Desktop Users */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Masaüstü Trafik</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{desktopCount}</span>
          <span className="text-[11px] text-cyan-400 font-bold">Bilgisayardan Girenler</span>
        </div>
      </div>

      {/* Detailed Log Table */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4 overflow-hidden">
        <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-amber-400" />
          <span>Tüm Ziyaretçi Logları (Son 500)</span>
        </h2>

        <div className="overflow-x-auto w-full pb-4">
          <table className="w-full text-left text-sm text-[#8b949e]">
            <thead className="text-xs text-[#8b949e] uppercase bg-[#0d1117] border-y border-[#30363d]">
              <tr>
                <th scope="col" className="px-4 py-3 font-heading font-black">Tarih / Saat</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Kaynak (Referer)</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Ziyaret Edilen Sayfa</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Cihaz</th>
                <th scope="col" className="px-4 py-3 font-heading font-black">Konum / IP</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id} className="border-b border-[#30363d]/50 hover:bg-[#21262d] transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-[#c9d1d9] whitespace-nowrap">
                    {new Date(v.createdAt).toLocaleDateString('tr-TR')} <br/>
                    <span className="text-amber-400">{new Date(v.createdAt).toLocaleTimeString('tr-TR')}</span>
                  </td>
                  <td className="px-4 py-4 font-bold">
                    {v.referer === 'Google Search' ? (
                      <span className="text-emerald-400 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/> Google</span>
                    ) : v.referer === 'Direct' ? (
                      <span className="text-[#8b949e]">Doğrudan (Direkt)</span>
                    ) : (
                      <span className="text-cyan-400">{v.referer}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-white max-w-[200px] truncate" title={v.path}>
                    {v.path}
                  </td>
                  <td className="px-4 py-4">
                    {v.device === 'mobile' ? (
                      <span className="text-purple-400 flex items-center gap-1"><Smartphone className="w-4 h-4"/> Mobil</span>
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1"><Monitor className="w-4 h-4"/> Masaüstü</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">
                    <span className="text-white flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400"/> {v.city || 'İstanbul'}</span>
                    <span className="text-[#8b949e]">{v.ip || 'Gizli'}</span>
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
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
