'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  AtSign, 
  Trash2,
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ExternalLink, 
  Crown, 
  Layers, 
  MapPin, 
  Copy, 
  Check,
  X,
  Plus
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { adminPortalCache } from '@/lib/adminPortalCache';

function MetricCircle({ percent, color = '#10b981', size = 38, strokeWidth = 3.5 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
  const safePercent = Math.min(100, Math.max(0, isNaN(percent) ? 0 : percent));
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
      <span className="absolute text-[10px] font-mono font-bold text-white">
        %{Math.round(safePercent)}
      </span>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>(() => adminPortalCache.get<any[]>('bms_admin_users') || []);
  const [loading, setLoading] = useState(() => !adminPortalCache.has('bms_admin_users'));
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New user form states
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [telefon, setTelefon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit User states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setEditUsername(u.kullaniciAdi || '');
    setEditPassword(u.sifreHash || '');
    setEditPhone(u.telefon || '');
    setEditMsg(null);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser._id,
          kullaniciAdi: editUsername.trim(),
          sifreHash: editPassword.trim(),
          telefon: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditMsg({ type: 'success', text: '✅ Kullanıcı başarıyla güncellendi!' });
        setUsers((prev) =>
          prev.map((u) =>
            u._id === editingUser._id
              ? { ...u, kullaniciAdi: editUsername.trim(), sifreHash: editPassword.trim(), telefon: editPhone.trim() }
              : u
          )
        );
        setTimeout(() => {
          setEditingUser(null);
        }, 1200);
      } else {
        setEditMsg({ type: 'error', text: data.error || 'Güncellenemedi.' });
      }
    } catch (e: any) {
      setEditMsg({ type: 'error', text: e.message || 'Bağlantı hatası.' });
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(!adminPortalCache.has('bms_admin_users'));
  }, []);

  const fetchUsers = async (forceRefresh: boolean | any = false) => {
    const isManual = forceRefresh === true || (forceRefresh && typeof forceRefresh === 'object');
    if (isManual || !adminPortalCache.has('bms_admin_users')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/admin/users?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      const list = (data.users && Array.isArray(data.users)) ? data.users : (Array.isArray(data) ? data : []);
      if (list.length > 0) {
        setUsers(list);
        adminPortalCache.set('bms_admin_users', list);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kullaniciAdi.trim() || !sifre.trim()) {
      setModalMessage({ type: 'error', text: 'Lütfen kullanıcı adı ve şifre giriniz.' });
      return;
    }

    setSubmitting(true);
    setModalMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullaniciAdi: kullaniciAdi.trim(),
          sifre: sifre.trim(),
          telefon: telefon.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setModalMessage({ type: 'success', text: `✅ "${data.user.kullaniciAdi}" başarıyla açıldı!` });
        setKullaniciAdi('');
        setSifre('');
        setTelefon('');
        fetchUsers();
        setTimeout(() => {
          setIsModalOpen(false);
          setModalMessage(null);
        }, 1200);
      } else {
        setModalMessage({ type: 'error', text: data.error || 'Kullanıcı oluşturulamadı.' });
      }
    } catch (err: any) {
      setModalMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz? (Kullanıcıya bağlı ilanlar sahipsiz kalabilir)`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert(data.error || 'Silinemedi.');
      }
    } catch (err) {
      alert('Silme işleminde bağlantı hatası.');
    }
  };

  const handleCopyPassword = (pwd: string, id: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedUserId((prev) => (prev === id ? null : id));
  };

  // Summary counts
  const totalUsersCount = users.length;
  const totalListingsCount = useMemo(() => users.reduce((acc, u) => acc + (u.stats?.totalListings || 0), 0), [users]);
  const totalActiveListingsCount = useMemo(() => users.reduce((acc, u) => acc + (u.stats?.activeListings || 0), 0), [users]);
  const totalWhatsappClicksCount = useMemo(() => users.reduce((acc, u) => acc + (u.stats?.totalWhatsapp || 0), 0), [users]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter((u) => {
      const matchesUser = (u.kullaniciAdi || '').toLowerCase().includes(term);
      const matchesPhone = (u.telefon || '').toLowerCase().includes(term);
      const matchesPwd = (u.sifreHash || '').toLowerCase().includes(term);
      const matchesListing = Array.isArray(u.listings) && u.listings.some((l: any) => 
        (l.baslik || '').toLowerCase().includes(term) ||
        (l.ilSlug || '').toLowerCase().includes(term) ||
        (l.ilceSlug || '').toLowerCase().includes(term)
      );
      return matchesUser || matchesPhone || matchesPwd || matchesListing;
    });
  }, [users, searchTerm]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full text-left font-sans animate-fadeIn pb-20 md:pb-12">
      
      {/* ── 1. ÜST HEADER BAR & SAYFA KİMLİĞİ ──────────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-lg mt-0.5 sm:mt-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-xl text-white tracking-tight">
                Kullanıcı &amp; İlan Yönetimi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono font-bold">
                {totalUsersCount} HESAP
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Tüm kullanıcı hesapları, bağlı ilan sayıları ve müşteri panel şifreleri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setModalMessage(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yeni Kullanıcı Aç</span>
          </button>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer active:scale-90 touch-manipulation shadow-sm"
            title="Listeyi Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI ŞERİDİ ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Kayıtlı Kullanıcı</span>
            <span className="font-mono font-bold text-lg text-white mt-0.5">{totalUsersCount}</span>
            <span className="text-[10px] text-slate-500">Müşteri hesabı</span>
          </div>
          <MetricCircle percent={totalUsersCount > 0 ? 100 : 0} color="#10b981" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Toplam İlan</span>
            <span className="font-mono font-bold text-lg text-cyan-400 mt-0.5">{totalListingsCount}</span>
            <span className="text-[10px] text-slate-500">Kayıtlı portföy</span>
          </div>
          <MetricCircle percent={totalListingsCount ? 100 : 0} color="#06b6d4" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Yayındaki İlan</span>
            <span className="font-mono font-bold text-lg text-emerald-400 mt-0.5">{totalActiveListingsCount}</span>
            <span className="text-[10px] text-slate-500">Aktif yayında</span>
          </div>
          <MetricCircle percent={totalListingsCount ? (totalActiveListingsCount / totalListingsCount) * 100 : 0} color="#10b981" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">WhatsApp Hit</span>
            <span className="font-mono font-bold text-lg text-green-400 mt-0.5">{totalWhatsappClicksCount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Müşteri etkileşimi</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center">
            <OfficialWhatsAppIcon className="w-4 h-4 fill-green-400" />
          </div>
        </div>
      </div>

      {/* ── 3. FULL WIDTH USERS LIST ──────────────── */}
      <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Kayıtlı Kullanıcılar ({filteredUsers.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Panel şifreleri, bağlı ilanlar ve canlı oturum durumları.</p>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Kullanıcı, tel veya ilan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Masaüstü Tablo */}
        {loading ? (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-900/40 border border-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#070a0f] rounded-xl border border-slate-800">
            Arama kriterlerine uygun kullanıcı bulunamadı.
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-[#070a0f]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3.5">Kullanıcı &amp; İlan</th>
                    <th className="py-2.5 px-3.5">İletişim / WhatsApp</th>
                    <th className="py-2.5 px-3.5">Panel Şifresi</th>
                    <th className="py-2.5 px-3.5">Oturum Durumu</th>
                    <th className="py-2.5 px-3.5 text-center">İlan Sayısı</th>
                    <th className="py-2.5 px-3.5 text-center">Hit</th>
                    <th className="py-2.5 px-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredUsers.map((u) => {
                    const isExpanded = expandedUserId === u._id;
                    const stats = u.stats || { totalListings: 0, activeListings: 0, pendingListings: 0, totalViews: 0, totalWhatsapp: 0 };
                    const listings = u.listings || [];
                    const isCopied = copiedId === u._id;
                    
                    const now = new Date();
                    const isActuallyOnline = u.isOnline || (u.lastActiveAt && (now.getTime() - new Date(u.lastActiveAt).getTime()) < 5 * 60000);
                    const startedAt = u.sessionStartedAt ? new Date(u.sessionStartedAt) : (u.lastActiveAt ? new Date(u.lastActiveAt) : null);
                    const minsInside = startedAt ? Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 60000)) : 0;
                    const entryTimeStr = startedAt ? startedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : null;

                    return (
                      <React.Fragment key={u._id}>
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 relative">
                                {u.kullaniciAdi?.charAt(0).toUpperCase() || 'U'}
                                {isActuallyOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#070a0f] animate-pulse"></span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0 max-w-[180px]">
                                <span className="font-bold text-xs text-white font-mono flex items-center gap-1 truncate">
                                  @{u.kullaniciAdi}
                                </span>
                                {listings.length > 0 ? (
                                  <span className="text-[10px] text-amber-300 font-semibold truncate">
                                    👑 {listings[0].baslik}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    İlan henüz yok
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            {u.telefon ? (
                              <a
                                href={`https://wa.me/${u.telefon.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs hover:underline"
                              >
                                <OfficialWhatsAppIcon className="w-3 h-3 fill-emerald-400 shrink-0" />
                                <span>{u.telefon}</span>
                              </a>
                            ) : (
                              <span className="text-slate-500 font-mono text-xs">—</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3.5">
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(u.sifreHash || '', u._id)}
                              className="inline-flex items-center gap-1.5 text-cyan-300 font-mono text-xs bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors"
                              title="Şifreyi Kopyala"
                            >
                              <Lock className="w-3 h-3 text-cyan-400" />
                              <span>{u.sifreHash || '—'}</span>
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                            </button>
                          </td>

                          <td className="py-2.5 px-3.5">
                            {isActuallyOnline ? (
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-emerald-400 font-bold">Online ({minsInside} dk)</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">
                                {u.lastActiveAt ? `Son: ${new Date(u.lastActiveAt).toLocaleDateString('tr-TR')}` : 'Çevrimdışı'}
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {stats.totalListings} Toplam
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                {stats.activeListings} Yayında
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 text-center">
                            <div className="inline-flex items-center gap-2 font-mono text-xs">
                              <span className="text-slate-400">👁️ {stats.totalViews}</span>
                              <span className="text-emerald-400">💬 {stats.totalWhatsapp}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white transition-colors"
                                title="Kullanıcıyı Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleExpand(u._id)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all ${
                                  isExpanded
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                                }`}
                              >
                                <Layers className="w-3 h-3" />
                                <span>İlanlar ({stats.totalListings})</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u._id, u.kullaniciAdi)}
                                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Kullanıcıyı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-950/60">
                            <td colSpan={7} className="p-3 sm:p-4 border-b border-slate-800">
                              <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                                  @{u.kullaniciAdi} Hesabına Bağlı İlanlar ({listings.length})
                                </span>
                                {listings.length === 0 ? (
                                  <div className="p-3 text-center text-xs text-slate-500 bg-[#070a0f] rounded-lg border border-slate-800">
                                    Bu kullanıcıya ait henüz bir ilan bulunmamaktadır.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {listings.map((item: any) => (
                                      <div 
                                        key={item._id}
                                        className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center justify-between gap-2"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                            <Image
                                              src={item.anaFotograf || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                                              alt={item.baslik}
                                              fill
                                              sizes="32px"
                                              className="object-cover"
                                            />
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-xs text-white truncate">{item.baslik}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">📍 {item.ilSlug}/{item.ilceSlug}</span>
                                          </div>
                                        </div>

                                        <Link
                                          href={`/ilan/${item.slug}`}
                                          target="_blank"
                                          className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                                          title="İlanı Aç"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── YENİ KULLANICI AÇMA MODALI ──────────────── */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0e131f] border border-slate-800/90 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm text-white">Yeni Kullanıcı Hesabı Aç</h3>
                  <span className="text-[11px] text-slate-400">Müşteri için giriş bilgilerini tanımlayın.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalMessage && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                modalMessage.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {modalMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{modalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">Kullanıcı Adı:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: ahmetyilmaz"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">Giriş Şifresi:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 123456"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-cyan-300 text-xs focus:outline-none focus:border-emerald-500/60 font-mono font-semibold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">WhatsApp / Telefon (Opsiyonel):</label>
                <input
                  type="text"
                  placeholder="Örn: 0542 000 00 00"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  {submitting ? 'Kaydediliyor...' : 'Hesabı Aç ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KULLANICI DÜZENLEME MODALI ──────────────── */}
      {editingUser && (
        <div 
          onClick={() => setEditingUser(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0e131f] border border-slate-800/90 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm text-white">Kullanıcıyı Düzenle</h3>
                  <span className="text-[11px] text-slate-400">@{editingUser.kullaniciAdi}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                editMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {editMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{editMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">Kullanıcı Adı:</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">Giriş Şifresi:</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-cyan-300 text-xs focus:outline-none focus:border-cyan-500/60 font-mono font-semibold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 text-[11px]">WhatsApp / Telefon:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  {editLoading ? 'Kaydediliyor...' : 'Güncelle ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
