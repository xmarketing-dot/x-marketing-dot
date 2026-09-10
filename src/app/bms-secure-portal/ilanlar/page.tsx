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
  Crown,
  Eye,
  UserCheck,
  UserPlus,
  Users,
  Search,
  ZoomIn,
  Calendar,
  Globe,
  AtSign
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'vitrin'>('all');

  // Detaylı İnceleme Modalı (Full Inspection Modal)
  const [inspectItem, setInspectItem] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectActivePhotoIdx, setInspectActivePhotoIdx] = useState(0);

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
    kullaniciId: '',
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
    kullaniciId: '',
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

  // Quick User Account Assignment states (Yeni Oluştur veya Mevcut Seç)
  const [assignModalItem, setAssignModalItem] = useState<any | null>(null);
  const [assignMode, setAssignMode] = useState<'create' | 'select'>('select');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedExistingUserId, setSelectedExistingUserId] = useState('');
  const [assignForm, setAssignForm] = useState({ kullaniciAdi: '', sifre: '', telefon: '' });
  const [assignLoading, setAssignLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; pass: string } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  useEffect(() => {
    fetchListings(true);
    fetchSystemUsers();
    const interval = setInterval(() => {
      fetchListings(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSystemUsers(data);
      } else if (data.users && Array.isArray(data.users)) {
        setSystemUsers(data.users);
      }
    } catch (e) {
      // Silent
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchListings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // One-Click Vitrin Approval from Listings Page
  const handleApproveVitrin = async (listingId: string, days = 1, paketi = 'gunluk') => {
    try {
      await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignVitrinDuration: { listingId, days, paketi },
        }),
      });
      fetchListings(false);
    } catch (e) {
      console.error(e);
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
      kullaniciId: item.kullaniciId ? (typeof item.kullaniciId === 'object' ? item.kullaniciId._id || item.kullaniciId.toString() : item.kullaniciId) : '',
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

    // Fotoğrafları tekil olarak arka planda eksiksiz çek
    if (item._id) {
      fetch(`/api/admin/listings?id=${item._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.listing?.fotograflar && data.listing.fotograflar.length > 0) {
            const freshPhotos = data.listing.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url));
            setPhotoUrls(freshPhotos);
            const freshCoverIdx = freshPhotos.findIndex((url: string) => url === (data.listing.anaFotograf?.url || item.anaFotograf?.url));
            setCoverPhotoIdx(freshCoverIdx >= 0 ? freshCoverIdx : 0);
          }
        })
        .catch(() => { });
    }
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

  // ── DETAYLI İNCELEME MODALI AÇMA ──
  const handleOpenInspect = async (item: any) => {
    setInspectItem(item);
    setInspectActivePhotoIdx(0);
    setInspectLoading(true);

    try {
      const res = await fetch(`/api/admin/listings?id=${item._id}`);
      const data = await res.json();
      if (data.listing) {
        setInspectItem(data.listing);
      }
    } catch (e) {
      // Keep basic item
    } finally {
      setInspectLoading(false);
    }
  };

  // Open Quick User Create / Assign Modal for this specific listing
  const handleOpenAssignModal = (listingItem: any) => {
    setAssignModalItem(listingItem);
    setAssignMode('select');
    setSelectedExistingUserId(listingItem.kullaniciId || '');
    setUserSearchTerm('');

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

  // Assign Existing User to Listing
  const handleAssignExistingUser = async (userId: string) => {
    if (!assignModalItem) return;
    setAssignLoading(true);

    try {
      const selectedUser = systemUsers.find((u) => u._id === userId);
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assignModalItem._id,
          kullaniciId: userId,
          ...(selectedUser?.sifreHash ? { panelSifresi: selectedUser.sifreHash } : {}),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ İlan başarıyla "${selectedUser?.kullaniciAdi || 'Seçilen Kullanıcı'}" hesabına atandı!`);
        setListings((prev) =>
          prev.map((l) =>
            l._id === assignModalItem._id
              ? { ...l, kullaniciId: userId, ...(selectedUser?.sifreHash ? { panelSifresi: selectedUser.sifreHash } : {}) }
              : l
          )
        );
        setAssignModalItem(null);
      } else {
        alert(data.error || 'Atama başarısız.');
      }
    } catch (e) {
      alert('Kullanıcı atanırken bağlantı hatası oluştu.');
    } finally {
      setAssignLoading(false);
    }
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

      const newUserId = userData.user._id;

      // 2. Bind user to listing & set panel password
      await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assignModalItem._id,
          kullaniciId: newUserId,
          panelSifresi: assignForm.sifre,
        }),
      });

      setCreatedCredentials({
        username: assignForm.kullaniciAdi,
        pass: assignForm.sifre,
      });

      // Update local state
      setListings((prev) =>
        prev.map((l) =>
          l._id === assignModalItem._id
            ? { ...l, kullaniciId: newUserId, panelSifresi: assignForm.sifre }
            : l
        )
      );

      // Refresh system users
      fetchSystemUsers();
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

  const vitrinCount = listings.filter((l) => Boolean(l.vitrinIstegi)).length;
  const pendingCount = listings.filter((l) => l.status === 'onay_bekliyor').length;

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'vitrin') return Boolean(l.vitrinIstegi);
    return l.status === filter;
  });

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full px-1 sm:px-0 pb-24 sm:pb-8">

      {/* ── 1. ÜST HEADER BAR ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <List className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-black text-base sm:text-2xl text-white font-heading flex items-center gap-2 truncate">
              <span>İlan Moderasyon Masası</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse shrink-0">
                  {pendingCount} Bekliyor
                </span>
              )}
              {vitrinCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 text-[10px] font-black animate-pulse shrink-0">
                  🔥 {vitrinCount} Vitrin Talebi
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#8b949e] truncate">Gelen ilanları onaylayın, vitrin taleplerini yönetin, süreleri ve hesapları düzenleyin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs font-heading shadow-md shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="truncate">+ Yeni VIP Model / İlan Ekle</span>
          </button>

          <button
            onClick={() => fetchListings(true)}
            className="p-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 hover:text-white border border-[#30363d] transition-all active:scale-95 shrink-0"
            title="İlanları Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. FILTER TABS (MOBİLDE KAYDIRILABİLİR SEGMENTED BAR) ──────────────── */}
      <div className="p-1 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center gap-1 overflow-x-auto no-scrollbar shadow-md">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${filter === 'all' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
            }`}
        >
          <span>Tüm İlanlar</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${filter === 'all' ? 'bg-slate-950/30 text-slate-950' : 'bg-[#0d1117] text-amber-400'}`}>
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('vitrin')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${filter === 'vitrin' ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20 font-black' : 'text-amber-400 hover:text-white hover:bg-[#21262d]'
            }`}
        >
          <span>🔥 Vitrin Talepleri</span>
          {vitrinCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
              {vitrinCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('onay_bekliyor')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${filter === 'onay_bekliyor' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
            }`}
        >
          <span>⏳ Onay Bekleyenler</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('yayinda')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${filter === 'yayinda' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
            }`}
        >
          <span>🟢 Yayındakiler</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${filter === 'yayinda' ? 'bg-slate-950/30 text-slate-950' : 'bg-[#0d1117] text-emerald-400'}`}>
            {listings.filter((l) => l.status === 'yayinda').length}
          </span>
        </button>
      </div>

      {/* ── 3. LISTINGS DISPLAY (MASAÜSTÜ İÇİN TABLO & MOBİL İÇİN NATIVE KARTLAR) ──────────────── */}
      <div>
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 bg-[#161b22] rounded-2xl border border-[#30363d]">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-xs text-[#8b949e]">İlanlar yükleniyor...</span>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#8b949e] bg-[#161b22] rounded-2xl border border-[#30363d]">
            Bu filtreye uygun ilan bulunamadı.
          </div>
        ) : (
          <>
            {/* ── MASAÜSTÜ PROFESYONEL VERİ TABLOSU (DESKTOP DATA TABLE - md & üstü) ──────────────── */}
            <div className="hidden md:block w-full overflow-hidden rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a202c] border-b border-[#30363d] text-[11px] font-black uppercase text-[#8b949e] font-heading tracking-wider">
                      <th className="py-3.5 px-4">İlan / Model</th>
                      <th className="py-3.5 px-3">Konum &amp; Bölge</th>
                      <th className="py-3.5 px-3">Rozet &amp; Durum</th>
                      <th className="py-3.5 px-3">Yayın Süresi</th>
                      <th className="py-3.5 px-3">İletişim &amp; Şifre</th>
                      <th className="py-3.5 px-3 text-center">Hit &amp; Like</th>
                      <th className="py-3.5 px-4 text-right">Yönetim &amp; Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]/50 text-xs">
                    {filteredListings.map((item) => {
                      const remaining = getRemainingTime(item.paketBitisTarihi, item.status);
                      const isPending = item.status === 'onay_bekliyor';
                      const isLive = item.status === 'yayinda';

                      return (
                        <tr
                          key={item._id}
                          className={`hover:bg-[#1c232d] transition-colors group ${isPending ? 'bg-amber-500/[0.04]' : ''
                            }`}
                        >
                          {/* İlan & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => handleOpenInspect(item)}
                                className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#363b42] bg-[#0d1117] cursor-pointer group/thumb shadow-sm"
                                title="Büyük boyutta incele"
                              >
                                <Image
                                  src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=150'}
                                  alt={item.baslik}
                                  fill
                                  sizes="50px"
                                  className="object-cover group-hover/thumb:scale-110 transition-transform"
                                />
                                <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 text-amber-400 text-[8px] font-bold">
                                  {item.fotograflar?.length || 1}
                                </span>
                              </div>

                              <div className="flex flex-col min-w-0 max-w-[220px] lg:max-w-xs">
                                <span
                                  onClick={() => handleOpenInspect(item)}
                                  className="font-heading font-black text-sm text-white truncate cursor-pointer hover:text-amber-400 transition-colors"
                                  title={item.baslik}
                                >
                                  {item.baslik}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-[#8b949e] font-mono mt-0.5">
                                  <span>#{item._id.slice(-6)}</span>
                                  {item.createdAt && (
                                    <>
                                      <span>&bull;</span>
                                      <span>{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Konum */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 text-amber-300 font-bold capitalize text-xs">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{item.ilSlug} / {item.ilceSlug}</span>
                            </div>
                          </td>

                          {/* Rozet & Durum */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-heading ${isLive
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                }`}>
                                {isLive ? '🟢 Yayında' : '⏳ Onay Bekliyor'}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase">
                                  👑 {item.rozet || 'vip'}
                                </span>
                                {item.vitrinIstegi && (
                                  item.vitrinPaketi === 'haftalik' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white font-black text-[9px] uppercase shadow-sm animate-pulse">
                                      👑 HAFTALIK VİTRİN (6.000 ₺)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[9px] uppercase shadow-sm animate-pulse">
                                      ⚡ GÜNLÜK VİTRİN (2.000 ₺)
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Kalan Süre */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1">
                              <span className={`font-mono text-xs font-bold flex items-center gap-1 ${remaining.isExpired ? 'text-rose-400' : 'text-emerald-400'
                                }`}>
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>{remaining.text}</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleExtendDuration(item._id, 7)}
                                  className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-mono font-bold transition-all border border-amber-500/30"
                                  title="+7 Gün Süre Ekle"
                                >
                                  +7G
                                </button>
                                <button
                                  onClick={() => handleExtendDuration(item._id, 30)}
                                  className="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-mono font-bold transition-all border border-amber-500/30"
                                  title="+30 Gün Süre Ekle"
                                >
                                  +30G
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* İletişim & Şifre & Kullanıcı */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 text-[11px]">
                              {item.kullaniciAdi ? (
                                <span className="flex items-center gap-1 text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 w-fit" title="İlan Sahibi Kullanıcı Adı">
                                  <AtSign className="w-3 h-3 text-amber-400" />
                                  <span>{item.kullaniciAdi}</span>
                                </span>
                              ) : (
                                <span className="text-[#8b949e] text-[10px] font-mono">@sahipsiz</span>
                              )}
                              <span className="text-white font-mono font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <span>{item.whatsappNumara}</span>
                              </span>
                              {item.panelSifresi && (
                                <span className="px-1.5 py-0.2 rounded bg-[#0d1117] text-amber-300 font-mono font-bold border border-amber-500/30 w-fit text-[10px]">
                                  🔑 {item.panelSifresi}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Hit & Like */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
                              <span className="text-[#8b949e] flex items-center gap-0.5" title="Görüntülenme">
                                <Eye className="w-3 h-3" />
                                <span>{item.goruntulenmeSayisi || 0}</span>
                              </span>
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5" title="WhatsApp Tıklaması">
                                <Phone className="w-3 h-3" />
                                <span>{item.whatsappTiklamaSayisi || 0}</span>
                              </span>
                            </div>
                          </td>

                          {/* Yönetim & Aksiyonlar */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Vitrin Talebini Onayla Butonu */}
                              {item.vitrinIstegi && (
                                <button
                                  onClick={() => handleApproveVitrin(item._id, item.vitrinPaketi === 'haftalik' ? 7 : 1, item.vitrinPaketi || 'gunluk')}
                                  className={`px-3 py-1.5 rounded-xl font-black text-[11px] font-heading shadow-md active:scale-95 transition-all flex items-center gap-1 shrink-0 ${item.vitrinPaketi === 'haftalik'
                                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white shadow-purple-500/30'
                                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/20'
                                    }`}
                                  title={`Vitrin Talebini Onayla (${item.vitrinPaketi === 'haftalik' ? '7 Günlük 6.000 ₺' : '1 Günlük 2.000 ₺'})`}
                                >
                                  <Crown className="w-3.5 h-3.5 fill-current" />
                                  <span>{item.vitrinPaketi === 'haftalik' ? '👑 Haftalık Onayla (6K)' : '⚡ Günlük Onayla (2K)'}</span>
                                </button>
                              )}

                              {/* Onayla / Durdur */}
                              {isPending ? (
                                <button
                                  onClick={() => handleQuickStatusChange(item._id, 'yayinda')}
                                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                                  title="Hemen Onayla & Yayına Al"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleQuickStatusChange(item._id, 'onay_bekliyor')}
                                  className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-amber-400 border border-[#30363d] text-xs transition-all"
                                  title="İlanı Durdur / Beklemeye Al"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}

                              {/* İncele */}
                              <button
                                onClick={() => handleOpenInspect(item)}
                                className="p-2 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-[#30363d] transition-all"
                                title="Detaylı Önizleme & İnceleme"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Düzenle */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 border border-[#30363d] transition-all"
                                title="İlanı Düzenle"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Chate At */}
                              <button
                                onClick={() => handleSendApprovalChat(item._id)}
                                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 transition-all"
                                title="Müşteri Sohbetine Onay Linki Gönder"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {/* Hesap Ata */}
                              <button
                                onClick={() => handleOpenAssignModal(item)}
                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 transition-all"
                                title="Kullanıcı Hesabı Oluştur / Ata"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Sitede Aç */}
                              <Link
                                href={`/ilan/${item.slug}`}
                                target="_blank"
                                className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] transition-all"
                                title="Canlı İlan Sayfasını Aç"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              {/* Sil */}
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all"
                                title="İlanı Kalıcı Olarak Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── MOBİL NATIVE KARTLAR LİSTESİ (MOBILE CARDS - md altında 100% korunan düzen) ──────────────── */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredListings.map((item) => {
                const remaining = getRemainingTime(item.paketBitisTarihi, item.status);
                const isPending = item.status === 'onay_bekliyor';
                const isLive = item.status === 'yayinda';

                return (
                  <div
                    key={item._id}
                    className={`p-3 sm:p-4 rounded-2xl bg-[#161b22] border transition-all flex flex-col gap-3 shadow-lg ${isPending
                        ? 'border-amber-500/60 shadow-amber-500/5 bg-gradient-to-b from-[#1c1811] to-[#161b22]'
                        : 'border-[#30363d] hover:border-[#3d444d]'
                      }`}
                  >
                    {/* ── KART ÜST BİLGİ ALANI ──────────────── */}
                    <div className="flex items-start gap-3 w-full">
                      {/* Thumbnail */}
                      <div
                        onClick={() => handleOpenInspect(item)}
                        className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#363b42] bg-[#0d1117] cursor-pointer group shadow-md"
                        title="Büyük boyutta incele"
                      >
                        <Image
                          src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=200'}
                          alt={item.baslik}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-amber-400 text-[8px] font-bold backdrop-blur-sm">
                          {item.fotograflar?.length || 1} Foto
                        </span>
                      </div>

                      {/* Meta Bilgileri */}
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            onClick={() => handleOpenInspect(item)}
                            className="font-heading font-black text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md cursor-pointer hover:text-amber-400 transition-colors"
                          >
                            {item.baslik}
                          </h3>

                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-heading ${isLive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                            }`}>
                            {isLive ? '🟢 Yayında' : '⏳ Onay Bekliyor'}
                          </span>

                          <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.rozet || 'vip'}
                          </span>

                          {item.vitrinIstegi && (
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 shadow-sm animate-pulse">
                              🔥 VİTRİN TALEBİ (+2.000 ₺)
                            </span>
                          )}
                        </div>

                        {/* Konum & Süre */}
                        <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold capitalize flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.ilSlug} / {item.ilceSlug}</span>
                          </span>
                          <span className="text-[#8b949e]">•</span>
                          <span className="text-emerald-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{remaining.text}</span>
                          </span>
                        </div>

                        {/* İletişim, Tarih, Kullanıcı & Şifre Çipleri */}
                        <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap mt-0.5">
                          {item.kullaniciAdi && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                              <AtSign className="w-2.5 h-2.5 text-amber-400" />
                              <span>{item.kullaniciAdi}</span>
                            </span>
                          )}
                          <span className="text-white font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{item.whatsappNumara}</span>
                          </span>
                          {item.createdAt && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#0d1117] text-slate-300 font-mono text-[10px] border border-[#30363d] flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-blue-400" />
                              <span>Ekleme: {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                          {item.panelSifresi && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#0d1117] text-amber-300 font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                              <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                              <span>Şifre: {item.panelSifresi}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── KART MOBİL UYUMLU AKSİYON BUTONLARI (2 SATIRLI DÜZEN) ──────────────── */}
                    <div className="flex flex-col gap-1.5 border-t border-[#30363d]/60 pt-2.5">
                      {/* Vitrin Talebi Onay Barı (Eğer varsa) */}
                      {item.vitrinIstegi && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 mb-1">
                          <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 font-heading">
                            <Crown className="w-3.5 h-3.5 fill-amber-300" />
                            <span>Vitrin Talebi ({item.vitrinPaketi === 'haftalik' ? '7 Günlük 6K' : '1 Günlük 2K'})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApproveVitrin(item._id, item.vitrinPaketi === 'haftalik' ? 7 : 1, item.vitrinPaketi || 'gunluk')}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-xs font-heading shadow-md active:scale-95 transition-all"
                          >
                            Hemen Onayla ➔
                          </button>
                        </div>
                      )}

                      {/* Satır 1: Ana Operasyon Butonları */}
                      <div className="flex items-center gap-1.5">
                        {/* Onayla / Beklemeye Al */}
                        {isPending ? (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'yayinda')}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Hemen Onayla</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(item._id, 'onay_bekliyor')}
                            className="py-2 px-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-amber-400 font-bold text-xs border border-[#30363d] transition-colors"
                            title="İlanı beklemeye al"
                          >
                            <span>Durdur</span>
                          </button>
                        )}

                        {/* Detaylı İncele */}
                        <button
                          onClick={() => handleOpenInspect(item)}
                          className={`py-2 px-3 rounded-xl text-xs font-heading font-black border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${isPending
                              ? 'bg-[#21262d] hover:bg-[#30363d] text-amber-300 border-[#30363d]'
                              : 'flex-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                            }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Detaylı İncele</span>
                        </button>

                        {/* Düzenle */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 border border-[#30363d] text-xs font-heading font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Düzenle</span>
                        </button>

                        {/* +7 Gün Uzat */}
                        <button
                          onClick={() => handleExtendDuration(item._id, 7)}
                          className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/30 transition-all shrink-0 active:scale-95"
                          title="Yayın Süresine +7 Gün Ekle"
                        >
                          +7G
                        </button>
                      </div>

                      {/* Satır 2: Hızlı Araç Butonları (Chate At, Hesap, Sitede Aç, Sil) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {/* Chate Link At */}
                        <button
                          onClick={() => handleSendApprovalChat(item._id)}
                          className="py-1.5 px-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
                          title="Müşteri chatine onay ve link ilet"
                        >
                          <MessageSquare className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">Chate At</span>
                        </button>

                        {/* Hesap Tanımla */}
                        <button
                          onClick={() => handleOpenAssignModal(item)}
                          className="py-1.5 px-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
                          title="Bu ilana kullanıcı hesabı oluştur ve şifre ver"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">Hesap</span>
                        </button>

                        {/* Sitede Aç */}
                        <Link
                          href={`/ilan/${item.slug}`}
                          target="_blank"
                          className="py-1.5 px-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-cyan-400 border border-[#30363d] text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
                          title="Canlı İlan Sayfasını Aç"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">Sitede Gör</span>
                        </Link>

                        {/* Sil */}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="py-1.5 px-1.5 rounded-xl bg-[#21262d] hover:bg-red-500/20 text-[#8b949e] hover:text-red-400 border border-[#30363d] hover:border-red-500/40 text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
                          title="İlanı Sil"
                        >
                          <Trash2 className="w-3 h-3 shrink-0" />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── 4. FULL EDITING MODAL (MOBİL UYUMLU) ──────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex flex-col min-w-0">
                <h2 className="font-heading font-black text-base sm:text-lg text-white flex items-center gap-2 truncate">
                  <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">İlanı Düzenle &amp; Resimler</span>
                </h2>
                <span className="text-[11px] text-amber-400 font-mono mt-0.5 truncate">
                  {getRemainingTime(editingItem.paketBitisTarihi, editingItem.status).text}
                </span>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">

              {/* Photo Management Section */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 font-heading uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotoğraflar ({photoUrls.length})</span>
                  </span>

                  <label className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>+ Fotoğraf Yükle</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {photoUrls.map((url, idx) => {
                    const isCover = idx === coverPhotoIdx;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1.5 h-28 sm:h-32 bg-[#161b22] ${isCover ? 'border-amber-400 shadow-md shadow-amber-500/20' : 'border-[#30363d]'
                          }`}
                      >
                        <img src={url} alt={`Resim ${idx}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10"></div>

                        <div className="relative z-20 flex items-center justify-between w-full">
                          {isCover ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-slate-950" />
                              Kapak
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverPhotoIdx(idx)}
                              className="px-1.5 py-0.5 rounded bg-[#161b22]/90 text-amber-400 font-bold text-[9px] hover:bg-amber-500 hover:text-slate-950"
                            >
                              Kapak Yap
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removePhotoUrl(idx)}
                            className="p-1 rounded bg-red-600/90 text-white hover:bg-red-500"
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
              <div className="grid grid-cols-1 gap-3">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    value={editForm.baslik}
                    onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Detaylı İlan Açıklaması *
                  <textarea
                    rows={3}
                    required
                    value={editForm.aciklama}
                    onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Tier & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Vitrin Kademe Rozeti *
                  <select
                    value={editForm.rozet}
                    onChange={(e) => setEditForm({ ...editForm, rozet: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-[#21262d] border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver Standart</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Yayın Durumu *
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-[#21262d] border border-emerald-500/50 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="yayinda">✅ Yayında</option>
                    <option value="onay_bekliyor">⏳ Onay Bekliyor</option>
                    <option value="suresi_doldu">❌ Süresi Doldu</option>
                  </select>
                </label>
              </div>

              {/* Panel Şifresi & Kullanıcı Hesabı Eşleştirme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Özel Panel Şifresi
                  <input
                    type="text"
                    value={editForm.panelSifresi}
                    onChange={(e) => setEditForm({ ...editForm, panelSifresi: e.target.value })}
                    className="px-3.5 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Bağlı Kullanıcı Hesabı
                  <select
                    value={editForm.kullaniciId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const u = systemUsers.find((user) => user._id === selectedId);
                      setEditForm({
                        ...editForm,
                        kullaniciId: selectedId,
                        ...(u?.sifreHash ? { panelSifresi: u.sifreHash } : {}),
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Bağımsız İlan --</option>
                    {systemUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.kullaniciAdi} ({u.telefon || 'No tel'})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* VIP Model Profil Bilgileri */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#0d1117] border border-amber-500/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 font-heading uppercase flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Model Sahne Bilgileri</span>
                  </span>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isVerifiedProfile}
                      onChange={(e) => setEditForm({ ...editForm, isVerifiedProfile: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-[11px] text-emerald-400 font-bold">%100 Teyitli</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    Model Sahne / Tam Adı
                    <input
                      type="text"
                      placeholder="Örn: Merve Özdemir"
                      value={editForm.tamAd}
                      onChange={(e) => setEditForm({ ...editForm, tamAd: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    👍 Like Sayısı
                    <input
                      type="number"
                      value={editForm.likeSayisi}
                      onChange={(e) => setEditForm({ ...editForm, likeSayisi: Number(e.target.value) })}
                      className="px-3 py-2 rounded-xl bg-[#161b22] border border-blue-500/40 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
              </div>

              {/* Location & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
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
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  İlçe Seçin *
                  <select
                    value={editForm.ilceSlug}
                    onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {selectedProvince.ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  WhatsApp Numarası *
                  <input
                    type="text"
                    required
                    value={editForm.whatsappNumara}
                    onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
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
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 font-heading uppercase active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. DETAYLI İNCELEME & FOTO GALERİSİ MODALI (MOBİL UYUMLU) ──────────────── */}
      {inspectItem && (
        <div
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#161b22] border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-heading font-black text-sm sm:text-lg text-white truncate max-w-[180px] sm:max-w-md">
                      {inspectItem.baslik}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${inspectItem.status === 'yayinda' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                      {inspectItem.status === 'yayinda' ? '🟢 Yayında' : '⏳ Onay Bekliyor'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8b949e] truncate">
                    📍 {inspectItem.ilSlug} / {inspectItem.ilceSlug} • {new Date(inspectItem.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectLoading ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                <span className="text-xs text-[#8b949e]">Yükleniyor...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* 1. Fotoğraf Galerisi & Büyük Önizleme */}
                <div className="p-3 sm:p-4 rounded-xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-2.5">
                  {(() => {
                    const photos = inspectItem.fotograflar && inspectItem.fotograflar.length > 0
                      ? inspectItem.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
                      : [inspectItem.anaFotograf?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800'];
                    const currentMainUrl = photos[inspectActivePhotoIdx] || photos[0];

                    return (
                      <div className="flex flex-col gap-2.5">
                        <div className="relative w-full h-56 sm:h-80 rounded-xl overflow-hidden bg-black/80 border border-[#30363d] flex items-center justify-center group">
                          <img
                            src={currentMainUrl}
                            alt="Önizleme"
                            className="w-full h-full object-contain"
                          />
                          <a
                            href={currentMainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all shadow-lg"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Tam Boyut</span>
                          </a>
                        </div>

                        {/* Thumbnail Strip */}
                        {photos.length > 1 && (
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                            {photos.map((url: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setInspectActivePhotoIdx(idx)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === inspectActivePhotoIdx ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30' : 'border-[#30363d] opacity-70'
                                  }`}
                              >
                                <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                                {idx === 0 && (
                                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[7px] font-black">
                                    Kapak
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 2. İletişim, Güvenlik ve Biyografi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#21262d] border border-[#363b42] flex flex-col gap-2">
                    <span className="text-[11px] font-black text-amber-400 font-heading uppercase flex items-center gap-1 border-b border-white/10 pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>İletişim &amp; Güvenlik</span>
                    </span>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[#8b949e]">WhatsApp:</span>
                      <a
                        href={`https://wa.me/${(inspectItem.whatsappNumara || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-black text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {inspectItem.whatsappNumara}
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[#8b949e]">Panel Şifresi:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {inspectItem.panelSifresi || 'Tanımlı Değil'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-[#30363d]">
                      <span className="text-[#8b949e]">Kalan Süre:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {getRemainingTime(inspectItem.paketBitisTarihi, inspectItem.status).text}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#21262d] border border-[#363b42] flex flex-col gap-2">
                    <span className="text-[11px] font-black text-amber-400 font-heading uppercase flex items-center gap-1 border-b border-white/10 pb-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Model Detayları</span>
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8b949e]">Sahne Adı:</span>
                      <span className="font-bold text-white">{inspectItem.tamAd || 'Belirtilmedi'}</span>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[#8b949e]">Açıklama:</span>
                      <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-[11px] leading-relaxed max-h-20 overflow-y-auto whitespace-pre-wrap">
                        {inspectItem.aciklama || 'Açıklama bulunmuyor.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Modal Alt Moderasyon Aksiyonları */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#30363d] flex-wrap">
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                    <Link
                      href={`/ilan/${inspectItem.slug}`}
                      target="_blank"
                      className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-cyan-300 font-bold text-xs border border-[#363b42] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Sitede Gör</span>
                    </Link>

                    <button
                      onClick={() => {
                        const itemToEdit = inspectItem;
                        setInspectItem(null);
                        handleOpenEdit(itemToEdit);
                      }}
                      className="py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 font-bold text-xs border border-[#363b42] flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-end">
                    {inspectItem.status === 'onay_bekliyor' ? (
                      <button
                        onClick={async () => {
                          await handleQuickStatusChange(inspectItem._id, 'yayinda');
                          setInspectItem((prev: any) => prev ? { ...prev, status: 'yayinda' } : null);
                        }}
                        className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading uppercase flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Onayla (Yayına Al)</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await handleQuickStatusChange(inspectItem._id, 'onay_bekliyor');
                          setInspectItem((prev: any) => prev ? { ...prev, status: 'onay_bekliyor' } : null);
                        }}
                        className="py-2 px-3 rounded-xl bg-[#21262d] text-[#8b949e] font-bold text-xs border border-[#363b42]"
                      >
                        Beklemeye Al
                      </button>
                    )}

                    <button
                      onClick={() => setInspectItem(null)}
                      className="py-2 px-3 rounded-xl bg-[#21262d] text-white font-bold text-xs"
                    >
                      Kapat
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. QUICK USER ASSIGNMENT & CREDENTIALS MODAL (MOBİL UYUMLU) ──────────────── */}
      {assignModalItem && (
        <div
          onClick={() => setAssignModalItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 selection:bg-amber-500 selection:text-slate-950"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#161b22] border-2 border-amber-500/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <KeyRound className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-white font-heading truncate">
                    Hesap Tanımla / Şifre Ver
                  </h3>
                  <span className="text-[11px] text-amber-400 font-bold truncate">
                    {assignModalItem.baslik}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAssignModalItem(null)}
                className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            {!createdCredentials && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs font-heading">
                <button
                  type="button"
                  onClick={() => setAssignMode('select')}
                  className={`py-2 px-2.5 rounded-lg font-black flex items-center justify-center gap-1.5 transition-all ${assignMode === 'select' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[#8b949e] hover:text-white'
                    }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Mevcut Kullanıcı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignMode('create')}
                  className={`py-2 px-2.5 rounded-lg font-black flex items-center justify-center gap-1.5 transition-all ${assignMode === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-[#8b949e] hover:text-white'
                    }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Yeni Hesap</span>
                </button>
              </div>
            )}

            {/* Created Success State with One-Click Copy */}
            {createdCredentials ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm font-heading">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hesap Başarıyla Oluşturuldu!</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#c9d1d9] flex flex-col gap-1 select-all">
                  <div><strong className="text-amber-400 font-heading">Panel:</strong> /panelim</div>
                  <div><strong className="text-amber-400 font-heading">Kullanıcı Adı:</strong> {createdCredentials.username}</div>
                  <div><strong className="text-amber-400 font-heading">Şifre:</strong> {createdCredentials.pass}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const panelUrl = typeof window !== 'undefined' ? `${window.location.origin}/panelim` : '/panelim';
                      const text = `🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş Adresi: ${panelUrl}\nKullanıcı Adı: ${createdCredentials.username}\nŞifre: ${createdCredentials.pass}\n\nPanelinize giriş yaparak ilanınızı yönetebilirsiniz.`;
                      navigator.clipboard.writeText(text);
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 2500);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs font-heading uppercase transition-all flex items-center justify-center gap-1.5 ${copiedCreds ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      }`}
                  >
                    {copiedCreds ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <span>📋 Mesajı Kopyala</span>
                    )}
                  </button>

                  <button
                    onClick={() => setAssignModalItem(null)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] text-white font-bold text-xs font-heading"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : assignMode === 'select' ? (
              /* Mevcut Kullanıcı Listesi */
              <div className="flex flex-col gap-2.5 text-xs font-heading">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı veya telefon ara..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {usersLoading ? (
                    <div className="p-4 text-center text-[#8b949e]">
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin mx-auto mb-1" />
                      Yükleniyor...
                    </div>
                  ) : systemUsers.length === 0 ? (
                    <div className="p-3 text-center text-[#8b949e] bg-[#0d1117] rounded-xl border border-[#30363d]">
                      Kayıtlı kullanıcı bulunamadı.
                    </div>
                  ) : (
                    systemUsers
                      .filter((u) => {
                        if (!userSearchTerm) return true;
                        const term = userSearchTerm.toLowerCase();
                        return (
                          (u.kullaniciAdi && u.kullaniciAdi.toLowerCase().includes(term)) ||
                          (u.telefon && u.telefon.includes(term)) ||
                          (u.ad && u.ad.toLowerCase().includes(term))
                        );
                      })
                      .map((u) => {
                        const isCurrentLinked = assignModalItem.kullaniciId === u._id;
                        return (
                          <div
                            key={u._id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${isCurrentLinked ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-[#0d1117] border-[#30363d] text-white'
                              }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-white flex items-center gap-1 truncate text-xs">
                                <span>{u.kullaniciAdi}</span>
                                {isCurrentLinked && (
                                  <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black text-[8px]">
                                    Bağlı
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-[#8b949e] font-mono truncate">
                                📞 {u.telefon || 'Tel yok'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAssignExistingUser(u._id)}
                              disabled={assignLoading || isCurrentLinked}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 transition-all ${isCurrentLinked ? 'bg-emerald-500/20 text-emerald-400 cursor-default' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                                }`}
                            >
                              {isCurrentLinked ? 'Bağlı' : 'Ata'}
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            ) : (
              /* Yeni Kullanıcı Formu */
              <form onSubmit={handleCreateAndAssignUser} className="flex flex-col gap-3 text-xs font-heading">
                <div className="flex flex-col gap-1">
                  <label className="text-[#8b949e] font-bold">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={assignForm.kullaniciAdi}
                    onChange={(e) => setAssignForm({ ...assignForm, kullaniciAdi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#8b949e] font-bold">Şifre</label>
                  <input
                    type="text"
                    required
                    value={assignForm.sifre}
                    onChange={(e) => setAssignForm({ ...assignForm, sifre: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-amber-400 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#8b949e] font-bold">Telefon / WhatsApp</label>
                  <input
                    type="text"
                    value={assignForm.telefon}
                    onChange={(e) => setAssignForm({ ...assignForm, telefon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assignLoading}
                  className="mt-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {assignLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Hesap Oluştur &amp; Eşleştir</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── 7. SIFIRDAN YENİ VİP MODEL & İLAN EKLEME MODALI (MOBİL UYUMLU) ──────────────── */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 selection:bg-amber-500 selection:text-slate-950"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#161b22] border-2 border-amber-500/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Crown className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading font-black text-sm sm:text-base text-white">
                    Sıfırdan Yeni VIP Model Ekle
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold">
                    Özel Profil, Biyografi &amp; Fotoğraflar
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3 text-xs font-heading">

              {/* Başlık & Model Sahne Adı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Beylikdüzü VIP Merve"
                    value={createForm.baslik}
                    onChange={(e) => setCreateForm({ ...createForm, baslik: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Model Sahne / Tam Adı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Merve Özdemir"
                    value={createForm.tamAd}
                    onChange={(e) => setCreateForm({ ...createForm, tamAd: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#30363d] text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Vitrin Paketi & Facebook Like & Şifre */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Vitrin Rozeti *
                  <select
                    value={createForm.rozet}
                    onChange={(e) => setCreateForm({ ...createForm, rozet: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  👍 Başlangıç Like
                  <input
                    type="number"
                    value={createForm.likeSayisi}
                    onChange={(e) => setCreateForm({ ...createForm, likeSayisi: Number(e.target.value) })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-blue-500/50 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  Panel Şifresi
                  <input
                    type="text"
                    value={createForm.panelSifresi}
                    onChange={(e) => setCreateForm({ ...createForm, panelSifresi: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Konum & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
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
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  İlçe Seçin *
                  <select
                    value={createForm.ilceSlug}
                    onChange={(e) => setCreateForm({ ...createForm, ilceSlug: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {(turkeyProvinces.find((p) => p.ilSlug === createForm.ilSlug) || turkeyProvinces[0]).ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                  WhatsApp Numarası *
                  <input
                    type="text"
                    required
                    value={createForm.whatsappNumara}
                    onChange={(e) => setCreateForm({ ...createForm, whatsappNumara: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Biyografi */}
              <label className="flex flex-col gap-1 text-xs font-bold text-[#f0f6fc]">
                Açıklama &amp; Biyografi
                <textarea
                  rows={2}
                  placeholder="Hizmet tarzı, hijyen ve detaylar..."
                  value={createForm.aciklama}
                  onChange={(e) => setCreateForm({ ...createForm, aciklama: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-[#21262d] border border-[#30363d] text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* Fotoğraf Yükleme Alanı */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#0d1117] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 font-heading uppercase flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotoğraflar ({createPhotoUrls.length})</span>
                  </span>
                  <span className="text-[10px] text-[#8b949e]">JPG, PNG, WEBP</span>
                </div>

                <label className="relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 cursor-pointer transition-all text-center gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCreateFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={createUploading}
                  />
                  {createUploading ? (
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fotoğraflar Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-white text-xs font-bold font-heading">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Galeriden Fotoğraf Seç &amp; Yükle</span>
                    </div>
                  )}
                </label>

                {createPhotoUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                    {createPhotoUrls.map((url, idx) => {
                      const isCover = idx === createCoverIdx;
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1 bg-[#161b22] ${isCover ? 'border-amber-400 shadow-md shadow-amber-500/30' : 'border-[#30363d]'
                            }`}
                        >
                          <img src={url} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />

                          <div className="relative z-20 flex items-center justify-between w-full">
                            {isCover ? (
                              <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px] flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-slate-950" />
                                Kapak
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCreateCoverIdx(idx)}
                                className="px-1 py-0.2 rounded bg-[#161b22]/90 text-amber-400 font-bold text-[8px] hover:bg-amber-500 hover:text-slate-950"
                              >
                                Kapak Yap
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeCreatePhotoUrl(idx)}
                              className="p-1 rounded bg-red-600/90 text-white hover:bg-red-500"
                              title="Sil"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-[#21262d] text-white font-bold text-xs border border-[#30363d]"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {creating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>İlanı Şimdi Yayına Al</span>
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
