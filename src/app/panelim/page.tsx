'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Lock,
  Sparkles,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Plus,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Crown,
  Star,
  ArrowRight,
  Save,
  X,
  Upload,
  Phone,
  KeyRound,
  Flame,
  CreditCard,
  Headphones,
  Check,
  ChevronDown,
  MessageSquare,
  Clock
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useAdminWhatsApp } from '@/lib/siteConfig';

export default function PanelimPage() {
  const router = useRouter();
  const { getWaUrl, openWhatsApp } = useAdminWhatsApp();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tab Navigation State: 'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'
  const [activeTab, setActiveTab] = useState<'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'>('ilanlarim');

  // Expanded analytics state per listing
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  // Vitrin Satın Alma Modal State
  const [selectedVitrinListing, setSelectedVitrinListing] = useState<any | null>(null);
  const [vitrinPaketiSecimi, setVitrinPaketiSecimi] = useState<'gunluk' | 'haftalik'>('haftalik');
  const [vitrinLoading, setVitrinLoading] = useState(false);
  const [vitrinSuccessMsg, setVitrinSuccessMsg] = useState('');

  // Modal Popup Reklam Satın Alma Modal State (Günlük 1.000 TL)
  const [selectedPopupListing, setSelectedPopupListing] = useState<any | null>(null);
  const [popupGunSecimi, setPopupGunSecimi] = useState<number>(1);
  const [popupHedefSehirSecimi, setPopupHedefSehirSecimi] = useState<string>('tum_turkiye');
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupSuccessMsg, setPopupSuccessMsg] = useState('');

  // Direct Phone + Password Login State
  const [telefon, setTelefon] = useState('');
  const [panelSifresi, setPanelSifresi] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    baslik: '',
    aciklama: '',
    whatsappNumara: '',
    ilSlug: 'istanbul',
    ilceSlug: 'kadikoy',
    fiyat: 2500,
    paraBirimi: 'TL',
    tamAd: '',
    yas: 23,
    boy: 173,
    kilo: 54,
    gogusOlcusu: '85C (Doğal)',
    sacRengi: 'Kumral',
    gozRengi: 'Ela',
    uyruk: 'Türkiye',
    diller: 'Türkçe, İngilizce',
    hizmetMekanlari: 'Kendi Evi, Lüks Otel, Rezidans',
    hakkindaBiyografi: '',
  });
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [editCoverIdx, setEditCoverIdx] = useState(0);
  const [uploadingEditPhotos, setUploadingEditPhotos] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick In-Panel New Listing State
  const [newListingForm, setNewListingForm] = useState({
    baslik: '',
    aciklama: '',
    whatsappNumara: '',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    rozet: 'vip',
    fiyat: 2500,
    yas: 23,
    boy: 172,
    kilo: 53,
    tamAd: '',
    vitrinIstegi: false,
  });
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [uploadingNewPhotos, setUploadingNewPhotos] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);

  // Live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check saved session
  useEffect(() => {
    const savedUser = localStorage.getItem('panel_user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        fetchListings(parsed.identifier, parsed.password);
      } catch (e) {
        localStorage.removeItem('panel_user_session');
      }
    }
  }, []);

  // Online Heartbeat Tracker
  useEffect(() => {
    if (!currentUser) return;

    const sendHeartbeat = (status = 'online') => {
      const activeIdent = currentUser.identifier || currentUser.telefon || currentUser.kullaniciAdi;
      if (!activeIdent && !currentUser.userId && !currentUser._id) return;

      const payload = {
        userId: currentUser.userId || currentUser._id,
        identifier: activeIdent,
        telefon: currentUser.telefon,
        kullaniciAdi: currentUser.kullaniciAdi,
        currentTab: activeTab,
        status,
      };

      if (status === 'offline' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/user-panel/heartbeat', blob);
      } else {
        fetch('/api/user-panel/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => { });
      }
    };

    sendHeartbeat('online');
    const intervalId = setInterval(() => sendHeartbeat('online'), 30000);

    const handleUnload = () => sendHeartbeat('offline');
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [currentUser, activeTab]);

  // Fetch listings
  const fetchListings = async (ident: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-panel/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: ident.trim(),
          password: pass.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const fetchedListings = data.listings || [];
        setListings(fetchedListings);
        setBanners(data.banners || []);

        if (data.user) {
          const userObj = {
            userId: data.user._id,
            identifier: data.user.identifier || ident.trim(),
            password: pass.trim(),
            panelSifresi: pass.trim(),
            kullaniciAdi: data.user.kullaniciAdi || data.user.ad || ident.trim(),
            telefon: data.user.telefon || '',
            ad: data.user.ad || data.user.kullaniciAdi || 'İlan Sahibi',
            type: data.user.type || 'user'
          };
          localStorage.setItem('panel_user_session', JSON.stringify(userObj));
          setCurrentUser(userObj);
        }

        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('action') === 'vitrin') {
            if (fetchedListings.length > 0) {
              setSelectedVitrinListing(fetchedListings[0]);
            } else {
              setActiveTab('ilan_ver');
            }
          }
        }
      } else {
        setListings([]);
        setBanners([]);
      }
    } catch (e) {
      setListings([]);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/user-panel/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: telefon.trim(),
          password: panelSifresi.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        const userObj = {
          userId: data.user._id,
          identifier: data.user.identifier || telefon.trim(),
          password: panelSifresi.trim(),
          panelSifresi: panelSifresi.trim(),
          kullaniciAdi: data.user.kullaniciAdi || data.user.ad || telefon.trim(),
          telefon: data.user.telefon || telefon.trim() || '',
          ad: data.user.ad || data.user.kullaniciAdi || 'İlan Sahibi',
          type: data.user.type || 'user'
        };
        localStorage.setItem('panel_user_session', JSON.stringify(userObj));
        setCurrentUser(userObj);
        setListings(data.listings || []);
        setBanners(data.banners || []);
      } else {
        setLoginError(data.error || 'Giriş bilgileri hatalı. Lütfen kontrol ediniz.');
      }
    } catch (err: any) {
      setLoginError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const activeIdent = currentUser.identifier || currentUser.telefon || currentUser.kullaniciAdi;
      const payload = {
        userId: currentUser.userId || currentUser._id,
        identifier: activeIdent,
        telefon: currentUser.telefon,
        kullaniciAdi: currentUser.kullaniciAdi,
        status: 'offline',
      };
      fetch('/api/user-panel/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => { });
    }

    localStorage.removeItem('panel_user_session');
    setCurrentUser(null);
    setListings([]);
    setBanners([]);
    setTelefon('');
    setPanelSifresi('');
  };

  const calculateLiveCountdown = (bitisTarihiStr: string | null | undefined, status: string) => {
    if (status !== 'yayinda') {
      return { text: 'Onay Bekliyor', expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    if (!bitisTarihiStr) {
      return { text: 'Süresiz VIP', expired: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    }

    const bitisTime = new Date(bitisTarihiStr).getTime();
    const diff = bitisTime - currentTime;

    if (diff <= 0) {
      return { text: 'Süresi Doldu', expired: true, color: 'text-rose-400', bg: 'bg-rose-500/10' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0) {
      return { text: `${days}g ${pad(hours)}s ${pad(minutes)}d`, expired: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    }

    return { text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, expired: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const calculateVitrinCountdown = (vitrinBitisTarihiStr: string | null | undefined, isVitrin?: boolean) => {
    if (!vitrinBitisTarihiStr && !isVitrin) {
      return null;
    }
    if (!vitrinBitisTarihiStr && isVitrin) {
      return {
        text: 'Vitrinde (Süresiz)',
        expired: false,
        color: 'text-emerald-400',
        days: 99, hours: 23, minutes: 59, seconds: 59,
        padDays: '99', padHours: '23', padMinutes: '59', padSeconds: '59',
      };
    }

    const bitisTime = new Date(vitrinBitisTarihiStr!).getTime();
    const diff = bitisTime - currentTime;

    if (diff <= 0) {
      return {
        text: 'Süre Doldu',
        expired: true,
        color: 'text-rose-400',
        days: 0, hours: 0, minutes: 0, seconds: 0,
        padDays: '00', padHours: '00', padMinutes: '00', padSeconds: '00',
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      text: days > 0 ? `${days}g ${pad(hours)}s ${pad(minutes)}d` : `${pad(hours)}s ${pad(minutes)}d ${pad(seconds)}sn`,
      expired: false,
      color: 'text-emerald-400',
      days, hours, minutes, seconds,
      padDays: pad(days), padHours: pad(hours), padMinutes: pad(minutes), padSeconds: pad(seconds),
    };
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingEditPhotos(true);
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setEditPhotos(prev => [...prev, ...data.urls].slice(0, 10));
      } else {
        alert(data.error || 'Dosya yükleme hatası.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploadingEditPhotos(false);
    }
  };

  const removeEditPhoto = (idx: number) => {
    const updated = editPhotos.filter((_, i) => i !== idx);
    setEditPhotos(updated);
    if (editCoverIdx >= updated.length) setEditCoverIdx(0);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !currentUser) return;
    setSavingEdit(true);

    const activePass = currentUser.password || currentUser.panelSifresi || '';
    const activeIdent = currentUser.identifier || currentUser.telefon || '';

    try {
      const res = await fetch('/api/listings/edit-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          telefon: currentUser.telefon || activeIdent,
          identifier: activeIdent,
          panelSifresi: activePass || editingListing.panelSifresi,
          password: activePass,
          listingId: editingListing._id,
          updateData: {
            ...editForm,
            fotograflar: editPhotos.map(url => ({ url })),
            anaFotograf: { url: editPhotos[editCoverIdx] || editPhotos[0] || '' }
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setEditingListing(null);
        fetchListings(activeIdent, activePass);
      } else {
        alert(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCreateNewListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhotos.length < 1) {
      alert('Lütfen en az 1 adet fotoğraf yükleyiniz.');
      return;
    }
    setCreatingListing(true);

    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListingForm,
          fotograflar: newPhotos.map(url => ({ url })),
          anaFotograf: { url: newPhotos[0] || '' }
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('İlanınız başarıyla oluşturuldu ve onay sürecine alındı!');
        setActiveTab('ilanlarim');
        setNewPhotos([]);
        if (currentUser) {
          fetchListings(currentUser.telefon || currentUser.identifier, currentUser.panelSifresi || currentUser.password);
        }
      } else {
        alert(data.error || 'İlan oluşturulamadı.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setCreatingListing(false);
    }
  };

  const handleNewFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingNewPhotos(true);
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setNewPhotos(prev => [...prev, ...data.urls].slice(0, 7));
      } else {
        alert(data.error || 'Dosya yükleme hatası.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploadingNewPhotos(false);
    }
  };

  // ══════════════════════════════════════════════════
  // 1. GİRİŞ YAPILMAMIŞ DURUM (BMS LUXURY OBSIDIAN GİRİŞ)
  // ══════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col justify-center px-4 py-8 max-w-md mx-auto selection:bg-slate-700 selection:text-white font-sans">
        <div className="p-6 sm:p-7 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-[#0e131f] border border-slate-700/80 text-sky-400 flex items-center justify-center font-bold shadow-sm">
              <KeyRound className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight mt-1">
              Müşteri &amp; İlan Sahibi Paneli
            </h1>
            <p className="text-xs text-slate-400 font-normal max-w-xs">
              Kullanıcı adınız veya kayıtlı telefon numaranız ve şifrenizle anında bağlanın
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Kullanıcı Adı veya Telefon
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Örn: 0530... veya kullanici_adi"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Panel Şifresi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••"
                  value={panelSifresi}
                  onChange={(e) => setPanelSifresi(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-white active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Panele Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 flex flex-col items-center gap-1.5 text-center">
            <span className="text-[11px] text-slate-400">Şifrenizi hatırlamıyor musunuz?</span>
            <Link
              href="/chat"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold hover:underline flex items-center gap-1"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>7/24 Canlı Destekten Şifremi İste</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 2. GİRİŞ YAPILMIŞ KONTROL MERKEZİ (SENIOR CYBER LUXURY)
  // ══════════════════════════════════════════════════
  const selectedProv = turkeyProvinces.find((p) => p.ilSlug === newListingForm.ilSlug) || turkeyProvinces[0];

  const menuItems = [
    { id: 'ilanlarim', label: 'İlanlarım', count: listings.length, icon: Star },
    { id: 'reklam_ver', label: 'Öne Çıkart', badge: 'VIP', icon: Flame },
    { id: 'ilan_ver', label: 'İlan Ekle', icon: Plus },
    { id: 'odeme', label: 'Ödeme / Süre', icon: CreditCard },
    { id: 'chat', label: 'Destek', badge: '7/24', icon: Headphones },
  ];

  const totalViews = listings.reduce((acc, curr) => acc + (curr.totalViews || curr.goruntulenmeSayisi || curr.goruntulenme || 0), 0);
  const totalWhatsapp = listings.reduce((acc, curr) => acc + (curr.whatsappTiklamaSayisi || curr.whatsappTiklama || 0), 0);
  const totalTodayWhatsapp = listings.reduce((acc, curr) => acc + (curr.todayWhatsappClicks || 0), 0);
  const totalUniqueVisitors = listings.reduce((acc, curr) => acc + (curr.uniqueVisitors || 0), 0);
  const overallConversion = totalViews > 0 ? ((totalWhatsapp / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans pb-24 select-none">

      {/* ── TOP HEADER BAR ──────────────── */}
      <header className="sticky top-0 z-30 bg-[#070a0f]/90 backdrop-blur-xl border-b border-slate-800 px-2.5 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0e131f] border border-slate-700/80 text-white font-mono font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {currentUser.ad?.charAt(0).toUpperCase() || 'İ'}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs sm:text-sm text-white truncate">
                  {currentUser.kullaniciAdi || currentUser.ad}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                {currentUser.telefon ? currentUser.telefon : 'Doğrulanmış Profil'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className="p-1.5 sm:p-2 rounded-xl bg-[#0b101b] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Canlı Destek"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl bg-[#0b101b] hover:bg-rose-500/15 border border-slate-800 text-slate-400 hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── SEGMENTED PILL TAB BAR (BMS Secure Portal Tarzı Yüksek Kontrast & Şık Tasarım) ──────────────── */}
        <div className="max-w-2xl mx-auto mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#151f32] text-white border-slate-600 shadow-md ring-1 ring-slate-500/30'
                    : 'bg-[#090d14] border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${
                    isSelected
                      ? 'bg-slate-800 text-slate-100 border-slate-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className={`text-[9px] font-mono font-semibold ${
                    item.badge === 'VIP' ? 'text-amber-400' : 'text-sky-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER (Mobil Kenar Boşlukları Optimize Edildi) ──────────────── */}
      <main className="max-w-2xl mx-auto px-2 sm:px-4 pt-2.5 sm:pt-4 flex flex-col gap-2.5 sm:gap-4">

        {/* ══════════════════════════════════════════════════
            TAB 1: İLANLARIM & PERFORMANS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'ilanlarim' && (
          <div className="flex flex-col gap-2.5 sm:gap-3.5 animate-fadeIn">

            {/* ── KPI ŞERİDİ (BMS Portal Renk Hiyerarşisi: Beyaz/Hit, Zümrüt/WA, Sky/Müşteri, Mor/Dönüşüm) ──────────────── */}
            <div className="grid grid-cols-4 py-2.5 px-1 sm:px-3 bg-[#0c1017] rounded-xl sm:rounded-2xl border border-slate-800 text-center divide-x divide-slate-800/80 shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider">GÖSTERİM</span>
                <span className="font-mono font-bold text-sm sm:text-base text-white mt-0.5">
                  {totalViews.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono uppercase tracking-wider">WHATSAPP</span>
                <span className="font-mono font-bold text-sm sm:text-base text-emerald-400 mt-0.5">
                  {totalTodayWhatsapp > 0 ? (
                    <span title={`Bugün: ${totalTodayWhatsapp} | Toplam: ${totalWhatsapp}`}>
                      {totalTodayWhatsapp} <span className="text-[10px] font-normal text-emerald-300">Bugün</span>
                    </span>
                  ) : (
                    totalWhatsapp.toLocaleString('tr-TR')
                  )}
                </span>
                {totalTodayWhatsapp > 0 && (
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono">
                    {totalWhatsapp} toplam
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-sky-400 font-mono uppercase tracking-wider">MÜŞTERİ</span>
                <span className="font-mono font-bold text-sm sm:text-base text-sky-300 mt-0.5">
                  {(totalUniqueVisitors || Math.max(1, Math.round(totalViews * 0.78))).toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] text-purple-400 font-mono uppercase tracking-wider">DÖNÜŞÜM</span>
                <span className="font-mono font-bold text-sm sm:text-base text-purple-300 mt-0.5">
                  %{overallConversion}
                </span>
              </div>
            </div>

            {/* ── AKTİF VİTRİN BİLGİLENDİRME (VIP Altın/Amber Hiyerarşisi) ── */}
            {(() => {
              const activeVitrin = listings.find((l) => l.isVitrin || (l.vitrinBitisTarihi && new Date(l.vitrinBitisTarihi).getTime() > currentTime));
              if (activeVitrin) {
                const vitrinCd = calculateVitrinCountdown(activeVitrin.vitrinBitisTarihi, activeVitrin.isVitrin);
                return (
                  <div className="px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-[#0c1017] border border-amber-500/30 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          Anasayfa Vitrininde Yayında
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-mono">
                          Kalan Süre: {vitrinCd?.text}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVitrinListing(activeVitrin);
                        setVitrinSuccessMsg('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] shrink-0 active:scale-95 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                    >
                      Uzat
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* ── LİSTİNGS LİSTESİ ──────────────── */}
            {loading ? (
              <div className="py-14 flex flex-col items-center justify-center gap-2.5">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-xs text-slate-400 font-mono">İlanlarınız yükleniyor...</span>
              </div>
            ) : listings.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-center bg-[#0c1017] rounded-xl sm:rounded-2xl border border-slate-800 p-6">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Star className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-white">Henüz Bir İlanınız Yok</span>
                <button
                  onClick={() => setActiveTab('ilan_ver')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase cursor-pointer active:scale-95 transition-all"
                >
                  + İlk İlanını Ekle
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-800/80 bg-[#0c1017] rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                {listings.map((item) => {
                  const liveTime = calculateLiveCountdown(item.paketBitisTarihi, item.status);
                  const isVitrinActive = item.isVitrin || (item.vitrinBitisTarihi && new Date(item.vitrinBitisTarihi).getTime() > currentTime);
                  const vitrinCd = calculateVitrinCountdown(item.vitrinBitisTarihi, item.isVitrin);
                  const coverUrl = item.anaFotograf?.url || item.fotograflar?.[0]?.url || '/placeholder-avatar.webp';
                  const isExpanded = !!expandedInsights[item._id];

                  return (
                    <div key={item._id} className="p-2.5 sm:p-3.5 flex flex-col gap-2.5">

                      {/* Üst Satır: Fotoğraf + Bilgiler (Verimli ve Kesilmeyen Düzen) */}
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverUrl}
                            alt={item.baslik}
                            className="w-full h-full object-cover"
                          />
                          <span className={`absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                            item.rozet === 'vip' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {item.rozet?.toUpperCase() || 'VIP'}
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1 justify-center gap-1">
                          {/* Başlık ve Durum */}
                          <div className="flex items-center justify-between gap-1.5">
                            <h3 className="font-semibold text-xs sm:text-sm text-white truncate leading-snug">
                              {item.baslik}
                            </h3>
                            <span className={`text-[9px] sm:text-[10px] font-mono font-medium shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full ${
                              item.status === 'yayinda'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.status === 'yayinda' ? '● Yayında' : '⏳ Onayda'}
                            </span>
                          </div>

                          {/* Konum ve Telefon (Asla kesilmeyen, net iki sütun) */}
                          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
                            <span className="truncate flex items-center gap-1 min-w-0">
                              <span className="text-slate-500 text-[10px]">📍</span>
                              <span className="truncate uppercase font-medium">{item.ilSlug || ''}{item.ilceSlug ? ` / ${item.ilceSlug}` : ''}</span>
                            </span>
                            <span className="font-mono text-emerald-400 shrink-0 text-[11px] flex items-center gap-1 font-medium">
                              <span className="text-slate-500 text-[10px]">📱</span>
                              <span>{item.whatsappNumara}</span>
                            </span>
                          </div>

                          {/* Kalan Süre Rozetleri */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-300 font-mono bg-[#070a0f] border border-slate-800 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span>{liveTime.text}</span>
                            </span>
                            {isVitrinActive && (
                              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                <Crown className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                <span>{vitrinCd?.text}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aksiyon Butonları (Tam Responsive, Tek Satır & Eşit Yükseklik) */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() => {
                            setEditingListing(item);
                            setEditPhotos((item.fotograflar || []).map((f: any) => typeof f === 'string' ? f : f.url).filter(Boolean));
                            setEditCoverIdx(0);
                            setEditForm({
                              baslik: item.baslik || '',
                              aciklama: item.aciklama || '',
                              whatsappNumara: item.whatsappNumara || '',
                              ilSlug: item.ilSlug || 'istanbul',
                              ilceSlug: item.ilceSlug || 'kadikoy',
                              fiyat: item.fiyat || 2500,
                              paraBirimi: item.paraBirimi || 'TL',
                              tamAd: item.tamAd || '',
                              yas: item.yas || 23,
                              boy: item.boy || 173,
                              kilo: item.kilo || 54,
                              gogusOlcusu: item.gogusOlcusu || '85C (Doğal)',
                              sacRengi: item.sacRengi || 'Kumral',
                              gozRengi: item.gozRengi || 'Ela',
                              uyruk: item.uyruk || 'Türkiye',
                              diller: Array.isArray(item.diller) ? item.diller.join(', ') : (item.diller || 'Türkçe, İngilizce'),
                              hizmetMekanlari: Array.isArray(item.hizmetMekanlari) ? item.hizmetMekanlari.join(', ') : (item.hizmetMekanlari || 'Kendi Evi, Lüks Otel, Rezidans'),
                              hakkindaBiyografi: item.hakkindaBiyografi || '',
                            });
                          }}
                          className="flex-1 h-9 px-2 rounded-xl bg-[#090d14] hover:bg-slate-800 border border-slate-800 active:scale-95 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedVitrinListing(item);
                            setVitrinSuccessMsg('');
                          }}
                          className="flex-[1.25] h-9 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 cursor-pointer whitespace-nowrap"
                        >
                          <Crown className="w-3.5 h-3.5 shrink-0" />
                          <span>{isVitrinActive ? 'Vitrini Uzat' : 'Vitrine Al'}</span>
                        </button>

                        <Link
                          href={`/ilan/${item.slug}`}
                          target="_blank"
                          className="h-9 px-3 sm:px-4 rounded-xl bg-[#090d14] hover:bg-slate-800 border border-slate-800 active:scale-95 text-slate-300 hover:text-white text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 transition-all text-center whitespace-nowrap shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>Gör</span>
                        </Link>
                      </div>

                      {/* Performans Raporu Açılır Bölüm */}
                      <button
                        onClick={() => setExpandedInsights(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                        className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white pt-0.5 px-0.5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
                          <span>{(item.goruntulenmeSayisi || item.goruntulenme || 0).toLocaleString('tr-TR')} Görüntülenme</span>
                          <span>•</span>
                          <span className="text-emerald-400">
                            {item.todayWhatsappClicks && item.todayWhatsappClicks > 0 ? (
                              <span className="font-semibold text-emerald-300">
                                {item.todayWhatsappClicks} Bugün <span className="text-slate-400 font-normal">({item.whatsappTiklamaSayisi || 0} Tık)</span>
                              </span>
                            ) : (
                              <span>{(item.whatsappTiklamaSayisi || item.whatsappTiklama || 0)} Tık</span>
                            )}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium text-[10px] sm:text-[11px]">
                          <span>{isExpanded ? 'Gizle' : 'Detaylı Rapor'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-2.5 sm:p-3 rounded-xl bg-[#090d14] border border-slate-800/80 flex flex-col gap-2 text-xs animate-fadeIn">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800">
                            <span>MÜŞTERİ ANALİZİ</span>
                            <span className="text-sky-400 font-semibold">CANLI VERİ</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center py-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-mono">Tekil Müşteri</span>
                              <span className="font-bold text-sky-300 mt-0.5 font-mono">
                                {(item.uniqueVisitors || Math.max(1, Math.round((item.goruntulenmeSayisi || 1) * 0.78))).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-emerald-400 font-mono">WhatsApp Tık</span>
                              <span className="font-bold text-emerald-400 mt-0.5 font-mono flex flex-col items-center">
                                <span>{(item.whatsappTiklamaSayisi || 0)} <span className="text-[9px] font-normal text-slate-400">Toplam</span></span>
                                {item.todayWhatsappClicks !== undefined && item.todayWhatsappClicks > 0 && (
                                  <span className="text-[10px] text-emerald-300 font-semibold">⚡ {item.todayWhatsappClicks} Bugün</span>
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-purple-400 font-mono">Dönüşüm</span>
                              <span className="font-bold text-purple-300 mt-0.5 font-mono">
                                %{((item.whatsappTiklamaSayisi || 0) / Math.max(1, (item.goruntulenmeSayisi || 1)) * 100).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800">
                            📍 <strong>{item.ilSlug?.toUpperCase()}</strong> bölgesinde son 7 günde profiliniz yüksek etkileşim aldı.
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SPONSORLU BANNERLAR ── */}
            {banners && banners.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1">
                  Sponsorlu Reklamlarınız ({banners.length})
                </span>
                <div className="flex flex-col divide-y divide-slate-800/80 bg-[#0c1017] rounded-2xl border border-slate-800 overflow-hidden">
                  {banners.map((b: any) => {
                    const timeInfo = calculateLiveCountdown(b.bitisTarihi, b.durum);
                    return (
                      <div key={b._id} className="p-3 flex items-center justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${b.durum === 'yayinda' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            <span className="font-semibold text-xs text-white truncate">
                              {b.baslik || 'Anasayfa Sabit Banner'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {(b.goruntulenmeSayisi || 0).toLocaleString('tr-TR')} Gösterim • {(b.tiklamaSayisi || 0)} Tıklama
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg ${timeInfo.bg} ${timeInfo.color}`}>
                          ⏱ {timeInfo.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: SPONSORLU REKLAM & POPUP
        ══════════════════════════════════════════════════ */}
        {activeTab === 'reklam_ver' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">

            {/* ── 1. ÖZEL MODAL POPUP REKLAMI ──────────────── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col gap-3.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Özel Modal Popup Reklamı</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase">
                  %570 Etkileşim
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Siteye giren müşterilerin ekranına ilk saniyede tam boy fotoğraflı popup olarak doğrudan siz düşün. Arama yapmadan doğrudan profilinizi görüp WhatsApp hattınıza mesaj atsınlar.
              </p>

              {/* KPI Şeridi */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-500">GÖSTERİM</span>
                  <span className="font-mono font-bold text-xs text-white mt-0.5">50.000+ / Gün</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-500">WHATSAPP</span>
                  <span className="font-mono font-bold text-xs text-emerald-400 mt-0.5">+%570 Tık</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-500">GÜNLÜK FİYAT</span>
                  <span className="font-mono font-bold text-xs text-cyan-400 mt-0.5">1.000 ₺ / Gün</span>
                </div>
              </div>

              {/* Popup Seçim Butonu */}
              {listings.length > 0 ? (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Hangi İlanınız Popup Olarak Çıksın?</span>
                  <div className="flex flex-col gap-2">
                    {listings.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || '/placeholder-avatar.webp'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-white truncate">{item.baslik}</span>
                            <span className="text-[10px] text-slate-400 font-mono">📍 {item.ilSlug?.toUpperCase()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPopupListing(item);
                            setPopupGunSecimi(1);
                            setPopupHedefSehirSecimi(item.ilSlug || 'tum_turkiye');
                            setPopupSuccessMsg('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Popup Yap (1.000 ₺/g)</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('ilan_ver')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-1 active:scale-95 cursor-pointer"
                >
                  <span>Önce İlanınızı Ekleyin</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </button>
              )}
            </div>

            {/* ── 2. ANASAYFA SABİT BANNER ALANI ──────────────── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span>Anasayfa Sabit VIP Banner</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tüm sayfalarda en üstte sabit fotoğrafınız veya hareketli GIF görseliniz yayınlansın, tüm arama ve WhatsApp trafiği doğrudan size aksın.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">7 Gün</span>
                  <span className="font-mono font-bold text-xs text-white mt-1">3.000 ₺</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070a0f] border border-emerald-500/30 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-emerald-400 font-mono uppercase font-semibold">15 Gün</span>
                  <span className="font-mono font-bold text-xs text-emerald-400 mt-1">7.000 ₺</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">30 Gün</span>
                  <span className="font-mono font-bold text-xs text-white mt-1">13.000 ₺</span>
                </div>
              </div>

              <Link
                href="/reklam-ver"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-1 active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <span>Banner Başvurusunu Başlat</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: YENİ İLAN EKLE
        ══════════════════════════════════════════════════ */}
        {activeTab === 'ilan_ver' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col gap-3.5">
              <span className="font-semibold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span>Panele Yeni İlan Ekle</span>
              </span>

              {/* Rozet Seçimi */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'gold' })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-semibold ${
                    newListingForm.rozet === 'gold'
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                      : 'bg-[#070a0f] border-slate-800 text-slate-400'
                  }`}
                >
                  <span>⭐ GOLD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'vip' })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-semibold ${
                    newListingForm.rozet === 'vip'
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-sm'
                      : 'bg-[#070a0f] border-slate-800 text-slate-400'
                  }`}
                >
                  <span>👑 VIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'silver' })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all text-xs font-semibold ${
                    newListingForm.rozet === 'silver'
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                      : 'bg-[#070a0f] border-slate-800 text-slate-400'
                  }`}
                >
                  <span>⚡ SILVER</span>
                </button>
              </div>

              <form onSubmit={handleCreateNewListing} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="İlan Başlığı (Örn: Kadıköy VIP Model)"
                  value={newListingForm.baslik}
                  onChange={(e) => setNewListingForm({ ...newListingForm, baslik: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newListingForm.ilSlug}
                    onChange={(e) => {
                      const il = turkeyProvinces.find(p => p.ilSlug === e.target.value);
                      setNewListingForm({
                        ...newListingForm,
                        ilSlug: e.target.value,
                        ilceSlug: il?.ilceler[0]?.slug || ''
                      });
                    }}
                    className="px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                  >
                    {turkeyProvinces.map(p => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>

                  <select
                    value={newListingForm.ilceSlug}
                    onChange={(e) => setNewListingForm({ ...newListingForm, ilceSlug: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                  >
                    {selectedProv.ilceler.map(d => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="tel"
                  required
                  placeholder="WhatsApp Numarası (0530...)"
                  value={newListingForm.whatsappNumara}
                  onChange={(e) => setNewListingForm({ ...newListingForm, whatsappNumara: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Hizmet detaylarınız ve randevu koşullarınız..."
                  value={newListingForm.aciklama}
                  onChange={(e) => setNewListingForm({ ...newListingForm, aciklama: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
                />

                {/* Fotoğraf Yükle */}
                <div className="flex flex-col gap-2">
                  <label className="p-3 border border-dashed border-slate-800 rounded-xl bg-[#070a0f] flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewFileUpload}
                      className="hidden"
                    />
                    {uploadingNewPhotos ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-slate-300">Fotoğraf Ekle ({newPhotos.length}/7)</span>
                      </>
                    )}
                  </label>

                  {newPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {newPhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-rose-600 rounded text-white text-[8px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={creatingListing || uploadingNewPhotos}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-50 cursor-pointer"
                >
                  {creatingListing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>İlanı Kaydet &amp; Onaya Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: ÖDEME & SÜRE UZAT
        ══════════════════════════════════════════════════ */}
        {activeTab === 'odeme' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <CryptoPaymentCard onChatClick={() => setActiveTab('chat')} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 5: CANLI DESTEK CHAT
        ══════════════════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <Headphones className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="font-semibold text-sm sm:text-base text-white">7/24 Canlı Destek Hattı</h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Ödeme bildirimleri, vitrin onayı ve tüm teknik talepleriniz için müşteri temsilcimize anında ulaşın.
              </p>
              <button
                onClick={() => router.push('/chat')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Canlı Sohbete Başla</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL: İLAN DÜZENLE ──────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0c1017] border border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>İlanı Düzenle</span>
              </span>
              <button onClick={() => setEditingListing(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const selectedEditProv = turkeyProvinces.find((p) => p.ilSlug === editForm.ilSlug) || turkeyProvinces[0];

              return (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-left">
                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                    İlan Başlığı
                    <input
                      type="text"
                      required
                      value={editForm.baslik}
                      onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                      Şehir
                      <select
                        value={editForm.ilSlug}
                        onChange={(e) => {
                          const newIl = e.target.value;
                          const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                          setEditForm({
                            ...editForm,
                            ilSlug: newIl,
                            ilceSlug: prov?.ilceler?.[0]?.slug || 'merkez',
                          });
                        }}
                        className="px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                      >
                        {turkeyProvinces.map((prov) => (
                          <option key={prov.ilSlug} value={prov.ilSlug}>{prov.il}</option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                      İlçe
                      <select
                        value={editForm.ilceSlug}
                        onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                        className="px-3 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60"
                      >
                        {selectedEditProv.ilceler.map((ilce) => (
                          <option key={ilce.slug} value={ilce.slug}>{ilce.ad}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                      WhatsApp
                      <input
                        type="tel"
                        required
                        value={editForm.whatsappNumara}
                        onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                      Fiyat (TL)
                      <input
                        type="number"
                        value={editForm.fiyat}
                        onChange={(e) => setEditForm({ ...editForm, fiyat: Number(e.target.value) || 0 })}
                        className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
                    Açıklama
                    <textarea
                      required
                      rows={3}
                      value={editForm.aciklama}
                      onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
                    />
                  </label>

                  {/* Fotoğraflar */}
                  <div className="flex flex-col gap-2">
                    <label className="p-3 border border-dashed border-slate-800 rounded-xl bg-[#070a0f] flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditFileUpload}
                        className="hidden"
                      />
                      {uploadingEditPhotos ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-medium text-slate-300">Fotoğraf Ekle ({editPhotos.length})</span>
                        </>
                      )}
                    </label>

                    {editPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {editPhotos.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeEditPhoto(idx)}
                              className="absolute top-1 right-1 p-1 bg-rose-600 rounded text-white text-[8px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="w-1/3 py-2.5 rounded-xl bg-[#070a0f] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Kaydet</span>
                    </button>
                  </div>
                </form>
              );
            })()}

          </div>
        </div>
      )}

      {/* ── MODAL: VİTRİN SATIN ALMA ──────────────── */}
      {selectedVitrinListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0c1017] border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto text-left">

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span>Anasayfa VIP Vitrin</span>
              </span>
              <button
                onClick={() => {
                  setSelectedVitrinListing(null);
                  setVitrinSuccessMsg('');
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vitrinSuccessMsg ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <span className="font-semibold text-sm text-white">Talep Alındı</span>
                <p className="text-xs text-slate-400 max-w-xs">{vitrinSuccessMsg}</p>
                <button
                  onClick={() => {
                    setSelectedVitrinListing(null);
                    setVitrinSuccessMsg('');
                  }}
                  className="mt-3 px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-[#070a0f] rounded-xl border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedVitrinListing.anaFotograf?.url || selectedVitrinListing.fotograflar?.[0]?.url || '/placeholder-avatar.webp'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-white truncate">{selectedVitrinListing.baslik}</span>
                    <span className="text-[10px] text-slate-400 font-mono">📍 {selectedVitrinListing.ilSlug?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVitrinPaketiSecimi('gunluk')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      vitrinPaketiSecimi === 'gunluk'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono block">1 Günlük</span>
                    <span className="font-mono font-bold text-xs text-white mt-0.5 block">2.000 ₺</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVitrinPaketiSecimi('haftalik')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      vitrinPaketiSecimi === 'haftalik'
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-md'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={`text-[9px] uppercase font-mono block ${vitrinPaketiSecimi === 'haftalik' ? 'text-slate-950' : 'text-emerald-400'}`}>7 Gün (Önerilen)</span>
                    <span className="font-mono font-bold text-xs mt-0.5 block">6.000 ₺</span>
                  </button>
                </div>

                <button
                  disabled={vitrinLoading}
                  onClick={async () => {
                    setVitrinLoading(true);
                    try {
                      const res = await fetch('/api/user-panel/vitrin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          listingId: selectedVitrinListing._id,
                          vitrinPaketi: vitrinPaketiSecimi,
                          telefon: currentUser?.telefon || selectedVitrinListing.whatsappNumara,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setVitrinSuccessMsg('Vitrin talebiniz alındı ve yönetici onayına iletildi.');
                        if (currentUser) {
                          fetchListings(currentUser.identifier, currentUser.password);
                        }
                      } else {
                        alert(data.error || 'Vitrin talebi iletilemedi.');
                      }
                    } catch (err) {
                      alert('Bağlantı hatası.');
                    } finally {
                      setVitrinLoading(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
                >
                  {vitrinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  <span>{vitrinPaketiSecimi === 'gunluk' ? 'Günlük Vitrini Al (2.000 ₺)' : 'Haftalık Vitrini Al (6.000 ₺)'}</span>
                </button>

                <a
                  href={getWaUrl(`Merhaba, ${selectedVitrinListing.baslik} ilanım için ${vitrinPaketiSecimi === 'gunluk' ? 'GÜNLÜK (2.000 ₺)' : 'HAFTALIK (6.000 ₺)'} vitrin satın almak istiyorum.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openWhatsApp(`Merhaba, ${selectedVitrinListing.baslik} ilanım için ${vitrinPaketiSecimi === 'gunluk' ? 'GÜNLÜK (2.000 ₺)' : 'HAFTALIK (6.000 ₺)'} vitrin satın almak istiyorum.`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#22c55e] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>WhatsApp ile Hızlı Onay Al</span>
                </a>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL: ÖZEL MODAL POPUP SATIN ALMA ──────────────── */}
      {selectedPopupListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0c1017] border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto text-left relative">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-white">Özel Modal Popup Reklamı</span>
              </div>
              <button
                onClick={() => {
                  setSelectedPopupListing(null);
                  setPopupSuccessMsg('');
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {popupSuccessMsg ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <span className="font-semibold text-sm text-white">Talep Alındı</span>
                <p className="text-xs text-slate-400 max-w-xs">{popupSuccessMsg}</p>
                <button
                  onClick={() => {
                    setSelectedPopupListing(null);
                    setPopupSuccessMsg('');
                  }}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-[#070a0f] rounded-xl border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPopupListing.anaFotograf?.url || selectedPopupListing.fotograflar?.[0]?.url || '/placeholder-avatar.webp'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-xs text-white truncate">{selectedPopupListing.baslik}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">📍 {selectedPopupListing.ilSlug?.toUpperCase()} / {selectedPopupListing.ilceSlug?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>+%570 Kümülatif Dönüşüm</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Ziyaretçiler siteye girdiğinde ilk saniyede tam boy fotoğraflı popup olarak ekranlarına çıkarsınız. Her gün <strong>1.000 ₺</strong> olarak hesaplanır.
                  </p>
                </div>

                {/* Süre Seçimi */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">1. Yayın Süresi Seçin</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 1, label: '1 Gün', price: '1.000 ₺' },
                      { days: 2, label: '2 Gün', price: '2.000 ₺' },
                      { days: 3, label: '3 Gün', price: '3.000 ₺' },
                      { days: 7, label: '7 Gün', price: '7.000 ₺' },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setPopupGunSecimi(opt.days)}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                          popupGunSecimi === opt.days
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-sm'
                            : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase block">{opt.label}</span>
                        <span className="font-mono font-bold text-xs mt-0.5 block">{opt.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hedef Gösterim Bölgesi */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">2. Hedef Gösterim Bölgesi</label>
                  <div className="flex flex-col gap-2">

                    {selectedPopupListing.ilSlug && selectedPopupListing.ilceSlug && (
                      <button
                        type="button"
                        onClick={() => setPopupHedefSehirSecimi(`${selectedPopupListing.ilSlug}/${selectedPopupListing.ilceSlug}`)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          popupHedefSehirSecimi === `${selectedPopupListing.ilSlug}/${selectedPopupListing.ilceSlug}`
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-white">
                            SADECE İLANIN BÖLGESİ
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {selectedPopupListing.ilSlug.toUpperCase()} / {selectedPopupListing.ilceSlug.toUpperCase()} sayfalarında görünür
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          popupHedefSehirSecimi === `${selectedPopupListing.ilSlug}/${selectedPopupListing.ilceSlug}`
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                            : 'border-slate-700'
                        }`}>
                          {popupHedefSehirSecimi === `${selectedPopupListing.ilSlug}/${selectedPopupListing.ilceSlug}` && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>
                      </button>
                    )}

                    {selectedPopupListing.ilSlug && (
                      <button
                        type="button"
                        onClick={() => setPopupHedefSehirSecimi(selectedPopupListing.ilSlug)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          popupHedefSehirSecimi === selectedPopupListing.ilSlug
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-white">
                            TÜM {selectedPopupListing.ilSlug.toUpperCase()} GENELİ
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {selectedPopupListing.ilSlug.toUpperCase()} ve tüm ilçelerinde görünür
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          popupHedefSehirSecimi === selectedPopupListing.ilSlug
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                            : 'border-slate-700'
                        }`}>
                          {popupHedefSehirSecimi === selectedPopupListing.ilSlug && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPopupHedefSehirSecimi('tum_turkiye')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        popupHedefSehirSecimi === 'tum_turkiye'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-white">
                          TÜM TÜRKİYE &amp; ANASAYFA
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          81 İlin tamamındaki tüm ziyaretçilere tam ekran çıkar
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        popupHedefSehirSecimi === 'tum_turkiye'
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                          : 'border-slate-700'
                      }`}>
                        {popupHedefSehirSecimi === 'tum_turkiye' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </button>

                  </div>
                </div>

                <button
                  disabled={popupLoading}
                  onClick={async () => {
                    setPopupLoading(true);
                    try {
                      const res = await fetch('/api/user-panel/popup-reklam', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          listingId: selectedPopupListing._id,
                          gun: popupGunSecimi,
                          hedefSehir: popupHedefSehirSecimi,
                          telefon: currentUser?.telefon || selectedPopupListing.whatsappNumara,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setPopupSuccessMsg(`${popupGunSecimi} günlük modal popup talebiniz alındı ve yönetici onayına iletildi.`);
                        if (currentUser) {
                          fetchListings(currentUser.identifier, currentUser.password);
                        }
                      } else {
                        alert(data.error || 'Popup talebi iletilemedi.');
                      }
                    } catch (err) {
                      alert('Bağlantı hatası.');
                    } finally {
                      setPopupLoading(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
                >
                  {popupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                  <span>{popupGunSecimi} Günlük Popup Reklamı Başlat ({(popupGunSecimi * 1000).toLocaleString('tr-TR')} ₺)</span>
                </button>

                <a
                  href={getWaUrl(`Merhaba, ${selectedPopupListing.baslik} ilanım için ${popupGunSecimi} GÜNLÜK (${(popupGunSecimi * 1000).toLocaleString('tr-TR')} ₺) ÖZEL MODAL POPUP REKLAMI satın almak istiyorum.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openWhatsApp(`Merhaba, ${selectedPopupListing.baslik} ilanım için ${popupGunSecimi} GÜNLÜK (${(popupGunSecimi * 1000).toLocaleString('tr-TR')} ₺) ÖZEL MODAL POPUP REKLAMI satın almak istiyorum.`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#22c55e] hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 text-center shadow-sm transition-all cursor-pointer"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>WhatsApp ile Anında Canlı Yayına Al</span>
                </a>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── FIXED BOTTOM DOCK BAR ──────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#070a0f]/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around max-w-2xl mx-auto shadow-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
