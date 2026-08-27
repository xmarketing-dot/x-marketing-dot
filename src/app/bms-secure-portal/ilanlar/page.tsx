'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  List,
  CheckCircle2,
  Trash2,
  Edit3,
  MapPin,
  RefreshCw,
  Loader2,
  Sparkles,
  X,
  Save,
  Phone,
  Clock,
  Image as ImageIcon,
  Upload,
  Star,
  Plus,
  KeyRound,
  MessageSquare,
  Check,
  Ban,
  ExternalLink,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda'>('all');

  // Edit Modal states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    baslik: '',
    aciklama: '',
    rozet: 'ultravip',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    whatsappNumara: '',
    status: 'yayinda',
    yayinSuresi: 'haftalik',
    panelSifresi: '',
    tamAd: '',
    isVerifiedProfile: false,
    likeSayisi: 55,
    yas: 23,
    boy: 173,
    kilo: 54,
    gogusOlcusu: '85C (Doğal)',
    sacRengi: 'Kumral',
    gozRengi: 'Ela',
    diller: 'Türkçe, İngilizce, Rusça',
    hizmetMekanlari: 'Kendi Evi, Lüks Otel, Rezidans, Seyahat',
  });

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [coverPhotoIdx, setCoverPhotoIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sıfırdan Yeni İlan Ekleme Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    baslik: '',
    aciklama: '',
    rozet: 'vip',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    whatsappNumara: '0530 000 00 00',
    status: 'yayinda',
    yayinSuresi: 'haftalik',
    panelSifresi: '123456',
    tamAd: 'Merve Özdemir',
    isVerifiedProfile: true,
    likeSayisi: 55,
    yas: 23,
    boy: 173,
    kilo: 54,
    gogusOlcusu: '85C (Doğal)',
    sacRengi: 'Kumral',
    gozRengi: 'Ela',
    diller: 'Türkçe, İngilizce, Rusça',
    hizmetMekanlari: 'Kendi Evi, Lüks Otel, Rezidans, Seyahat',
  });
  const [createPhotoUrls, setCreatePhotoUrls] = useState<string[]>([]);
  const [createCoverIdx, setCreateCoverIdx] = useState(0);
  const [createUploading, setCreateUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Quick User Account Assignment states
  const [assignModalItem, setAssignModalItem] = useState<any | null>(null);
  const [assignForm, setAssignForm] = useState({ kullaniciAdi: '', sifre: '', telefon: '' });
  const [assignLoading, setAssignLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; pass: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/listings');
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Approval / Status Change
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
        );
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      alert('Durum güncellenirken hata oluştu.');
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      baslik: item.baslik || '',
      aciklama: item.aciklama || '',
      rozet: item.rozet || 'ultravip',
      ilSlug: item.ilSlug || 'istanbul',
      ilceSlug: item.ilceSlug || 'beylikduzu',
      whatsappNumara: item.whatsappNumara || '',
      status: item.status || 'yayinda',
      yayinSuresi: item.yayinSuresi || 'haftalik',
      panelSifresi: item.panelSifresi || '',
      tamAd: item.tamAd || '',
      isVerifiedProfile: Boolean(item.isVerifiedProfile),
      likeSayisi: item.likeSayisi || 55,
      yas: item.yas || 23,
      boy: item.boy || 173,
      kilo: item.kilo || 54,
      gogusOlcusu: item.gogusOlcusu || '85C (Doğal)',
      sacRengi: item.sacRengi || 'Kumral',
      gozRengi: item.gozRengi || 'Ela',
      diller: Array.isArray(item.diller) ? item.diller.join(', ') : (item.diller || 'Türkçe, İngilizce'),
      hizmetMekanlari: Array.isArray(item.hizmetMekanlari) ? item.hizmetMekanlari.join(', ') : (item.hizmetMekanlari || 'Kendi Evi, Lüks Otel, Rezidans'),
    });

    const photos = item.fotograflar && item.fotograflar.length > 0
      ? item.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
      : [item.anaFotograf?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800'];

    setPhotoUrls(photos);

    const coverIdx = photos.findIndex((url: string) => url === item.anaFotograf?.url);
    setCoverPhotoIdx(coverIdx >= 0 ? coverIdx : 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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
        setPhotoUrls((prev) => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Dosya yükleme hatası.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const removePhotoUrl = (index: number) => {
    if (photoUrls.length <= 1) {
      alert('İlanda en az 1 resim bulunmalıdır!');
      return;
    }
    const updated = photoUrls.filter((_, idx) => idx !== index);
    setPhotoUrls(updated);
    if (coverPhotoIdx >= updated.length) {
      setCoverPhotoIdx(0);
    }
  };

  const handleCreateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCreateUploading(true);
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
        setCreatePhotoUrls((prev) => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Dosya yükleme hatası.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setCreateUploading(false);
    }
  };

  const removeCreatePhotoUrl = (index: number) => {
    const updated = createPhotoUrls.filter((_, idx) => idx !== index);
    setCreatePhotoUrls(updated);
    if (createCoverIdx >= updated.length) {
      setCreateCoverIdx(0);
    }
  };

  // Open Quick User Create Modal for this specific listing
  const handleOpenAssignModal = (listingItem: any) => {
    setAssignModalItem(listingItem);
    const cleanPhone = (listingItem.whatsappNumara || '').replace(/\D/g, '');
    const phoneSuffix = cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
    const suggestedUsername = `uye_${listingItem.ilceSlug || 'ilan'}_${phoneSuffix}`;
    const generatedPass = Math.random().toString(36).substring(2, 8) + 'Bms!';

    setAssignForm({
      kullaniciAdi: suggestedUsername,
      sifre: generatedPass,
      telefon: listingItem.whatsappNumara || '',
    });
    setCreatedCredentials(null);
    setCopiedCreds(false);
  };

  // Create User in DB and bind to this listing
  const handleCreateAndAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalItem) return;
    setAssignLoading(true);

    try {
      // 1. Create User
      const userRes = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });

      const userData = await userRes.json();
      if (!userRes.ok || !userData.user) {
        alert(userData.error || 'Kullanıcı oluşturulamadı.');
        setAssignLoading(false);
        return;
      }

      // 2. Bind user to listing & set panel password
      await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assignModalItem._id,
          panelSifresi: assignForm.sifre,
        }),
      });

      setCreatedCredentials({
        username: assignForm.kullaniciAdi,
        pass: assignForm.sifre,
      });

      // Update local state
      setListings((prev) =>
        prev.map((l) => (l._id === assignModalItem._id ? { ...l, panelSifresi: assignForm.sifre } : l))
      );
    } catch (err) {
      alert('Hesap oluşturulurken bağlantı hatası oluştu.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Resend / Send Approval info message directly into customer chat
  const handleSendApprovalChat = async (id: string) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'yayinda', notifyChat: true }),
      });
      if (res.ok) {
        alert('🎉 İlan onay mesajı, canlı linki ve panel bilgisi müşterinin chatine anında iletildi!');
      } else {
        alert('Mesaj iletilemedi.');
      }
    } catch (e) {
      alert('Bağlantı hatası.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const coverUrl = photoUrls[coverPhotoIdx] || photoUrls[0];

      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem._id,
          ...editForm,
          fotograflar: photoUrls.map((url) => ({ url })),
          anaFotografUrl: coverUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingItem(null);
        fetchListings();
      } else {
        alert(data.error || 'Güncelleme hatası.');
      }
    } catch (err) {
      alert('İlan güncellenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.baslik) {
      alert('Lütfen ilan başlığını yazın!');
      return;
    }

    setCreating(true);
    try {
      const defaultPhotos = createPhotoUrls.length > 0
        ? createPhotoUrls
        : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'];

      const coverUrl = defaultPhotos[createCoverIdx] || defaultPhotos[0];

      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          anaFotografUrl: coverUrl,
          fotograflar: defaultPhotos.map((url) => ({ url })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.listing) {
        alert('Yeni VIP Model & İlan Başarıyla Oluşturuldu!');
        setShowCreateModal(false);
        setCreatePhotoUrls([]);
        fetchListings();
      } else {
        alert(data.error || 'İlan oluşturulamadı.');
      }
    } catch (err) {
      alert('Oluşturma hatası.');
    } finally {
      setCreating(false);
    }
  };

  const handleExtendDuration = async (id: string, days: number) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ekleGun: days }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`İlan yayın süresi +${days} gün uzatıldı!`);
        fetchListings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ilanı tamamen silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' });
      fetchListings();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to format remaining listing days
  const getRemainingTime = (expiryDate?: string | Date, status?: string) => {
    if (status === 'onay_bekliyor') return { text: '⏳ Onay Bekliyor', isExpired: false, isPending: true };
    if (!expiryDate) return { text: '⏳ 7 Gün Kaldı', isExpired: false, isPending: false };
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { text: '❌ Süresi Doldu', isExpired: true, isPending: false };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return { text: `⏳ ${diffDays} Gün ${diffHours} Saat Kaldı`, isExpired: false, isPending: false };
    }
    return { text: `⏳ ${diffHours} Saat Kaldı`, isExpired: false, isPending: false };
  };

  const selectedProvince = turkeyProvinces.find((p) => p.ilSlug === editForm.ilSlug) || turkeyProvinces[0];

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const pendingCount = listings.filter((l) => l.status === 'onay_bekliyor').length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">

      {/* ── 1. HEADER BAR ──────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <List className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading flex items-center gap-2">
              <span>İlan Moderasyonu &amp; Onay Masası</span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-black animate-pulse">
                  {pendingCount} Onay Bekliyor!
                </span>
              )}
            </h1>
            <p className="text-xs text-[#8b949e]">Gelen ilanları onaylayın, reddedin, fotoğrafları ve süreleri yönetin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Sıfırdan Yeni VIP Model / İlan Ekle</span>
          </button>

          <button
            onClick={fetchListings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. FILTER TABS ──────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#161b22] border border-[#30363d] w-fit font-heading text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl transition-all ${filter === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
            }`}
        >
          Tüm İlanlar ({listings.length})
        </button>

        <button
          onClick={() => setFilter('onay_bekliyor')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${filter === 'onay_bekliyor' ? 'bg-amber-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
            }`}
        >
          <span>⏳ Onay Bekleyenler</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('yayinda')}
          className={`px-4 py-2 rounded-xl transition-all ${filter === 'yayinda' ? 'bg-amber-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
            }`}
        >
          🟢 Yayındakiler ({listings.filter((l) => l.status === 'yayinda').length})
        </button>
      </div>

      {/* ── 3. LISTINGS LIST ──────────────── */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        {loading ? (
          <div className="p-12 text-center flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8b949e]">
            Bu filtreye uygun ilan bulunamadı.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredListings.map((item) => {
              const remaining = getRemainingTime(item.paketBitisTarihi, item.status);
              const isPending = item.status === 'onay_bekliyor';
              const isLive = item.status === 'yayinda';

              return (
                <div
                  key={item._id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl ${isPending
                    ? 'bg-gradient-to-r from-amber-500/10 via-[#21262d] to-[#21262d] border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                    : 'bg-[#21262d] border-[#363b42]'
                    }`}
                >

                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-[#363b42] bg-[#0d1117]">
                      <Image
                        src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=200'}
                        alt={item.baslik}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-bold">
                        {item.fotograflar?.length || 1} Foto
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-sm sm:text-base text-white font-heading">{item.baslik}</h3>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-heading ${isLive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                          }`}>
                          {isLive ? '🟢 Yayında' : '⏳ Onay Bekliyor'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {item.rozet || 'ultravip'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-amber-400 font-bold capitalize flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.ilSlug} / {item.ilceSlug}
                        </span>
                        <span className="text-[#8b949e]">|</span>
                        <span className="text-emerald-400 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {remaining.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#8b949e] font-medium flex-wrap mt-0.5">
                        <span className="text-white font-bold">📞 WhatsApp: {item.whatsappNumara}</span>
                        {item.panelSifresi && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#161b22] text-amber-300 font-mono font-black border border-amber-500/30 flex items-center gap-1">
                            <KeyRound className="w-3 h-3" />
                            Şifre: {item.panelSifresi}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Moderation Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">

                    {/* TEK TIKLA ONAYLA (YAYINA AL) */}
                    {isPending ? (
                      <button
                        onClick={() => handleQuickStatusChange(item._id, 'yayinda')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Hemen Onayla</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickStatusChange(item._id, 'onay_bekliyor')}
                        className="px-3 py-2 rounded-xl bg-[#161b22] hover:bg-[#30363d] text-[#8b949e] font-bold text-xs border border-[#363b42] transition-colors"
                      >
                        Beklemeye Al
                      </button>
                    )}

                    {/* QUICK EXTEND BUTTONS */}
                    <button
                      onClick={() => handleExtendDuration(item._id, 7)}
                      className="px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-black text-xs border border-amber-500/40 transition-colors"
                      title="Yayın Süresine +7 Gün Ekle"
                    >
                      +7 Gün
                    </button>

                    <button
                      onClick={() => handleExtendDuration(item._id, 30)}
                      className="px-2.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-xs border border-cyan-500/40 transition-colors"
                      title="Yayın Süresine +30 Gün Ekle"
                    >
                      +30 Gün
                    </button>

                    {/* CANLI İNCELE */}
                    <Link
                      href={`/ilan/${item.slug}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-[#161b22] hover:bg-[#30363d] text-cyan-400 border border-[#363b42] transition-colors"
                      title="İlanı Görüntüle"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* CHATE ONAY METNİ & LİNK FIRLAT */}
                    <button
                      onClick={() => handleSendApprovalChat(item._id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-extrabold text-xs border border-cyan-500/40 transition-all shadow-sm"
                      title="Müşterinin chatine canlı ilan linki ve kalan süreyi otomatik yolla"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Chate Link At</span>
                    </button>

                    {/* HESAP OLUŞTUR & ŞİFRE VER */}
                    <button
                      onClick={() => handleOpenAssignModal(item)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-extrabold text-xs border border-amber-500/40 transition-all shadow-sm"
                      title="Bu ilana kullanıcı hesabı oluştur ve şifre ver"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hesap Tanımla</span>
                    </button>

                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#161b22] hover:bg-[#30363d] text-amber-400 font-bold text-xs border border-[#363b42] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Düzenle</span>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="İlanı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL EDITING MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex flex-col">
                <h2 className="font-black text-lg text-white font-heading flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <span>İlanı Düzenle &amp; Resim Yönetimi</span>
                </h2>
                <span className="text-xs text-amber-400 font-mono mt-0.5">
                  {getRemainingTime(editingItem.paketBitisTarihi, editingItem.status).text}
                </span>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">

              {/* Photo Management Section */}
              <div className="p-4 rounded-2xl bg-[#21262d] border border-[#363b42] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 font-heading uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>İlan Fotoğrafları Yönetimi ({photoUrls.length} Resim)</span>
                  </span>

                  <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>Yeni Fotoğraf Yükle</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-1">
                  {photoUrls.map((url, idx) => {
                    const isCover = idx === coverPhotoIdx;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1.5 h-32 bg-[#0d1117] ${isCover ? 'border-amber-400 shadow-md shadow-amber-500/20' : 'border-[#30363d]'
                          }`}
                      >
                        <img src={url} alt={`Resim ${idx}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10"></div>

                        <div className="relative z-20 flex items-center justify-between">
                          {isCover ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-slate-950" />
                              Kapak
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverPhotoIdx(idx)}
                              className="px-1.5 py-0.5 rounded-md bg-[#161b22]/90 text-amber-400 font-bold text-[9px] hover:bg-amber-500 hover:text-slate-950"
                            >
                              Kapak Yap
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removePhotoUrl(idx)}
                            className="p-1 rounded-md bg-red-600/90 text-white hover:bg-red-500"
                            title="Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    value={editForm.baslik}
                    onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                    className="px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Detaylı İlan Açıklaması *
                  <textarea
                    rows={3}
                    required
                    value={editForm.aciklama}
                    onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                    className="px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Tier & Status */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Vitrin Kademe Rozeti *
                  <select
                    value={editForm.rozet}
                    onChange={(e) => setEditForm({ ...editForm, rozet: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin (En Üst Sıra)</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver Standart</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Yayın Durumu *
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-emerald-500/50 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="yayinda">✅ Yayında</option>
                    <option value="onay_bekliyor">⏳ Onay Bekliyor</option>
                    <option value="suresi_doldu">❌ Süresi Doldu</option>
                  </select>
                </label>
              </div>

              {/* Panel Şifresi */}
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                Özel Panel Şifresi
                <input
                  type="text"
                  value={editForm.panelSifresi}
                  onChange={(e) => setEditForm({ ...editForm, panelSifresi: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* ── ÖZEL VİP MODEL PROFİL BİLGİLERİ (ADMİN YÖNETİMİ) ──────────────── */}
              <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 font-heading uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span>Özel VIP Model Portföyü &amp; Fiziksel Nitelikler</span>
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isVerifiedProfile}
                      onChange={(e) => setEditForm({ ...editForm, isVerifiedProfile: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-emerald-400 font-bold">%100 Teyitli Profil</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    Model Sahne / Tam Adı
                    <input
                      type="text"
                      placeholder="Örn: Merve Özdemir"
                      value={editForm.tamAd}
                      onChange={(e) => setEditForm({ ...editForm, tamAd: e.target.value })}
                      className="px-3.5 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    👍 Like &amp; Öneri Sayısı (Facebook Tarzı)
                    <input
                      type="number"
                      value={editForm.likeSayisi}
                      onChange={(e) => setEditForm({ ...editForm, likeSayisi: Number(e.target.value) })}
                      className="px-3.5 py-2 rounded-xl bg-[#161b22] border border-blue-500/40 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
              </div>
              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İl Seçin *
                  <select
                    value={editForm.ilSlug}
                    onChange={(e) => {
                      const newIl = e.target.value;
                      const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                      setEditForm({
                        ...editForm,
                        ilSlug: newIl,
                        ilceSlug: prov?.ilceler[0]?.slug || 'merkez',
                      });
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İlçe Seçin *
                  <select
                    value={editForm.ilceSlug}
                    onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {selectedProvince.ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* WhatsApp */}
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                WhatsApp Telefon Numarası *
                <input
                  type="text"
                  required
                  value={editForm.whatsappNumara}
                  onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 font-heading uppercase"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Değişiklikleri &amp; Resimleri Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── 5. QUICK USER ASSIGNMENT & CREDENTIALS MODAL ──────────────── */}
      {assignModalItem && (
        <div
          onClick={() => setAssignModalItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#161b22] border-2 border-amber-500/60 rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <KeyRound className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-base sm:text-lg text-white font-heading">
                    İlana Kullanıcı Hesabı Tanımla
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">
                    {assignModalItem.baslik}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAssignModalItem(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Created Success State with One-Click Copy */}
            {createdCredentials ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-heading">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hesap Başarıyla Oluşturuldu ve İlanla Eşleştirildi!</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#c9d1d9] flex flex-col gap-1.5 select-all">
                  <div><strong className="text-amber-400 font-heading">Panel Adresi:</strong> /panelim</div>
                  <div><strong className="text-amber-400 font-heading">Kullanıcı Adı:</strong> {createdCredentials.username}</div>
                  <div><strong className="text-amber-400 font-heading">Şifre:</strong> {createdCredentials.pass}</div>
                  <div><strong className="text-amber-400 font-heading">İlan:</strong> {assignModalItem.baslik}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const panelUrl = typeof window !== 'undefined' ? `${window.location.origin}/panelim` : '/panelim';
                      const text = `🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş Adresi: ${panelUrl}\nKullanıcı Adı: ${createdCredentials.username}\nŞifre: ${createdCredentials.pass}\n\nPanelinize giriş yaparak ilanınızı yönetebilir, fotoğraflarınızı güncelleyebilir ve sürenizi uzatabilirsiniz.`;
                      navigator.clipboard.writeText(text);
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 2500);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-black text-xs font-heading uppercase transition-all flex items-center justify-center gap-2 ${copiedCreds
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      }`}
                  >
                    {copiedCreds ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Chat İçin Mesaj Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <span>📋 Chat / WhatsApp Mesajını Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setAssignModalItem(null)}
                    className="px-4 py-3 rounded-xl bg-[#21262d] text-white font-bold text-xs font-heading"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              /* Create Form */
              <form onSubmit={handleCreateAndAssignUser} className="flex flex-col gap-4 text-xs font-heading">

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8b949e] font-black uppercase">Atanacak Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={assignForm.kullaniciAdi}
                    onChange={(e) => setAssignForm({ ...assignForm, kullaniciAdi: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8b949e] font-black uppercase">Giriş Şifresi (Otomatik Üretildi)</label>
                  <input
                    type="text"
                    required
                    value={assignForm.sifre}
                    onChange={(e) => setAssignForm({ ...assignForm, sifre: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-amber-400 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#8b949e] font-black uppercase">Müşteri Telefon / WhatsApp</label>
                  <input
                    type="text"
                    value={assignForm.telefon}
                    onChange={(e) => setAssignForm({ ...assignForm, telefon: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assignLoading}
                  className="mt-2 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {assignLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Hesap Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Hesabı Oluştur &amp; İlanla Eşleştir</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── 6. SIFIRDAN YENİ VİP MODEL & İLAN EKLEME MODALI ──────────────── */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#161b22] border-2 border-amber-500/60 rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-lg text-white font-heading">
                    Sıfırdan Yeni VIP Model &amp; İlan Ekle
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">
                    %100 Teyitli Özel Profil, Biyografi &amp; Fotoğraflar
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-xs font-heading">

              {/* Başlık & Model Sahne Adı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Beylikdüzü VIP Merve Özdemir"
                    value={createForm.baslik}
                    onChange={(e) => setCreateForm({ ...createForm, baslik: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Model Sahne / Tam Adı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Merve Özdemir"
                    value={createForm.tamAd}
                    onChange={(e) => setCreateForm({ ...createForm, tamAd: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Vitrin Paketi & Facebook Like */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Vitrin Kademe Rozeti *
                  <select
                    value={createForm.rozet}
                    onChange={(e) => setCreateForm({ ...createForm, rozet: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin (En Üst Sıra)</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver Standart</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  👍 Başlangıç Like / Öneri Sayısı
                  <input
                    type="number"
                    value={createForm.likeSayisi}
                    onChange={(e) => setCreateForm({ ...createForm, likeSayisi: Number(e.target.value) })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-blue-500/50 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Panel Şifresi
                  <input
                    type="text"
                    value={createForm.panelSifresi}
                    onChange={(e) => setCreateForm({ ...createForm, panelSifresi: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Konum & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  İl Seçin *
                  <select
                    value={createForm.ilSlug}
                    onChange={(e) => {
                      const newIl = e.target.value;
                      const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                      setCreateForm({
                        ...createForm,
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
                    value={createForm.ilceSlug}
                    onChange={(e) => setCreateForm({ ...createForm, ilceSlug: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {(turkeyProvinces.find((p) => p.ilSlug === createForm.ilSlug) || turkeyProvinces[0]).ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  WhatsApp Numarası *
                  <input
                    type="text"
                    required
                    value={createForm.whatsappNumara}
                    onChange={(e) => setCreateForm({ ...createForm, whatsappNumara: e.target.value })}
                    className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Biyografi */}
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                Detaylı Açıklama &amp; Biyografi Metni
                <textarea
                  rows={3}
                  placeholder="Modelin hizmet tarzı, hijyen prensipleri ve detayları..."
                  value={createForm.aciklama}
                  onChange={(e) => setCreateForm({ ...createForm, aciklama: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* ── FOTOĞRAF YÜKLEME ALANI (ADMİN YENİ İLAN) ──────────────── */}
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 font-heading uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>İlan Fotoğrafları ({createPhotoUrls.length} Adet)</span>
                  </span>
                  <span className="text-[11px] text-[#8b949e]">JPG, PNG, WEBP Desteklenir</span>
                </div>

                {/* Upload Input */}
                <label className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all text-center gap-2 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCreateFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={createUploading}
                  />
                  {createUploading ? (
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fotoğraflar Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white text-xs font-bold font-heading">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Bilgisayardan / Galeriden Fotoğraf Seç &amp; Yükle</span>
                    </div>
                  )}
                </label>

                {/* Photo Previews */}
                {createPhotoUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-1">
                    {createPhotoUrls.map((url, idx) => {
                      const isCover = idx === createCoverIdx;
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
                                onClick={() => setCreateCoverIdx(idx)}
                                className="px-1.5 py-0.5 rounded-md bg-[#161b22]/90 text-amber-400 font-bold text-[9px] hover:bg-amber-500 hover:text-slate-950 font-heading"
                              >
                                Kapak Yap
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeCreatePhotoUrl(idx)}
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

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-3.5 px-4 rounded-xl bg-[#21262d] text-white font-bold text-xs border border-[#363b42]"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>İlanı &amp; Modeli Şimdi Yayına Al</span>
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



