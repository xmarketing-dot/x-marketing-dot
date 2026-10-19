'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  AtSign,
  ArrowUpDown,
  SlidersHorizontal,
  Flame,
  MessageCircle,
  TrendingUp,
  BarChart3,
  ThumbsUp
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

function MetricCircle({ percent, color, size = 42, strokeWidth = 3.5 }: { percent: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, isNaN(percent) ? 0 : percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
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
      <span className="absolute text-[10px] font-mono font-black text-white">
        %{Math.round(safePercent)}
      </span>
    </div>
  );
}


export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu'>('all');
  const [sortBy, setSortBy] = useState<'expiry_asc' | 'created_desc' | 'city_asc' | 'views_desc' | 'whatsapp_desc' | 'title_asc'>('created_desc');
  const [searchTerm, setSearchTerm] = useState('');

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
    yas: 0,
    boy: 0,
    kilo: 0,
    gogusOlcusu: '',
    sacRengi: '',
    gozRengi: '',
    diller: 'Türkçe',
    hizmetMekanlari: '',
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
    tamAd: '',
    isVerifiedProfile: true,
    likeSayisi: 55,
    yas: 0,
    boy: 0,
    kilo: 0,
    gogusOlcusu: '',
    sacRengi: '',
    gozRengi: '',
    diller: 'Türkçe',
    hizmetMekanlari: '',
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

  // ── KULLANICI BAZLI TOPLU WHATSAPP NUMARASI GÜNCELLEME (TEKİL / HAVUZ RASTGELE) ──
  const [showBulkPhoneModal, setShowBulkPhoneModal] = useState(false);
  const [bulkPhoneUser, setBulkPhoneUser] = useState('');
  const [bulkPhoneInputMode, setBulkPhoneInputMode] = useState<'single' | 'pool'>('single');
  const [bulkSingleNumber, setBulkSingleNumber] = useState('');
  const [bulkPoolNumbersText, setBulkPoolNumbersText] = useState('');
  const [bulkDistributionMode, setBulkDistributionMode] = useState<'round_robin' | 'random'>('round_robin');
  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);
  const [bulkPreviewData, setBulkPreviewData] = useState<{
    user: any;
    totalListings: number;
    currentNumbers: string[];
  } | null>(null);
  const [bulkExecuting, setBulkExecuting] = useState(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  const parsedPoolNumbers = useMemo(() => {
    return bulkPoolNumbersText
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter((n) => n.length >= 7);
  }, [bulkPoolNumbersText]);

  const userListingStats = useMemo(() => {
    const map = new Map<string, { count: number; userId?: string; phone?: string }>();
    systemUsers.forEach((u: any) => {
      if (u.kullaniciAdi) {
        map.set(u.kullaniciAdi.toLowerCase(), {
          count: u.stats?.totalListings || 0,
          userId: u._id,
          phone: u.telefon
        });
      }
    });

    listings.forEach((l: any) => {
      const uname = l.kullaniciAdi || (l.kullaniciObj?.kullaniciAdi);
      if (uname) {
        const key = uname.toLowerCase();
        const existing = map.get(key);
        const actualCount = listings.filter((x: any) => (x.kullaniciAdi || x.kullaniciObj?.kullaniciAdi)?.toLowerCase() === key).length;
        if (existing) {
          existing.count = Math.max(existing.count, actualCount);
        } else {
          map.set(key, {
            count: actualCount,
            phone: l.whatsappNumara
          });
        }
      }
    });

    return Array.from(map.entries())
      .map(([uname, data]) => ({
        username: uname,
        count: data.count,
        userId: data.userId,
        phone: data.phone
      }))
      .sort((a, b) => b.count - a.count);
  }, [systemUsers, listings]);

  const fetchBulkUserPreview = async (uname: string) => {
    if (!uname || !uname.trim()) {
      setBulkPreviewData(null);
      return;
    }
    setBulkPreviewLoading(true);
    setBulkResult(null);
    try {
      const clean = uname.replace(/^@/, '').trim();
      const res = await fetch(`/api/admin/listings/bulk-phone?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBulkPreviewData(data);
      } else {
        setBulkPreviewData(null);
      }
    } catch {
      setBulkPreviewData(null);
    } finally {
      setBulkPreviewLoading(false);
    }
  };

  const handleSelectBulkUser = (uname: string) => {
    setBulkPhoneUser(uname);
    fetchBulkUserPreview(uname);
  };

  const handleExecuteBulkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPhoneUser.trim()) {
      alert('Lütfen bir kullanıcı seçin veya kullanıcı adı girin.');
      return;
    }

    const numbers = bulkPhoneInputMode === 'single'
      ? [bulkSingleNumber.trim()]
      : parsedPoolNumbers;

    if (numbers.length === 0 || (bulkPhoneInputMode === 'single' && !bulkSingleNumber.trim())) {
      alert('Lütfen en az bir geçerli WhatsApp numarası giriniz.');
      return;
    }

    const cleanUname = bulkPhoneUser.replace(/^@/, '').trim();
    const count = bulkPreviewData?.totalListings || 'tüm';
    const confirmText = bulkPhoneInputMode === 'single'
      ? `@${cleanUname} kullanıcısına ait ${count} ilanın WhatsApp numarası "${numbers[0]}" olarak güncellenecektir. Onaylıyor musunuz?`
      : `@${cleanUname} kullanıcısına ait ${count} ilana girilen ${numbers.length} adet numara ${bulkDistributionMode === 'round_robin' ? 'dengeli/eşit' : 'rastgele'} olarak paylaştırılacaktır. Onaylıyor musunuz?`;

    if (!confirm(confirmText)) return;

    setBulkExecuting(true);
    setBulkResult(null);

    try {
      const res = await fetch('/api/admin/listings/bulk-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUname,
          rawNumbers: numbers,
          mode: bulkPhoneInputMode === 'single' ? 'single' : bulkDistributionMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBulkResult(data);
        fetchListings(false);
        fetchBulkUserPreview(cleanUname);
      } else {
        alert(data.error || 'Numaralar güncellenemedi.');
      }
    } catch (err: any) {
      alert(err.message || 'Bağlantı hatası.');
    } finally {
      setBulkExecuting(false);
    }
  };

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

  const handleDeleteComment = async (listingId: string, commentId: string) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}&commentId=${commentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (inspectItem && inspectItem._id === listingId) {
          setInspectItem((prev: any) => ({
            ...prev,
            anonimYorumlar: (prev.anonimYorumlar || []).filter((c: any) => c._id !== commentId),
          }));
        }
        setListings((prev) =>
          prev.map((l) =>
            l._id === listingId
              ? { ...l, anonimYorumlar: (l.anonimYorumlar || []).filter((c: any) => c._id !== commentId) }
              : l
          )
        );
      } else {
        alert(data.error || 'Yorum silinemedi.');
      }
    } catch (err) {
      alert('Yorum silinirken hata oluştu.');
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
      yas: item.yas || 0,
      boy: item.boy || 0,
      kilo: item.kilo || 0,
      gogusOlcusu: item.gogusOlcusu || '',
      sacRengi: item.sacRengi || '',
      gozRengi: item.gozRengi || '',
      diller: Array.isArray(item.diller) ? item.diller.join(', ') : (item.diller || 'Türkçe'),
      hizmetMekanlari: Array.isArray(item.hizmetMekanlari) ? item.hizmetMekanlari.join(', ') : (item.hizmetMekanlari || ''),
    });

    const photos = item.fotograflar && item.fotograflar.length > 0
      ? item.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
      : [item.anaFotograf?.url || '/placeholder-avatar.webp'];

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

  // Helper to format dates and remaining listing days
  const formatDateTime = (dateVal?: string | Date) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgoOrLeft = (dateVal?: string | Date) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const isPast = diffMs > 0;
    const absDiff = Math.abs(diffMs);

    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

    if (isPast) {
      if (days > 0) return days + ' gün önce';
      if (hours > 0) return hours + ' sa önce';
      if (minutes > 0) return minutes + ' dk önce';
      return 'Az önce';
    } else {
      if (days > 0) return days + ' gün ' + (hours % 24) + ' sa kaldı';
      if (hours > 0) return hours + ' sa ' + (minutes % 60) + ' dk kaldı';
      return minutes + ' dk kaldı';
    }
  };

  const getRemainingTime = (expiryDate?: string | Date, status?: string, createdDate?: string | Date) => {
    const createdStr = createdDate ? formatDateTime(createdDate) : null;
    const createdAgo = createdDate ? getTimeAgoOrLeft(createdDate) : null;

    if (status === 'onay_bekliyor') {
      return {
        text: '⏳ Onay Bekliyor',
        detail: expiryDate ? 'Bitiş: ' + formatDateTime(expiryDate) : null,
        isExpired: false,
        isPending: true,
        expiryStr: expiryDate ? formatDateTime(expiryDate) : null,
        expiryAgo: null,
        createdStr,
        createdAgo,
      };
    }

    const expiry = expiryDate ? new Date(expiryDate) : null;
    const hasExpiry = expiry && !isNaN(expiry.getTime());
    const now = Date.now();
    const diffMs = hasExpiry ? expiry.getTime() - now : 0;
    const isExpired = status === 'suresi_doldu' || (hasExpiry && diffMs <= 0);

    if (isExpired) {
      const expiryStr = hasExpiry ? formatDateTime(expiry) : null;
      const expiredAgo = hasExpiry ? getTimeAgoOrLeft(expiry) : null;
      return {
        text: hasExpiry ? '❌ Süresi Doldu (' + expiredAgo + ')' : '❌ Süresi Doldu',
        detail: hasExpiry ? 'Bitiş: ' + expiryStr : null,
        isExpired: true,
        isPending: false,
        expiryStr,
        expiryAgo: expiredAgo,
        createdStr,
        createdAgo,
      };
    }

    if (!hasExpiry) {
      return {
        text: '⏳ 7 Gün Kaldı',
        detail: null,
        isExpired: false,
        isPending: false,
        expiryStr: null,
        expiryAgo: null,
        createdStr,
        createdAgo,
      };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingText = diffDays > 0 ? '⏳ ' + diffDays + ' Gün ' + diffHours + ' Sa Kaldı' : '⏳ ' + diffHours + ' Saat Kaldı';

    return {
      text: remainingText,
      detail: 'Bitiş: ' + formatDateTime(expiry),
      isExpired: false,
      isPending: false,
      expiryStr: formatDateTime(expiry),
      expiryAgo: null,
      createdStr,
      createdAgo,
    };
  };

  const selectedProvince = turkeyProvinces.find((p) => p.ilSlug === editForm.ilSlug) || turkeyProvinces[0];

  const pendingCount = listings.filter((l) => l.status === 'onay_bekliyor').length;
  const liveCount = listings.filter((l) => l.status === 'yayinda' && (!l.paketBitisTarihi || new Date(l.paketBitisTarihi).getTime() >= Date.now())).length;
  const expiredCount = listings.filter((l) => {
    if (l.status === 'suresi_doldu') return true;
    if (l.paketBitisTarihi && new Date(l.paketBitisTarihi).getTime() < Date.now()) return true;
    return false;
  }).length;

  const filteredListings = useMemo(() => {
    let list = listings.filter((l) => {
      // 1. Status Filter
      if (filter === 'onay_bekliyor') {
        if (l.status !== 'onay_bekliyor') return false;
      } else if (filter === 'yayinda') {
        if (l.status !== 'yayinda' || (l.paketBitisTarihi && new Date(l.paketBitisTarihi).getTime() < Date.now())) return false;
      } else if (filter === 'suresi_doldu') {
        const isExpired = l.status === 'suresi_doldu' || (l.paketBitisTarihi && new Date(l.paketBitisTarihi).getTime() < Date.now());
        if (!isExpired) return false;
      }

      // 2. Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchTitle = (l.baslik || '').toLowerCase().includes(query);
        const matchName = (l.tamAd || '').toLowerCase().includes(query);
        const matchCity = (l.ilSlug || '').toLowerCase().includes(query);
        const matchDistrict = (l.ilceSlug || '').toLowerCase().includes(query);
        const matchPhone = (l.whatsappNumara || '').toLowerCase().includes(query);
        const matchUser = (
          l.kullaniciAdi ||
          (typeof l.kullaniciId === 'object' ? l.kullaniciId?.kullaniciAdi : '') ||
          ''
        ).toLowerCase().includes(query);

        if (!matchTitle && !matchName && !matchCity && !matchDistrict && !matchPhone && !matchUser) {
          return false;
        }
      }

      return true;
    });

    // 3. Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'expiry_asc') {
        // En az süresi kalan (veya süresi geçmiş olanlar) en üstte
        const timeA = a.paketBitisTarihi ? new Date(a.paketBitisTarihi).getTime() : 9999999999999;
        const timeB = b.paketBitisTarihi ? new Date(b.paketBitisTarihi).getTime() : 9999999999999;
        return timeA - timeB;
      }
      if (sortBy === 'created_desc') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'city_asc') {
        const cityA = (a.ilSlug || '').toLowerCase();
        const cityB = (b.ilSlug || '').toLowerCase();
        const comp = cityA.localeCompare(cityB, 'tr');
        if (comp !== 0) return comp;
        return (a.ilceSlug || '').toLowerCase().localeCompare((b.ilceSlug || '').toLowerCase(), 'tr');
      }
      if (sortBy === 'views_desc') {
        const vA = Number(a.goruntulenmeSayisi || 0);
        const vB = Number(b.goruntulenmeSayisi || 0);
        return vB - vA;
      }
      if (sortBy === 'whatsapp_desc') {
        const wA = Number(a.whatsappTiklamaSayisi || 0);
        const wB = Number(b.whatsappTiklamaSayisi || 0);
        return wB - wA;
      }
      if (sortBy === 'title_asc') {
        const tA = (a.baslik || '').toLowerCase();
        const tB = (b.baslik || '').toLowerCase();
        return tA.localeCompare(tB, 'tr');
      }
      return 0;
    });

    return list;
  }, [listings, filter, searchTerm, sortBy]);

  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-full px-1 sm:px-0 pb-24 sm:pb-8">

      {/* ── 1. ÜST HEADER BAR & EXECUTIVE KPI ŞERİDİ ──────────────── */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Main Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800/80 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-md">
              <List className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-lg sm:text-2xl text-white font-heading tracking-tight">
                  İlan Moderasyon Masası
                </h1>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-black animate-pulse shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {pendingCount} Bekliyor
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                VIP ilan vitrini, onay kuyruğu, süre uzatma ve üye bağlantı operasyonları.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => {
                setShowBulkPhoneModal(true);
                setBulkResult(null);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 font-black text-xs font-heading shadow-md active:scale-95 transition-all cursor-pointer"
              title="Kullanıcı seçip tüm ilanlarının WhatsApp numarasını toplu güncelleyin"
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Toplu Numara Güncelle</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="truncate">+ Yeni VIP Model / İlan</span>
            </button>

            <button
              onClick={() => fetchListings(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all active:scale-95 shrink-0 cursor-pointer"
              title="İlanları Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Executive 4-KPI Metric Strip with Circular Progress (Filter Selectors) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Toplam İlan */}
          <div 
            onClick={() => setFilter('all')} 
            className={`p-3.5 sm:p-4 rounded-2xl bg-[#0c1017] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              filter === 'all' ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[#0c1017]' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-heading">Tüm İlanlar</span>
                {filter === 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <span className="font-black text-xl sm:text-2xl text-white font-heading mt-0.5">{listings.length}</span>
              <span className="text-[10px] text-slate-500">Tüm havuz</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle percent={100} color="#f59e0b" size={42} />
            </div>
          </div>

          {/* Card 2: Onay Bekleyen */}
          <div 
            onClick={() => setFilter('onay_bekliyor')} 
            className={`p-3.5 sm:p-4 rounded-2xl bg-[#0c1017] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              filter === 'onay_bekliyor' ? 'border-rose-500 ring-2 ring-rose-500/30 bg-gradient-to-br from-rose-950/30 to-[#0c1017]' : 'border-slate-800/80'
            } ${pendingCount > 0 ? 'bg-gradient-to-br from-rose-950/15 to-[#0c1017]' : ''}`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 font-heading">Onay Bekleyen</span>
                {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
              </div>
              <span className="font-black text-xl sm:text-2xl text-rose-400 font-heading mt-0.5">{pendingCount}</span>
              <span className="text-[10px] text-slate-500">Kuyrukta moderasyon</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle 
                percent={listings.length > 0 ? (pendingCount / listings.length) * 100 : 0} 
                color="#f43f5e" 
                size={42} 
              />
            </div>
          </div>

          {/* Card 3: Yayındaki İlan */}
          <div 
            onClick={() => setFilter('yayinda')} 
            className={`p-3.5 sm:p-4 rounded-2xl bg-[#0c1017] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              filter === 'yayinda' ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[#0c1017]' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-heading">Yayında</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-black text-xl sm:text-2xl text-emerald-400 font-heading mt-0.5">{liveCount}</span>
              <span className="text-[10px] text-slate-500">Canlı vitrinde aktif</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle 
                percent={listings.length > 0 ? (liveCount / listings.length) * 100 : 0} 
                color="#10b981" 
                size={42} 
              />
            </div>
          </div>

          {/* Card 4: Süresi Dolan */}
          <div 
            onClick={() => setFilter('suresi_doldu')} 
            className={`p-3.5 sm:p-4 rounded-2xl bg-[#0c1017] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              filter === 'suresi_doldu' ? 'border-amber-500 ring-2 ring-amber-500/30 bg-gradient-to-br from-amber-950/20 to-[#0c1017]' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-heading">Süresi Dolan</span>
                {expiredCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
              <span className="font-black text-xl sm:text-2xl text-amber-400 font-heading mt-0.5">{expiredCount}</span>
              <span className="text-[10px] text-slate-500">Süre yenileme bekleyen</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle 
                percent={listings.length > 0 ? (expiredCount / listings.length) * 100 : 0} 
                color="#f59e0b" 
                size={42} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. UNIFIED SEARCH & SORT TOOLBAR (REDUNDANT TABS REMOVED) ──────────────── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0c1017] border border-slate-800/80 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Arama Kutusu */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İlan ara: Model adı, şehir, ilçe, tel no veya kullanıcı..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#070a0f] border border-slate-800 rounded-xl text-white placeholder:text-slate-400/60 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sıralama Seçenekleri (Sorting Toolbar) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-heading font-semibold whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Sırala:</span>
            </div>

            {/* Desktop / Tablet Quick Sort Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-[#070a0f] p-1 rounded-xl border border-slate-800/60">
              <button
                onClick={() => setSortBy('expiry_asc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  sortBy === 'expiry_asc'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
                title="Süresi en az kalan veya bitmiş ilanlar en üstte"
              >
                <Clock className="w-3 h-3" />
                <span>Az Zamanı Kalan</span>
              </button>

              <button
                onClick={() => setSortBy('created_desc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  sortBy === 'created_desc'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>En Yeni</span>
              </button>

              <button
                onClick={() => setSortBy('city_asc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  sortBy === 'city_asc'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Şehir (A-Z)</span>
              </button>

              <button
                onClick={() => setSortBy('views_desc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  sortBy === 'views_desc'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Hit / Ziyaret</span>
              </button>

              <button
                onClick={() => setSortBy('whatsapp_desc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  sortBy === 'whatsapp_desc'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Mobile / Compact Select Dropdown */}
            <div className="sm:hidden flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-[#070a0f] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500/60"
              >
                <option value="expiry_asc">⏳ Az Zamanı Kalan (Önce Bitenler)</option>
                <option value="created_desc">🆕 En Yeni Eklenen</option>
                <option value="city_asc">🏙️ Şehir &amp; İlçe (A-Z)</option>
                <option value="views_desc">🔥 En Çok Ziyaret Edilen (Hit)</option>
                <option value="whatsapp_desc">💬 En Çok WhatsApp Tıklaması</option>
                <option value="title_asc">🔤 İlan Adı (A-Z)</option>
              </select>
            </div>

            {/* Total Results Count Badge */}
            <div className="hidden xl:flex items-center px-2.5 py-1 rounded-lg bg-[#070a0f] border border-slate-800/50 text-[11px] font-mono text-slate-400 whitespace-nowrap">
              <span>Sonuç: <strong className="text-amber-400">{filteredListings.length}</strong> ilan</span>
            </div>
          </div>
        </div>
      

      {/* ── 3. LISTINGS DISPLAY (MASAÜSTÜ İÇİN TABLO & MOBİL İÇİN NATIVE KARTLAR) ──────────────── */}
      <div>
        {loading ? (
          <div className="flex flex-col gap-4">
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-[#0c1017] border border-slate-800/80 p-4 animate-pulse flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                    <div className="w-8 h-8 rounded-xl bg-slate-800" />
                  </div>
                  <div className="h-7 w-16 bg-slate-700/60 rounded" />
                </div>
              ))}
            </div>

            {/* Desktop Table Skeleton */}
            <div className="hidden md:block rounded-2xl bg-[#0c1017] border border-slate-800/80 overflow-hidden shadow-xl">
              <div className="p-4 bg-[#070a0f] border-b border-slate-800 flex items-center justify-between">
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-900/40 border border-slate-800/50 animate-pulse flex items-center justify-between px-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 bg-slate-700/60 rounded" />
                        <div className="h-3 w-24 bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-24 bg-slate-800 rounded hidden lg:block" />
                    <div className="h-5 w-20 bg-slate-800 rounded" />
                    <div className="h-4 w-28 bg-slate-800 rounded hidden xl:block" />
                    <div className="flex gap-1.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800" />
                      <div className="w-8 h-8 rounded-xl bg-slate-800" />
                      <div className="w-8 h-8 rounded-xl bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards Skeleton */}
            <div className="md:hidden flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#0c1017] border border-slate-800/80 animate-pulse flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-700/60 rounded" />
                      <div className="h-3 w-1/2 bg-slate-800 rounded" />
                      <div className="h-3 w-2/3 bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#070a0f] border border-slate-800/80">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-8 bg-slate-800/60 rounded" />
                    ))}
                  </div>
                  <div className="h-9 w-full bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 bg-[#0c1017] rounded-2xl border border-slate-800">
            Bu filtreye uygun ilan bulunamadı.
          </div>
        ) : (
          <>
            {/* ── MASAÜSTÜ PROFESYONEL VERİ TABLOSU (DESKTOP DATA TABLE - md & üstü) ──────────────── */}
            <div className="hidden md:block w-full overflow-hidden rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#070a0f] border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 font-heading tracking-wider">
                      <th className="py-3.5 px-4">İlan / Model</th>
                      <th className="py-3.5 px-3">Konum &amp; Bölge</th>
                      <th className="py-3.5 px-3">Rozet &amp; Durum</th>
                      <th className="py-3.5 px-3">Yayın Süresi</th>
                      <th className="py-3.5 px-3">İletişim &amp; Şifre</th>
                      <th className="py-3.5 px-3 text-center">📊 İstatistik &amp; Yorumlar</th>
                      <th className="py-3.5 px-4 text-right">Yönetim &amp; Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {filteredListings.map((item) => {
                      const remaining = getRemainingTime(item.paketBitisTarihi, item.status, item.createdAt);
                      const isPending = item.status === 'onay_bekliyor';
                      const isLive = item.status === 'yayinda';

                      const hits = Number(item.goruntulenmeSayisi || 0);
                      const clicks = Number(item.whatsappTiklamaSayisi || 0);
                      const likes = Number(item.likeSayisi || 0);
                      const commentsList = item.anonimYorumlar || [];
                      const commentCount = commentsList.length;
                      const avgScore = commentCount > 0
                        ? (commentsList.reduce((acc: number, c: any) => acc + (Number(c.puan) || 5), 0) / commentCount).toFixed(1)
                        : '5.0';
                      const conversion = hits > 0 ? ((clicks / hits) * 100).toFixed(1) : '0.0';

                      return (
                        <tr
                          key={item._id}
                          className={`hover:bg-slate-900/50 transition-colors group ${isPending ? 'bg-amber-500/[0.04]' : ''
                            }`}
                        >
                          {/* İlan & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => handleOpenInspect(item)}
                                className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 bg-[#070a0f] cursor-pointer group/thumb shadow-sm"
                                title="Büyük boyutta incele"
                              >
                                <Image
                                  src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || '/placeholder-avatar.webp'}
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
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5 flex-wrap">
                                  <span>#{item._id.slice(-6)}</span>
                                  {item.createdAt && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="text-amber-400/90 font-bold">📅 İlan: {formatDateTime(item.createdAt)} ({getTimeAgoOrLeft(item.createdAt)})</span>
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
                              {remaining.expiryStr && (
                                <span className={`text-[10px] font-mono font-bold ${remaining.isExpired ? 'text-rose-300' : 'text-emerald-300'}`}>
                                  ⏰ Bitiş: {remaining.expiryStr}
                                </span>
                              )}
                              {remaining.createdStr && (
                                <span className="text-[10px] font-mono text-[#8b949e]">
                                  📅 İlan: {remaining.createdStr}
                                </span>
                              )}
                              <div className="flex items-center gap-1 pt-0.5">
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
                                <span className="text-slate-400 text-[10px] font-mono">@sahipsiz</span>
                              )}
                              <span className="text-white font-mono font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <span>{item.whatsappNumara}</span>
                              </span>
                              {item.panelSifresi && (
                                <span className="px-1.5 py-0.2 rounded bg-[#070a0f] text-amber-300 font-mono font-bold border border-amber-500/30 w-fit text-[10px]">
                                  🔑 {item.panelSifresi}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* İstatistik & Yorumlar */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1 font-mono text-[11px]">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-white font-bold flex items-center gap-0.5" title="Toplam Görüntülenme (Hit)">
                                  <Eye className="w-3 h-3 text-amber-400" />
                                  <span>{hits.toLocaleString('tr-TR')}</span>
                                </span>
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5" title="WhatsApp Tıklaması">
                                  <Phone className="w-3 h-3" />
                                  <span>{clicks}</span>
                                </span>
                                <span className="text-cyan-400 font-bold flex items-center gap-0.5" title="Dönüşüm Oranı">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>%{conversion}</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-center gap-2 text-[10px]">
                                <span className="text-amber-400 font-bold flex items-center gap-0.5" title="Yorumlar ve Puan">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  <span>{commentCount > 0 ? `${avgScore} (${commentCount} Yorum)` : '0 Yorum'}</span>
                                </span>
                                {likes > 0 && (
                                  <span className="text-blue-400 flex items-center gap-0.5" title="Beğeni (Like)">
                                    <ThumbsUp className="w-2.5 h-2.5" />
                                    <span>{likes}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Yönetim & Aksiyonlar */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
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
                                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-xs transition-all"
                                  title="İlanı Durdur / Beklemeye Al"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}

                              {/* İncele */}
                              <button
                                onClick={() => handleOpenInspect(item)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-800 transition-all"
                                title="Detaylı Önizleme & İnceleme"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Düzenle */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-all"
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
                                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
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
                const remaining = getRemainingTime(item.paketBitisTarihi, item.status, item.createdAt);
                const isPending = item.status === 'onay_bekliyor';
                const isLive = item.status === 'yayinda';

                return (
                  <div
                    key={item._id}
                    className={`p-3 sm:p-4 rounded-2xl bg-[#0c1017] border transition-all flex flex-col gap-3 shadow-lg ${isPending
                        ? 'border-amber-500/60 shadow-amber-500/5 bg-gradient-to-b from-[#1c1811] to-[#0c1017]'
                        : 'border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    {/* ── KART ÜST BİLGİ ALANI ──────────────── */}
                    <div className="flex items-start gap-3 w-full">
                      {/* Thumbnail */}
                      <div
                        onClick={() => handleOpenInspect(item)}
                        className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700/80 bg-[#070a0f] cursor-pointer group shadow-md"
                        title="Büyük boyutta incele"
                      >
                        <Image
                          src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || '/placeholder-avatar.webp'}
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
                        </div>

                        {/* Konum & Süre */}
                        <div className="flex items-center gap-2 text-[11px] text-amber-400 font-bold capitalize flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.ilSlug} / {item.ilceSlug}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className={`${remaining.isExpired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-mono'} flex items-center gap-1`}>
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{remaining.text}</span>
                          </span>
                          {remaining.expiryStr && (
                            <span className={`text-[10px] font-mono font-bold ${remaining.isExpired ? 'text-rose-300' : 'text-emerald-300'}`}>
                              ⏰ Bitiş: {remaining.expiryStr}
                            </span>
                          )}
                        </div>

                        {/* İletişim, Tarih, Kullanıcı & Şifre Çipleri */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap mt-0.5">
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
                            <span className="px-1.5 py-0.5 rounded-md bg-[#070a0f] text-slate-300 font-mono text-[10px] border border-slate-800 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-blue-400" />
                              <span>📅 İlan: {formatDateTime(item.createdAt)} ({getTimeAgoOrLeft(item.createdAt)})</span>
                            </span>
                          )}
                          {item.panelSifresi && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#070a0f] text-amber-300 font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                              <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                              <span>Şifre: {item.panelSifresi}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── KART PERFORMANS & İSTATİSTİK BAR (PANEL FORMATINDA) ── */}
                    {(() => {
                      const hits = Number(item.goruntulenmeSayisi || 0);
                      const clicks = Number(item.whatsappTiklamaSayisi || 0);
                      const likes = Number(item.likeSayisi || 0);
                      const commentsList = item.anonimYorumlar || [];
                      const commentCount = commentsList.length;
                      const avgScore = commentCount > 0
                        ? (commentsList.reduce((acc: number, c: any) => acc + (Number(c.puan) || 5), 0) / commentCount).toFixed(1)
                        : '5.0';
                      const conversion = hits > 0 ? ((clicks / hits) * 100).toFixed(1) : '0.0';

                      return (
                        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#070a0f] border border-slate-800/80 text-center font-mono text-[11px]">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">Hit</span>
                            <span className="font-bold text-white mt-0.5 flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5 text-amber-400" />
                              <span>{hits.toLocaleString('tr-TR')}</span>
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-emerald-400 uppercase font-sans font-bold">WP Tık</span>
                            <span className="font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{clicks}</span>
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-cyan-400 uppercase font-sans font-bold">Dönüşüm</span>
                            <span className="font-bold text-cyan-400 mt-0.5 flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" />
                              <span>%{conversion}</span>
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-amber-400 uppercase font-sans font-bold">Yorum</span>
                            <span className="font-bold text-amber-400 mt-0.5 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>{commentCount > 0 ? `${avgScore} (${commentCount})` : '0'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── KART MOBİL UYUMLU AKSİYON BUTONLARI (2 SATIRLI DÜZEN) ──────────────── */}
                    <div className="flex flex-col gap-1.5 border-t border-slate-800/60 pt-2.5">
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
                            className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 font-bold text-xs border border-slate-800 transition-colors"
                            title="İlanı beklemeye al"
                          >
                            <span>Durdur</span>
                          </button>
                        )}

                        {/* Detaylı İncele */}
                        <button
                          onClick={() => handleOpenInspect(item)}
                          className={`py-2 px-3 rounded-xl text-xs font-heading font-black border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${isPending
                              ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                              : 'flex-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                            }`}
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Detaylı İncele</span>
                        </button>

                        {/* Düzenle */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-heading font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
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
                          className="py-1.5 px-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
                          title="Canlı İlan Sayfasını Aç"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">Sitede Gör</span>
                        </Link>

                        {/* Sil */}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="py-1.5 px-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 text-[11px] font-heading font-bold flex items-center justify-center gap-1 transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0c1017] border border-slate-700/80 rounded-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Sticky Header */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0">
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
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800">

              {/* Photo Management Section */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-2.5">
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
                        className={`relative rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1.5 h-28 sm:h-32 bg-[#0c1017] ${isCover ? 'border-amber-400 shadow-md shadow-amber-500/20' : 'border-slate-800'
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
                              className="px-1.5 py-0.5 rounded bg-[#0c1017]/90 text-amber-400 font-bold text-[9px] hover:bg-amber-500 hover:text-slate-950"
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
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    value={editForm.baslik}
                    onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Detaylı İlan Açıklaması *
                  <textarea
                    rows={3}
                    required
                    value={editForm.aciklama}
                    onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Tier & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Vitrin Kademe Rozeti *
                  <select
                    value={editForm.rozet}
                    onChange={(e) => setEditForm({ ...editForm, rozet: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver Standart</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Yayın Durumu *
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="yayinda">✅ Yayında</option>
                    <option value="onay_bekliyor">⏳ Onay Bekliyor</option>
                    <option value="suresi_doldu">❌ Süresi Doldu</option>
                  </select>
                </label>
              </div>

              {/* Panel Şifresi & Kullanıcı Hesabı Eşleştirme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Özel Panel Şifresi
                  <input
                    type="text"
                    value={editForm.panelSifresi}
                    onChange={(e) => setEditForm({ ...editForm, panelSifresi: e.target.value })}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
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
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
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
              <div className="p-3 sm:p-4 rounded-xl bg-[#070a0f] border border-amber-500/40 flex flex-col gap-2.5">
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
                  <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-400">
                    Model Sahne / Tam Adı
                    <input
                      type="text"
                      placeholder="Örn: Merve Özdemir"
                      value={editForm.tamAd}
                      onChange={(e) => setEditForm({ ...editForm, tamAd: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-bold text-slate-400">
                    👍 Like Sayısı
                    <input
                      type="number"
                      value={editForm.likeSayisi}
                      onChange={(e) => setEditForm({ ...editForm, likeSayisi: Number(e.target.value) })}
                      className="px-3 py-2 rounded-xl bg-[#0c1017] border border-blue-500/40 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
              </div>

              {/* Location & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
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
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  İlçe Seçin *
                  <select
                    value={editForm.ilceSlug}
                    onChange={(e) => setEditForm({ ...editForm, ilceSlug: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {selectedProvince.ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  WhatsApp Numarası *
                  <input
                    type="text"
                    required
                    value={editForm.whatsappNumara}
                    onChange={(e) => setEditForm({ ...editForm, whatsappNumara: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#0c1017]/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#0c1017] border border-slate-700/80 rounded-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-2">
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
                  <span className="text-[10px] text-slate-400 truncate">
                    📍 {inspectItem.ilSlug} / {inspectItem.ilceSlug} • {new Date(inspectItem.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectLoading ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                <span className="text-xs text-slate-400">Yükleniyor...</span>
              </div>
            ) : (<div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800">

                {/* 1. Fotoğraf Galerisi & Büyük Önizleme */}
                <div className="p-3 sm:p-4 rounded-xl bg-[#070a0f] border border-amber-500/30 flex flex-col gap-2.5">
                  {(() => {
                    const photos = inspectItem.fotograflar && inspectItem.fotograflar.length > 0
                      ? inspectItem.fotograflar.map((f: any) => (typeof f === 'string' ? f : f.url))
                      : [inspectItem.anaFotograf?.url || '/placeholder-avatar.webp'];
                    const currentMainUrl = photos[inspectActivePhotoIdx] || photos[0];

                    return (
                      <div className="flex flex-col gap-2.5">
                        <div className="relative w-full h-56 sm:h-80 rounded-xl overflow-hidden bg-black/80 border border-slate-800 flex items-center justify-center group">
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
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === inspectActivePhotoIdx ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30' : 'border-slate-800 opacity-70'
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
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-2">
                    <span className="text-[11px] font-black text-amber-400 font-heading uppercase flex items-center gap-1 border-b border-white/10 pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>İletişim &amp; Güvenlik</span>
                    </span>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c1017] border border-slate-800">
                      <span className="text-slate-400">WhatsApp:</span>
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

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c1017] border border-slate-800">
                      <span className="text-slate-400">Panel Şifresi:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {inspectItem.panelSifresi || 'Tanımlı Değil'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#0c1017] border border-slate-800">
                      <span className="text-slate-400">Kalan Süre:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {getRemainingTime(inspectItem.paketBitisTarihi, inspectItem.status).text}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-2">
                    <span className="text-[11px] font-black text-amber-400 font-heading uppercase flex items-center gap-1 border-b border-white/10 pb-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Model Detayları</span>
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sahne Adı:</span>
                      <span className="font-bold text-white">{inspectItem.tamAd || 'Belirtilmedi'}</span>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-slate-400">Açıklama:</span>
                      <div className="p-2 rounded-lg bg-[#0c1017] border border-slate-800 text-white text-[11px] leading-relaxed max-h-20 overflow-y-auto whitespace-pre-wrap">
                        {inspectItem.aciklama || 'Açıklama bulunmuyor.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Canlı İstatistik & Müşteri Analiz Paneli (Panel Formatında) */}
                {(() => {
                  const hits = Number(inspectItem.goruntulenmeSayisi || 0);
                  const clicks = Number(inspectItem.whatsappTiklamaSayisi || 0);
                  const likes = Number(inspectItem.likeSayisi || 0);
                  const uniqueVisitors = Math.max(1, Math.round((hits || 1) * 0.78));
                  const conversion = hits > 0 ? ((clicks / hits) * 100).toFixed(1) : '0.0';
                  const commentsList = inspectItem.anonimYorumlar || [];
                  const commentCount = commentsList.length;
                  const avgScore = commentCount > 0
                    ? (commentsList.reduce((acc: number, c: any) => acc + (Number(c.puan) || 5), 0) / commentCount).toFixed(1)
                    : '5.0';

                  return (
                    <div className="p-3 sm:p-4 rounded-xl bg-[#070a0f] border border-amber-500/30 flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-black text-amber-400 font-heading uppercase flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4" />
                          <span>Canlı İstatistikler &amp; Etkileşim Raporu</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ● Canlı Veri
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                        <div className="p-2.5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>Görüntülenme</span>
                          </span>
                          <span className="text-base sm:text-lg font-black text-white mt-1">
                            {hits.toLocaleString('tr-TR')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-400" />
                            <span>Tekil Ziyaretçi</span>
                          </span>
                          <span className="text-base sm:text-lg font-black text-blue-300 mt-1">
                            {uniqueVisitors.toLocaleString('tr-TR')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center">
                          <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>WP Tıklaması</span>
                          </span>
                          <span className="text-base sm:text-lg font-black text-emerald-400 mt-1">
                            {clicks}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center">
                          <span className="text-[10px] text-cyan-400 uppercase font-sans font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Dönüşüm Oranı</span>
                          </span>
                          <span className="text-base sm:text-lg font-black text-cyan-300 mt-1">
                            %{conversion}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-amber-400 uppercase font-sans font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Yorum &amp; Beğeni</span>
                          </span>
                          <span className="text-sm font-black text-amber-300 mt-1">
                            ⭐ {avgScore} ({commentCount}) • 👍 {likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Kullanıcı Yorumları & Moderasyon Masası */}
                <div className="p-3 sm:p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white font-heading uppercase">
                        Kullanıcı Yorumları &amp; Değerlendirmeler
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                        {(inspectItem.anonimYorumlar || []).length} Adet
                      </span>
                    </div>
                  </div>

                  {(!inspectItem.anonimYorumlar || inspectItem.anonimYorumlar.length === 0) ? (
                    <div className="p-4 rounded-xl bg-[#070a0f] border border-slate-800/60 text-center text-xs text-slate-400">
                      Bu ilana ait henüz kullanıcı yorumu bulunmuyor.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                      {inspectItem.anonimYorumlar.map((c: any, idx: number) => {
                        const stars = Number(c.puan) || 5;
                        return (
                          <div
                            key={c._id || idx}
                            className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col gap-1.5 text-xs shadow-sm group hover:border-amber-500/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">
                                  {c.yazar || 'Anonim Misafir'}
                                </span>
                                <div className="flex items-center text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-2.5 h-2.5 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                                    />
                                  ))}
                                </div>
                                {c.userIp && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#0c1017] text-slate-400 font-mono text-[9px] border border-slate-800" title="Yorum IP Adresi">
                                    🌐 {c.userIp}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Yeni'}
                                </span>
                                {c._id && (
                                  <button
                                    onClick={() => handleDeleteComment(inspectItem._id, c._id)}
                                    className="p-1 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-colors"
                                    title="Bu Yorumu Kalıcı Olarak Sil"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-[#e6edf3] text-xs leading-relaxed break-words font-normal">
                              {c.yorum}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Modal Alt Moderasyon Aksiyonları */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                    <Link
                      href={`/ilan/${inspectItem.slug}`}
                      target="_blank"
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-slate-700/80 flex items-center gap-1 transition-colors"
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
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs border border-slate-700/80 flex items-center gap-1 transition-colors"
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
                        className="py-2 px-3 rounded-xl bg-slate-900 text-slate-400 font-bold text-xs border border-slate-700/80"
                      >
                        Beklemeye Al
                      </button>
                    )}

                    <button
                      onClick={() => setInspectItem(null)}
                      className="py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
            className="w-full max-w-lg bg-[#0c1017] border-2 border-amber-500/60 rounded-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            {!createdCredentials && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#070a0f] border border-slate-800 text-xs font-heading">
                <button
                  type="button"
                  onClick={() => setAssignMode('select')}
                  className={`py-2 px-2.5 rounded-lg font-black flex items-center justify-center gap-1.5 transition-all ${assignMode === 'select' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Mevcut Kullanıcı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignMode('create')}
                  className={`py-2 px-2.5 rounded-lg font-black flex items-center justify-center gap-1.5 transition-all ${assignMode === 'create' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
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

                <div className="p-3 rounded-lg bg-[#070a0f] border border-slate-800 font-mono text-xs text-[#c9d1d9] flex flex-col gap-1 select-all">
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
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs font-heading"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : assignMode === 'select' ? (
              /* Mevcut Kullanıcı Listesi */
              <div className="flex flex-col gap-2.5 text-xs font-heading">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı veya telefon ara..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {usersLoading ? (
                    <div className="p-4 text-center text-slate-400">
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin mx-auto mb-1" />
                      Yükleniyor...
                    </div>
                  ) : systemUsers.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 bg-[#070a0f] rounded-xl border border-slate-800">
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
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${isCurrentLinked ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-[#070a0f] border-slate-800 text-white'
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
                              <span className="text-[10px] text-slate-400 font-mono truncate">
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
                  <label className="text-slate-400 font-bold">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={assignForm.kullaniciAdi}
                    onChange={(e) => setAssignForm({ ...assignForm, kullaniciAdi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold">Şifre</label>
                  <input
                    type="text"
                    required
                    value={assignForm.sifre}
                    onChange={(e) => setAssignForm({ ...assignForm, sifre: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-amber-400 font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold">Telefon / WhatsApp</label>
                  <input
                    type="text"
                    value={assignForm.telefon}
                    onChange={(e) => setAssignForm({ ...assignForm, telefon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
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
            className="w-full max-w-2xl bg-[#0c1017] border-2 border-amber-500/60 rounded-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3 text-xs font-heading">

              {/* Başlık & Model Sahne Adı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  İlan Başlığı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Beylikdüzü VIP Merve"
                    value={createForm.baslik}
                    onChange={(e) => setCreateForm({ ...createForm, baslik: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Model Sahne / Tam Adı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Merve Özdemir"
                    value={createForm.tamAd}
                    onChange={(e) => setCreateForm({ ...createForm, tamAd: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Vitrin Paketi & Facebook Like & Şifre */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Vitrin Rozeti *
                  <select
                    value={createForm.rozet}
                    onChange={(e) => setCreateForm({ ...createForm, rozet: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="vip">👑 VIP Vitrin</option>
                    <option value="gold">🥇 Gold Vitrin</option>
                    <option value="silver">🥈 Silver</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  👍 Başlangıç Like
                  <input
                    type="number"
                    value={createForm.likeSayisi}
                    onChange={(e) => setCreateForm({ ...createForm, likeSayisi: Number(e.target.value) })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-blue-500/50 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  Panel Şifresi
                  <input
                    type="text"
                    value={createForm.panelSifresi}
                    onChange={(e) => setCreateForm({ ...createForm, panelSifresi: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Konum & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
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
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  İlçe Seçin *
                  <select
                    value={createForm.ilceSlug}
                    onChange={(e) => setCreateForm({ ...createForm, ilceSlug: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {(turkeyProvinces.find((p) => p.ilSlug === createForm.ilSlug) || turkeyProvinces[0]).ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.ad}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  WhatsApp Numarası *
                  <input
                    type="text"
                    required
                    value={createForm.whatsappNumara}
                    onChange={(e) => setCreateForm({ ...createForm, whatsappNumara: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              {/* Biyografi */}
              <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                Açıklama &amp; Biyografi
                <textarea
                  rows={2}
                  placeholder="Hizmet tarzı, hijyen ve detaylar..."
                  value={createForm.aciklama}
                  onChange={(e) => setCreateForm({ ...createForm, aciklama: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </label>

              {/* Fotoğraf Yükleme Alanı */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#070a0f] border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 font-heading uppercase flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotoğraflar ({createPhotoUrls.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
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
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col justify-between p-1 bg-[#0c1017] ${isCover ? 'border-amber-400 shadow-md shadow-amber-500/30' : 'border-slate-800'
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
                                className="px-1 py-0.2 rounded bg-[#0c1017]/90 text-amber-400 font-bold text-[8px] hover:bg-amber-500 hover:text-slate-950"
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
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs border border-slate-800"
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

      {/* ── KULLANICI BAZLI TOPLU WHATSAPP NUMARASI GÜNCELLEME MODALI ──────────────── */}
      {showBulkPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading font-black text-sm sm:text-base text-white">
                    Toplu WhatsApp Numarası Güncelle
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Kullanıcı seçin, o kullanıcının tüm ilanlarının numarasını tek seferde veya havuzdan dağıtın.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPhoneModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleExecuteBulkPhone} className="flex flex-col gap-4 text-xs font-heading">
              {/* 1. KULLANICI SEÇİMİ */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-bold flex items-center justify-between">
                  <span>1. Hedef Kullanıcı:</span>
                  {bulkPhoneUser && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      Seçili: @{bulkPhoneUser}
                    </span>
                  )}
                </label>

                {/* Hızlı Seçim Hapları (İlanı Olan Kullanıcılar) */}
                {userListingStats.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-400">Kayıtlı İlan Sahiplerinden Hızlı Seç:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {userListingStats.slice(0, 20).map((stat) => {
                        const isSelected = bulkPhoneUser.toLowerCase() === stat.username.toLowerCase();
                        return (
                          <button
                            key={stat.username}
                            type="button"
                            onClick={() => handleSelectBulkUser(stat.username)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center gap-1 border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                                : 'bg-[#070a0f] text-slate-400 hover:text-white border-slate-800'
                            }`}
                          >
                            <span>@{stat.username}</span>
                            <span className={`px-1 py-0.2 rounded-full text-[9px] ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-amber-400'}`}>
                              {stat.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manuel Kullanıcı Adı Girişi */}
                <div className="relative">
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="veya kullanıcı adını elle yazın (örn: esra_vip)..."
                    value={bulkPhoneUser}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^@/, '');
                      setBulkPhoneUser(val);
                      fetchBulkUserPreview(val);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                {/* Kullanıcı İlan Önizleme Kartı */}
                {bulkPreviewLoading ? (
                  <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Kullanıcıya ait ilanlar taranıyor...</span>
                  </div>
                ) : bulkPreviewData ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-1 text-emerald-300">
                    <div className="flex items-center justify-between font-bold">
                      <span>✓ @{bulkPhoneUser} Kullanıcısı Bulundu</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                        {bulkPreviewData.totalListings} İlan Mevcut
                      </span>
                    </div>
                    {bulkPreviewData.currentNumbers.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        Şu Anki Numaralar: {bulkPreviewData.currentNumbers.join(', ')}
                      </span>
                    )}
                  </div>
                ) : bulkPhoneUser.trim() ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px]">
                    ⚠️ Bu kullanıcı adına ait ilan taranıyor veya sistemde eşleşen ilan yok.
                  </div>
                ) : null}
              </div>

              {/* 2. NUMARA GİRİŞ MODU (TEKİL / HAVUZ) */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
                <label className="text-white font-bold">2. Numaralandırma Yöntemi:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkPhoneInputMode('single')}
                    className={`p-2.5 rounded-xl border flex flex-col gap-0.5 text-left transition-all ${
                      bulkPhoneInputMode === 'single'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>📱 Tek Numara Ata</span>
                      {bulkPhoneInputMode === 'single' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                    <span className="text-[10px] opacity-75">Tüm ilanlara aynı numarayı yazar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkPhoneInputMode('pool')}
                    className={`p-2.5 rounded-xl border flex flex-col gap-0.5 text-left transition-all ${
                      bulkPhoneInputMode === 'pool'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>🎲 Havuzdan Dağıt</span>
                      {bulkPhoneInputMode === 'pool' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                    <span className="text-[10px] opacity-75">Çoklu numarayı eşit/rastgele paylaştırır</span>
                  </button>
                </div>
              </div>

              {/* Tek Numara Formu */}
              {bulkPhoneInputMode === 'single' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold">Yeni WhatsApp Numarası:</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Örn: +90 534 000 0000"
                      value={bulkSingleNumber}
                      onChange={(e) => setBulkSingleNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                /* Havuz Numaraları Formu */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-bold">Numara Havuzu (Her satıra bir numara):</label>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      {parsedPoolNumbers.length} Geçerli Numara
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="+905340000001&#10;+905340000002&#10;+905340000003"
                    value={bulkPoolNumbersText}
                    onChange={(e) => setBulkPoolNumbersText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none font-mono leading-relaxed"
                  />

                  {/* Dağıtım Stratejisi */}
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-bold">Dağıtım Şekli:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkDistributionMode('round_robin')}
                        className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                          bulkDistributionMode === 'round_robin'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-[#070a0f] text-slate-400 border-slate-800'
                        }`}
                      >
                        ⚖️ Eşit / Dengeli Dağıt (Sırayla)
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkDistributionMode('random')}
                        className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                          bulkDistributionMode === 'random'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-[#070a0f] text-slate-400 border-slate-800'
                        }`}
                      >
                        🎲 Tamamen Rastgele Dağıt
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sonuç Özeti / Alert */}
              {bulkResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col gap-1.5 text-emerald-300">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Başarılı! Toplam {bulkResult.totalUpdated} İlan Güncellendi</span>
                  </div>
                  {bulkResult.distribution && Object.keys(bulkResult.distribution).length > 0 && (
                    <div className="flex flex-col gap-0.5 pt-1 border-t border-emerald-500/20 font-mono text-[10px]">
                      {Object.entries(bulkResult.distribution).map(([num, count]: any) => (
                        <div key={num} className="flex justify-between">
                          <span>{num}:</span>
                          <span className="font-bold">{count} ilana atandı</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkPhoneModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Kapat
                </button>

                <button
                  type="submit"
                  disabled={bulkExecuting || !bulkPhoneUser.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {bulkExecuting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span>Numaraları Toplu Güncelle</span>
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
