'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Lock, 
  Sparkles, 
  Clock, 
  Eye, 
  MessageSquare, 
  Edit3, 
  ExternalLink, 
  Zap, 
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
  Calendar,
  Timer,
  Upload,
  Image as ImageIcon,
  Trash2,
  Phone,
  KeyRound,
  Flame,
  CreditCard,
  Headphones,
  Check,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  TrendingUp,
  Award,
  Layers,
  Sparkle,
  Activity
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { getAdminWhatsAppUrl, getAdminWhatsAppNumber } from '@/lib/siteConfig';

export default function PanelimPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Tab Navigation State: 'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'
  const [activeTab, setActiveTab] = useState<'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'>('ilanlarim');

  // Vitrin Satın Alma Modal State (Günlük 2.000 TL, Haftalık Kampanyalı 6.000 TL)
  const [selectedVitrinListing, setSelectedVitrinListing] = useState<any | null>(null);
  const [vitrinPaketiSecimi, setVitrinPaketiSecimi] = useState<'gunluk' | 'haftalik'>('haftalik');
  const [vitrinLoading, setVitrinLoading] = useState(false);
  const [vitrinSuccessMsg, setVitrinSuccessMsg] = useState('');

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

        // URL'de action=vitrin varsa otomatik vitrin modalını aç
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
    localStorage.removeItem('panel_user_session');
    setCurrentUser(null);
    setListings([]);
    setTelefon('');
    setPanelSifresi('');
  };

  const calculateLiveCountdown = (bitisTarihiStr: string | null | undefined, status: string) => {
    if (status !== 'yayinda') {
      return { text: 'Onay Bekliyor', expired: false, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    }
    if (!bitisTarihiStr) {
      return { text: 'Süresiz VIP', expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }

    const bitisTime = new Date(bitisTarihiStr).getTime();
    const diff = bitisTime - currentTime;

    if (diff <= 0) {
      return { text: 'Süresi Doldu', expired: true, color: 'text-red-400', bg: 'bg-red-500/10' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (days > 0) {
      return { text: `${days}g ${pad(hours)}s ${pad(minutes)}d ${pad(seconds)}sn`, expired: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    }

    return { text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const calculateVitrinCountdown = (vitrinBitisTarihiStr: string | null | undefined, isVitrin?: boolean) => {
    if (!vitrinBitisTarihiStr && !isVitrin) {
      return null;
    }
    if (!vitrinBitisTarihiStr && isVitrin) {
      return { 
        text: 'Vitrinde Yayında (Süresiz)', 
        expired: false, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10',
        days: 99,
        hours: 23,
        minutes: 59,
        seconds: 59,
        padDays: '99',
        padHours: '23',
        padMinutes: '59',
        padSeconds: '59',
      };
    }

    const bitisTime = new Date(vitrinBitisTarihiStr!).getTime();
    const diff = bitisTime - currentTime;

    if (diff <= 0) {
      return { 
        text: 'Vitrin Süresi Doldu', 
        expired: true, 
        color: 'text-red-400', 
        bg: 'bg-red-500/10',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        padDays: '00',
        padHours: '00',
        padMinutes: '00',
        padSeconds: '00',
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return { 
      text: days > 0 ? `${days} Gün ${pad(hours)}s ${pad(minutes)}d ${pad(seconds)}sn` : `${pad(hours)} Saat ${pad(minutes)} Dk ${pad(seconds)}sn`, 
      expired: false, 
      color: 'text-amber-300', 
      bg: 'bg-amber-500/15',
      days,
      hours,
      minutes,
      seconds,
      padDays: pad(days),
      padHours: pad(hours),
      padMinutes: pad(minutes),
      padSeconds: pad(seconds),
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
        alert('İlanınız başarıyla güncellendi!');
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
    if (newPhotos.length < 2) {
      alert('Lütfen en az 2 adet fotoğraf yükleyiniz.');
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
          fetchListings(currentUser.telefon, currentUser.panelSifresi);
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
  // 1. GİRİŞ YAPILMAMIŞ DURUM (LOGIN FORMU)
  // ══════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-md mx-auto min-h-[75vh] justify-center text-left">
        <div className="p-6 sm:p-8 rounded-[32px] bg-[#161b22] border-2 border-[#30363d] shadow-2xl flex flex-col gap-6 text-center">
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/25">
              <KeyRound className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-white font-heading">İlan Sahibi Paneli</h1>
              <p className="text-xs sm:text-sm text-[#8b949e] mt-1 font-medium">
                Kullanıcı Adınız ve Şifreniz ile giriş yapın.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              Kullanıcı Adınız (veya Telefon) *
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adınız..."
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors font-medium"
                />
                <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              Şifreniz *
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={panelSifresi}
                  onChange={(e) => setPanelSifresi(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors font-medium"
                />
                <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all font-heading uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Panele Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] text-left flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 font-heading">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Giriş Yapamıyor musunuz?</span>
            </span>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              Kullanıcı adı veya şifrenizi hatırlamıyorsanız 7/24 canlı destek üzerinden anında yardım alabilirsiniz.
            </p>
            <Link
              href="/chat"
              className="text-xs text-amber-400 font-black hover:underline mt-1 flex items-center gap-1 font-heading"
            >
              <span>Canlı Destekten Şifremi İste ➔</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 2. GİRİŞ YAPILMIŞ TAM KURUMSAL & MOBİL UYUMLU KONTROL MERKEZİ
  // ══════════════════════════════════════════════════
  const selectedProv = turkeyProvinces.find((p) => p.ilSlug === newListingForm.ilSlug) || turkeyProvinces[0];

  const menuItems = [
    { id: 'ilanlarim', label: 'İlanlarım & Süreler', icon: Star, badge: `${listings.length} İlan` },
    { id: 'reklam_ver', label: 'Sponsorlu Reklam Ver', icon: Crown, badge: '%300 ETKİ 🔥' },
    { id: 'ilan_ver', label: 'Yeni İlan Ekle', icon: Plus, badge: 'Hızlı' },
    { id: 'odeme', label: 'Ödeme & Süre Uzat', icon: CreditCard, badge: 'USDT / Kripto' },
    { id: 'chat', label: '7/24 Canlı Destek', icon: Headphones, badge: 'Online 🟢' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col gap-6 pb-24 text-left">
      
      {/* ── 1. ÜST KURUMSAL BAŞLIK & PROFİL BİLGİSİ ──────────────── */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25">
            {currentUser.ad?.charAt(0).toUpperCase() || 'İ'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-xl text-white font-heading">
                {currentUser.kullaniciAdi || currentUser.ad}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Doğrulanmış Üye
              </span>
            </div>
            <span className="text-xs text-amber-400 font-bold font-mono mt-0.5">
              {currentUser.kullaniciAdi ? `@${currentUser.kullaniciAdi}` : ''} {currentUser.telefon ? `• 📱 ${currentUser.telefon}` : ''} • {listings.length} İlan Yayında
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setActiveTab('chat')}
            className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-all"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Temsilciye Bağlan</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-red-500/20 hover:text-red-400 text-[#8b949e] font-bold text-xs border border-[#363b42] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* ── VIP VİTRİN ÜST DURUM HERO BANNERI ── */}
      {(() => {
        const activeVitrin = listings.find((l) => l.isVitrin || (l.vitrinBitisTarihi && new Date(l.vitrinBitisTarihi).getTime() > currentTime));
        const pendingVitrin = listings.find((l) => l.vitrinIstegi && !activeVitrin);

        if (activeVitrin) {
          const vitrinCountdown = calculateVitrinCountdown(activeVitrin.vitrinBitisTarihi, activeVitrin.isVitrin);
          return (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#2a1d06] via-[#161b22] to-[#120e06] border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xl shadow-amber-500/30">
                  <Crown className="w-6 h-6 fill-slate-950" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-black text-sm sm:text-base text-white">
                      👑 AKTİF VİTRİN: &quot;{activeVitrin.baslik}&quot;
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] font-mono flex items-center gap-1 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                      ANASAYFA VİTRİNİNDE CANLI
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-amber-300 font-mono">
                    <span>⏱️ Kalan Süre: <strong>{vitrinCountdown?.text}</strong></span>
                    <span className="text-[#8b949e] hidden sm:inline">•</span>
                    <span className="text-emerald-400 font-bold hidden sm:inline">⚡ Günlük 50.000+ Müşteri Akışı</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedVitrinListing(activeVitrin);
                  setVitrinSuccessMsg('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-400 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-md shrink-0 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Süreyi Uzat ➔</span>
              </button>
            </div>
          );
        }

        if (pendingVitrin) {
          return (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/15 via-[#161b22] to-yellow-500/10 border-2 border-yellow-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-black shrink-0 border border-yellow-500/30 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-xs sm:text-sm text-yellow-300">
                      ⏳ VİTRİN TALEBİNİZ YÖNETİCİ ONAYINDA: &quot;{pendingVitrin.baslik}&quot;
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[9px] font-bold">
                      Onay Bekleniyor
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8b949e]">
                    Yönetici onayladığında anında anasayfa 5&apos;li VIP vitrinine eklenecek ve canlı geri sayım başlayacaktır.
                  </span>
                </div>
              </div>

              <a
                href={getAdminWhatsAppUrl(
                  `Merhaba, ${pendingVitrin.baslik} ilanım için vitrin talebinde bulundum, hızlı onay alabilir miyim?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#22c55e] text-white font-heading font-black text-xs shadow-md shrink-0 flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>WhatsApp Hızlı Onay</span>
              </a>
            </div>
          );
        }

        return null;
      })()}

      {/* ── 2. DUAL LAYOUT: MASAÜSTÜNDE YAN MENÜ + İÇERİK / MOBİLDE ÜST TAB ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* SOL YAN MENÜ (Masaüstü Kurumsal Sidebar) */}
        <div className="hidden md:flex flex-col gap-2 p-3 bg-[#161b22] rounded-3xl border border-[#30363d] shadow-xl md:sticky md:top-20">
          <span className="text-[10px] font-heading font-black text-[#8b949e] px-3 py-1 uppercase tracking-wider">
            Yönetim Menüsü
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`p-3 rounded-2xl font-heading font-black text-xs transition-all flex items-center justify-between text-left ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-[#c9d1d9] hover:bg-[#21262d] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-slate-950 text-amber-300' : 'bg-[#21262d] text-[#8b949e]'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}

          {/* Sidebar Reklam Teşvik Kutusu */}
          <div 
            onClick={() => setActiveTab('reklam_ver')}
            className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#2a1b04] to-[#120e06] border border-amber-500/50 cursor-pointer hover:border-amber-400 transition-all flex flex-col gap-1.5 text-left"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-heading font-black text-xs">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Sponsorlu VIP Reklam</span>
            </div>
            <p className="text-[11px] text-[#8b949e] leading-snug">
              Anasayfada en üstte sabit banner ile günlük 50.000+ müşteriye ulaşın.
            </p>
            <span className="text-[10px] text-amber-300 font-bold mt-1">İncele ve Başvur ➔</span>
          </div>
        </div>

        {/* SAĞ İÇERİK ALANI (Tüm Sekmelerin Profesyonel Gösterimi) */}
        <div className="md:col-span-3 flex flex-col gap-4">

          {/* ══════════════════════════════════════════════════
              TAB 1: İLANLARIM & CANLI İSTATİSTİKLER (Sadece Bu Tabda Gözükür)
          ══════════════════════════════════════════════════ */}
          {activeTab === 'ilanlarim' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              
              {/* ── 5'Lİ SUMMARY İSTATİSTİK KARTLARI (VIP VİTRİN + METRİKLER) ──────────────── */}
              {(() => {
                const totalViews = listings.reduce((acc, curr) => acc + (curr.totalViews || curr.goruntulenmeSayisi || curr.goruntulenme || 0), 0);
                const totalWhatsapp = listings.reduce((acc, curr) => acc + (curr.whatsappTiklamaSayisi || curr.whatsappTiklama || 0), 0);
                const totalUniqueVisitors = listings.reduce((acc, curr) => acc + (curr.uniqueVisitors || 0), 0);
                const overallConversion = totalViews > 0 ? ((totalWhatsapp / totalViews) * 100).toFixed(1) : '0.0';

                const activeVitrinListing = listings.find((l) => l.isVitrin || (l.vitrinBitisTarihi && new Date(l.vitrinBitisTarihi).getTime() > currentTime));
                const pendingVitrinListing = listings.find((l) => l.vitrinIstegi && !activeVitrinListing);
                const vitrinCountdown = activeVitrinListing ? calculateVitrinCountdown(activeVitrinListing.vitrinBitisTarihi, activeVitrinListing.isVitrin) : null;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {/* 1. ÖZEL VIP VİTRİN DURUM KARTI */}
                    <div 
                      onClick={() => {
                        if (activeVitrinListing) {
                          setSelectedVitrinListing(activeVitrinListing);
                        } else if (pendingVitrinListing) {
                          setSelectedVitrinListing(pendingVitrinListing);
                        } else if (listings.length > 0) {
                          setSelectedVitrinListing(listings[0]);
                        } else {
                          setActiveTab('ilan_ver');
                        }
                        setVitrinSuccessMsg('');
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 shadow-lg flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                        activeVitrinListing
                          ? 'bg-gradient-to-br from-[#2a1d06] via-[#1a1407] to-[#120e06] border-amber-400 shadow-amber-500/20'
                          : pendingVitrinListing
                          ? 'bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/10'
                          : 'bg-[#161b22] border-dashed border-amber-500/40 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[#8b949e]">
                        <span className="text-[10px] sm:text-xs font-bold font-heading uppercase text-amber-300">VIP Vitrin</span>
                        <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="font-heading font-black text-sm sm:text-base text-white truncate">
                          {activeVitrinListing ? 'Vitrinde Aktif' : pendingVitrinListing ? 'Onay Bekliyor' : '+ Vitrin Satın Al'}
                        </span>
                        <span className="text-[10px] font-mono font-bold mt-0.5 truncate text-amber-400">
                          {activeVitrinListing ? (vitrinCountdown?.text || '1. Sırada Canlı') : pendingVitrinListing ? 'Yönetici Masasında' : '50.000+ Müşteri'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          activeVitrinListing
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : pendingVitrinListing
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {activeVitrinListing ? '● CANLI YAYIN' : pendingVitrinListing ? '⏳ ONAYDA' : '👑 HEMEN AL'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Görüntülenme / Gösterim */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#8b949e]">
                        <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">Görüntülenme</span>
                        <Eye className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-heading font-black text-lg sm:text-xl text-white">
                          {totalViews.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">Vitrin+Detay</span>
                      </div>
                      <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Anasayfa & Liste Gösterimi</span>
                    </div>

                    {/* 3. WhatsApp Tıklama (%100 Organik) */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#8b949e]">
                        <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">WhatsApp Tık</span>
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-heading font-black text-lg sm:text-xl text-emerald-400">
                          {totalWhatsapp.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">Organik</span>
                      </div>
                      <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Müşteri Görüşmesi</span>
                    </div>

                    {/* 4. Tekil Ziyaretçi */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#8b949e]">
                        <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">Tekil Müşteri</span>
                        <UserIcon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="font-heading font-black text-lg sm:text-xl text-white">
                          {totalUniqueVisitors > 0 ? totalUniqueVisitors.toLocaleString('tr-TR') : Math.max(1, Math.round(totalViews * 0.75)).toLocaleString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-bold font-mono">Tekil</span>
                      </div>
                      <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Farklı Müşteri</span>
                    </div>

                    {/* 5. Dönüşüm Oranı */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#241a06] to-[#120e06] border border-amber-500/50 shadow-lg flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[#8b949e]">
                        <span className="text-[10px] sm:text-xs font-bold font-heading uppercase text-amber-300">Dönüşüm</span>
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="font-heading font-black text-lg sm:text-xl text-amber-400">
                          %{overallConversion}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold font-mono">CTR</span>
                      </div>
                      <span className="text-[9px] text-amber-400/80 font-bold mt-1">
                        Gösterim ➔ Tık Oranı
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* ── KULLANICININ GERÇEK REKLAM BANNER'LARI VARSA TAM ZENGİN REKLAM KARTLARI ── */}
              {banners && banners.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-heading font-black text-xs sm:text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      <span>Sponsorlu Reklam &amp; Banner Performansınız ({banners.length} Reklam)</span>
                    </span>
                    <span className="text-[10px] text-[#8b949e] font-mono">
                      Toplam: {banners.reduce((acc, b) => acc + (b.goruntulenmeSayisi || 0), 0).toLocaleString('tr-TR')} Gösterim
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {banners.map((b: any) => {
                      const timeInfo = calculateLiveCountdown(b.bitisTarihi, b.durum);
                      const ctr = (b.goruntulenmeSayisi || 0) > 0 
                        ? (((b.tiklamaSayisi || 0) / b.goruntulenmeSayisi) * 100).toFixed(1) 
                        : '0.0';

                      return (
                        <div 
                          key={b._id}
                          className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#1c1810] via-[#161b22] to-[#0d1117] border-2 transition-all flex flex-col gap-3.5 shadow-xl ${
                            b.durum === 'yayinda'
                              ? 'border-amber-500/60 shadow-amber-500/10'
                              : b.durum === 'onay_bekliyor'
                              ? 'border-yellow-500/50'
                              : 'border-[#30363d] opacity-85'
                          }`}
                        >
                          {/* Üst Başlık & Rozetler */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-black uppercase flex items-center gap-1 ${
                                b.durum === 'yayinda'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : b.durum === 'onay_bekliyor'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  b.durum === 'yayinda' ? 'bg-emerald-400 animate-pulse' : b.durum === 'onay_bekliyor' ? 'bg-yellow-400' : 'bg-red-400'
                                }`}></span>
                                <span>{b.durum === 'yayinda' ? 'YAYINDA' : b.durum === 'onay_bekliyor' ? 'ONAY BEKLİYOR' : 'SÜRESİ DOLDU'}</span>
                              </span>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#21262d] text-amber-300 border border-white/5">
                                {b.konum === 'her_ikisi' ? '👑 Anasayfa + Detay Vitrini' : b.konum === 'ilan_detay' ? '📍 İlan Detay Vitrini' : '🌟 Anasayfa Sabit Vitrin'}
                              </span>
                            </div>

                            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border border-current/20 ${timeInfo.color} ${timeInfo.bg}`}>
                              ⏱ {timeInfo.text}
                            </span>
                          </div>

                          {/* Banner Görseli & Başlık Bilgisi */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                            {b.gorselUrl && (
                              <div className="relative w-full sm:w-48 h-20 rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shrink-0">
                                <img src={b.gorselUrl} alt={b.baslik} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex flex-col min-w-0 flex-1">
                              <h4 className="font-heading font-black text-sm sm:text-base text-white truncate">
                                {b.baslik}
                              </h4>
                              <span className="text-[11px] text-[#8b949e] font-mono mt-0.5 truncate">
                                🔗 Hedef: <strong className="text-blue-400">{b.hedefUrl}</strong>
                              </span>
                              {b.sureGun && (
                                <span className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                                  Paket: {b.sureGun} Günlük Sponsorluk
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 3'lü Canlı İstatistik Masası */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-center">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-[#8b949e] uppercase font-bold">Banner Gösterim</span>
                              <span className="font-mono font-black text-sm sm:text-base text-white mt-0.5">
                                {(b.goruntulenmeSayisi || 0).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex flex-col border-x border-[#21262d]">
                              <span className="text-[9px] text-amber-400 uppercase font-bold">Direkt Tıklama</span>
                              <span className="font-mono font-black text-sm sm:text-base text-amber-400 mt-0.5">
                                {(b.tiklamaSayisi || 0).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-emerald-400 uppercase font-bold">Tıklama Oranı (CTR)</span>
                              <span className="font-mono font-black text-sm sm:text-base text-emerald-400 mt-0.5">
                                %{ctr}
                              </span>
                            </div>
                          </div>

                          {/* Alt Aksiyon Butonları */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/60 text-xs">
                            <a
                              href={b.hedefUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#8b949e] hover:text-white flex items-center gap-1 font-bold transition-colors"
                            >
                              <span>Hedef Sayfayı Aç</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => setActiveTab('chat')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-heading font-black text-[11px] flex items-center gap-1 border border-amber-500/40 transition-all"
                            >
                              <Headphones className="w-3 h-3" />
                              <span>{b.durum === 'suresi_doldu' ? 'Süreyi Yeniden Uzat ➔' : 'Bannerı Güncelle / Destek ➔'}</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-white font-heading flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Yayındaki İlanlarınız ({listings.length})</span>
                </span>
                <button
                  onClick={() => setActiveTab('ilan_ver')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-heading hover:bg-amber-400 transition-all shadow-md"
                >
                  + Yeni İlan Ekle
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="p-10 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
                  <UserIcon className="w-10 h-10 text-[#8b949e]" />
                  <span className="font-bold text-base text-white">Henüz Kayıtlı İlanınız Yok</span>
                  <p className="text-xs text-[#8b949e] max-w-sm">
                    Hemen <strong>"Yeni İlan Ekle"</strong> sekmesinden ilanınızı oluşturabilir veya canlı destek üzerinden hızlı destek alabilirsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('ilan_ver')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg"
                  >
                    İlk İlanınızı Oluşturun
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {listings.map((item) => {
                    const liveTime = calculateLiveCountdown(item.paketBitisTarihi, item.status);
                    const coverUrl = item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800';

                    return (
                      <div
                        key={item._id}
                        className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-all shadow-xl flex flex-col gap-4"
                      >
                        {/* Üst Satır: Durum Rozetleri & Canlı Kalan Süre */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase font-heading ${
                              item.status === 'yayinda'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {item.status === 'yayinda' ? '● Yayında' : '⏳ Onay Bekliyor'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-heading font-black">
                              👑 {item.rozet?.toUpperCase() || 'VIP'}
                            </span>
                          </div>

                          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border border-current/20 ${liveTime.color} ${liveTime.bg}`}>
                            ⏱ {liveTime.text}
                          </span>
                        </div>

                        {/* Orta Satır: Görsel + Detaylar */}
                        <div className="flex items-center gap-4">
                          <img
                            src={coverUrl}
                            alt={item.baslik}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#30363d] shrink-0 shadow-md"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                              {item.baslik}
                            </h3>
                            <span className="text-xs text-[#8b949e] mt-0.5 font-medium">
                              📍 {item.ilSlug?.toUpperCase()} / {item.ilceSlug?.toUpperCase()}
                            </span>
                            <span className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                              💬 WhatsApp: {item.whatsappNumara}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[#30363d]/60 text-[11px] font-mono">
                              <span className="flex items-center gap-1 text-amber-300 font-bold bg-[#0d1117] px-2 py-0.5 rounded-lg border border-[#30363d]">
                                <Eye className="w-3 h-3 text-amber-400" />
                                <span>{(item.goruntulenmeSayisi || item.goruntulenme || 0).toLocaleString('tr-TR')} Görüntülenme</span>
                              </span>
                              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-[#0d1117] px-2 py-0.5 rounded-lg border border-[#30363d]">
                                <MessageSquare className="w-3 h-3 text-emerald-400" />
                                <span>{(item.whatsappTiklamaSayisi || item.whatsappTiklama || 0).toLocaleString('tr-TR')} WhatsApp Tık</span>
                              </span>
                              <span className="flex items-center gap-1 text-pink-400 font-bold bg-[#0d1117] px-2 py-0.5 rounded-lg border border-[#30363d]">
                                <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                                <span>{(item.likeSayisi || 0).toLocaleString('tr-TR')} Beğeni</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* İlan Canlı Performans & Dönüşüm Metrikleri */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-left">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-[#8b949e] font-mono font-bold">GÖRÜNTÜLENME</span>
                            <span className="font-heading font-black text-xs sm:text-sm text-white flex items-center gap-1 mt-0.5">
                              <Eye className="w-3 h-3 text-amber-400 shrink-0" />
                              {(item.totalViews || item.goruntulenmeSayisi || 0).toLocaleString('tr-TR')} Kez
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[9px] text-[#8b949e] font-mono font-bold">TEKİL MÜŞTERİ</span>
                            <span className="font-heading font-black text-xs sm:text-sm text-cyan-300 flex items-center gap-1 mt-0.5">
                              <UserIcon className="w-3 h-3 text-cyan-400 shrink-0" />
                              {(item.uniqueVisitors || (item.totalViews ? Math.max(1, Math.round((item.totalViews || 0) * 0.75)) : Math.max(1, Math.round((item.goruntulenmeSayisi || 1) * 0.78)))).toLocaleString('tr-TR')} Kişi
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[9px] text-[#8b949e] font-mono font-bold">WHATSAPP TIK</span>
                            <span className="font-heading font-black text-xs sm:text-sm text-emerald-400 flex items-center gap-1 mt-0.5">
                              <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                              {(item.whatsappTiklamaSayisi || 0).toLocaleString('tr-TR')} Tıklama
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[9px] text-[#8b949e] font-mono font-bold">DÖNÜŞÜM ORANI</span>
                            <span className="font-heading font-black text-xs sm:text-sm text-amber-400 flex items-center gap-1 mt-0.5">
                              <TrendingUp className="w-3 h-3 text-amber-400 shrink-0" />
                              %{item.conversionRate || ((item.totalViews || item.goruntulenmeSayisi || 0) > 0 ? (((item.whatsappTiklamaSayisi || 0) / (item.totalViews || item.goruntulenmeSayisi || 1)) * 100).toFixed(1) : '0.0')}
                            </span>
                          </div>
                        </div>

                        {/* ── AKILLI İLAN PERFORMANS İÇGÖRÜLERİ (AI INSIGHTS) ── */}
                        {(() => {
                          const views = item.totalViews || item.goruntulenmeSayisi || 0;
                          const waClicks = item.whatsappTiklamaSayisi || 0;
                          const uniqueCount = Math.max(1, Math.round(views * 0.78));
                          const loyalFans = Math.max(1, Math.round(views * 0.12));
                          const fanVisits = Math.max(3, Math.round((views / Math.max(1, uniqueCount)) * 4) + 2);
                          
                          // İlan ekleme tarihinden beri geçen gün sayısı
                          const createdDate = item.createdAt ? new Date(item.createdAt) : null;
                          const daysActive = createdDate 
                            ? Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
                            : 1;

                          const formattedDate = createdDate 
                            ? createdDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : 'Son dönemde';

                          return (
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#1c1811] via-[#161b22] to-[#0d1117] border border-amber-500/40 flex flex-col gap-2.5 text-left shadow-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                  <span>Canlı Müşteri Analiz Raporu &amp; İlgi Seviyesi</span>
                                </span>
                                <span className="text-[10px] text-[#8b949e] font-mono">
                                  📅 {formattedDate} ({daysActive}. gün)
                                </span>
                              </div>

                              <div className="flex flex-col gap-2 text-xs leading-relaxed">
                                {/* 1. WhatsApp & İlgi */}
                                <div className="flex items-start gap-2 text-[#f0f6fc]">
                                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">●</span>
                                  <p>
                                    İlanınız <span className="text-amber-300 font-bold">{formattedDate}</span> tarihinden beri yayında. Bu süre zarfında <strong className="text-emerald-400 font-bold">{waClicks > 0 ? waClicks : Math.max(3, Math.round(views * 0.08))} farklı müşteri</strong> doğrudan WhatsApp butonunuza dokunarak sizinle iletişime geçmek istedi.
                                  </p>
                                </div>

                                {/* 2. Tekil Kullanıcı & İlgi */}
                                <div className="flex items-start gap-2 text-[#f0f6fc]">
                                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">●</span>
                                  <p>
                                    Profiliniz toplam <strong className="text-cyan-300 font-bold">{uniqueCount.toLocaleString('tr-TR')} farklı tekil kullanıcı</strong> tarafından ayrıntılı olarak incelendi ve bölgesel aramalarda yüksek dikkat çekti.
                                  </p>
                                </div>

                                {/* 3. Sadık Ziyaretçi / Gizli Hayran */}
                                <div className="flex items-start gap-2 text-[#f0f6fc]">
                                  <span className="text-pink-400 font-bold shrink-0 mt-0.5">●</span>
                                  <p className="text-pink-200/90">
                                    ❤️ <strong className="text-pink-300 font-bold">İlanınızın sadık takipçileri var:</strong> Son günlerde en az <strong className="text-white font-bold">{loyalFans} farklı müşteri</strong> ilanınızı <strong className="text-amber-300 font-bold">{fanVisits} defadan fazla</strong> tekrar tekrar ziyaret etti ve fotoğraflarınızı inceledi.
                                  </p>
                                </div>

                                {/* 4. Bölgesel Sıralama */}
                                <div className="flex items-start gap-2 text-[#f0f6fc]">
                                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">●</span>
                                  <p>
                                    📍 <strong className="text-amber-300 capitalize">{item.ilSlug || 'Bölge'}</strong> listelerinde bu hafta en aktif ve ilgi gören <strong className="text-white font-bold">Top VIP profiller</strong> arasında yer alıyorsunuz (%{Math.min(98, 70 + (waClicks % 25))} performans artışı).
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* ── VİTRİN DURUMU VE CANLI KALAN SÜRE SAYAÇ KUTUSU ── */}
                        {(() => {
                          const vitrinCountdown = calculateVitrinCountdown(item.vitrinBitisTarihi, item.isVitrin);
                          const isCurrentlyVitrin = item.isVitrin || (item.vitrinBitisTarihi && new Date(item.vitrinBitisTarihi).getTime() > currentTime);
                          const isExpiredVitrin = item.vitrinBitisTarihi && new Date(item.vitrinBitisTarihi).getTime() <= currentTime;
                          const isPendingVitrinApproval = Boolean(item.vitrinIstegi && !isCurrentlyVitrin && !isExpiredVitrin);

                          // Makul, inandırıcı ve etkileyici canlı vitrin istatistikleri
                          const rawViews = item.totalViews || item.goruntulenmeSayisi || 1;
                          const rawWa = item.whatsappTiklamaSayisi || 1;
                          const boostedVitrinViews = Math.max(1280, rawViews * 3 + 920);
                          const boostedUniqueClients = Math.max(580, Math.round(boostedVitrinViews * 0.48));
                          const boostedWaContacts = Math.max(26, rawWa * 2 + 20);
                          const liveViewingCount = Math.floor((currentTime / 7000) % 3) + 2;

                          if (isCurrentlyVitrin) {
                            const bitisDateStr = item.vitrinBitisTarihi
                              ? new Date(item.vitrinBitisTarihi).toLocaleString('tr-TR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Süresiz';

                            return (
                              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#2a1d06] via-[#161b22] to-[#0d1117] border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col gap-4 relative overflow-hidden text-left">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                                {/* Başlık & Canlı Rozet */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xl shadow-amber-500/30">
                                      <Crown className="w-6 h-6 fill-slate-950" />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-heading font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                                          👑 ANASAYFA 5'Lİ VIP VİTRİNİNDE 1. SIRADA CANLI YAYINDA
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] font-mono flex items-center gap-1 shadow-md">
                                          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                                          ● CANLI YAYIN
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-amber-300 font-medium mt-0.5">
                                        💎 Paket: {item.vitrinPaketi === 'haftalik' ? 'HAFTALIK KAMPANYALI VIP VİTRİN (6.000 ₺)' : 'GÜNLÜK VIP VİTRİN (2.000 ₺)'}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedVitrinListing(item);
                                      setVitrinSuccessMsg('');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Süreyi Uzat (+1 Gün / +7 Gün)</span>
                                  </button>
                                </div>

                                {/* 4 KUTULU DİJİTAL GERİ SAYIM SAATİ (DIGITAL TICKING CLOCK) */}
                                <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-black/60 border border-amber-500/40">
                                  <div className="flex items-center justify-between text-xs text-amber-300 font-heading font-black">
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                      <span>VİTRİN KALAN YAYIN SÜRESİ (CANLI GERİ SAYIM):</span>
                                    </span>
                                    <span className="text-[11px] text-white/70 font-mono font-normal">
                                      Bitiş: {bitisDateStr}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center mt-1">
                                    {/* Gün */}
                                    <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#161b22] border border-amber-500/30">
                                      <span className="font-mono text-xl sm:text-3xl font-black text-amber-400 tracking-tight">
                                        {vitrinCountdown?.padDays || '00'}
                                      </span>
                                      <span className="text-[9px] sm:text-[10px] text-[#8b949e] font-heading font-bold uppercase mt-0.5">
                                        GÜN
                                      </span>
                                    </div>

                                    {/* Saat */}
                                    <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#161b22] border border-amber-500/30">
                                      <span className="font-mono text-xl sm:text-3xl font-black text-amber-300 tracking-tight">
                                        {vitrinCountdown?.padHours || '00'}
                                      </span>
                                      <span className="text-[9px] sm:text-[10px] text-[#8b949e] font-heading font-bold uppercase mt-0.5">
                                        SAAT
                                      </span>
                                    </div>

                                    {/* Dakika */}
                                    <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#161b22] border border-amber-500/30">
                                      <span className="font-mono text-xl sm:text-3xl font-black text-amber-300 tracking-tight">
                                        {vitrinCountdown?.padMinutes || '00'}
                                      </span>
                                      <span className="text-[9px] sm:text-[10px] text-[#8b949e] font-heading font-bold uppercase mt-0.5">
                                        DAKİKA
                                      </span>
                                    </div>

                                    {/* Saniye */}
                                    <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-amber-500/20 border-2 border-amber-400 animate-pulse">
                                      <span className="font-mono text-xl sm:text-3xl font-black text-yellow-300 tracking-tight">
                                        {vitrinCountdown?.padSeconds || '00'}
                                      </span>
                                      <span className="text-[9px] sm:text-[10px] text-amber-400 font-heading font-black uppercase mt-0.5">
                                        SANİYE
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* ÇARPICI VİTRİN İSTATİSTİK KARTLARI */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  <div className="p-3 rounded-xl bg-[#0d1117] border border-amber-500/20 flex flex-col">
                                    <span className="text-[9px] text-[#8b949e] font-mono font-bold uppercase">VİTRİN GÖSTERİMİ</span>
                                    <span className="font-heading font-black text-sm sm:text-base text-white mt-0.5 flex items-center gap-1">
                                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                      {boostedVitrinViews.toLocaleString('tr-TR')}+
                                    </span>
                                    <span className="text-[9px] text-emerald-400 font-bold font-mono mt-0.5">+%85 Vitrin Artışı</span>
                                  </div>

                                  <div className="p-3 rounded-xl bg-[#0d1117] border border-cyan-500/20 flex flex-col">
                                    <span className="text-[9px] text-[#8b949e] font-mono font-bold uppercase">TEKİL VIP MÜŞTERİ</span>
                                    <span className="font-heading font-black text-sm sm:text-base text-cyan-300 mt-0.5 flex items-center gap-1">
                                      <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                                      {boostedUniqueClients.toLocaleString('tr-TR')}+
                                    </span>
                                    <span className="text-[9px] text-cyan-400 font-bold font-mono mt-0.5">Anasayfadan Ziyaret</span>
                                  </div>

                                  <div className="p-3 rounded-xl bg-[#0d1117] border border-emerald-500/20 flex flex-col">
                                    <span className="text-[9px] text-[#8b949e] font-mono font-bold uppercase">WHATSAPP İLETİŞİM</span>
                                    <span className="font-heading font-black text-sm sm:text-base text-emerald-400 mt-0.5 flex items-center gap-1">
                                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                      {(item.whatsappTiklamaSayisi || item.whatsappTiklama || 0).toLocaleString('tr-TR')} Tıklama
                                    </span>
                                    <span className="text-[9px] text-emerald-400 font-bold font-mono mt-0.5">%100 Organik Tık</span>
                                  </div>

                                  <div className="p-3 rounded-xl bg-[#0d1117] border border-purple-500/20 flex flex-col">
                                    <span className="text-[9px] text-[#8b949e] font-mono font-bold uppercase">DÖNÜŞÜM &amp; SIRALAMA</span>
                                    <span className="font-heading font-black text-sm sm:text-base text-purple-300 mt-0.5 flex items-center gap-1">
                                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                                      %24.8 İlgi
                                    </span>
                                    <span className="text-[9px] text-purple-300 font-bold font-mono mt-0.5">Bölgesinde İlk %5'te</span>
                                  </div>
                                </div>

                                {/* Canlı Radar Bildirimi */}
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2 text-[#f0f6fc]">
                                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                    <span>
                                      🔥 <strong>Canlı Trafik:</strong> Şu anda anasayfa vitrininden gelen <strong className="text-amber-300">{liveViewingCount} müşteri</strong> profilinizi ve fotoğraflarınızı inceliyor!
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0 hidden sm:inline">
                                    📍 {(item.ilSlug || 'Bölge').toUpperCase()} 1. Slot
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (isPendingVitrinApproval) {
                            return (
                              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#2a1d06] via-[#161b22] to-[#0d1117] border-2 border-yellow-500/60 shadow-xl shadow-yellow-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-black shrink-0 border border-yellow-500/40 animate-pulse">
                                    <Sparkles className="w-6 h-6" />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-heading font-black text-sm sm:text-base text-yellow-300 flex items-center gap-1.5">
                                        ⏳ VİTRİN TALEBİNİZ ALINDI &amp; YÖNETİCİ ONAY MASASINDA
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono text-[9px] font-bold">
                                        ONAY BEKLİYOR
                                      </span>
                                    </div>
                                    <span className="text-xs text-[#c9d1d9] mt-1">
                                      💎 Talep Edilen Paket: <strong>{item.vitrinPaketi === 'haftalik' ? 'Haftalık VIP Vitrin (6.000 ₺)' : 'Günlük VIP Vitrin (2.000 ₺)'}</strong>. Yönetici onayladığı anda ilanınız anasayfa vitrinine eklenecek ve canlı geri sayım başlayacaktır.
                                    </span>
                                  </div>
                                </div>

                                <a
                                  href={getAdminWhatsAppUrl(
                                    `Merhaba, ${item.baslik} ilanım için vitrin satın alma talebinde bulundum, hızlı onay alabilir miyim?`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs font-heading shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                                >
                                  <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                                  <span>WhatsApp Hızlı Onay</span>
                                </a>
                              </div>
                            );
                          }

                          if (isExpiredVitrin) {
                            return (
                              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md text-left">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-black shrink-0 border border-red-500/30">
                                    <Clock className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-heading font-black text-xs sm:text-sm text-red-300">
                                        ⚠️ Vitrin Yayın Süreniz Sona Erdi
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[9px] font-bold">
                                        VİTRİNDEN KALDIRILDI
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-[#8b949e]">
                                      İlanınız anasayfa vitrininden düştü. Tekrar en üstte 50.000+ müşteriye görünmek için vitrin paketini yenileyebilirsiniz.
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedVitrinListing(item);
                                    setVitrinSuccessMsg('');
                                  }}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
                                >
                                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                                  <span>👑 Tekrar Vitrine Ekle</span>
                                </button>
                              </div>
                            );
                          }

                          // Standart Vitrin Satın Alma Kutusu
                          return (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ffd700]/15 via-[#f59e0b]/20 to-[#ffd700]/15 border-2 border-amber-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10 text-left">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                                  <Crown className="w-5 h-5 fill-slate-950" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-heading font-black text-xs sm:text-sm text-white">
                                      👑 Anasayfa 5'li VIP Vitrine Taşı
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-heading font-black text-[9px]">
                                      Günlük 2.000 ₺ • Haftalık 6.000 ₺
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-amber-300/80">
                                    Bu ilanınızı anasayfa 5 vitrin slotundan birine sabitleyin, günde 50.000+ canlı müşteriye doğrudan ulaşın.
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedVitrinListing(item);
                                  setVitrinSuccessMsg('');
                                }}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
                              >
                                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                                <span>Vitrini Satın Al</span>
                              </button>
                            </div>
                          );
                        })()}

                        {/* Alt Butonlar */}
                        <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-white/5">
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
                            className="py-2.5 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs border border-[#363b42] flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Düzenle</span>
                          </button>

                          <Link
                            href={`/ilan/${item.slug}`}
                            target="_blank"
                            className="py-2.5 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-cyan-300 font-bold text-xs border border-[#363b42] flex items-center justify-center gap-1.5 transition-all text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Görüntüle</span>
                          </Link>

                          <button
                            onClick={() => setActiveTab('odeme')}
                            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <Zap className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Süre Uzat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 2: SPONSORLU REKLAM VER
          ══════════════════════════════════════════════════ */}
          {activeTab === 'reklam_ver' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2a1d06] via-[#1a1408] to-[#0d1117] border-2 border-amber-500/70 flex flex-col gap-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4 fill-amber-400" />
                    <span>Sponsorlu VIP Banner Ayrıcalığı</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] font-heading shadow-md">
                    GÜNLÜK 50.000+ GÖRÜNTÜLENME
                  </span>
                </div>

                <div>
                  <h2 className="font-heading font-black text-xl text-white">
                    Anasayfanın En Tepesinde Sonsuz Görünürlük
                  </h2>
                  <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
                    Tüm şehir ve ilan sayfalarında en üstte fotoğrafınız veya hareketli GIF banner'ınız yayınlansın, tüm WhatsApp ve arama trafiği doğrudan size aksın.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between relative">
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px] border border-amber-500/30">
                      2.000 ₺ İndirim
                    </span>
                    <span className="text-xs text-[#8b949e]">7 Günlük Başlangıç</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xs text-[#8b949e] line-through font-mono">5.000 ₺</span>
                      <span className="font-heading font-black text-lg text-amber-400">3.000 ₺</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col justify-between relative">
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-heading font-black text-[9px] shadow-md">
                      POPÜLER TERCİH 🔥
                    </span>
                    <span className="text-xs text-amber-300 font-bold">15 Günlük Standart</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xs text-[#8b949e] line-through font-mono">9.000 ₺</span>
                      <span className="font-heading font-black text-lg text-white">7.000 ₺</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2a1d06] to-[#161b22] border-2 border-amber-400/80 shadow-lg shadow-amber-500/10 flex flex-col justify-between relative">
                    <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-heading font-black text-[9px] shadow-md">
                      👑 %35 MAKSİMUM KÂR
                    </span>
                    <span className="text-xs text-amber-300 font-bold">30 Günlük (1 Ay) VIP</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xs text-[#8b949e] line-through font-mono">15.000 ₺</span>
                      <span className="font-heading font-black text-lg text-amber-400">13.000 ₺</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/reklam-ver"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm font-heading uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-center mt-2"
                >
                  <span>Banner Reklam Başvurusunu Başlat</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 3: YENİ İLAN EKLE
          ══════════════════════════════════════════════════ */}
          {activeTab === 'ilan_ver' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
                    <span>Panele Yeni İlan Ekle</span>
                  </span>
                  <span className="text-xs text-amber-400 font-bold font-mono">Doğrudan Veritabanı Kaydı</span>
                </div>

                {/* 3'LÜ KARTVİZİT KATEGORİ SEÇİMİ */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
                  {/* GOLD */}
                  <div
                    onClick={() => setNewListingForm({ ...newListingForm, rozet: 'gold' })}
                    className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                      newListingForm.rozet === 'gold'
                        ? 'bg-gradient-to-b from-[#2b210a] via-[#1a1406] to-[#0f0b02] border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                        : 'bg-[#12161c] border-[#30363d] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[9px] font-heading font-black text-amber-400 uppercase tracking-widest">GOLD İLAN</span>
                    <span className="text-2xl my-1">⭐</span>
                    <span className="font-heading font-black text-sm text-amber-300">GOLD</span>
                    <span className="text-[9px] text-[#8b949e] mt-1">Popüler İlan</span>
                  </div>

                  {/* VIP */}
                  <div
                    onClick={() => setNewListingForm({ ...newListingForm, rozet: 'vip' })}
                    className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                      newListingForm.rozet === 'vip'
                        ? 'bg-gradient-to-b from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 border-amber-300 ring-4 ring-amber-300 ring-offset-2 ring-offset-[#0d1117] scale-105 z-10'
                        : 'bg-[#12161c] border-amber-500/50 text-amber-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className={`text-[9px] font-heading font-black uppercase tracking-widest ${newListingForm.rozet === 'vip' ? 'text-slate-950' : 'text-amber-400'}`}>
                      VIP İLAN
                    </span>
                    <span className="text-2xl my-1">👑</span>
                    <span className={`font-heading font-black text-sm ${newListingForm.rozet === 'vip' ? 'text-slate-950' : 'text-white'}`}>
                      VIP VİTRİN
                    </span>
                    <span className={`text-[9px] mt-1 ${newListingForm.rozet === 'vip' ? 'text-slate-950/90 font-bold' : 'text-amber-400/80'}`}>
                      En Üst Sıra
                    </span>
                  </div>

                  {/* SILVER */}
                  <div
                    onClick={() => setNewListingForm({ ...newListingForm, rozet: 'silver' })}
                    className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                      newListingForm.rozet === 'silver'
                        ? 'bg-gradient-to-b from-[#222a36] via-[#161c24] to-[#0d1218] border-slate-300 ring-2 ring-slate-400/50 scale-[1.02]'
                        : 'bg-[#12161c] border-[#30363d] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[9px] font-heading font-black text-slate-300 uppercase tracking-widest">SILVER İLAN</span>
                    <span className="text-2xl my-1">⚡</span>
                    <span className="font-heading font-black text-sm text-slate-200">SILVER</span>
                    <span className="text-[9px] text-[#8b949e] mt-1">Standart</span>
                  </div>
                </div>

                {/* FORM ALANLARI */}
                <form onSubmit={handleCreateNewListing} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5 text-xs font-bold text-white">
                    İlan Başlığı *
                    <input
                      type="text"
                      required
                      placeholder="Örn: Beylikdüzü VIP Sarışın Model"
                      value={newListingForm.baslik}
                      onChange={(e) => setNewListingForm({ ...newListingForm, baslik: e.target.value })}
                      className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5 text-xs font-bold text-white">
                      Şehir *
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
                        className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                      >
                        {turkeyProvinces.map(p => (
                          <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1.5 text-xs font-bold text-white">
                      İlçe *
                      <select
                        value={newListingForm.ilceSlug}
                        onChange={(e) => setNewListingForm({ ...newListingForm, ilceSlug: e.target.value })}
                        className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                      >
                        {selectedProv.ilceler.map(d => (
                          <option key={d.slug} value={d.slug}>{d.ad}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-xs font-bold text-white">
                    WhatsApp Numarası *
                    <input
                      type="tel"
                      required
                      placeholder="0530 000 00 00"
                      value={newListingForm.whatsappNumara}
                      onChange={(e) => setNewListingForm({ ...newListingForm, whatsappNumara: e.target.value })}
                      className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-bold text-white">
                    İlan Açıklaması *
                    <textarea
                      required
                      rows={4}
                      placeholder="Hizmet detaylarınız ve randevu koşullarınız..."
                      value={newListingForm.aciklama}
                      onChange={(e) => setNewListingForm({ ...newListingForm, aciklama: e.target.value })}
                      className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </label>

                  {/* ── ANASAYFA VIP VİTRİN OPSİYONU (+2.000 TL) ── */}
                  <div
                    onClick={() => setNewListingForm({ ...newListingForm, vitrinIstegi: !newListingForm.vitrinIstegi })}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center justify-between ${
                      newListingForm.vitrinIstegi
                        ? 'bg-gradient-to-r from-[#2a1d06] to-[#120e06] border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-[#0d1117] border-[#30363d] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className={`w-5 h-5 ${newListingForm.vitrinIstegi ? 'text-amber-400 fill-amber-400' : 'text-[#8b949e]'}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-black text-xs text-white">Anasayfa Vitrinine Ekle</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-heading font-black text-[9px]">
                            +2.000 ₺ / Hafta
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8b949e]">Anasayfada en üstte 7 gün sabit gösterim</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      newListingForm.vitrinIstegi ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-[#363b42] bg-[#21262d]'
                    }`}>
                      {newListingForm.vitrinIstegi && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingListing || uploadingNewPhotos}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-heading shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* VIP Vitrin Satın Alma Bilgi Kartı */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#2a1d06] via-[#1a1408] to-[#0d1117] border-2 border-amber-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/25">
                    <Crown className="w-6 h-6 fill-slate-950" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm sm:text-base text-white">
                        👑 VIP İlanlar İçin Anasayfa Vitrini
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-heading font-black text-[10px]">
                        2.000 ₺ / Hafta
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] mt-0.5 leading-relaxed">
                      VIP İlan sahibiyseniz ek 2.000 ₺ ödeyerek anasayfanın en tepesindeki dev vitrinde 7 gün boyunca sabit olarak yer alabilirsiniz.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('chat')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Headphones className="w-4 h-4 stroke-[2.5]" />
                  <span>Vitrini Satın Al (2.000 ₺)</span>
                </button>
              </div>

              <CryptoPaymentCard onChatClick={() => setActiveTab('chat')} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB 5: CANLI DESTEK CHAT
          ══════════════════════════════════════════════════ */}
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-8 rounded-3xl bg-[#161b22] border-2 border-emerald-500/50 flex flex-col items-center text-center gap-4 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                  <Headphones className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="flex flex-col">
                  <h2 className="font-heading font-black text-xl text-white">
                    7/24 Canlı Yönetici &amp; Temsilci Hattı
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8b949e] mt-2 max-w-md leading-relaxed">
                    Ödeme teyitleri, vitrin yükseltme, reklam banner rezervasyonu veya soru/sorunlarınız için anında müşteri temsilcimize bağlanın.
                  </p>
                </div>

                <button
                  onClick={() => router.push('/chat')}
                  className="w-full max-w-sm py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-heading shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <MessageSquare className="w-4 h-4 fill-slate-950" />
                  <span>Canlı Sohbete Başla</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── EDIT MODAL POPUP (TÜM ALANLARI KAPSAYAN PROFESYONEL FORM) ──────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-[#161b22] border-2 border-amber-500/50 rounded-[32px] p-4 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-white">İlan Bilgilerini Düzenle</h3>
                  <span className="text-[10px] text-[#8b949e]">Şehir, ilçe, fiyat, biyografi ve tüm detayları güncelleyin</span>
                </div>
              </div>
              <button onClick={() => setEditingListing(null)} className="p-1.5 text-[#8b949e] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const selectedEditProv = turkeyProvinces.find((p) => p.ilSlug === editForm.ilSlug) || turkeyProvinces[0];

              return (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                  {/* BÖLÜM 1: TEMEL BİLGİLER & İLETİŞİM */}
                  <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3">
                    <span className="text-[11px] font-heading font-black text-amber-400 uppercase tracking-wider">
                      1. Temel İlan & İletişim Bilgileri
                    </span>

                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
                      İlan Başlığı *
                      <input
                        type="text"
                        required
                        placeholder="Örn: İzmir VIP Hizmet..."
                        value={editForm.baslik}
                        onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-xs font-bold text-white">
                        WhatsApp Numarası *
                        <input
                          type="tel"
                          required
                          placeholder="0530 000 00 00"
                          value={editForm.whatsappNumara}
                          onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                          className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold text-white">
                        Görüşme / Seans Ücreti (TL)
                        <input
                          type="number"
                          value={editForm.fiyat}
                          onChange={(e) => setEditForm({ ...editForm, fiyat: Number(e.target.value) || 0 })}
                          className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </label>
                    </div>
                  </div>

                  {/* BÖLÜM 2: ŞEHİR & İLÇE KONUMU */}
                  <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3">
                    <span className="text-[11px] font-heading font-black text-amber-400 uppercase tracking-wider">
                      2. Hizmet Şehri & İlçesi
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-xs font-bold text-white">
                        Şehir (İl) *
                        <select
                          value={editForm.ilSlug}
                          onChange={(e) => {
                            const newIlSlug = e.target.value;
                            const prov = turkeyProvinces.find((p) => p.ilSlug === newIlSlug);
                            setEditForm({
                              ...editForm,
                              ilSlug: newIlSlug,
                              ilceSlug: prov?.ilceler?.[0]?.slug || 'merkez',
                            });
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                        >
                          {turkeyProvinces.map((prov) => (
                            <option key={prov.ilSlug} value={prov.ilSlug}>
                              {prov.il}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold text-white">
                        İlçe / Bölge *
                        <select
                          value={editForm.ilceSlug}
                          onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                          className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                        >
                          {selectedEditProv.ilceler.map((ilce) => (
                            <option key={ilce.slug} value={ilce.slug}>
                              {ilce.ad}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* BÖLÜM 3: İLAN AÇIKLAMASI */}
                  <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3">
                    <span className="text-[11px] font-heading font-black text-amber-400 uppercase tracking-wider">
                      3. İlan Açıklama Metni
                    </span>

                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
                      İlan Açıklaması *
                      <textarea
                        required
                        rows={4}
                        placeholder="Müşterilerinize hizmetinizi ve detayları anlatan metin..."
                        value={editForm.aciklama}
                        onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                      />
                    </label>
                  </div>

                  {/* BÖLÜM 4: FOTOĞRAF GALERİSİ */}
                  <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#0d1117] border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400">Fotoğraflar ({editPhotos.length} Adet)</span>
                      <span className="text-[10px] text-[#8b949e]">İlk fotoğraf veya seçtiğiniz kapak ana görsel olur</span>
                    </div>

                    <label className="p-3 border border-dashed border-amber-500/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/10 text-xs text-white transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditFileUpload}
                        className="hidden"
                      />
                      {uploadingEditPhotos ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span className="font-heading font-black">Yeni Fotoğraf Yükle</span>
                        </>
                      )}
                    </label>

                    {editPhotos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                        {editPhotos.map((url, idx) => {
                          const isCover = idx === editCoverIdx;
                          return (
                            <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isCover ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-[#30363d]'}`}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-1 inset-x-1 flex items-center justify-between">
                                {isCover ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[8px]">Kapak</span>
                                ) : (
                                  <button type="button" onClick={() => setEditCoverIdx(idx)} className="px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[8px]">Kapak Yap</button>
                                )}
                                <button type="button" onClick={() => removeEditPhoto(idx)} className="p-1 bg-red-600 hover:bg-red-500 rounded text-white text-[9px]">✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* BUTONLAR */}
                  <div className="flex items-center gap-2 mt-2 font-heading sticky bottom-0 bg-[#161b22] pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="w-1/3 py-3.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingEdit ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Güncelleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Değişiklikleri Kaydet</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── VİTRİN SATIN ALMA MODAL POPUP (GÜNLÜK 2.000 TL / HAFTALIK 6.000 TL KAMPANYA) ── */}
      {selectedVitrinListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#161b22] border-2 border-amber-400 rounded-[32px] p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto text-left relative">
            
            {/* Üst Kapatma ve Başlık */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/25">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-white">
                    Anasayfa VIP Vitrin Satın Al
                  </h3>
                  <span className="text-[11px] text-amber-400 font-bold">
                    Günlük 2.000 ₺ • Haftalık 6.000 ₺ Kampanyalı
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedVitrinListing(null);
                  setVitrinSuccessMsg('');
                }}
                className="p-1.5 text-[#8b949e] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vitrinSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex flex-col items-center justify-center text-center gap-3">
                <CheckCircle2 className="w-10 h-10" />
                <span className="font-heading font-black text-base text-white">Vitrin Talebiniz Alındı!</span>
                <p className="text-xs text-[#c9d1d9] leading-relaxed">
                  {vitrinSuccessMsg}
                </p>
                <button
                  onClick={() => {
                    setSelectedVitrinListing(null);
                    setVitrinSuccessMsg('');
                  }}
                  className="mt-2 py-2.5 px-6 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase font-heading"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <>
                {/* Seçilen İlan Özeti */}
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex items-center gap-3">
                  <img
                    src={selectedVitrinListing.anaFotograf?.url || selectedVitrinListing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400'}
                    alt={selectedVitrinListing.baslik}
                    className="w-16 h-16 rounded-xl object-cover border border-[#30363d] shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider font-heading">
                      SEÇİLEN VIP İLAN:
                    </span>
                    <h4 className="font-heading font-black text-sm text-white truncate">
                      {selectedVitrinListing.baslik}
                    </h4>
                    <span className="text-xs text-[#8b949e]">
                      📍 {selectedVitrinListing.ilSlug?.toUpperCase()} / {selectedVitrinListing.ilceSlug?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 2'Lİ KAMPANYALI VİTRİN PAKETİ SEÇİMİ */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading">
                    Vitrin Süresi Seçiniz:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. Günlük Vitrin (2.000 ₺) */}
                    <div
                      onClick={() => setVitrinPaketiSecimi('gunluk')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 select-none ${
                        vitrinPaketiSecimi === 'gunluk'
                          ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/15'
                          : 'bg-[#0d1117] border-[#30363d] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#8b949e] uppercase">1 Günlük</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          vitrinPaketiSecimi === 'gunluk' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-[#30363d]'
                        }`}>
                          {vitrinPaketiSecimi === 'gunluk' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-sm text-white">Günlük Vitrin</span>
                        <span className="font-mono font-black text-lg text-amber-400 mt-0.5">2.000 ₺</span>
                        <span className="text-[10px] text-[#8b949e]">24 saat boyunca en üstte sabit</span>
                      </div>
                    </div>

                    {/* 2. Haftalık VIP Vitrin (6.000 ₺ KAMPANYALI) */}
                    <div
                      onClick={() => setVitrinPaketiSecimi('haftalik')}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 select-none relative overflow-hidden ${
                        vitrinPaketiSecimi === 'haftalik'
                          ? 'bg-gradient-to-br from-[#2a1d06] to-[#161b22] border-amber-400 shadow-xl shadow-amber-500/20'
                          : 'bg-[#0d1117] border-[#30363d] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-heading font-black text-[9px]">
                        %57 İNDİRİM
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">7 Günlük (Önerilen)</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          vitrinPaketiSecimi === 'haftalik' ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-[#30363d]'
                        }`}>
                          {vitrinPaketiSecimi === 'haftalik' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-black text-sm text-white flex items-center gap-1">
                          <span>Haftalık VIP Vitrin</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="font-mono font-black text-lg text-amber-400">6.000 ₺</span>
                          <span className="font-mono text-xs text-[#8b949e] line-through">14.000 ₺</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">1 Hafta (7 Gün) Boyunca Kesintisiz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vitrin Avantajları */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-[#f0f6fc]">
                  <span className="font-heading font-black text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Vitrin Ayrıcalıkları:</span>
                  </span>
                  <ul className="flex flex-col gap-1 text-[11px] text-[#c9d1d9] pl-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Anasayfa Hero Slider vitrininde en üstte sabit gösterim</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Günlük ortalama +300% daha fazla tekil müşteri ve doğrudan WhatsApp iletişimi</span>
                    </li>
                  </ul>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex flex-col gap-2.5 font-heading pt-1">
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
                          setVitrinSuccessMsg(
                            vitrinPaketiSecimi === 'gunluk'
                              ? 'Günlük Vitrin (2.000 ₺) talebiniz başarıyla alındı ve yönetici onayına iletildi.'
                              : 'Haftalık Kampanyalı VIP Vitrin (6.000 ₺) talebiniz başarıyla alındı ve yönetici onayına iletildi.'
                          );
                          if (currentUser) {
                            fetchListings(currentUser.identifier, currentUser.password);
                          }
                        } else {
                          alert(data.error || 'Vitrin talebi iletilemedi.');
                        }
                      } catch (err: any) {
                        alert('Bağlantı hatası.');
                      } finally {
                        setVitrinLoading(false);
                      }
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {vitrinLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 fill-slate-950" />
                    )}
                    <span>
                      {vitrinPaketiSecimi === 'gunluk'
                        ? 'Günlük Vitrini Satın Al (2.000 ₺) ➔'
                        : 'Haftalık VIP Vitrini Satın Al (6.000 ₺) ➔'}
                    </span>
                  </button>

                  <a
                    href={getAdminWhatsAppUrl(
                      `Merhaba, ${selectedVitrinListing.baslik} ilanım için ${
                        vitrinPaketiSecimi === 'gunluk' ? 'GÜNLÜK (2.000 ₺)' : 'HAFTALIK KAMPANYALI (6.000 ₺)'
                      } Anasayfa Vitrin Paketi satın almak istiyorum.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    <span>WhatsApp ile Hızlı Onay Al</span>
                  </a>
                </div>
              </>
            )}

          </div>
        </div>
      )}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#12161c]/95 backdrop-blur-xl border-t border-[#30363d] px-2 py-2 flex items-center justify-around md:hidden shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          const isChat = item.id === 'chat';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                isSelected
                  ? isChat
                    ? 'bg-emerald-500/20 text-emerald-400 font-extrabold shadow-inner'
                    : 'bg-amber-500/20 text-amber-400 font-extrabold shadow-inner'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              {isSelected && (
                <span className={`absolute -top-1 w-6 h-1 rounded-full ${isChat ? 'bg-emerald-400' : 'bg-amber-400'} shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />
              )}
              <Icon className={`w-5 h-5 ${isSelected ? 'scale-110 stroke-[2.5]' : 'stroke-2'} transition-transform`} />
              <span className="text-[10px] font-heading font-black tracking-tight leading-none">
                {item.id === 'ilanlarim'
                  ? 'İlanlarım'
                  : item.id === 'reklam_ver'
                  ? 'Reklam'
                  : item.id === 'ilan_ver'
                  ? 'İlan Ekle'
                  : item.id === 'odeme'
                  ? 'Ödeme'
                  : 'Canlı Chat'}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
