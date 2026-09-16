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
  ChevronDown,
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

  // Expanded analytics state per listing
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  // Vitrin Satın Alma Modal State
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

  // Online Heartbeat Tracker
  useEffect(() => {
    if (!currentUser) return;
    
    const sendHeartbeat = (status = 'online') => {
      const activeIdent = currentUser.identifier || currentUser.telefon || currentUser.kullaniciAdi;
      if (!activeIdent) return;

      if (status === 'offline' && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery when tab is closing
        const blob = new Blob([JSON.stringify({ identifier: activeIdent, status })], { type: 'application/json' });
        navigator.sendBeacon('/api/user-panel/heartbeat', blob);
      } else {
        fetch('/api/user-panel/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: activeIdent, status })
        }).catch(() => {});
      }
    };

    // Initial ping
    sendHeartbeat('online');

    // Interval ping every 30 seconds
    const intervalId = setInterval(() => sendHeartbeat('online'), 30000);

    // Offline signal on tab close
    const handleUnload = () => sendHeartbeat('offline');
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload); // For iOS Safari

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [currentUser]);

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
    // Send offline ping before logging out
    if (currentUser) {
      const activeIdent = currentUser.identifier || currentUser.telefon || currentUser.kullaniciAdi;
      if (activeIdent) {
        fetch('/api/user-panel/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: activeIdent, status: 'offline' })
        }).catch(() => {});
      }
    }

    localStorage.removeItem('panel_user_session');
    setCurrentUser(null);
    setListings([]);
    setTelefon('');
    setPanelSifresi('');
  };

  const calculateLiveCountdown = (bitisTarihiStr: string | null | undefined, status: string) => {
    if (status !== 'yayinda') {
      return { text: 'Onay Bekliyor', expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    if (!bitisTarihiStr) {
      return { text: 'Süresiz VIP', expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
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

    return { text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, expired: false, color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const calculateVitrinCountdown = (vitrinBitisTarihiStr: string | null | undefined, isVitrin?: boolean) => {
    if (!vitrinBitisTarihiStr && !isVitrin) {
      return null;
    }
    if (!vitrinBitisTarihiStr && isVitrin) {
      return { 
        text: 'Vitrinde (Süresiz)', 
        expired: false, 
        color: 'text-amber-400',
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
      color: 'text-amber-300',
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
  // 1. GİRİŞ YAPILMAMIŞ DURUM (NATIVE MOBIL GİRİŞ)
  // ══════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090d14] text-[#f0f6fc] flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-2xl shadow-amber-500/20">
            <KeyRound className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="font-heading font-black text-2xl text-white mt-3">İlan Sahibi Paneli</h1>
          <p className="text-xs text-[#8b949e]">Kullanıcı Adınız veya Telefonunuz ile bağlanın</p>
        </div>

        {loginError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Kullanıcı Adınız veya Telefon"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#12161f] border border-white/10 text-white text-sm placeholder:text-[#8b949e] focus:outline-none focus:border-amber-400 transition-colors"
            />
            <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              placeholder="Şifreniz"
              value={panelSifresi}
              onChange={(e) => setPanelSifresi(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#12161f] border border-white/10 text-white text-sm placeholder:text-[#8b949e] focus:outline-none focus:border-amber-400 transition-colors"
            />
            <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-4" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2 text-center">
          <span className="text-xs text-[#8b949e]">Şifrenizi hatırlamıyor musunuz?</span>
          <Link
            href="/chat"
            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>7/24 Canlı Destekten Şifremi İste</span>
          </Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // 2. GİRİŞ YAPILMIŞ TAM NATIVE MOBİL KONTROL MERKEZİ
  // ══════════════════════════════════════════════════
  const selectedProv = turkeyProvinces.find((p) => p.ilSlug === newListingForm.ilSlug) || turkeyProvinces[0];

  const menuItems = [
    { id: 'ilanlarim', label: 'İlanlarım', count: listings.length, icon: Star },
    { id: 'reklam_ver', label: 'VIP Reklam', badge: '🔥 %300', icon: Crown },
    { id: 'ilan_ver', label: 'İlan Ekle', icon: Plus },
    { id: 'odeme', label: 'Ödeme / Süre', icon: CreditCard },
    { id: 'chat', label: 'Destek', badge: '7/24', icon: Headphones },
  ];

  const totalViews = listings.reduce((acc, curr) => acc + (curr.totalViews || curr.goruntulenmeSayisi || curr.goruntulenme || 0), 0);
  const totalWhatsapp = listings.reduce((acc, curr) => acc + (curr.whatsappTiklamaSayisi || curr.whatsappTiklama || 0), 0);
  const totalUniqueVisitors = listings.reduce((acc, curr) => acc + (curr.uniqueVisitors || 0), 0);
  const overallConversion = totalViews > 0 ? ((totalWhatsapp / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#090d14] text-[#f0f6fc] font-sans pb-28 select-none">
      
      {/* ── NATIVE APP TOP BAR ──────────────── */}
      <header className="sticky top-0 z-30 bg-[#090d14]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              {currentUser.ad?.charAt(0).toUpperCase() || 'İ'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-sm text-white">
                  {currentUser.kullaniciAdi || currentUser.ad}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[11px] text-[#8b949e] font-mono">
                {currentUser.telefon ? currentUser.telefon : 'Doğrulanmış Profil'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 active:scale-95 transition-all"
              title="Canlı Destek"
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#8b949e] hover:text-rose-400 active:scale-95 transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── NATIVE SEGMENTED PILL TAB BAR ──────────────── */}
        <div className="max-w-2xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-[#8b949e] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-slate-950 text-amber-300' : 'bg-white/10 text-white'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] text-amber-300 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ──────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 flex flex-col gap-4">

        {/* ══════════════════════════════════════════════════
            TAB 1: İLANLARIM & PERFORMANS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'ilanlarim' && (
          <div className="flex flex-col gap-4 animate-fadeIn">

            {/* ── NATIVE HORIZONTAL METRICS BAR (Kart Yok, Tek Satır KPI) ──────────────── */}
            <div className="grid grid-cols-4 py-2.5 px-3 bg-[#12161f] rounded-2xl border border-white/5 text-center divide-x divide-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#8b949e] font-bold">GÖSTERİM</span>
                <span className="font-heading font-black text-sm text-white mt-0.5">
                  {totalViews.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-emerald-400 font-bold">WHATSAPP</span>
                <span className="font-heading font-black text-sm text-emerald-400 mt-0.5">
                  {totalWhatsapp.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-300 font-bold">MÜŞTERİ</span>
                <span className="font-heading font-black text-sm text-white mt-0.5">
                  {(totalUniqueVisitors || Math.max(1, Math.round(totalViews * 0.75))).toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-amber-400 font-bold">DÖNÜŞÜM</span>
                <span className="font-heading font-black text-sm text-amber-400 mt-0.5">
                  %{overallConversion}
                </span>
              </div>
            </div>

            {/* ── AKTİF VİTRİN BİLGİLENDİRME (Varsa Minimal Tek Satır) ── */}
            {(() => {
              const activeVitrin = listings.find((l) => l.isVitrin || (l.vitrinBitisTarihi && new Date(l.vitrinBitisTarihi).getTime() > currentTime));
              if (activeVitrin) {
                const vitrinCd = calculateVitrinCountdown(activeVitrin.vitrinBitisTarihi, activeVitrin.isVitrin);
                return (
                  <div className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-heading font-black text-white truncate">
                          👑 Anasayfa Vitrininde Yayında
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          Kalan Süre: {vitrinCd?.text}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVitrinListing(activeVitrin);
                        setVitrinSuccessMsg('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-heading font-black text-[11px] shrink-0 active:scale-95"
                    >
                      Uzat
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* ── NATIVE LİSTİNGS LİSTE (KART YOK, SAF NATIVE MOBİL LİSTE ELEMANI) ──────────────── */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs text-[#8b949e]">İlanlarınız yükleniyor...</span>
              </div>
            ) : listings.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#8b949e]">
                  <Star className="w-6 h-6" />
                </div>
                <span className="font-heading font-bold text-sm text-white">Henüz Bir İlanınız Yok</span>
                <button
                  onClick={() => setActiveTab('ilan_ver')}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-heading font-black text-xs uppercase"
                >
                  + İlk İlanını Ekle
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5 bg-[#12161f] rounded-3xl border border-white/5 overflow-hidden">
                {listings.map((item) => {
                  const liveTime = calculateLiveCountdown(item.paketBitisTarihi, item.status);
                  const isVitrinActive = item.isVitrin || (item.vitrinBitisTarihi && new Date(item.vitrinBitisTarihi).getTime() > currentTime);
                  const vitrinCd = calculateVitrinCountdown(item.vitrinBitisTarihi, item.isVitrin);
                  const coverUrl = item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400';
                  const isExpanded = !!expandedInsights[item._id];

                  return (
                    <div key={item._id} className="p-3.5 sm:p-4 flex flex-col gap-3">
                      
                      {/* Üst Satır: Fotoğraf + Bilgiler */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverUrl}
                            alt={item.baslik}
                            className="w-full h-full object-cover"
                          />
                          <span className={`absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            item.rozet === 'vip' ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-white'
                          }`}>
                            {item.rozet?.toUpperCase() || 'VIP'}
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-heading font-black text-sm text-white truncate">
                              {item.baslik}
                            </h3>
                            <span className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full ${
                              item.status === 'yayinda'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {item.status === 'yayinda' ? '● Yayında' : '⏳ Onayda'}
                            </span>
                          </div>

                          <span className="text-[11px] text-[#8b949e] mt-0.5 truncate">
                            📍 {item.ilSlug?.toUpperCase()} / {item.ilceSlug?.toUpperCase()} • 📱 {item.whatsappNumara}
                          </span>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-amber-400 font-mono font-bold bg-white/5 px-2 py-0.5 rounded-md">
                              ⏱ {liveTime.text}
                            </span>
                            {isVitrinActive && (
                              <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{vitrinCd?.text}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hızlı Aksiyon Butonları */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
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
                          className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-heading font-bold text-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Düzenle</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedVitrinListing(item);
                            setVitrinSuccessMsg('');
                          }}
                          className="py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-amber-500/20"
                        >
                          <Crown className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{isVitrinActive ? 'Vitrini Uzat' : 'Vitrine Al'}</span>
                        </button>

                        <Link
                          href={`/ilan/${item.slug}`}
                          target="_blank"
                          className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-cyan-300 font-heading font-bold text-xs flex items-center justify-center gap-1 transition-all text-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Gör</span>
                        </Link>
                      </div>

                      {/* Performans Detayları Açılır Menüsü */}
                      <button
                        onClick={() => setExpandedInsights(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                        className="flex items-center justify-between text-[11px] text-[#8b949e] hover:text-white pt-1 px-1 transition-colors"
                      >
                        <span className="flex items-center gap-1 font-mono">
                          <span>{(item.goruntulenmeSayisi || item.goruntulenme || 0).toLocaleString('tr-TR')} Görüntülenme</span>
                          <span>•</span>
                          <span className="text-emerald-400">{(item.whatsappTiklamaSayisi || item.whatsappTiklama || 0)} Tık</span>
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <span>{isExpanded ? 'Gizle' : 'Detaylı Rapor'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Genişletilmiş Rapor */}
                      {isExpanded && (
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2 text-xs animate-fadeIn">
                          <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-mono pb-1 border-b border-white/5">
                            <span>MÜŞTERİ ANALİZİ</span>
                            <span className="text-amber-400">CANLI VERİ</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center py-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#8b949e]">Tekil Müşteri</span>
                              <span className="font-bold text-white mt-0.5">
                                {(item.uniqueVisitors || Math.max(1, Math.round((item.goruntulenmeSayisi || 1) * 0.78))).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-emerald-400">WhatsApp Tık</span>
                              <span className="font-bold text-emerald-400 mt-0.5">
                                {(item.whatsappTiklamaSayisi || 0)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-amber-400">Dönüşüm</span>
                              <span className="font-bold text-amber-400 mt-0.5">
                                %{((item.whatsappTiklamaSayisi || 0) / Math.max(1, (item.goruntulenmeSayisi || 1)) * 100).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#8b949e] leading-snug pt-1 border-t border-white/5">
                            📍 <strong>{item.ilSlug?.toUpperCase()}</strong> bölgesinde son 7 günde profiliniz yüksek etkileşim aldı.
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SPONSORLU BANNERLAR (Varsa Native Liste) ── */}
            {banners && banners.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-heading font-black text-amber-400 uppercase tracking-wider px-1">
                  Sponsorlu Reklamlarınız ({banners.length})
                </span>
                <div className="flex flex-col divide-y divide-white/5 bg-[#12161f] rounded-3xl border border-white/5 overflow-hidden">
                  {banners.map((b: any) => {
                    const timeInfo = calculateLiveCountdown(b.bitisTarihi, b.durum);
                    return (
                      <div key={b._id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${b.durum === 'yayinda' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            <span className="font-heading font-bold text-xs text-white truncate">
                              {b.baslik || 'Anasayfa Sabit Banner'}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8b949e] mt-0.5 font-mono">
                            {(b.goruntulenmeSayisi || 0).toLocaleString('tr-TR')} Gösterim • {(b.tiklamaSayisi || 0)} Tıklama
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${timeInfo.bg} ${timeInfo.color}`}>
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
            TAB 2: SPONSORLU REKLAM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'reklam_ver' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="p-5 rounded-3xl bg-[#12161f] border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-heading font-black text-sm">
                <Crown className="w-5 h-5 fill-amber-400" />
                <span>Anasayfa Sabit VIP Banner</span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Tüm sayfalarda en üstte sabit fotoğrafınız veya hareketli GIF görseliniz yayınlansın, tüm arama ve WhatsApp trafiği doğrudan size aksın.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-[#8b949e]">7 Gün</span>
                  <span className="font-heading font-black text-sm text-amber-400 mt-1">3.000 ₺</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-amber-300 font-bold">15 Gün</span>
                  <span className="font-heading font-black text-sm text-white mt-1">7.000 ₺</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between text-center">
                  <span className="text-[10px] text-amber-300 font-bold">30 Gün (1 Ay)</span>
                  <span className="font-heading font-black text-sm text-amber-400 mt-1">13.000 ₺</span>
                </div>
              </div>

              <Link
                href="/reklam-ver"
                className="w-full py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <span>Banner Başvurusunu Başlat</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: YENİ İLAN EKLE
        ══════════════════════════════════════════════════ */}
        {activeTab === 'ilan_ver' && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className="p-5 rounded-3xl bg-[#12161f] border border-white/5 flex flex-col gap-4">
              <span className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
                <span>Panele Yeni İlan Ekle</span>
              </span>

              {/* Rozet Seçimi */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'gold' })}
                  className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                    newListingForm.rozet === 'gold'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                      : 'bg-black/30 border-white/5 text-[#8b949e]'
                  }`}
                >
                  <span className="text-xs">⭐ GOLD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'vip' })}
                  className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                    newListingForm.rozet === 'vip'
                      ? 'bg-amber-400 border-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-black/30 border-white/5 text-[#8b949e]'
                  }`}
                >
                  <span className="text-xs">👑 VIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewListingForm({ ...newListingForm, rozet: 'silver' })}
                  className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                    newListingForm.rozet === 'silver'
                      ? 'bg-slate-700 border-slate-400 text-white font-black'
                      : 'bg-black/30 border-white/5 text-[#8b949e]'
                  }`}
                >
                  <span className="text-xs">⚡ SILVER</span>
                </button>
              </div>

              <form onSubmit={handleCreateNewListing} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="İlan Başlığı (Örn: Kadıköy VIP Model)"
                  value={newListingForm.baslik}
                  onChange={(e) => setNewListingForm({ ...newListingForm, baslik: e.target.value })}
                  className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
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
                    className="px-3 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map(p => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>

                  <select
                    value={newListingForm.ilceSlug}
                    onChange={(e) => setNewListingForm({ ...newListingForm, ilceSlug: e.target.value })}
                    className="px-3 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
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
                  className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Hizmet detaylarınız ve randevu koşullarınız..."
                  value={newListingForm.aciklama}
                  onChange={(e) => setNewListingForm({ ...newListingForm, aciklama: e.target.value })}
                  className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />

                {/* Fotoğraf Yükle */}
                <div className="flex flex-col gap-2">
                  <label className="p-3.5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
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
                        <span className="text-xs font-bold text-white">Fotoğraf Ekle ({newPhotos.length}/7)</span>
                      </>
                    )}
                  </label>

                  {newPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {newPhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
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
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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
            <div className="p-6 rounded-3xl bg-[#12161f] border border-white/5 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Headphones className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h2 className="font-heading font-black text-lg text-white">7/24 Canlı Destek Hattı</h2>
              <p className="text-xs text-[#8b949e] max-w-xs leading-relaxed">
                Ödeme bildirimleri, vitrin onayı ve tüm teknik talepleriniz için müşteri temsilcimize anında ulaşın.
              </p>
              <button
                onClick={() => router.push('/chat')}
                className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950" />
                <span>Canlı Sohbete Başla</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── NATIVE BOTTOM SHEET / MODAL: İLAN DÜZENLE ──────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#12161f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="font-heading font-black text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>İlanı Düzenle</span>
              </span>
              <button onClick={() => setEditingListing(null)} className="p-1 text-[#8b949e] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const selectedEditProv = turkeyProvinces.find((p) => p.ilSlug === editForm.ilSlug) || turkeyProvinces[0];

              return (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-left">
                  <label className="flex flex-col gap-1 text-xs font-bold text-white">
                    İlan Başlığı
                    <input
                      type="text"
                      required
                      value={editForm.baslik}
                      onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
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
                        className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        {turkeyProvinces.map((prov) => (
                          <option key={prov.ilSlug} value={prov.ilSlug}>{prov.il}</option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
                      İlçe
                      <select
                        value={editForm.ilceSlug}
                        onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                        className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        {selectedEditProv.ilceler.map((ilce) => (
                          <option key={ilce.slug} value={ilce.slug}>{ilce.ad}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
                      WhatsApp
                      <input
                        type="tel"
                        required
                        value={editForm.whatsappNumara}
                        onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-bold text-white">
                      Fiyat (TL)
                      <input
                        type="number"
                        value={editForm.fiyat}
                        onChange={(e) => setEditForm({ ...editForm, fiyat: Number(e.target.value) || 0 })}
                        className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-xs font-bold text-white">
                    Açıklama
                    <textarea
                      required
                      rows={3}
                      value={editForm.aciklama}
                      onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                    />
                  </label>

                  {/* Fotoğraflar */}
                  <div className="flex flex-col gap-2">
                    <label className="p-3 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
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
                          <span className="text-xs font-bold text-white">Fotoğraf Ekle ({editPhotos.length})</span>
                        </>
                      )}
                    </label>

                    {editPhotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {editPhotos.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
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

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="w-1/3 py-3 rounded-xl bg-white/5 text-white text-xs font-bold"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 font-heading font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
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

      {/* ── NATIVE BOTTOM SHEET / MODAL: VİTRİN SATIN ALMA ──────────────── */}
      {selectedVitrinListing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#12161f] border-t sm:border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="font-heading font-black text-sm text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Anasayfa VIP Vitrin</span>
              </span>
              <button
                onClick={() => {
                  setSelectedVitrinListing(null);
                  setVitrinSuccessMsg('');
                }}
                className="p-1 text-[#8b949e] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vitrinSuccessMsg ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <span className="font-heading font-black text-base text-white">Talep Alındı!</span>
                <p className="text-xs text-[#8b949e] max-w-xs">{vitrinSuccessMsg}</p>
                <button
                  onClick={() => {
                    setSelectedVitrinListing(null);
                    setVitrinSuccessMsg('');
                  }}
                  className="mt-3 px-6 py-2 rounded-xl bg-amber-400 text-slate-950 font-heading font-black text-xs"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedVitrinListing.anaFotograf?.url || selectedVitrinListing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=200'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading font-bold text-xs text-white truncate">{selectedVitrinListing.baslik}</span>
                    <span className="text-[10px] text-[#8b949e]">📍 {selectedVitrinListing.ilSlug?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVitrinPaketiSecimi('gunluk')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      vitrinPaketiSecimi === 'gunluk'
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-black/30 border-white/5 text-[#8b949e]'
                    }`}
                  >
                    <span className="text-[10px] uppercase block">1 Günlük</span>
                    <span className="font-heading font-black text-sm text-amber-400 mt-0.5 block">2.000 ₺</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVitrinPaketiSecimi('haftalik')}
                    className={`p-3 rounded-2xl border text-center transition-all relative ${
                      vitrinPaketiSecimi === 'haftalik'
                        ? 'bg-amber-400 border-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-black/30 border-white/5 text-[#8b949e]'
                    }`}
                  >
                    <span className={`text-[9px] font-bold block ${vitrinPaketiSecimi === 'haftalik' ? 'text-slate-950' : 'text-emerald-400'}`}>7 Gün (Önerilen)</span>
                    <span className={`font-heading font-black text-sm mt-0.5 block ${vitrinPaketiSecimi === 'haftalik' ? 'text-slate-950' : 'text-amber-400'}`}>6.000 ₺</span>
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
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {vitrinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4 fill-slate-950" />}
                  <span>{vitrinPaketiSecimi === 'gunluk' ? 'Günlük Vitrini Al (2.000 ₺)' : 'Haftalık Vitrini Al (6.000 ₺)'}</span>
                </button>

                <a
                  href={getAdminWhatsAppUrl(`Merhaba, ${selectedVitrinListing.baslik} ilanım için ${vitrinPaketiSecimi === 'gunluk' ? 'GÜNLÜK (2.000 ₺)' : 'HAFTALIK (6.000 ₺)'} vitrin satın almak istiyorum.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-[#22c55e] text-white font-heading font-bold text-xs flex items-center justify-center gap-2 text-center"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>WhatsApp ile Hızlı Onay Al</span>
                </a>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── NATIVE FIXED BOTTOM APP DOCK BAR ──────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#090d14]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around max-w-2xl mx-auto shadow-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-2xl transition-all active:scale-90 ${
                isSelected
                  ? 'text-amber-400 font-extrabold'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.5] scale-105' : 'stroke-2'}`} />
              <span className="text-[10px] font-heading font-bold tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
