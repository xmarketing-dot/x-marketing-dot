'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Upload,
  Clock,
  LayoutTemplate,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { smartUploadFile } from '@/lib/smartUpload';

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
  displayType: 'drawer' | 'bar';
  delaySeconds: number;
  mediaUrl?: string;
  mediaType?: 'gif' | 'image' | 'none';
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
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [isActive, setIsActive] = useState(false);
  const [displayType, setDisplayType] = useState<'drawer' | 'bar'>('drawer');
  const [delaySeconds, setDelaySeconds] = useState<number>(3);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'gif' | 'image' | 'none'>('none');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [stylePreset, setStylePreset] = useState<'fire' | 'emerald' | 'fuchsia' | 'cyber'>('fire');

  // Logs Table Filters & Pagination
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'view' | 'click' | 'dismiss'>('all');
  const [logPage, setLogPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState<number | 'all'>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcement-bar', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIsActive(json.data.isActive);
        setDisplayType(json.data.displayType || 'drawer');
        setDelaySeconds(typeof json.data.delaySeconds === 'number' ? json.data.delaySeconds : 3);
        setMediaUrl(json.data.mediaUrl || '');
        setMediaType(json.data.mediaType || 'none');
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setFeedback(null);
    try {
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const result = await smartUploadFile(file, `announcement_media_${Date.now()}.${isGif ? 'gif' : 'jpg'}`);
      if (result.success && result.url) {
        setMediaUrl(result.url);
        setMediaType(isGif ? 'gif' : 'image');

        // Otomatik olarak veritabanına anında kaydet
        await fetch('/api/admin/announcement-bar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive,
            displayType,
            delaySeconds: Number(delaySeconds) || 0,
            mediaUrl: result.url,
            mediaType: isGif ? 'gif' : 'image',
            title,
            description,
            badgeText,
            buttonText,
            targetUrl,
            openInNewTab,
            stylePreset,
          }),
        });

        setFeedback({ type: 'success', text: isGif ? '🎉 GIF başarıyla yüklendi ve kaydedildi!' : '🎉 Görsel başarıyla yüklendi ve kaydedildi!' });
      } else {
        setFeedback({ type: 'error', text: result.error || 'Medya yüklenemedi' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Yükleme hatası: ' + err.message });
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setFeedback(null), 4000);
    }
  };

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
          displayType,
          delaySeconds: Number(delaySeconds) || 0,
          mediaUrl,
          mediaType: mediaUrl ? (mediaUrl.includes('.gif') ? 'gif' : 'image') : 'none',
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

  const presetButtonGradients = {
    fire: 'from-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/30',
    fuchsia: 'from-fuchsia-400 to-pink-300 text-slate-950 shadow-fuchsia-500/30',
    emerald: 'from-emerald-400 to-teal-300 text-slate-950 shadow-emerald-500/30',
    cyber: 'from-cyan-400 to-blue-300 text-slate-950 shadow-cyan-500/30',
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
                  <span>Duyuru &amp; Çekmece Bildirim Merkezi</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    Drawer &amp; Bar Popup
                  </span>
                </h1>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  Tüm ziyaretçilere açılan çekmece (drawer) veya üst bar bildirimini yönetin, GIF görseli ekleyin ve gecikme süresini ayarlayın.
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
              <span>Canlı Önizleme ({displayType === 'drawer' ? 'Çekmece / Drawer Popup' : 'Sabit Üst Bar'})</span>
            </div>
            <span className="text-[11px] font-mono text-[#8b949e]">
              Gecikme: <span className="text-amber-300 font-bold">{delaySeconds} sn sonra</span>
            </span>
          </div>

          {displayType === 'drawer' ? (
            /* ÇEKMECE ÖNİZLEME (VIP REKLAM STYLE - %100 ORTALANMIŞ) */
            <div className="p-6 rounded-2xl bg-[#0B0E14] border border-[#252B3B] flex justify-center items-center">
              <div className="w-full max-w-md bg-[#141824]/95 border border-amber-500/40 rounded-3xl shadow-2xl p-6 flex flex-col justify-between items-center text-center space-y-4">
                {/* Grab Handle */}
                <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto -mt-1" />

                {/* Rozet */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-inner">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-heading font-black text-xs text-amber-300 uppercase tracking-wider">
                    {badgeText || '👑 VIP DUYURU'}
                  </span>
                </div>

                {/* Medya (GIF / Görsel) */}
                {mediaUrl && (
                  <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#252B3B] bg-black/90 shadow-xl flex items-center justify-center p-1.5">
                    <img
                      src={mediaUrl}
                      alt="Önizleme"
                      className="w-full h-full object-contain max-h-[34vh] rounded-xl"
                    />
                  </div>
                )}

                {/* Başlık & Açıklama (Ortalanmış) */}
                <div className="space-y-1.5 px-2">
                  <h3 className="text-xl font-heading font-black tracking-tight leading-snug bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-300">
                    {title || 'Türkiyenin en büyük eskort sitesi açıldı !'}
                  </h3>
                  {description && (
                    <p className="text-xs text-[#9AA3B2] font-medium leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>

                {/* Butonlar */}
                <div className="w-full space-y-2 pt-2">
                  <div className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-heading font-black text-sm uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/30 cursor-pointer">
                    <span>{buttonText || 'Hemen İncele'}</span>
                    <ExternalLink className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="text-[11px] text-[#9AA3B2] font-medium cursor-pointer">
                    Daha sonra hatırlat veya kapat
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ÜST BAR ÖNİZLEME */
            <div className="p-1 rounded-2xl bg-[#0d1117] border border-[#21262d] overflow-hidden">
              <div className={`w-full bg-gradient-to-r ${presetClasses[stylePreset]} px-3 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs`}>
                <div className="flex items-center gap-2 truncate">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 font-black text-[10px] text-white">
                    <Flame className="w-2.5 h-2.5 text-amber-300" />
                    <span>{badgeText || '🚀 YENİ'}</span>
                  </span>
                  <span className="font-heading font-black text-white truncate">
                    {title || 'Türkiyenin en büyük eskort sitesi açıldı !'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-white text-slate-950 font-heading font-black text-[10px]">
                    {buttonText || 'İncele →'}
                  </span>
                  <span className="p-1 rounded bg-black/20 text-white/80">
                    <X className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FORM & KONTROL MERKEZİ ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Kolon: Metin, Medya ve Link Düzenleme */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-5">
            <h2 className="text-base font-heading font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Duyuru İçerik &amp; Yönlendirme Ayarları</span>
            </h2>

            {/* GÖRÜNÜM TİPİ VE GECİKME SEÇİMİ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0d1117] border border-[#21262d]">
              {/* Görünüm Modu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e] flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bildirim Formatı</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayType('drawer')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      displayType === 'drawer'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-[#161b22] text-[#8b949e] border-[#30363d]'
                    }`}
                  >
                    📱 Çekmece (Drawer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayType('bar')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      displayType === 'bar'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-[#161b22] text-[#8b949e] border-[#30363d]'
                    }`}
                  >
                    📌 Üst Sabit Bar
                  </button>
                </div>
              </div>

              {/* Kaç Saniye Sonra Çıksın */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8b949e] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kaç Sn Sonra Açılsın?</span>
                </label>
                <select
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value={0}>0 saniye (Hemen Açılır)</option>
                  <option value={1}>1 saniye sonra</option>
                  <option value={2}>2 saniye sonra</option>
                  <option value={3}>3 saniye sonra (Önerilen)</option>
                  <option value={5}>5 saniye sonra</option>
                  <option value={7}>7 saniye sonra</option>
                  <option value={10}>10 saniye sonra</option>
                  <option value={15}>15 saniye sonra</option>
                </select>
              </div>
            </div>

            {/* MEDYA / GIF YÜKLEYİCİ */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#21262d] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#8b949e] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Çekmece Görseli / Hareketli GIF (Opsiyonel)</span>
                </label>
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setMediaType('none');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Medyayı Kaldır
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setMediaType(e.target.value.includes('.gif') ? 'gif' : 'image');
                  }}
                  placeholder="https://... veya dosya yükleyin"
                  className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-xs placeholder-[#484f58]"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaUpload}
                  accept="image/gif,image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                >
                  <Upload className={`w-3.5 h-3.5 ${uploadingMedia ? 'animate-bounce' : ''}`} />
                  <span>{uploadingMedia ? 'Yükleniyor...' : 'GIF / Görsel Yükle'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8b949e]">
                15MB'a kadar hareketli GIF veya yüksek kaliteli görselleri yükleyebilirsiniz.
              </p>
            </div>

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
                  Açıklama Metni
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="escturkiye.devs.surf yayında! Tüm illerdeki doğrulanmış VIP ilanları hemen keşfedin."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-amber-400 focus:outline-none text-white text-sm placeholder-[#484f58] resize-none"
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
                  Kullanıcı siteye girdiğinde belirlediğiniz gecikme süresi (örn. 3 sn) sonrasında bildirim açılır. Kullanıcı tıkladığında veya kapattığında tarayıcısına kayıt atılır ve aynı kullanıcı bir daha rahatsız edilmez.
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
                  Duyuruyu güncellediğinizde veya yeni bir kampanya başlattığınızda aşağıdaki butona basın. Tüm eski ziyaretçilerin kayıtları sıfırlanır ve herkes bildirimi tekrar 1 kez görür.
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

        {/* ── CANLI ETKİLEŞİM VE LOG TABLOSU (TÜMÜ) ─────────────────── */}
        <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-heading font-black text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                <span>Ziyaretçi Etkileşim Günlüğü (Tüm Kayıtlar)</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Duyuru &amp; Çekmece ile etkileşime geçen tüm ziyaretçilerin anlık kayıtları
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-lg bg-[#0d1117] border border-[#21262d] text-[#8b949e]">
                Toplam Kayıt: <span className="text-white font-bold">{data?.recentLogs?.length || 0}</span>
              </span>
            </div>
          </div>

          {/* Filtre ve Arama Araç Çubuğu */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#21262d]">
            {/* Arama Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogPage(1);
                }}
                placeholder="IP adresi, şehir veya ID ile ara..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Event Tipi Filtresi */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'click', label: '🎯 Tıklamalar' },
                { id: 'view', label: '👁️ Görüntülemeler' },
                { id: 'dismiss', label: '❌ Kapatmalar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setLogFilter(tab.id as any);
                    setLogPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    logFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sayfa Başına Gösterim */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#8b949e] font-medium hidden sm:inline">Göster:</span>
              <select
                value={logsPerPage}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setLogsPerPage(val);
                  setLogPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value={50}>50 kayıt</option>
                <option value={100}>100 kayıt</option>
                <option value={250}>250 kayıt</option>
                <option value={500}>500 kayıt</option>
                <option value="all">Tümünü Göster</option>
              </select>
            </div>
          </div>

          {/* Tablo */}
          {(() => {
            const allLogs = data?.recentLogs ? [...data.recentLogs].reverse() : [];
            const filtered = allLogs.filter((log) => {
              if (logFilter !== 'all' && log.eventType !== logFilter) return false;
              if (logSearch.trim()) {
                const q = logSearch.toLowerCase().trim();
                const ip = (log.ip || '').toLowerCase();
                const city = (log.city || '').toLowerCase();
                const vid = (log.visitorId || '').toLowerCase();
                return ip.includes(q) || city.includes(q) || vid.includes(q);
              }
              return true;
            });

            const limit = logsPerPage === 'all' ? filtered.length : logsPerPage;
            const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
            const currentPage = Math.min(logPage, totalPages);
            const displayed = logsPerPage === 'all' ? filtered : filtered.slice((currentPage - 1) * limit, currentPage * limit);

            return (
              <>
                <div className="rounded-xl border border-[#21262d] overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d1117] text-[#8b949e] uppercase font-mono font-bold text-[10px] border-b border-[#21262d] sticky top-0 z-10">
                      <tr>
                        <th className="p-3">Etkinlik</th>
                        <th className="p-3">IP Adresi</th>
                        <th className="p-3">Konum</th>
                        <th className="p-3">Cihaz</th>
                        <th className="p-3">Zaman</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#21262d] text-[#c9d1d9]">
                      {displayed.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#8b949e] italic">
                            {filtered.length === 0 && logSearch
                              ? 'Aramanıza uygun etkileşim kaydı bulunamadı.'
                              : 'Henüz etkileşim kaydı bulunmuyor. Duyuru barını açtığınızda tüm ziyaretçi logları burada listelenecektir.'}
                          </td>
                        </tr>
                      ) : (
                        displayed.map((log, i) => (
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

                {/* Sayfalama & Bilgi Alt Çubuğu */}
                {filtered.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#8b949e]">
                    <div>
                      Filtrelenen <span className="text-white font-bold">{filtered.length}</span> kayıttan{' '}
                      <span className="text-white font-bold">
                        {logsPerPage === 'all' ? `1 - ${filtered.length}` : `${(currentPage - 1) * limit + 1} - ${Math.min(currentPage * limit, filtered.length)}`}
                      </span>{' '}
                      arası gösteriliyor
                    </div>

                    {logsPerPage !== 'all' && totalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-white"
                          title="Önceki Sayfa"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 rounded-lg bg-[#0d1117] border border-[#21262d] font-mono text-white text-xs">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed text-white"
                          title="Sonraki Sayfa"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
