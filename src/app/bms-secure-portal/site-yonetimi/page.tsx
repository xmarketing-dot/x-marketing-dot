'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  ShieldCheck,
  Check,
  Loader2,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sliders,
  Type,
  Megaphone,
  Radio,
  Zap,
  Flame,
  Sparkles,
  Search,
  Eye,
  MousePointerClick,
  XCircle,
  TrendingUp,
  Save,
  RotateCcw,
  AlertTriangle,
  Laptop,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Upload,
  Clock,
  LayoutTemplate,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { parsePhoneNumber, setClientAdminWhatsApp } from '@/lib/siteConfig';
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


function MetricCircle({ percent, color = '#f59e0b', size = 38, strokeWidth = 3 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[9px] font-mono font-black text-white">
        %{Math.round(safePercent)}
      </span>
    </div>
  );
}

function SiteYonetimiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') === 'duyuru' ? 'duyuru' : 'genel';
  const [activeTab, setActiveTab] = useState<'genel' | 'duyuru'>(initialTab);

  // Sync tab change with URL without hard reload
  const handleTabChange = (tab: 'genel' | 'duyuru') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'duyuru') {
      url.searchParams.set('tab', 'duyuru');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  };

  // ─────────────────────────────────────────────────────────────
  // 1. GENEL & WHATSAPP AYARLARI STATE
  // ─────────────────────────────────────────────────────────────
  const [loadingGenel, setLoadingGenel] = useState(true);
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [currentAdminWhatsApp, setCurrentAdminWhatsApp] = useState('');
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);

  const [pingingSeo, setPingingSeo] = useState(false);
  const [pingResult, setPingResult] = useState<any | null>(null);
  const [targetPingUrl, setTargetPingUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTargetPingUrl(window.location.origin);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 2. DUYURU & ÇEKMECE BİLDİRİM MERKEZİ STATE
  // ─────────────────────────────────────────────────────────────
  const [announcementData, setAnnouncementData] = useState<AnnouncementState | null>(null);
  const [loadingDuyuru, setLoadingDuyuru] = useState(false);
  const [savingDuyuru, setSavingDuyuru] = useState(false);
  const [resettingCampaign, setResettingCampaign] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [duyuruFeedback, setDuyuruFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Duyuru Form State
  const [duyuruIsActive, setDuyuruIsActive] = useState(false);
  const [displayType, setDisplayType] = useState<'drawer' | 'bar'>('drawer');
  const [delaySeconds, setDelaySeconds] = useState<number>(3);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'gif' | 'image' | 'none'>('none');
  const [duyuruTitle, setDuyuruTitle] = useState('');
  const [duyuruDescription, setDuyuruDescription] = useState('');
  const [duyuruBadgeText, setDuyuruBadgeText] = useState('');
  const [duyuruButtonText, setDuyuruButtonText] = useState('');
  const [duyuruTargetUrl, setDuyuruTargetUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [stylePreset, setStylePreset] = useState<'fire' | 'emerald' | 'fuchsia' | 'cyber'>('fire');

  // Logs Table Filters & Pagination
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'view' | 'click' | 'dismiss'>('all');
  const [logPage, setLogPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState<number | 'all'>(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch Genel Ayarlar ──────────────────────────────────────
  const fetchGenelConfig = async () => {
    try {
      setLoadingGenel(true);
      const res = await fetch(`/api/admin/homepage-config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.config) {
        const c = data.config;
        if (c.adminWhatsApp) {
          setAdminWhatsApp(c.adminWhatsApp);
          setCurrentAdminWhatsApp(c.adminWhatsApp);
          setClientAdminWhatsApp(c.adminWhatsApp);
        }
        setHeroBaslik(c.hero?.baslik || "Türkiye'nin En Güvenilir VIP Eskort İlan Platformu");
        setHeroAltBaslik(c.hero?.altBaslik || "81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.");
      }
    } catch {
      // silent
    } finally {
      setLoadingGenel(false);
    }
  };

  // ── Fetch Duyuru Barı Verileri ──────────────────────────────
  const fetchDuyuruConfig = async () => {
    try {
      setLoadingDuyuru(true);
      const res = await fetch('/api/admin/announcement-bar', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncementData(json.data);
        setDuyuruIsActive(json.data.isActive);
        setDisplayType(json.data.displayType || 'drawer');
        setDelaySeconds(typeof json.data.delaySeconds === 'number' ? json.data.delaySeconds : 3);
        setMediaUrl(json.data.mediaUrl || '');
        setMediaType(json.data.mediaType || 'none');
        setDuyuruTitle(json.data.title || '');
        setDuyuruDescription(json.data.description || '');
        setDuyuruBadgeText(json.data.badgeText || '');
        setDuyuruButtonText(json.data.buttonText || '');
        setDuyuruTargetUrl(json.data.targetUrl || '');
        setOpenInNewTab(json.data.openInNewTab ?? true);
        setStylePreset(json.data.stylePreset || 'fire');
      }
    } catch (err: any) {
      setDuyuruFeedback({ type: 'error', text: 'Duyuru verileri alınamadı: ' + err.message });
    } finally {
      setLoadingDuyuru(false);
    }
  };

  useEffect(() => {
    fetchGenelConfig();
    fetchDuyuruConfig();
  }, []);

  // ── WhatsApp Kaydet ──────────────────────────────────────────
  const handleSaveWhatsApp = async () => {
    const trimmed = adminWhatsApp.trim();
    if (!trimmed) {
      alert('Lütfen geçerli bir telefon numarası girin.');
      return;
    }
    setSavingWhatsApp(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWhatsApp: trimmed }),
      });
      if (res.ok) {
        setCurrentAdminWhatsApp(trimmed);
        setClientAdminWhatsApp(trimmed);
        setWhatsAppSuccess(true);
        setTimeout(() => setWhatsAppSuccess(false), 5000);
      } else {
        alert('Numara kaydedilemedi.');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingWhatsApp(false);
    }
  };

  // ── Hero Metinlerini Kaydet ──────────────────────────────────
  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroBaslik, heroAltBaslik }),
      });
      if (res.ok) {
        setHeroSuccess(true);
        setTimeout(() => setHeroSuccess(false), 4000);
      } else {
        alert('Hero metinleri kaydedilemedi.');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingHero(false);
    }
  };

  // ── SEO IndexNow Ping ────────────────────────────────────────
  const handlePingSeo = async (overrideUrl?: string) => {
    setPingingSeo(true);
    setPingResult(null);
    try {
      const urlToSend = overrideUrl || targetPingUrl;
      const res = await fetch('/api/admin/seo/boost-and-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSiteUrl: urlToSend }),
      });
      const data = await res.json();
      setPingResult(data);
    } catch (e: any) {
      setPingResult({ error: e.message });
    } finally {
      setPingingSeo(false);
    }
  };

  // ── Duyuru GIF / Görsel Yükle ────────────────────────────────
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setDuyuruFeedback(null);
    try {
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const result = await smartUploadFile(file, `announcement_media_${Date.now()}.${isGif ? 'gif' : 'jpg'}`);
      if (result.success && result.url) {
        setMediaUrl(result.url);
        setMediaType(isGif ? 'gif' : 'image');

        await fetch('/api/admin/announcement-bar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive: duyuruIsActive,
            displayType,
            delaySeconds: Number(delaySeconds) || 0,
            mediaUrl: result.url,
            mediaType: isGif ? 'gif' : 'image',
            title: duyuruTitle,
            description: duyuruDescription,
            badgeText: duyuruBadgeText,
            buttonText: duyuruButtonText,
            targetUrl: duyuruTargetUrl,
            openInNewTab,
            stylePreset,
          }),
        });

        setDuyuruFeedback({
          type: 'success',
          text: isGif ? '🎉 GIF başarıyla yüklendi ve kaydedildi!' : '🎉 Görsel başarıyla yüklendi ve kaydedildi!'
        });
      } else {
        setDuyuruFeedback({ type: 'error', text: result.error || 'Medya yüklenemedi' });
      }
    } catch (err: any) {
      setDuyuruFeedback({ type: 'error', text: 'Yükleme hatası: ' + err.message });
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setDuyuruFeedback(null), 4000);
    }
  };

  // ── Duyuru Ayarlarını Kaydet ─────────────────────────────────
  const handleSaveDuyuru = async (forceActiveState?: boolean) => {
    try {
      setSavingDuyuru(true);
      setDuyuruFeedback(null);
      const activeToSave = typeof forceActiveState === 'boolean' ? forceActiveState : duyuruIsActive;

      const res = await fetch('/api/admin/announcement-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: activeToSave,
          displayType,
          delaySeconds: Number(delaySeconds) || 0,
          mediaUrl,
          mediaType: mediaUrl ? (mediaUrl.includes('.gif') ? 'gif' : 'image') : 'none',
          title: duyuruTitle,
          description: duyuruDescription,
          badgeText: duyuruBadgeText,
          buttonText: duyuruButtonText,
          targetUrl: duyuruTargetUrl,
          openInNewTab,
          stylePreset,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncementData(json.data);
        setDuyuruIsActive(json.data.isActive);
        setDuyuruFeedback({ type: 'success', text: json.message || 'Duyuru & Çekmece ayarları güncellendi!' });
      } else {
        setDuyuruFeedback({ type: 'error', text: json.error || 'Kaydetme başarısız oldu' });
      }
    } catch (err: any) {
      setDuyuruFeedback({ type: 'error', text: 'Hata: ' + err.message });
    } finally {
      setSavingDuyuru(false);
      setTimeout(() => setDuyuruFeedback(null), 4000);
    }
  };

  // ── Kampanyayı Sıfırla ──────────────────────────────────────
  const handleResetCampaign = async () => {
    if (!window.confirm("Bu işlem tüm sayaçları sıfırlayacak ve bildirimi daha önce görmüş/kapatmış olan tüm kullanıcılara tekrar TEK SEFERLİK gösterilmesini sağlayacaktır. Onaylıyor musunuz?")) {
      return;
    }

    try {
      setResettingCampaign(true);
      setDuyuruFeedback(null);
      const res = await fetch('/api/admin/announcement-bar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_campaign' }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncementData(json.data);
        setDuyuruIsActive(json.data.isActive);
        setDuyuruFeedback({ type: 'success', text: 'Kampanya başarıyla sıfırlandı! Tüm ziyaretçiler tekrar 1 kez görecek.' });
      }
    } catch (err: any) {
      setDuyuruFeedback({ type: 'error', text: 'Sıfırlama hatası: ' + err.message });
    } finally {
      setResettingCampaign(false);
      setTimeout(() => setDuyuruFeedback(null), 4000);
    }
  };

  const presetClasses = {
    fire: 'from-amber-600 via-rose-600 to-red-700 border-amber-400/50 shadow-red-900/40 text-amber-50',
    fuchsia: 'from-fuchsia-700 via-purple-700 to-pink-700 border-fuchsia-400/50 shadow-fuchsia-900/40 text-fuchsia-50',
    emerald: 'from-emerald-600 via-teal-700 to-cyan-800 border-emerald-400/50 shadow-emerald-900/40 text-emerald-50',
    cyber: 'from-indigo-700 via-violet-800 to-blue-900 border-indigo-400/50 shadow-indigo-900/40 text-indigo-50',
  };

  const phoneDetails = parsePhoneNumber(adminWhatsApp || currentAdminWhatsApp);

  // Canlı Önizleme Kutusu
  const renderPreviewBox = () => {
    if (displayType === 'drawer') {
      return (
        <div className="p-3 sm:p-5 rounded-2xl bg-[#070a0f] border border-slate-800 flex justify-center items-center w-full">
          <div className="w-full max-w-sm bg-[#0c1017]/95 border border-amber-500/40 rounded-2xl shadow-2xl p-3.5 sm:p-5 flex flex-col justify-between items-center text-center space-y-2.5 sm:space-y-3">
            <div className="w-10 sm:w-12 h-1.5 rounded-full bg-white/25 mx-auto -mt-0.5" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-inner">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-heading font-black text-[11px] text-amber-300 uppercase tracking-wider">
                {duyuruBadgeText || '👑 VIP DUYURU'}
              </span>
            </div>

            {mediaUrl && (
              <div className="relative w-full h-32 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 bg-black/90 shadow-xl flex items-center justify-center p-1">
                <img
                  src={mediaUrl}
                  alt="Önizleme"
                  className="w-full h-full object-contain max-h-[24vh] rounded-lg sm:rounded-xl"
                />
              </div>
            )}

            <div className="space-y-1 px-1 w-full">
              <h3 className="text-sm sm:text-lg font-heading font-black tracking-tight leading-snug bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-300 break-words">
                {duyuruTitle || 'Türkiyenin en büyük eskort sitesi açıldı !'}
              </h3>
              {duyuruDescription && (
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2 break-words">
                  {duyuruDescription}
                </p>
              )}
            </div>

            <div className="w-full space-y-1.5 pt-1">
              <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-heading font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/30">
                <span>{duyuruButtonText || 'Hemen İncele'}</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[3] shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Daha sonra hatırlat veya kapat
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-1 rounded-2xl bg-[#070a0f] border border-slate-800 overflow-hidden w-full">
        <div className={`w-full bg-gradient-to-r ${presetClasses[stylePreset]} px-3 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs`}>
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 font-black text-[10px] text-white shrink-0">
              <Flame className="w-2.5 h-2.5 text-amber-300" />
              <span>{duyuruBadgeText || '🚀 YENİ'}</span>
            </span>
            <span className="font-heading font-black text-white truncate text-xs">
              {duyuruTitle || 'Türkiyenin en büyük eskort sitesi açıldı !'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded bg-white text-slate-950 font-heading font-black text-[10px]">
              {duyuruButtonText || 'İncele →'}
            </span>
            <span className="p-1 rounded bg-black/20 text-white/80">
              <X className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full text-left font-sans animate-fadeIn pb-20 md:pb-12">
      
      {/* ── 1. ÜST BAŞLIK VE SAYFA KİMLİĞİ (PRO RESPONSIVE HEADER) ─────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-lg mt-0.5 sm:mt-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-base sm:text-xl md:text-2xl text-white font-heading tracking-tight">
                Site &amp; Sistem Yönetimi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-black font-mono">
                GENEL MERKEZ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              WhatsApp destek hattı, çekmece popup'ı, SEO ping ve metinler.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchGenelConfig();
            fetchDuyuruConfig();
          }}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold font-heading transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loadingGenel || loadingDuyuru) ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Verileri Yenile</span>
          <span className="sm:hidden">Yenile</span>
        </button>
      </div>

      {/* ── 2. SEKMELER (CLEAN PILL SELECTOR) ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#0c1017] border border-slate-800 font-heading font-black text-xs w-full">
        <button
          type="button"
          onClick={() => handleTabChange('genel')}
          className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'genel' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <OfficialWhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
          <span className="truncate">WhatsApp &amp; Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('duyuru')}
          className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'duyuru' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 shrink-0" />
          <span className="truncate">Duyuru &amp; Çekmece</span>
          {announcementData?.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEKME 1: WHATSAPP, HERO VE SİSTEM AYARLARI                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'genel' && (
        <div className="flex flex-col gap-4 sm:gap-6 animate-fadeIn w-full">
          
          {/* CANLI WHATSAPP HATTI (PROFESSIONAL RESPONSIVE CARD) */}
          <div className="p-3.5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121c15] via-[#0c1017] to-[#0f1712] border-2 border-emerald-500/40 shadow-2xl flex flex-col gap-3.5 sm:gap-4 w-full">
            
            {/* Header: Başlık & Durum */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
                  <OfficialWhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-[#25D366]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-black text-sm sm:text-lg text-white font-heading truncate">
                      Canlı WhatsApp Destek Hattı
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] sm:text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>CANLIDA AKTİF</span>
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Yeni numarayı kaydedin; kod ve deploy gerekmeden tüm sitede anında güncellenir.
                  </p>
                </div>
              </div>

              {/* Sitedeki Hat Rozeti */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070a0f] border border-emerald-500/30 text-xs font-mono self-start sm:self-auto shrink-0">
                <span className="text-slate-400 text-[10px] sm:text-[11px]">Sitedeki Hat:</span>
                <span className="text-emerald-400 font-black text-xs sm:text-sm">
                  {phoneDetails.formatted || 'Tanımlanmadı'}
                </span>
              </div>
            </div>

            {/* Input & Butonlar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2.5 sm:gap-3 w-full">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] sm:text-xs font-bold text-slate-300">
                  WhatsApp Telefon Numarası (Ülke kodu ile):
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={adminWhatsApp}
                    onChange={(e) => setAdminWhatsApp(e.target.value)}
                    placeholder="Örn: 905xxxxxxxxx veya 905551234567"
                    className="w-full pl-3.5 pr-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-emerald-500/50 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                    <OfficialWhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveWhatsApp}
                  disabled={savingWhatsApp}
                  className="flex-1 sm:flex-initial py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {savingWhatsApp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : whatsAppSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] shrink-0" />
                      <span>Kaydedildi!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 stroke-[2.5] shrink-0" />
                      <span>Hattı Güncelle</span>
                    </>
                  )}
                </button>

                {phoneDetails.raw && (
                  <a
                    href={phoneDetails.waLink || `https://wa.me/${phoneDetails.raw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 sm:py-3.5 px-3.5 rounded-xl sm:rounded-2xl bg-[#0c1017] hover:bg-slate-900 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-center justify-center shrink-0 cursor-pointer min-h-[44px]"
                    title="Canlı WhatsApp Hattını Test Et"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
              </div>
            </div>

            {whatsAppSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Admin WhatsApp hattı başarıyla güncellendi. Tüm kullanıcılar ve destek butonları artık yeni numaraya yönlendiriliyor.
                </span>
              </div>
            )}
          </div>

          {/* 2-COLUMN RESPONSIVE GRID FOR HERO METİNLERİ & SEO PING */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            
            {/* ANASAYFA HERO VE MARKA METİNLERİ */}
            <div className="p-3.5 sm:p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col justify-between gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold shrink-0">
                    <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-white font-heading">
                      Anasayfa Hero &amp; Marka Metinleri
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Anasayfadaki ana vitrin başlığı ve alt açıklama metni.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 font-heading">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                      Ana Vitrin Başlığı (H1):
                    </label>
                    <input
                      type="text"
                      value={heroBaslik}
                      onChange={(e) => setHeroBaslik(e.target.value)}
                      placeholder="Türkiye'nin En Güvenilir VIP Eskort İlan Platformu"
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800 text-white text-xs sm:text-sm font-medium focus:border-emerald-500/60 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                      Alt Açıklama &amp; Slogan:
                    </label>
                    <textarea
                      rows={2}
                      value={heroAltBaslik}
                      onChange={(e) => setHeroAltBaslik(e.target.value)}
                      placeholder="81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları."
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800 text-white text-xs sm:text-sm font-medium focus:border-emerald-500/60 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-800">
                {heroSuccess ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Kaydedildi!</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-slate-400">
                    Anasayfada anında yansır.
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={savingHero}
                  className="py-2.5 px-4 sm:px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-40 cursor-pointer min-h-[40px]"
                >
                  {savingHero ? 'Kaydediliyor...' : 'Metinleri Kaydet'}
                </button>
              </div>
            </div>

            {/* HIZLI SİSTEM & SEO AKSİYONLARI */}
            <div className="p-3.5 sm:p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col justify-between gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm sm:text-base text-white font-heading">
                      Hızlı Sistem &amp; SEO Aksiyonları
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Google ve Yandex IndexNow arama motoru sinyali.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs sm:text-sm text-white">
                      IndexNow &amp; Google / Yandex Ping
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                      Canlı Hedef
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400">
                    Yeni ilanları ve güncel sayfaları arama motorlarına bildirmek için hedef domain URL&apos;sini seçip ping sinyali gönderin:
                  </span>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={targetPingUrl}
                        onChange={(e) => setTargetPingUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {pingResult && (
                  <div className="p-3 sm:p-4 rounded-xl bg-[#070a0f] border border-blue-500/30 text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-white text-xs">
                        🚀 Ping Sonuç Raporu
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {pingResult.timestamp ? new Date(pingResult.timestamp).toLocaleTimeString('tr-TR') : ''}
                      </span>
                    </div>

                    {pingResult.message && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        {pingResult.message}
                      </p>
                    )}

                    {pingResult.pingResult?.endpoints && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-[#0c1017] border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Yandex IndexNow</span>
                          <span className="text-xs font-bold text-white">
                            {pingResult.pingResult.endpoints.yandex ? '✅ İletildi' : '⚠️ Başarısız'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0c1017] border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Bing IndexNow</span>
                          <span className="text-xs font-bold text-white">
                            {pingResult.pingResult.endpoints.bing ? '✅ İletildi' : '⚠️ Başarısız'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0c1017] border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Google Indexing API</span>
                          <span className="text-xs font-bold text-white">
                            {pingResult.googleIndexingResult?.successCount > 0
                              ? `✅ ${pingResult.googleIndexingResult.successCount} URL`
                              : (pingResult.googleIndexingResult ? '⚠️ Kota/Hata' : 'ℹ️ Sinyal Gönderildi')}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0c1017] border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Sitemap Ping</span>
                          <span className="text-xs font-bold text-white">
                            {pingResult.pingResult.endpoints.googleSitemapPing ? '✅ İletildi' : '⚠️ Başarısız'}
                          </span>
                        </div>
                      </div>
                    )}

                    {pingResult.error && (
                      <div className="text-[11px] font-mono text-rose-400">
                        Hata: {pingResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-slate-800">
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  IndexNow &amp; Google API
                </span>
                <button
                  type="button"
                  onClick={() => handlePingSeo()}
                  disabled={pingingSeo}
                  className="py-2.5 px-4 sm:px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-heading font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer min-h-[40px]"
                >
                  {pingingSeo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Ping Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 shrink-0" />
                      <span>Seçili URL&apos;ye Ping Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEKME 2: DUYURU & ÇEKMECE BİLDİRİM MERKEZİ                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'duyuru' && (
        <div className="flex flex-col gap-4 sm:gap-6 animate-fadeIn w-full">
          
          {/* FEEDBACK ALERT */}
          {duyuruFeedback && (
            <div
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 w-full ${
                duyuruFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {duyuruFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{duyuruFeedback.text}</span>
              </div>
              <button onClick={() => setDuyuruFeedback(null)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── KPI STATS (CLEAN RESPONSIVE METRIC CARDS) ─────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 w-full">
            {/* 1. Durum */}
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all col-span-2 sm:col-span-1 ${
              duyuruIsActive
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                : 'bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/5'
            }`}>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 font-bold">
                <span>Yayın Durumu</span>
                <span className={`w-2 h-2 rounded-full ${duyuruIsActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-sm sm:text-base font-heading font-black ${duyuruIsActive ? 'text-emerald-300' : 'text-red-400'}`}>
                  {duyuruIsActive ? 'YAYINDA' : 'PASİF'}
                </span>
                <button
                  onClick={() => {
                    const next = !duyuruIsActive;
                    setDuyuruIsActive(next);
                    handleSaveDuyuru(next);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    duyuruIsActive ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {duyuruIsActive ? 'Kapat' : 'Yayına Al'}
                </button>
              </div>
            </div>

            {/* 2. Kaç Kişi Gördü */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 font-bold">
                <span>Gören Kişi</span>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="mt-1.5">
                <div className="text-lg sm:text-2xl font-heading font-black text-white font-mono">
                  {announcementData?.uniqueViewsCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Toplam: {announcementData?.viewsCount ?? 0}
                </div>
              </div>
            </div>

            {/* 3. Kaç Kişi Tıkladı */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 font-bold">
                <span>Tıklayan</span>
                <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1.5">
                <div className="text-lg sm:text-2xl font-heading font-black text-amber-300 font-mono">
                  {announcementData?.uniqueClicksCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Toplam: {announcementData?.clicksCount ?? 0}
                </div>
              </div>
            </div>

            {/* 4. CTR */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 font-bold">
                <span>CTR Verimi</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-1.5">
                <div className="text-lg sm:text-2xl font-heading font-black text-emerald-300 font-mono">
                  %{announcementData?.ctr ?? '0.0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Tıklanma oranı
                </div>
              </div>
            </div>

            {/* 5. Kapatma */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 font-bold">
                <span>Kapatan (X)</span>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-1.5">
                <div className="text-lg sm:text-2xl font-heading font-black text-rose-400 font-mono">
                  {announcementData?.dismissCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Kapatma adedi
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBİL ÖZEL KATLANABİLİR ÖNİZLEME (ONLY VISIBLE ON < XL) ────── */}
          <div className="xl:hidden p-3.5 sm:p-4 rounded-2xl bg-[#0c1017] border border-slate-800 space-y-2.5 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Canlı Önizleme ({displayType === 'drawer' ? 'Çekmece' : 'Üst Bar'})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 text-xs font-bold flex items-center gap-1 border border-slate-800 cursor-pointer"
              >
                <span>{showMobilePreview ? 'Gizle' : 'Önizle'}</span>
                {showMobilePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {showMobilePreview && (
              <div className="pt-1.5 animate-in fade-in">
                {renderPreviewBox()}
              </div>
            )}
          </div>

          {/* ── 2-COLUMN MAIN RESPONSIVE WORK AREA ON DESKTOP (XL+) ────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 w-full items-start">
            
            {/* SOL KOLON (XL: 7 / 2XL: 8): FORM VE AYARLAR */}
            <div className="xl:col-span-7 2xl:col-span-8 p-3.5 sm:p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl space-y-4 sm:space-y-5 w-full">
              <h2 className="text-sm sm:text-base font-heading font-black text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Duyuru İçerik &amp; Format Yapılandırması</span>
              </h2>

              {/* Format ve Gecikme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bildirim Formatı</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDisplayType('drawer')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        displayType === 'drawer'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-[#0c1017] text-slate-400 border-slate-800'
                      }`}
                    >
                      📱 Çekmece
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayType('bar')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        displayType === 'bar'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-[#0c1017] text-slate-400 border-slate-800'
                      }`}
                    >
                      📌 Üst Bar
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gecikme Süresi</span>
                  </label>
                  <select
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs font-bold focus:border-emerald-500/60 focus:outline-none cursor-pointer"
                  >
                    <option value={0}>0 sn (Hemen Açılır)</option>
                    <option value={1}>1 saniye sonra</option>
                    <option value={2}>2 saniye sonra</option>
                    <option value={3}>3 saniye sonra (Önerilen)</option>
                    <option value={5}>5 saniye sonra</option>
                    <option value={7}>7 saniye sonra</option>
                    <option value={10}>10 saniye sonra</option>
                  </select>
                </div>
              </div>

              {/* Medya / GIF Yükleyici */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Çekmece Görseli / GIF</span>
                  </label>
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setMediaType('none');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      Medyayı Kaldır
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      setMediaType(e.target.value.includes('.gif') ? 'gif' : 'image');
                    }}
                    placeholder="https://... veya dosya seçin"
                    className="flex-1 w-full px-3 py-2.5 rounded-xl bg-[#0c1017] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white text-xs placeholder-[#484f58]"
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
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20 cursor-pointer min-h-[40px]"
                  >
                    <Upload className={`w-3.5 h-3.5 ${uploadingMedia ? 'animate-bounce' : ''}`} />
                    <span>{uploadingMedia ? 'Yükleniyor...' : 'Görsel / GIF Seç'}</span>
                  </button>
                </div>
              </div>

              {/* Başlık, Açıklama ve Buton Metinleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Duyuru Başlığı <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={duyuruTitle}
                    onChange={(e) => setDuyuruTitle(e.target.value)}
                    placeholder="Türkiyenin en büyük eskort sitesi açıldı !"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white text-xs font-bold placeholder-[#484f58]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Açıklama Metni
                  </label>
                  <textarea
                    rows={2}
                    value={duyuruDescription}
                    onChange={(e) => setDuyuruDescription(e.target.value)}
                    placeholder="VIP ilanları ve WhatsApp iletişim hatlarını hemen keşfedin."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white text-xs placeholder-[#484f58] resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Sol Rozet Metni
                  </label>
                  <input
                    type="text"
                    value={duyuruBadgeText}
                    onChange={(e) => setDuyuruBadgeText(e.target.value)}
                    placeholder="🚀 YENİ"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white text-xs font-bold placeholder-[#484f58]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Aksiyon Butonu
                  </label>
                  <input
                    type="text"
                    value={duyuruButtonText}
                    onChange={(e) => setDuyuruButtonText(e.target.value)}
                    placeholder="Hemen İncele →"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white text-xs font-bold placeholder-[#484f58]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Hedef Yönlendirme URL'si <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={duyuruTargetUrl}
                    onChange={(e) => setDuyuruTargetUrl(e.target.value)}
                    placeholder="https://... veya /ilan-ver"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-amber-300 font-mono text-xs font-bold placeholder-[#484f58]"
                  />
                </div>
              </div>

              {/* Tema Seçici */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] sm:text-xs font-bold text-slate-400">
                  Renk Teması
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                  {[
                    { id: 'fire', label: '🔥 Ateş', class: 'from-amber-600 to-red-700' },
                    { id: 'fuchsia', label: '🔮 Siber', class: 'from-fuchsia-700 to-pink-700' },
                    { id: 'emerald', label: '🌿 Zümrüt', class: 'from-emerald-600 to-teal-800' },
                    { id: 'cyber', label: '⚡ Mavi', class: 'from-indigo-700 to-blue-900' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStylePreset(item.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 transition-all cursor-pointer ${
                        stylePreset === item.id
                          ? 'bg-gradient-to-r ' + item.class + ' text-white border-white/60 shadow-md scale-[1.01]'
                          : 'bg-[#070a0f] text-slate-300 border-slate-800'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {stylePreset === item.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#070a0f] border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Yeni Sekmede Aç</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleSaveDuyuru()}
                  disabled={savingDuyuru}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{savingDuyuru ? 'Kaydediliyor...' : 'Duyuruyu Kaydet'}</span>
                </button>
              </div>
            </div>

            {/* SAĞ KOLON (XL: 5 / 2XL: 4): DESKTOP CANLI ÖNİZLEME & KAMPANYA SIFIRLAMA (STICKY) */}
            <div className="hidden xl:flex xl:col-span-5 2xl:col-span-4 flex-col gap-5 xl:sticky xl:top-6">
              
              {/* Canlı Önizleme Kartı */}
              <div className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl space-y-3 w-full">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Canlı Önizleme ({displayType === 'drawer' ? 'Çekmece' : 'Üst Bar'})</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    {delaySeconds} sn sonra
                  </span>
                </div>
                {renderPreviewBox()}
              </div>

              {/* Kampanya Sıfırlama Kartı */}
              <div className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col justify-between gap-4 w-full">
                <div className="space-y-3">
                  <h3 className="text-sm font-heading font-black text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Tekrar Gösterim &amp; Sıfırlama</span>
                  </h3>

                  <div className="p-3.5 rounded-2xl bg-[#070a0f] border border-slate-800 space-y-2 text-xs text-slate-400">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Tek Seferlik Gösterim:</span>
                    </div>
                    <p>
                      Ziyaretçi bildirimi görüp kapattığında tarayıcısına token atılır ve bir daha rahatsız edilmez.
                    </p>
                    <p className="pt-1.5 border-t border-slate-800">
                      Kampanya ID: <span className="font-mono text-amber-300 font-bold">{announcementData?.campaignId || 'camp_v1'}</span>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Duyuruyu güncellediğinizde butona basarak tüm eski ziyaretçilerin kayıtlarını sıfırlayabilirsiniz.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetCampaign}
                  disabled={resettingCampaign}
                  className="w-full p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 font-heading font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className={`w-4 h-4 ${resettingCampaign ? 'animate-spin' : ''}`} />
                  <span>{resettingCampaign ? 'Sıfırlanıyor...' : '🔄 Kampanyayı Sıfırla (Herkese Göster)'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* ── ZİYARETÇİ ETKİLEŞİM GÜNLÜĞÜ (FULL WIDTH RESPONSIVE) ─────────── */}
          <div className="p-3.5 sm:p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl space-y-3.5 sm:space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h2 className="text-sm sm:text-base font-heading font-black text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Duyuru Etkileşim Günlüğü</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Duyuru &amp; Çekmece ile etkileşime geçen ziyaretçilerin anlık kayıtları
                </p>
              </div>
              <span className="text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-lg bg-[#070a0f] border border-slate-800 text-slate-400 self-start sm:self-auto">
                Kayıt: <span className="text-white font-bold">{announcementData?.recentLogs?.length || 0}</span>
              </span>
            </div>

            {/* Arama ve Filtre */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#070a0f] border border-slate-800 w-full">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => {
                    setLogSearch(e.target.value);
                    setLogPage(1);
                  }}
                  placeholder="IP veya şehir ile ara..."
                  className="w-full pl-8 sm:pl-9 pr-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs placeholder-[#484f58] focus:border-emerald-500/60 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'click', label: '🎯 Tıklama' },
                  { id: 'view', label: '👁️ Gösterim' },
                  { id: 'dismiss', label: '❌ Kapatma' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setLogFilter(tab.id as any);
                      setLogPage(1);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      logFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'bg-[#0c1017] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LOG KAYITLARI GÖRÜNÜMÜ */}
            {(() => {
              const allLogs = announcementData?.recentLogs ? [...announcementData.recentLogs].reverse() : [];
              const filtered = allLogs.filter((log) => {
                if (logFilter !== 'all' && log.eventType !== logFilter) return false;
                if (logSearch.trim()) {
                  const q = logSearch.toLowerCase().trim();
                  const ip = (log.ip || '').toLowerCase();
                  const city = (log.city || '').toLowerCase();
                  return ip.includes(q) || city.includes(q);
                }
                return true;
              });

              const limit = logsPerPage === 'all' ? filtered.length : logsPerPage;
              const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
              const currentPage = Math.min(logPage, totalPages);
              const displayed = logsPerPage === 'all' ? filtered : filtered.slice((currentPage - 1) * limit, currentPage * limit);

              if (displayed.length === 0) {
                return (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-[#070a0f] rounded-xl sm:rounded-2xl border border-slate-800 w-full">
                    Kayıt bulunamadı.
                  </div>
                );
              }

              return (
                <div className="w-full">
                  {/* MOBİL GÖRÜNÜM: DOKUNMATİK UYUMLU KART AKIŞI (SIKIŞMA VE YATAY SCROLL YOK) */}
                  <div className="md:hidden flex flex-col gap-2 w-full">
                    {displayed.map((log, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          {log.eventType === 'click' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                              🎯 Tıkladı (Siteye Gitti)
                            </span>
                          )}
                          {log.eventType === 'view' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold">
                              👁️ Görüntüledi
                            </span>
                          )}
                          {log.eventType === 'dismiss' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                              ❌ Kapattı ('X')
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/60">
                          <span className="font-bold text-white text-[11px]">
                            📍 {log.city || 'Bilinmiyor'}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {log.ip || 'anon'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px]">
                            {log.device === 'desktop' ? <Laptop className="w-3 h-3 text-blue-400" /> : <Smartphone className="w-3 h-3 text-emerald-400" />}
                            <span className="capitalize">{log.device || 'Mobil'}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP GÖRÜNÜM: ZENGİN MASAÜSTÜ TABLOSU */}
                  <div className="hidden md:block rounded-2xl border border-slate-800 overflow-x-auto max-h-[500px] overflow-y-auto w-full">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#070a0f] text-slate-400 uppercase font-mono font-bold text-[10px] border-b border-slate-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-3">Etkinlik</th>
                          <th className="p-3">IP Adresi</th>
                          <th className="p-3">Konum</th>
                          <th className="p-3">Cihaz</th>
                          <th className="p-3">Zaman</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#21262d] text-slate-300">
                        {displayed.map((log, i) => (
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
                            <td className="p-3 font-mono text-slate-400">
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
                            <td className="p-3 font-mono text-slate-400">
                              {new Date(log.createdAt).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sayfalama */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2.5 text-xs text-slate-400 w-full">
                      <div className="text-[11px]">
                        {filtered.length} kayıttan {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, filtered.length)} gösteriliyor
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          className="p-1.5 rounded-lg bg-[#070a0f] hover:bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 py-1 rounded-lg bg-[#070a0f] border border-slate-800 font-mono text-white text-[11px]">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="p-1.5 rounded-lg bg-[#070a0f] hover:bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      )}

    </div>
  );
}

export default function SiteYonetimiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Site Yönetimi Yükleniyor...</span>
      </div>
    }>
      <SiteYonetimiContent />
    </Suspense>
  );
}
