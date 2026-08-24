'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, ShieldCheck, Zap, ArrowUpRight, Loader2, Sparkles, MapPin } from 'lucide-react';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
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
    totalListingViews = 0,
    totalWhatsappClicks = 0,
    recentVisitors = [],
  } = data || {};

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Canlı Trafik & Ziyaretçi Analizleri</h1>
            <p className="text-xs text-[#8b949e]">Gerçek zamanlı ziyaretçi cihazları, Google arama oranları ve şehir verileri.</p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Verileri Yenile</span>
        </button>
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
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> %100 Gerçek Zamanlı Takip
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
          <span className="text-[11px] text-[#8b949e]">📱 {mobileCount} Mobil / 💻 {desktopCount} Masaüstü</span>
        </div>

        {/* Google Search Traffic */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Google Arama Trafiği</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{googleCount} Ziyaret</span>
          <span className="text-[11px] text-emerald-400 font-bold">SEO Optimizasyonu Aktif</span>
        </div>

        {/* Total Listing Views & WhatsApp Clicks */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">İlan Görüntülenme</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <span className="font-black text-3xl text-white font-heading">{totalListingViews.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {totalWhatsappClicks} WhatsApp Tıklaması
          </span>
        </div>
      </div>

      {/* Device Breakdown Progress Bar */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Cihaz Dağılımı (Mobil vs Masaüstü)</span>
        </h2>

        <div className="w-full h-4 rounded-full bg-[#21262d] overflow-hidden flex border border-[#363b42]">
          <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all" style={{ width: `${mobilePercentage}%` }}></div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 h-full transition-all" style={{ width: `${desktopPercentage}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-amber-400">
            <Smartphone className="w-4 h-4" />
            <span>Mobil Kullanıcılar: %{mobilePercentage} ({mobileCount} Kişi)</span>
          </div>

          <div className="flex items-center gap-2 text-purple-300">
            <Monitor className="w-4 h-4" />
            <span>Masaüstü Kullanıcılar: %{desktopPercentage} ({desktopCount} Kişi)</span>
          </div>
        </div>
      </div>

      {/* Recent Live Visitors Table */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Son Canlı Ziyaretçiler Log Akışı</span>
          </h2>
          <span className="text-xs text-[#8b949e] font-bold">Son 20 Anlık Kayıt</span>
        </div>

        {recentVisitors.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8b949e]">
            Henüz canlı ziyaretçi kaydı oluşmadı.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentVisitors.map((v: any) => (
              <div key={v._id} className="p-3.5 rounded-2xl bg-[#21262d] border border-[#363b42] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl font-bold ${
                    v.device === 'mobile' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {v.device === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {v.city || 'İstanbul'}
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono">{v.path}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#161b22] text-[#8b949e] font-mono text-[10px]">
                    {v.referer}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">
                    {new Date(v.createdAt).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
