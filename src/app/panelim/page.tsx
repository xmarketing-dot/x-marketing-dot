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
  Award, 
  Medal,
  ArrowRight,
  Save,
  X,
  Calendar,
  Timer,
  Upload,
  Image as ImageIcon,
  Trash2,
  AtSign,
  Phone,
  KeyRound
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';

export default function PanelimPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    diller: 'Türkçe, İngilizce, Rusça',
    hizmetMekanlari: 'Kendi Evi, Lüks Otel, Rezidans, Seyahat',
    hakkindaBiyografi: '',
  });
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [editCoverIdx, setEditCoverIdx] = useState(0);
  const [uploadingEditPhotos, setUploadingEditPhotos] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // New Listing Modal State (Inside Dashboard)
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [newListingForm, setNewListingForm] = useState({
    baslik: '',
    aciklama: '',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    rozet: 'ultravip',
    yayinSuresi: 'haftalik',
  });
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [newCoverIdx, setNewCoverIdx] = useState(0);
  const [uploadingNewPhotos, setUploadingNewPhotos] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);

  // Live real-time 1-second countdown interval ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        fetchUserListings(parsed);
      } catch (e) {
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserListings = async (user: any) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (user._id) query.set('kullaniciId', user._id);
      if (user.telefon) query.set('telefon', user.telefon);

      const res = await fetch(`/api/listings/my-listings?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.listings) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setLoginError(data.error || 'Giriş yapılamadı.');
      } else if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        fetchUserListings(data.user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Giriş hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setListings([]);
  };

  // Helper to calculate live real-time countdown (Days, Hours, Minutes, Seconds)
  const calculateLiveCountdown = (endDateStr?: string, status?: string) => {
    if (status === 'onay_bekliyor') {
      return { 
        countdown: '⏳ Onay ve Yönetici Kontrolü Bekleniyor', 
        endDateFormatted: 'Admin onayından sonra süre başlar',
        isExpired: false, 
        isPending: true 
      };
    }
    if (!endDateStr) {
      return { 
        countdown: 'Süre Belirtilmedi', 
        endDateFormatted: '-',
        isExpired: false, 
        isPending: false 
      };
    }

    const endMs = new Date(endDateStr).getTime();
    const diff = endMs - currentTime;

    const endDate = new Date(endDateStr);
    const endDateFormatted = endDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diff <= 0) {
      return { 
        countdown: '🔴 Yayının Süresi Doldu', 
        endDateFormatted: `Bitiş: ${endDateFormatted}`,
        isExpired: true, 
        isPending: false 
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      countdown: `${days > 0 ? `${days}g ` : ''}${pad(hours)}s ${pad(minutes)}d ${pad(seconds)}sn`,
      endDateFormatted: `Bitiş: ${endDateFormatted}`,
      isExpired: false,
      isPending: false,
    };
  };

  // Handle Edit File Upload
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
        setEditPhotos((prev) => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Yükleme başarısız.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploadingEditPhotos(false);
    }
  };

  const removeEditPhoto = (index: number) => {
    if (editPhotos.length <= 1) {
      alert('İlanda en az 1 adet fotoğraf bulunmalıdır!');
      return;
    }
    const updated = editPhotos.filter((_, idx) => idx !== index);
    setEditPhotos(updated);
    if (editCoverIdx >= updated.length) {
      setEditCoverIdx(0);
    }
  };

  // Handle Edit Submit (Ensures expiration time never changes)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setSavingEdit(true);
    try {
      const coverUrl = editPhotos[editCoverIdx] || editPhotos[0] || '';
      const res = await fetch(`/api/listings/${editingListing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          fotograflar: editPhotos.map((url) => ({ url })),
          anaFotografUrl: coverUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.listing) {
        setListings((prev) => prev.map((l) => (l._id === data.listing._id ? { ...l, ...data.listing } : l)));
        setEditingListing(null);
        alert('İlan bilgileriniz ve fotoğraflarınız başarıyla güncellendi! (Yayın süreniz aynen korunmuştur)');
      } else {
        alert(data.error || 'Güncelleme yapılamadı.');
      }
    } catch (err) {
      alert('Güncelleme hatası.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Create New Listing From Inside Dashboard
  const handleCreateNewListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhotos.length === 0) {
      alert('Lütfen en az 1 adet fotoğraf yükleyin!');
      return;
    }

    setCreatingListing(true);
    try {
      const coverUrl = newPhotos[newCoverIdx] || newPhotos[0];
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListingForm,
          whatsappNumara: currentUser?.telefon || '0500 000 00 00',
          kullaniciId: currentUser?._id || null,
          anaFotografUrl: coverUrl,
          fotograflar: newPhotos.map((url) => ({ url })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.listing) {
        setListings((prev) => [data.listing, ...prev]);
        setShowNewListingModal(false);
        setNewPhotos([]);
        setNewListingForm({
          baslik: '',
          aciklama: '',
          ilSlug: 'istanbul',
          ilceSlug: 'beylikduzu',
          rozet: 'ultravip',
          yayinSuresi: 'haftalik',
        });
        alert('Yeni ilanınız oluşturuldu ve onay sürecine alındı! Yöneticimiz inceledikten sonra hemen yayına alacaktır.');
      } else {
        alert(data.error || 'İlan oluşturulamadı.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setCreatingListing(false);
    }
  };

  const handleUploadNewPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingNewPhotos(true);
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setNewPhotos((prev) => [...prev, ...data.urls].slice(0, 7));
      } else {
        alert(data.error || 'Yükleme hatası');
      }
    } catch (err) {
      alert('Fotoğraf yükleme hatası');
    } finally {
      setUploadingNewPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs text-[#8b949e] font-bold font-heading">İlan Paneliniz Yükleniyor...</span>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 1. KULLANICI ADI & ŞİFRE GİRİŞ EKRANI
  // ══════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-md mx-auto min-h-[75vh] justify-center">
        <div className="p-6 sm:p-8 rounded-[32px] bg-[#161b22] border-2 border-[#30363d] shadow-2xl flex flex-col gap-6 text-center">
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/25">
              <UserIcon className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-black text-2xl text-white font-heading">Kullanıcı İlan Paneli</h1>
              <p className="text-xs sm:text-sm text-[#8b949e] mt-1 font-medium">
                Yönetici tarafından tanımlanan Kullanıcı Adınız ve Şifreniz ile giriş yapın.
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
              Kullanıcı Adı *
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors font-medium"
                />
                <AtSign className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              Giriş Şifresi *
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Giriş Yapılıyor...</span>
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
              <span>Hesabınız Henüz Yok mu?</span>
            </span>
            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              İlan verdikten sonra canlı destek üzerinden ödemenizi teyit ederek size özel kullanıcı adı ve şifrenizi anında alabilirsiniz.
            </p>
            <Link
              href="/chat"
              className="text-xs text-amber-400 font-black hover:underline mt-1 flex items-center gap-1 font-heading"
            >
              <span>Canlı Desteğe Bağlan ➔</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 2. GİRİŞ YAPILMIŞ MOBİL UYUMLU KULLANICI DASHBOARD'I
  // ══════════════════════════════════════════════════
  const selectedProv = turkeyProvinces.find((p) => p.ilSlug === newListingForm.ilSlug) || turkeyProvinces[0];

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-2xl mx-auto pb-16">
      
      {/* ── ÜST PROFİL / DASHBOARD BAŞLIĞI ──────────────── */}
      <div className="p-5 sm:p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl shadow-lg">
            {currentUser.ad?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-base sm:text-lg text-white font-heading flex items-center gap-1.5">
              <span>{currentUser.ad}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h1>
            <span className="text-xs text-amber-400 font-bold font-mono">
              @{currentUser.kullaniciAdi} • {listings.length} Adet İlanınız Var
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#21262d] hover:bg-red-500/20 hover:text-red-400 text-[#8b949e] font-bold text-xs border border-[#363b42] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>

      {/* ── HIZLI İLAN VER & SÜRE UZAT BUTONLARI ──────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-black text-xs uppercase tracking-widest text-[#8b949e] font-heading">
          Yayınlarınız ve Canlı Kalan Süreleriniz
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-amber-500/40 text-amber-400 font-bold text-xs font-heading flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>Süre Uzat &amp; Ödeme</span>
          </button>

          <button
            onClick={() => setShowNewListingModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yeni İlan Ekle</span>
          </button>
        </div>
      </div>

      {/* ── İLAN KARTLARI LİSTESİ ──────────────── */}
      {listings.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#21262d] text-[#8b949e] flex items-center justify-center">
            <UserIcon className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-white">Henüz Kayıtlı İlanınız Yok</span>
          <p className="text-xs text-[#8b949e] max-w-xs">
            Hemen yukarıdaki <strong>"Yeni İlan Ekle"</strong> butonuna basarak ilanınızı oluşturabilirsiniz. İlanınız admin onayından sonra hemen yayına alınır.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((item) => {
            const liveTime = calculateLiveCountdown(item.paketBitisTarihi, item.status);
            const coverUrl = item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800';

            return (
              <div
                key={item._id}
                className="p-5 rounded-[28px] bg-[#161b22] border border-[#30363d] hover:border-amber-500/40 transition-all shadow-xl flex flex-col gap-4"
              >
                {/* ÜST ROZETLER & DURUM */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase font-heading ${
                      item.status === 'yayinda'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.status === 'yayinda' ? '🟢 Yayında' : '⏳ Onay Bekliyor'}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase border border-amber-500/20 font-heading">
                      {item.rozet?.toUpperCase() || 'ULTRA VIP'}
                    </span>
                  </div>
                </div>

                {/* ── CANLI SANİYELİ GERİ SAYIM SAYACI PANELİ ──────────────── */}
                <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  liveTime.isExpired
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : liveTime.isPending
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-gradient-to-r from-cyan-950/40 via-[#161b22] to-amber-950/30 border-cyan-500/40 text-cyan-300 shadow-md'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Timer className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider">Kalan Canlı Süre:</span>
                      <span className="font-mono font-black text-sm sm:text-base text-white tracking-wider">
                        {liveTime.countdown}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#8b949e] font-medium sm:text-right">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{liveTime.endDateFormatted}</span>
                  </div>
                </div>

                {/* İLAN GÖRSELİ VE DETAYI */}
                <div className="flex gap-3.5 items-start">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border border-[#30363d] shrink-0 bg-[#0d1117] relative">
                    <img src={coverUrl} alt={item.baslik} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-bold">
                      {item.fotograflar?.length || 1} Foto
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <h2 className="font-black text-sm sm:text-base text-white truncate font-heading">
                      {item.baslik}
                    </h2>
                    <span className="text-xs text-amber-400 font-bold capitalize">
                      📍 {item.ilSlug} / {item.ilceSlug}
                    </span>
                    <span className="text-xs text-[#8b949e] font-medium truncate">
                      📞 WhatsApp: {item.whatsappNumara}
                    </span>

                    {/* İSTATİSTİKLER */}
                    <div className="flex items-center gap-4 text-xs text-[#8b949e] font-bold mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.goruntulenmeSayisi || 0} Görüntülenme</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.whatsappTiklamaSayisi || 0} WhatsApp Tıklama</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* İŞLEM BUTONLARI */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-heading">
                  {/* 1. İLAN DÜZENLE */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingListing(item);
                      const photos = item.fotograflar && item.fotograflar.length > 0
                        ? item.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
                        : [item.anaFotograf?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800'];
                      setEditPhotos(photos);
                      const coverIdx = photos.findIndex((u: string) => u === item.anaFotograf?.url);
                      setEditCoverIdx(coverIdx >= 0 ? coverIdx : 0);
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

                  {/* 2. CANLI GÖRÜNTÜLE */}
                  <Link
                    href={`/ilan/${item.slug}`}
                    target="_blank"
                    className="py-2.5 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-cyan-300 font-bold text-xs border border-[#363b42] flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Görüntüle</span>
                  </Link>

                  {/* 3. SÜRE UZAT / YÜKSELT */}
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
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

      {/* ── ÖDEME VE SÜRE UZATMA KRİPTO CÜZDAN MODALI (AÇILIR POPUP) ──────────────── */}
      {showPaymentModal && (
        <div 
          onClick={() => setShowPaymentModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white border border-[#30363d] shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <CryptoPaymentCard onChatClick={() => {
              setShowPaymentModal(false);
              router.push('/chat');
            }} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          YENİ İLAN EKLEME MODALI (ONAY SÜRECİNE GİRER)
      ══════════════════════════════════════════════════ */}
      {showNewListingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161b22] border-2 border-amber-500/50 rounded-[32px] p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-white font-heading font-black text-base">
                  <Plus className="w-5 h-5 text-amber-400 stroke-[3]" />
                  <span>Yeni İlan Oluştur</span>
                </div>
                <span className="text-[11px] text-amber-300 font-bold mt-0.5">
                  ⏳ İlanınız kaydedildikten sonra admin onayına gönderilecektir.
                </span>
              </div>

              <button
                onClick={() => setShowNewListingModal(false)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewListing} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Vitrin Rozeti
                  <select
                    value={newListingForm.rozet}
                    onChange={(e) => setNewListingForm({ ...newListingForm, rozet: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="ultravip">💎 Ultra VIP</option>
                    <option value="vip">⭐ VIP İlan</option>
                    <option value="gold">🥇 Gold İlan</option>
                    <option value="silver">🥈 Silver İlan</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Yayın Süresi
                  <select
                    value={newListingForm.yayinSuresi}
                    onChange={(e) => setNewListingForm({ ...newListingForm, yayinSuresi: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-emerald-500/50 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="gunluk">📅 1 Günlük</option>
                    <option value="haftalik">📆 1 Haftalık</option>
                    <option value="aylik">🗓️ 1 Aylık</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                İlan Başlığı *
                <input
                  type="text"
                  required
                  placeholder="Örn: İstanbul Beylikdüzü VIP Hizmet"
                  value={newListingForm.baslik}
                  onChange={(e) => setNewListingForm({ ...newListingForm, baslik: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                Detaylı Açıklama *
                <textarea
                  required
                  rows={4}
                  placeholder="İlan açıklaması..."
                  value={newListingForm.aciklama}
                  onChange={(e) => setNewListingForm({ ...newListingForm, aciklama: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İl Seçin *
                  <select
                    value={newListingForm.ilSlug}
                    onChange={(e) => {
                      const newIl = e.target.value;
                      const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                      setNewListingForm({
                        ...newListingForm,
                        ilSlug: newIl,
                        ilceSlug: prov?.ilceler[0]?.slug || 'merkez',
                      });
                    }}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İlçe Seçin *
                  <select
                    value={newListingForm.ilceSlug}
                    onChange={(e) => setNewListingForm({ ...newListingForm, ilceSlug: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {selectedProv.ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* FOTOĞRAF YÜKLEME ALANI */}
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#0d1117] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-heading">
                    Fotoğraflar ({newPhotos.length}/7)
                  </span>
                  <label className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadNewPhotos}
                      className="hidden"
                      disabled={uploadingNewPhotos}
                    />
                    {uploadingNewPhotos ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 stroke-[2.5]" />}
                    <span>Fotoğraf Ekle</span>
                  </label>
                </div>

                {newPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {newPhotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#30363d]">
                        <img src={url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewPhotos(newPhotos.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={creatingListing || uploadingNewPhotos}
                className="w-full py-4 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-xl flex items-center justify-center gap-2 mt-1"
              >
                {creatingListing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Onaya Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>İlanı Onaya Gönder</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MEVCUT İLAN DÜZENLEME MODALI (ZAMAN ASLA DEĞİŞMEZ)
      ══════════════════════════════════════════════════ */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161b22] border-2 border-amber-500/50 rounded-[32px] p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-white font-heading font-black text-base">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <span>İlan Bilgilerini Düzenle</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold mt-0.5">
                  🛡️ Bilgiler güncellendiğinde yayın süreniz aynen korunur.
                </span>
              </div>

              <button
                onClick={() => setEditingListing(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                İlan Başlığı *
                <input
                  type="text"
                  required
                  value={editForm.baslik}
                  onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                WhatsApp İletişim Numarası *
                <input
                  type="text"
                  required
                  value={editForm.whatsappNumara}
                  onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                Detaylı İlan Açıklaması *
                <textarea
                  required
                  rows={4}
                  value={editForm.aciklama}
                  onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* ── FOTOĞRAF DÜZENLEME ALANI (PANEL DÜZENLEME) ──────────────── */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 font-heading uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>İlan Fotoğrafları ({editPhotos.length} Adet)</span>
                  </span>
                  <span className="text-[11px] text-[#8b949e]">Yeni Fotoğraf Ekle</span>
                </div>

                {/* Upload Input */}
                <label className="relative flex flex-col items-center justify-center p-3.5 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all text-center gap-2 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploadingEditPhotos}
                  />
                  {uploadingEditPhotos ? (
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fotoğraflar Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white text-xs font-bold font-heading">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Galeriden Yeni Fotoğraf Seç &amp; Ekle</span>
                    </div>
                  )}
                </label>

                {/* Photo Previews */}
                {editPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2.5 mt-1">
                    {editPhotos.map((url, idx) => {
                      const isCover = idx === editCoverIdx;
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1.5 bg-[#161b22] ${
                            isCover ? 'border-amber-400 shadow-md shadow-amber-500/30' : 'border-[#30363d]'
                          }`}
                        >
                          <img src={url} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />

                          <div className="relative z-20 flex items-center justify-between w-full">
                            {isCover ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5 font-heading">
                                <Star className="w-3 h-3 fill-slate-950" />
                                Kapak
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditCoverIdx(idx)}
                                className="px-1.5 py-0.5 rounded-md bg-[#161b22]/90 text-amber-400 font-bold text-[9px] hover:bg-amber-500 hover:text-slate-950 font-heading"
                              >
                                Kapak Yap
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeEditPhoto(idx)}
                              className="p-1 rounded-md bg-red-600/90 text-white hover:bg-red-500 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 font-heading">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="w-1/3 py-3.5 px-4 rounded-xl bg-[#21262d] text-white font-bold text-xs border border-[#363b42]"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {savingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

