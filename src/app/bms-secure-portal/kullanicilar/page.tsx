'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  AtSign,
  Trash2,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Eye,
  Crown,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // New user form states
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [telefon, setTelefon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi, sifre, telefon }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'Kullanıcı oluşturulamadı.' });
      } else {
        setMessage({ type: 'success', text: `"${kullaniciAdi}" hesabı başarıyla açıldı!` });
        setKullaniciAdi('');
        setSifre('');
        setTelefon('');
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bir hata oluştu.' });
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

  const toggleExpand = (id: string) => {
    setExpandedUserId((prev) => (prev === id ? null : id));
  };

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
    <div className="flex flex-col gap-8 w-full max-w-full text-left">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Kullanıcı Hesap &amp; İlan Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Kullanıcıların kaç ilanı olduğunu, durumlarını ve detaylı profil performanslarını inceleyin.</p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors self-start sm:self-auto shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create User Form */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5 h-fit">
          <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <span>Yeni Kullanıcı Hesabı Aç</span>
          </h2>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
            
            {/* Kullanıcı Adı */}
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
              Kullanıcı Adı *
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Örn: ahmetyilmaz"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-mono font-medium"
                />
                <AtSign className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
              </div>
            </label>

            {/* Şifre */}
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
              Giriş Şifresi *
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Örn: 123456"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                />
                <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3.5" />
              </div>
            </label>

            {/* İsteğe Bağlı Telefon Numarası */}
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
              WhatsApp / Telefon (İsteğe Bağlı)
              <div className="relative">
                <input
                  type="text"
                  placeholder="Örn: 0532 000 00 00"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                />
                <Phone className="w-4 h-4 text-[#8b949e] absolute left-3 top-3.5" />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-heading uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Hesap Açılıyor...</span>
                </>
              ) : (
                <span>Hesabı Oluştur</span>
              )}
            </button>
          </form>
        </div>

        {/* Existing Users List with Detailed Listing Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-base text-white font-heading">
                Kayıtlı Kullanıcılar ({users.length})
              </h2>
            </div>

            {/* Arama Çubuğu */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Kullanıcı, şifre, ilan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b949e]">
              Arama kriterlerine uygun kullanıcı bulunamadı.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredUsers.map((u) => {
                const isExpanded = expandedUserId === u._id;
                const stats = u.stats || { totalListings: 0, activeListings: 0, pendingListings: 0, totalViews: 0, totalWhatsapp: 0 };
                const listings = u.listings || [];

                return (
                  <div 
                    key={u._id} 
                    className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-amber-500/40 transition-all flex flex-col gap-4 shadow-md"
                  >
                    
                    {/* User Header Info & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                          {u.kullaniciAdi?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white font-mono flex items-center gap-1">
                              <AtSign className="w-3.5 h-3.5 text-amber-400" />
                              {u.kullaniciAdi}
                            </span>
                            <code className="text-amber-300 font-mono font-bold bg-[#161b22] px-2 py-0.5 rounded text-[11px] border border-[#30363d]">
                              Şifre: {u.sifreHash || 'Belirtilmedi'}
                            </code>
                          </div>

                          <div className="flex items-center gap-3 text-xs mt-1 text-[#8b949e]">
                            {u.telefon ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                                <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                                <span>{u.telefon}</span>
                              </span>
                            ) : (
                              <span>Telefon: Yok</span>
                            )}
                            <span>●</span>
                            <span className="text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => toggleExpand(u._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all font-heading ${
                            isExpanded
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                              : 'bg-[#161b22] hover:bg-[#21262d] text-white border-[#30363d]'
                          }`}
                        >
                          <span>İlanları Gör ({stats.totalListings})</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u._id, u.kullaniciAdi)}
                          className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition-all active:scale-95"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#30363d]/60 text-center font-heading">
                      <div className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col">
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Toplam İlan</span>
                        <span className="font-black text-sm text-white">{stats.totalListings} Adet</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#161b22] border border-emerald-500/30 flex flex-col">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Yayındaki İlan</span>
                        <span className="font-black text-sm text-emerald-400">{stats.activeListings} Yayında</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#161b22] border border-blue-500/30 flex flex-col">
                        <span className="text-[10px] text-blue-400 uppercase font-bold">Görüntülenme</span>
                        <span className="font-black text-sm text-blue-400">{stats.totalViews.toLocaleString()}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#161b22] border border-green-500/30 flex flex-col">
                        <span className="text-[10px] text-[#25D366] uppercase font-bold">WhatsApp Tıklama</span>
                        <span className="font-black text-sm text-[#25D366]">{stats.totalWhatsapp.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Expandable Listings Section */}
                    {isExpanded && (
                      <div className="mt-2 p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 flex flex-col gap-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Kullanıcının Bağlı İlanları</span>
                          </span>
                          <span className="text-[11px] text-[#8b949e]">
                            {listings.length} ilan bulundu
                          </span>
                        </div>

                        {listings.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#8b949e]">
                            Bu kullanıcıya ait henüz bir ilan bulunmamaktadır.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {listings.map((item: any) => (
                              <div 
                                key={item._id}
                                className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center gap-3 justify-between"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                                    <Image
                                      src={item.anaFotograf || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                                      alt={item.baslik}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs text-white truncate font-heading">
                                      {item.baslik}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                      <span className="text-amber-400 font-bold uppercase">
                                        {item.ilSlug}/{item.ilceSlug}
                                      </span>
                                      <span className={`px-1 rounded font-black uppercase text-[9px] ${
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
                                  className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-amber-400 hover:text-white transition-colors shrink-0"
                                  title="İlanı Sitede Gör"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
}
