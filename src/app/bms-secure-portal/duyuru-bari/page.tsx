'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Eye,
  MousePointerClick,
  XCircle,
  TrendingUp,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  Layers,
  Radio,
  Sliders,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

interface LogItem {
  visitorId?: string;
  ip?: string;
  eventType: 'view' | 'click' | 'dismiss';
  city?: string;
  device?: string;
  userAgent?: string;
  createdAt: string;
}

interface AnnouncementState {
  isActive: boolean;
  campaignId: string;
  title: string;
  description?: string;
  badgeText: string;
  buttonText: string;
  targetUrl: string;
  openInNewTab: boolean;
  stylePreset: 'fire' | 'emerald' | 'fuchsia' | 'cyber';
  viewsCount: number;
  clicksCount: number;
  dismissCount: number;
  uniqueViewsCount: number;
  uniqueClicksCount: number;
  ctr: string;
  recentLogs: LogItem[];
}

export default function AnnouncementBarAdminPage() {
  const [data, setData] = useState<AnnouncementState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [stylePreset, setStylePreset] = useState<'fire' | 'emerald' | 'fuchsia' | 'cyber'>('fire');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcement-bar', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIsActive(json.data.isActive);
        setTitle(json.data.title || '');
        setDescription(json.data.description || '');
        setBadgeText(json.data.badgeText || '');
        setButtonText(json.data.buttonText || '');
        setTargetUrl(json.data.targetUrl || '');
        setOpenInNewTab(json.data.openInNewTab ?? true);
        setStylePreset(json.data.stylePreset || 'fire');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Veriler alınamadı: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (forceActiveState?: boolean) => {
    try {
      setSaving(true);
      setFeedback(null);
      const activeToSave = typeof forceActiveState === 'boolean' ? forceActiveState : isActive;

      const res = await fetch('/api/admin/announcement-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: activeToSave,
          title,
          description,
          badgeText,
          buttonText,
          targetUrl,
          openInNewTab,
          stylePreset,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIsActive(json.data.isActive);
        setFeedback({ type: 'success', text: json.message || 'Ayarlar başarıyla kaydedildi!' });
      } else {
        setFeedback({ type: 'error', text: json.error || 'Kaydetme başarısız oldu' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Hata: ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleResetCampaign = async () => {
    if (!window.confirm("Bu işlem tüm sayaçları sıfırlayacak ve bildirimi daha önce görmüş/kapatmış olan tüm kullanıcılara tekrar TEK SEFERLİK gösterilecek şekilde yeni kampanya kimliği üretecektir. Devam etmek istiyor musunuz?")) {
      return;
    }

    try {
      setResetting(true);
      setFeedback(null);
      const res = await fetch('/api/admin/announcement-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_campaign' }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIsActive(json.data.isActive);
        setFeedback({ type: 'success', text: json.message || 'Kampanya sıfırlandı!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Sıfırlama hatası: ' + err.message });
    } finally {
      setResetting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const presetClasses = {
    fire: 'from-amber-600 via-rose-600 to-red-700 border-amber-400/50 shadow-red-900/40 text-amber-50',
    fuchsia: 'from-fuchsia-700 via-purple-700 to-pink-700 border-fuchsia-400/50 shadow-fuchsia-900/40 text-fuchsia-50',
    emerald: 'from-emerald-600 via-teal-700 to-cyan-800 border-emerald-400/50 shadow-emerald-900/40 text-emerald-50',
    cyber: 'from-indigo-700 via-violet-800 to-blue-900 border-indigo-400/50 shadow-indigo-900/40 text-indigo-50',
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-black text-white flex items-center gap-2">
                  <span>Üst Duyuru &amp; Bildirim Barı</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    Tek Seferlik Gösterim
                  </span>
                </h1>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Tüm ziyaretçilerin göreceği tek seferlik duyuru barını yönetin, anlık görüntülenme ve tıklanma istatistiklerini takip edin.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Kaydet ve Güncelle'}</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── KPI STATS CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Durum */}
          <div className={`p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
            isActive
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              : 'bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/5'
          }`}>
            <div className="flex items-center justify-between text-xs text-[#8b949e] font-bold">
              <span>Yayın Durumu</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-lg font-heading font-black ${isActive ? 'text-emerald-300' : 'text-red-400'}`}>
                {isActive ? 'YAYINDA (AÇIK)' : 'KAPALI (PASİF)'}
              </span>
              <button
                onClick={() => {
                  const next = !isActive;
                  setIsActive(next);
                  handleSave(next);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  isActive ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isActive ? 'Kapat' : 'Yayına Al'}
              </button>
            </div>
          </div>

          {/* 2. Kaç Kişi Gördü */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#8b949e] font-bold">
              <span>Kaç Kişi Gördü</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-heading font-black text-white font-mono">
                {data?.uniqueViewsCount ?? 0}
              </div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">
                Toplam: {data?.viewsCount ?? 0} gösterim
              </div>
            </div>
          </div>

          {/* 3. Kaç Kişi Tıkladı */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#8b949e] font-bold">
              <span>Kaç Kişi Tıkladı</span>
              <MousePointerClick className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-heading font-black text-amber-300 font-mono">
                {data?.uniqueClicksCount ?? 0}
              </div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">
                Toplam: {data?.clicksCount ?? 0} tık
              </div>
            </div>
          </div>

          {/* 4. Tıklanma Oranı (CTR) */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#8b949e] font-bold">
              <span>Tıklanma (CTR)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-heading font-black text-emerald-300 font-mono">
                %{data?.ctr ?? '0.0'}
              </div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">
                Etkileşim verimi
              </div>
            </div>
          </div>

          {/* 5. Kaç Kişi Kapattı */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#8b949e] font-bold">
              <span>Kapatma (Dismiss)</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-heading font-black text-rose-400 font-mono">
                {data?.dismissCount ?? 0}
              </div>
              <div className="text-[10px] text-[#8b949e] mt-0.5">
                'X' butonuna basanlar
              </div>
            </div>
          </div>
        </div>

        {/* ── CANLI ÖNİZLEME (LIVE PREVIEW) ─────────────────── */}
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8b949e]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Canlı Önizleme (Kullanıcıların Göreceği Hali)</span>
            </div>
            <span className="text-[11px] font-mono text-[#8b949e]">
              Tema: <span className="text-amber-400 uppercase font-bold">{stylePreset}</span>
            </span>
          </div>

          <div className="p-1 rounded-2xl bg-[#0d1117] border border-[#21262d] overflow-hidden">
            <div className={`w-full bg-gradient-to-r ${presetClasses[stylePreset]} p-3 rounded-xl shadow-lg transition-all`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/30 border border-white/20 font-black text-[10px] tracking-wider uppercase text-white shadow-inner shrink-0">
                    <Flame className="w-3 h-3 text-amber-300 animate-bounce" />
                    <span>{badgeText || '🚀 YENİ AĞ'}</span>
                  </span>

                  <span className="font-heading font-black tracking-tight text-white drop-shadow-sm">
                    {title || 'Türkiyenin en büyük eskort sitesi açıldı !'}
                  </span>

                  {description && (
                    <span className="hidden md:inline text-white/85 text-xs font-medium">
                      — {description}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-heading font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                    <span>{buttonText || 'Hemen İncele →'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>

                  <span className="p-1 rounded-lg bg-black/20 text-white/80">
                    <X className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FORM & KONTROL MERKEZİ ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Kolon: Metin ve Link Düzenleme */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-5">
            <h2 className="text-base font-heading font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Duyuru İçerik &amp; Yönlendirme Ayarları</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Başlık */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e]">
                  Duyuru Başlığı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Türkiyenin en büyük eskort sitesi açıldı !"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-sm font-bold placeholder-[#484f58]"
                />
              </div>

              {/* Açıklama */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e]">
                  Alt Açıklama (Masaüstünde Gözükür)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="escturkiye.devs.surf yayında! Tüm illerdeki doğrulanmış VIP ilanları hemen keşfedin."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-sm placeholder-[#484f58]"
                />
              </div>

              {/* Rozet Metni */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e]">
                  Sol Rozet Metni
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="🚀 YENİ AĞ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-sm font-bold placeholder-[#484f58]"
                />
              </div>

              {/* Buton Metni */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e]">
                  Aksiyon Butonu Metni
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Hemen İncele →"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-sm font-bold placeholder-[#484f58]"
                />
              </div>

              {/* Hedef URL */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e]">
                  Hedef Yönlendirme URL'si (Tıklanınca Açılacak Adres) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://escturkiye.devs.surf"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-amber-300 font-mono text-sm font-bold placeholder-[#484f58]"
                />
              </div>
            </div>

            {/* Tema Seçici */}
            <div className="space-y-2 pt-2 border-t border-[#21262d]">
              <label className="text-xs font-bold text-[#8b949e]">
                Renk &amp; Parlama Teması
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'fire', label: '🔥 Ateş Kırmızı', class: 'from-amber-600 to-red-700' },
                  { id: 'fuchsia', label: '🔮 Siber Fuşya', class: 'from-fuchsia-700 to-pink-700' },
                  { id: 'emerald', label: '🌿 Zümrüt Yeşil', class: 'from-emerald-600 to-teal-800' },
                  { id: 'cyber', label: '⚡ Derin Mavi', class: 'from-indigo-700 to-blue-900' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStylePreset(item.id as any)}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                      stylePreset === item.id
                        ? 'bg-gradient-to-r ' + item.class + ' text-white border-white/60 shadow-md scale-[1.02]'
                        : 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d] hover:border-[#8b949e]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {stylePreset === item.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#21262d]">
              <label className="flex items-center gap-2 text-xs font-bold text-[#c9d1d9] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-amber-500 focus:ring-0"
                />
                <span>Yeni Sekmede Aç (`target="_blank"`)</span>
              </label>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </div>

          {/* Sağ Kolon: Kampanya Sıfırlama & Bilgilendirme */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-base font-heading font-black text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Yeniden Gösterim &amp; Sıfırlama</span>
              </h2>

              <div className="p-4 rounded-xl bg-[#0d1117] border border-[#21262d] space-y-2 text-xs text-[#8b949e]">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Tek Seferlik Gösterim Mantığı:</span>
                </div>
                <p>
                  Kullanıcı siteye girdiğinde duyuru barını görür. Butona tıklar veya 'X' ile kapatırsa tarayıcısına (localStorage) kayıt atılır ve bir daha aynı kullanıcıyı rahatsız etmez.
                </p>
                <p className="pt-2 border-t border-[#21262d]">
                  Mevcut Kampanya ID: <span className="font-mono text-amber-300 font-bold">{data?.campaignId || 'camp_v1'}</span>
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-300">
                  Tüm Kullanıcılara Tekrar Göstermek İçin:
                </span>
                <p className="text-[11px] text-[#8b949e]">
                  Duyuru metnini değiştirdiğinizde veya yeni bir duyuru yapmak istediğinizde aşağıdaki butona basın. Tüm eski ziyaretçilerin 'gördüm' durumu sıfırlanır ve herkes barı tekrar 1 kez görür.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetCampaign}
              disabled={resetting}
              className="w-full p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 font-heading font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Sıfırlanıyor...' : '🔄 Kampanyayı Sıfırla (Herkese Tekrar Göster)'}</span>
            </button>
          </div>

        </div>

        {/* ── CANLI ETKİLEŞİM VE LOG TABLOSU ─────────────────── */}
        <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-heading font-black text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                <span>Son Ziyaretçi Etkileşim Akışı</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Duyuru barını gören, tıklayan ve kapatan son 250 ziyaretçinin anlık logları
              </p>
            </div>
            <span className="text-xs font-mono text-[#8b949e]">
              Toplam Kayıt: <span className="text-white font-bold">{data?.recentLogs?.length || 0}</span>
            </span>
          </div>

          <div className="rounded-xl border border-[#21262d] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1117] text-[#8b949e] uppercase font-mono font-bold text-[10px] border-b border-[#21262d]">
                <tr>
                  <th className="p-3">Etkinlik</th>
                  <th className="p-3">IP Adresi</th>
                  <th className="p-3">Konum</th>
                  <th className="p-3">Cihaz</th>
                  <th className="p-3">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d] text-[#c9d1d9]">
                {(!data?.recentLogs || data.recentLogs.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#8b949e] italic">
                      Henüz etkileşim kaydı bulunmuyor. Duyuru barını açtığınızda anlık loglar burada listelenecektir.
                    </td>
                  </tr>
                ) : (
                  [...data.recentLogs].reverse().slice(0, 50).map((log, i) => (
                    <tr key={i} className="hover:bg-[#1f242c] transition-colors">
                      <td className="p-3 font-bold">
                        {log.eventType === 'click' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                            🎯 Tıkladı (Siteye Gitti)
                          </span>
                        )}
                        {log.eventType === 'view' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px]">
                            👁️ Görüntüledi
                          </span>
                        )}
                        {log.eventType === 'dismiss' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                            ❌ Kapattı ('X')
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[#8b949e]">
                        {log.ip || 'anon'}
                      </td>
                      <td className="p-3 font-medium text-white">
                        {log.city || 'Bilinmiyor'}
                      </td>
                      <td className="p-3 font-medium">
                        <span className="inline-flex items-center gap-1">
                          {log.device === 'desktop' ? <Laptop className="w-3.5 h-3.5 text-blue-400" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className="capitalize">{log.device || 'Mobil'}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[#8b949e]">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
