'use client';

import React, { useState, useEffect } from 'react';
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New user form states
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [telefon, setTelefon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi, sifre, telefon }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setModalMessage({ type: 'error', text: data.error || 'Kullanıcı oluşturulamadı.' });
      } else {
        setModalMessage({ type: 'success', text: `"${kullaniciAdi}" hesabı başarıyla kaydedildi!` });
        setKullaniciAdi('');
        setSifre('');
        setTelefon('');
        fetchUsers();
        setTimeout(() => {
          setIsModalOpen(false);
          setModalMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setModalMessage({ type: 'error', text: err.message || 'Bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, usernameStr: string) => {
    if (!confirm(`"${usernameStr}" kullanıcısını tamamen silmek istediğinizden emin misiniz?`)) return;

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
  const totalListingsCount = users.reduce((acc, u) => acc + (u.stats?.totalListings || 0), 0);
  const totalActiveListingsCount = users.reduce((acc, u) => acc + (u.stats?.activeListings || 0), 0);
  const totalWhatsappClicksCount = users.reduce((acc, u) => acc + (u.stats?.totalWhatsapp || 0), 0);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-full text-left">
      
      {/* ── HEADER BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161b22] p-5 sm:p-6 rounded-3xl border border-[#30363d] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl sm:text-2xl text-white font-heading">Kullanıcı &amp; İlan Yönetimi</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase font-mono">
                {totalUsersCount} Hesap
              </span>
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5">Tüm kullanıcı hesapları, bağlı ilan sayıları ve panel şifreleri.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setModalMessage(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs uppercase font-heading shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yeni Kullanıcı Aç</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-[#0d1117] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2 shrink-0"
            title="Listeyi Yenile"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* ── TOP STATS PILLS ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider">Kayıtlı Kullanıcı</span>
            <span className="font-black text-lg sm:text-xl text-white font-heading truncate">{totalUsersCount} Kişi</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider">Toplam İlan</span>
            <span className="font-black text-lg sm:text-xl text-blue-400 font-heading truncate">{totalListingsCount} Adet</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider">Yayındaki İlan</span>
            <span className="font-black text-lg sm:text-xl text-emerald-400 font-heading truncate">{totalActiveListingsCount} Yayında</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 text-[#25D366] flex items-center justify-center font-bold shrink-0">
            <OfficialWhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[#8b949e] font-bold uppercase tracking-wider">WhatsApp Hit</span>
            <span className="font-black text-lg sm:text-xl text-[#25D366] font-heading truncate">{totalWhatsappClicksCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── FULL WIDTH USERS LIST ──────────────────────────── */}
      <div className="w-full flex flex-col gap-4">
        
        {/* Arama & Filtre Çubuğu */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="font-extrabold text-sm sm:text-base text-white font-heading">
              Kayıtlı Kullanıcılar ({filteredUsers.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Kullanıcı adı, şifre, tel veya ilan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Kullanıcı Kartları Listesi */}
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3 bg-[#161b22] rounded-3xl border border-[#30363d]">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-xs text-[#8b949e] font-heading">Kullanıcı verileri yükleniyor...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8b949e] bg-[#161b22] rounded-3xl border border-[#30363d]">
            Arama kriterlerine uygun kullanıcı bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((u) => {
              const isExpanded = expandedUserId === u._id;
              const stats = u.stats || { totalListings: 0, activeListings: 0, pendingListings: 0, totalViews: 0, totalWhatsapp: 0 };
              const listings = u.listings || [];
              const isCopied = copiedId === u._id;

              return (
                <div 
                  key={u._id} 
                  className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-all flex flex-col gap-4 shadow-xl"
                >
                  
                  {/* User Header Info & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        {u.kullaniciAdi?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm sm:text-base text-white font-mono flex items-center gap-1">
                            <AtSign className="w-4 h-4 text-amber-400" />
                            {u.kullaniciAdi}
                          </span>
                          
                          {/* Password Badge with Copy */}
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(u.sifreHash || '', u._id)}
                            className="text-amber-300 font-mono font-bold bg-[#0d1117] hover:bg-[#21262d] px-2.5 py-1 rounded-xl text-xs border border-[#30363d] flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Şifreyi Kopyala"
                          >
                            <span>Şifre: {u.sifreHash || '—'}</span>
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#8b949e]" />}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs mt-1 text-[#8b949e]">
                          {u.telefon ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                              <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                              <span>{u.telefon}</span>
                            </span>
                          ) : (
                            <span className="text-[#8b949e]">Tel: Belirtilmedi</span>
                          )}
                          <span className="text-[#30363d]">●</span>
                          <span className="text-[11px] text-[#8b949e]">
                            Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand & Delete Actions */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#30363d]/60">
                      <button
                        type="button"
                        onClick={() => toggleExpand(u._id)}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all font-heading ${
                          isExpanded
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-[#0d1117] hover:bg-[#21262d] text-white border-[#30363d]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>İlanları Gör ({stats.totalListings})</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u._id, u.kullaniciAdi)}
                        className="p-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition-all active:scale-95 shrink-0"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#30363d]/60 text-center font-heading">
                    <div className="p-2.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                      <span className="text-[10px] text-[#8b949e] uppercase font-bold">Toplam İlan</span>
                      <span className="font-black text-sm text-white">{stats.totalListings} Adet</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">Yayındaki İlan</span>
                      <span className="font-black text-sm text-emerald-400">{stats.activeListings} Yayında</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col">
                      <span className="text-[10px] text-blue-400 uppercase font-bold">Görüntülenme</span>
                      <span className="font-black text-sm text-blue-400">{stats.totalViews.toLocaleString()}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#0d1117] border border-green-500/30 flex flex-col">
                      <span className="text-[10px] text-[#25D366] uppercase font-bold">WhatsApp Hit</span>
                      <span className="font-black text-sm text-[#25D366]">{stats.totalWhatsapp.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Expandable Listings Section */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Kullanıcıya Bağlı İlanlar</span>
                        </span>
                        <span className="text-[11px] text-[#8b949e]">
                          {listings.length} ilan listelendi
                        </span>
                      </div>

                      {listings.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#8b949e]">
                          Bu kullanıcıya ait henüz bir ilan bulunmamaktadır.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {listings.map((item: any) => (
                            <div 
                              key={item._id}
                              className="p-3.5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-amber-500/40 flex items-center gap-3 justify-between transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shrink-0">
                                  <Image
                                    src={item.anaFotograf || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                                    alt={item.baslik}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-xs text-white truncate font-heading">
                                    {item.baslik}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                    <span className="text-amber-400 font-bold uppercase">
                                      📍 {item.ilSlug}/{item.ilceSlug}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded font-black uppercase text-[9px] ${
                                      item.status === 'yayinda' 
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                      {item.status === 'yayinda' ? 'YAYINDA' : item.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Link
                                href={`/ilan/${item.slug}`}
                                target="_blank"
                                className="p-2.5 rounded-xl bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition-colors shrink-0 flex items-center justify-center shadow-md"
                                title="İlanı Sitede Gör"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── ➕ YENİ KULLANICI AÇMA MODAL POPUP ──────────────── */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#161b22] border-2 border-amber-500/60 rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left animate-in zoom-in-95 duration-200"
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-lg text-white font-heading">
                    Yeni Kullanıcı Hesabı Aç
                  </h3>
                  <span className="text-xs text-[#8b949e]">
                    Müşteri için giriş bilgilerini tanımlayın.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {modalMessage && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                modalMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/15 border border-red-500/40 text-red-400'
              }`}>
                {modalMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="leading-tight">{modalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              
              {/* Kullanıcı Adı */}
              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
                <span>Kullanıcı Adı <span className="text-amber-400">*</span></span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Örn: ahmetyilmaz"
                    value={kullaniciAdi}
                    onChange={(e) => setKullaniciAdi(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#0d1117] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-mono font-medium shadow-inner"
                  />
                  <AtSign className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                </div>
              </label>

              {/* Şifre */}
              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
                <span>Giriş Şifresi <span className="text-amber-400">*</span></span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Örn: 123456"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#0d1117] border border-[#363b42] text-amber-300 text-xs focus:outline-none focus:border-amber-400 font-mono font-bold shadow-inner"
                  />
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                </div>
              </label>

              {/* İsteğe Bağlı Telefon Numarası */}
              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
                <span>WhatsApp / Telefon Numarası (Opsiyonel)</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Örn: 0542 000 00 00"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#0d1117] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-medium shadow-inner"
                  />
                  <Phone className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3.5" />
                </div>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs transition-colors"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-heading uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Hesabı Oluştur</span>
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
