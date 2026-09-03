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

export default function PanelimPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Tab Navigation State: 'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'
  const [activeTab, setActiveTab] = useState<'ilanlarim' | 'reklam_ver' | 'ilan_ver' | 'odeme' | 'chat'>('ilanlarim');

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
    tamAd: '',
    yas: 23,
    boy: 173,
    kilo: 54,
    gogusOlcusu: '85C (Doğal)',
    sacRengi: 'Kumral',
    gozRengi: 'Ela',
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
    tamAd: ''
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
        setListings(data.listings || []);
        setBanners(data.banners || []);
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
          identifier: telefon.trim(),
          password: panelSifresi.trim(),
          telefon: data.user.telefon || telefon.trim(),
          ad: data.user.ad || 'İlan Sahibi',
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
    if (!editingListing) return;
    setSavingEdit(true);

    try {
      const res = await fetch('/api/listings/edit-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          telefon: currentUser.telefon,
          panelSifresi: currentUser.panelSifresi,
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
        fetchListings(currentUser.telefon, currentUser.panelSifresi);
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
                İlan verirken belirlediğiniz WhatsApp Numaranız ve İlan Şifreniz ile giriş yapın.
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
              WhatsApp Numaranız *
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0530 000 00 00"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors font-mono font-medium"
                />
                <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              İlan Şifreniz *
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
              <span>Şifrenizi mi Unuttunuz?</span>
            </span>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              İlan şifrenizi hatırlamıyorsanız canlı destek üzerinden numaranızı teyit ederek şifrenizi anında sıfırlayabilirsiniz.
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
                {currentUser.ad}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Doğrulanmış Üye
              </span>
            </div>
            <span className="text-xs text-amber-400 font-bold font-mono mt-0.5">
              📱 {currentUser.telefon} • {listings.length} Aktif İlan Yayında
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
              
              {/* ── 4'LÜ İSTATİSTİK KARTLARI (VERİTABANINDAN %100 GERÇEK CANLI VERİLER) ──────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Görüntülenme */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">Görüntülenme</span>
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-heading font-black text-xl sm:text-2xl text-white">
                      {listings.reduce((acc, curr) => acc + (curr.goruntulenmeSayisi || curr.goruntulenme || 0), 0).toLocaleString('tr-TR')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">Gerçek</span>
                  </div>
                  <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Tekil Ziyaretçi</span>
                </div>

                {/* 2. WhatsApp Tıklama */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">WhatsApp İletişim</span>
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-heading font-black text-xl sm:text-2xl text-emerald-400">
                      {listings.reduce((acc, curr) => acc + (curr.whatsappTiklamaSayisi || curr.whatsappTiklama || 0), 0).toLocaleString('tr-TR')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">Canlı Tık</span>
                  </div>
                  <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Müşteri Yönlendirme</span>
                </div>

                {/* 3. Beğeni & Favori */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[10px] sm:text-xs font-bold font-heading uppercase">Beğeni / İlgi</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-heading font-black text-xl sm:text-2xl text-white">
                      {listings.reduce((acc, curr) => acc + (curr.likeSayisi || 0), 0).toLocaleString('tr-TR')}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold font-mono">Favori</span>
                  </div>
                  <span className="text-[9px] text-[#8b949e] mt-1 font-mono">Toplam Etkileşim</span>
                </div>

                {/* 4. Yayın & Kategori Durumu */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#241a06] to-[#120e06] border border-amber-500/50 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#8b949e]">
                    <span className="text-[10px] sm:text-xs font-bold font-heading uppercase text-amber-300">Vitrin Durumu</span>
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-heading font-black text-base sm:text-lg text-amber-400 truncate">
                      {listings.length > 0 
                        ? (listings[0].status === 'yayinda' 
                            ? `${(listings[0].rozet || 'VIP').toUpperCase()} (Aktif)` 
                            : 'Onay Bekliyor')
                        : 'İlan Yok'}
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-400/80 font-bold mt-1">
                    {listings.length > 0 && listings[0].status === 'yayinda' ? '✓ Google & Yandex Yayında' : 'İnceleme Sürecinde'}
                  </span>
                </div>
              </div>

              {/* ── KULLANICININ GERÇEK REKLAM BANNER'I VARSA ÖZEL REKLAM PERFORMANS KARTI ── */}
              {banners && banners.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#2a1d06] via-[#1a1408] to-[#0d1117] border-2 border-amber-500/70 flex flex-col gap-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      <span>Aktif Sponsorlu Reklam Performansınız ({banners.length} Banner)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/30">
                      ● Reklamınız Yayında
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-left">
                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                      <span className="text-[10px] text-[#8b949e]">Banner Görüntülenme</span>
                      <span className="font-heading font-black text-base sm:text-lg text-white mt-1">
                        {banners.reduce((acc, b) => acc + (b.goruntulenmeSayisi || 0), 0).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col">
                      <span className="text-[10px] text-[#8b949e]">Doğrudan Reklam Tıklaması</span>
                      <span className="font-heading font-black text-base sm:text-lg text-amber-400 mt-1">
                        {banners.reduce((acc, b) => acc + (b.tiklamaSayisi || 0), 0).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-center">
                      <span className="text-[10px] text-amber-300 font-bold">Reklam Konumu</span>
                      <span className="font-heading font-black text-xs text-white uppercase mt-0.5">
                        {banners[0]?.konum === 'her_ikisi' ? 'Anasayfa + Detaylar' : banners[0]?.konum?.toUpperCase() || 'ANASAYFA'}
                      </span>
                    </div>
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
                          <div className="flex flex-col min-w-0">
                            <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                              {item.baslik}
                            </h3>
                            <span className="text-xs text-[#8b949e] mt-0.5 font-medium">
                              📍 {item.ilSlug?.toUpperCase()} / {item.ilceSlug?.toUpperCase()}
                            </span>
                            <span className="text-xs text-emerald-400 font-mono font-bold mt-1">
                              💬 WhatsApp: {item.whatsappNumara}
                            </span>
                          </div>
                        </div>

                        {/* Alt Butonlar */}
                        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/5">
                          <button
                            onClick={() => {
                              setEditingListing(item);
                              setEditPhotos((item.fotograflar || []).map((f: any) => typeof f === 'string' ? f : f.url));
                              setEditForm({
                                baslik: item.baslik || '',
                                aciklama: item.aciklama || '',
                                whatsappNumara: item.whatsappNumara || '',
                                tamAd: item.tamAd || '',
                                yas: item.yas || 23,
                                boy: item.boy || 173,
                                kilo: item.kilo || 54,
                                gogusOlcusu: item.gogusOlcusu || '85C (Doğal)',
                                sacRengi: item.sacRengi || 'Kumral',
                                gozRengi: item.gozRengi || 'Ela',
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
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs text-[#8b949e]">7 Günlük Banner</span>
                    <span className="font-heading font-black text-lg text-amber-400 mt-2">5.000 ₺</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/50 flex flex-col justify-between relative">
                    <span className="text-xs text-amber-300 font-bold">15 Gün (En Popüler) 🔥</span>
                    <span className="font-heading font-black text-lg text-white mt-2">9.000 ₺</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs text-[#8b949e]">30 Günlük Banner</span>
                    <span className="font-heading font-black text-lg text-amber-400 mt-2">15.000 ₺</span>
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

                  {/* Fotoğraf Yükleme */}
                  <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#0d1117] border border-white/10">
                    <span className="text-xs font-bold text-amber-400">İlan Fotoğrafları ({newPhotos.length} Adet)</span>
                    <label className="p-4 border-2 border-dashed border-amber-500/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/10 text-xs sm:text-sm text-white font-bold">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewFileUpload}
                        className="hidden"
                      />
                      {uploadingNewPhotos ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Galeriden Fotoğraf Seç &amp; Yükle</span>
                        </>
                      )}
                    </label>

                    {newPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-1">
                        {newPhotos.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/20">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 p-1 bg-red-600 rounded text-white text-[10px]"
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

      {/* ── EDIT MODAL POPUP ──────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161b22] border-2 border-amber-500/50 rounded-[32px] p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading font-black text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>İlanı Düzenle</span>
              </span>
              <button onClick={() => setEditingListing(null)} className="p-1 text-[#8b949e] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-white">
                Başlık *
                <input
                  type="text"
                  required
                  value={editForm.baslik}
                  onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-white">
                WhatsApp Numarası *
                <input
                  type="tel"
                  required
                  value={editForm.whatsappNumara}
                  onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-white">
                Açıklama Metni *
                <textarea
                  required
                  rows={4}
                  value={editForm.aciklama}
                  onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </label>

              {/* Fotoğraf Düzenleme */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#0d1117] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400">Fotoğraflar ({editPhotos.length} Adet)</span>
                </div>

                <label className="p-2.5 border border-dashed border-amber-500/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/10 text-xs text-white">
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
                      <span>Yeni Fotoğraf Ekle</span>
                    </>
                  )}
                </label>

                {editPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {editPhotos.map((url, idx) => {
                      const isCover = idx === editCoverIdx;
                      return (
                        <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isCover ? 'border-amber-400' : 'border-[#30363d]'}`}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-1 inset-x-1 flex items-center justify-between">
                            {isCover ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[8px]">Kapak</span>
                            ) : (
                              <button type="button" onClick={() => setEditCoverIdx(idx)} className="px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[8px]">Kapak Yap</button>
                            )}
                            <button type="button" onClick={() => removeEditPhoto(idx)} className="p-1 bg-red-600 rounded text-white text-[9px]">✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 font-heading">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="w-1/3 py-3 rounded-xl bg-[#21262d] text-white text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg uppercase"
                >
                  {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBİL SABİT ALT GEZİNME ÇUBUĞU (MOBILE BOTTOM BAR)
      ══════════════════════════════════════════════════ */}
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
