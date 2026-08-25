'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form states (Only username & password, optional phone)
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

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Kullanıcı Hesap Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Kullanıcı adı ve şifre oluşturun, hesapları anında yönetin veya silin.</p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create User Form (Only Username & Password) */}
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

        {/* Existing Users List with Delete Buttons */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
            <h2 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Kayıtlı Kullanıcı Hesapları ({users.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b949e]">
              Henüz tanımlanmış kullanıcı hesabı bulunmamaktadır.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((u) => (
                <div key={u._id} className="p-4 rounded-2xl bg-[#21262d] border border-[#363b42] hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                      {u.kullaniciAdi?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-white font-mono flex items-center gap-1">
                        <AtSign className="w-3.5 h-3.5 text-amber-400" />
                        {u.kullaniciAdi}
                      </span>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="text-[#8b949e] font-medium">Şifre:</span>
                        <code className="text-amber-300 font-mono font-bold bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]">
                          {u.sifreHash || 'Belirtilmedi'}
                        </code>
                      </div>
                      {u.telefon && (
                        <span className="text-[11px] text-[#8b949e] mt-0.5">
                          📞 {u.telefon}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Silme Butonu */}
                    <button
                      onClick={() => handleDeleteUser(u._id, u.kullaniciAdi)}
                      className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                      title="Kullanıcıyı Tamamen Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

