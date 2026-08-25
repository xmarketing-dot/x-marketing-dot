'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Ban, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Search, 
  Globe, 
  MessageSquare,
  Lock,
  User,
  Zap
} from 'lucide-react';

interface BanItem {
  _id: string;
  ip?: string;
  threadId?: string;
  sebep: string;
  engellemeTuru: 'tam_ban' | 'chat_ban';
  aktif: boolean;
  createdAt: string;
}

interface RecentThread {
  _id: string;
  kullaniciAdi: string;
  ip?: string;
  sonMesajOzeti?: string;
  isBanned?: boolean;
  banTuru?: string;
  updatedAt: string;
}

export default function AdminSecurityPage() {
  const [bans, setBans] = useState<BanItem[]>([]);
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manuel Ban Form State
  const [manualIp, setManualIp] = useState('');
  const [manualThreadId, setManualThreadId] = useState('');
  const [manualType, setManualType] = useState<'tam_ban' | 'chat_ban'>('tam_ban');
  const [manualReason, setManualReason] = useState('Kural ihlali / Spam nedeniyle engellendi');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBans();
  }, []);

  const fetchBans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bans');
      const data = await res.json();
      if (data.bans) {
        setBans(data.bans);
      }
      if (data.recentThreads) {
        setRecentThreads(data.recentThreads);
      }
    } catch (e) {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThreadToBan = (th: RecentThread) => {
    setManualIp(th.ip || '');
    setManualThreadId(th._id);
    setManualReason(`Kural ihlali (${th.kullaniciAdi} - "${th.sonMesajOzeti || ''}")`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp && !manualThreadId) {
      setMessage({ type: 'error', text: 'Lütfen IP Adresi veya Chat Thread ID girin.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: manualIp.trim() || undefined,
          threadId: manualThreadId.trim() || undefined,
          engellemeTuru: manualType,
          sebep: manualReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Engelleme başarıyla uygulandı ve veritabanına kaydedildi.' });
        setManualIp('');
        setManualThreadId('');
        fetchBans();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ban eklenemedi.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'İşlem başarısız oldu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnban = async (banId: string) => {
    if (!window.confirm('Bu engellemeyi kaldırmak istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/bans?banId=${banId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBans((prev) => prev.filter((b) => b._id !== banId));
        setMessage({ type: 'success', text: 'Engelleme başarıyla kaldırıldı.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Engelleme kaldırılamadı.' });
    }
  };

  const filteredBans = bans.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.ip || '').toLowerCase().includes(term) ||
      (b.threadId || '').toLowerCase().includes(term) ||
      (b.sebep || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-full text-left">
      
      {/* ── 1. HEADER BAR ──────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading flex items-center gap-2">
              <span>Güvenlik &amp; IP/Chat Ban Masası</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-black">
                {bans.length} Engelli
              </span>
            </h1>
            <p className="text-xs text-[#8b949e]">Ziyaretçileri IP ve Chat üzerinden tek tıkla engelleyin, IP'leri otomatik listeden seçin.</p>
          </div>
        </div>

        <button
          onClick={fetchBans}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── 2. MANUEL VEYA OTOMATİK SEÇİMLİ BAN FORMU ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-red-500/40 shadow-2xl flex flex-col gap-5 max-w-4xl">
        <div className="flex items-center gap-2.5 border-b border-[#30363d] pb-3">
          <Ban className="w-5 h-5 text-red-400" />
          <div className="flex flex-col">
            <h2 className="font-black text-base text-white font-heading">Engelleme Paneli (IP / Kullanıcı)</h2>
            <span className="text-xs text-[#8b949e]">Aşağıdaki listeden bir ziyaretçiye tıklarsanız IP ve ID bilgileri buraya otomatik dolar.</span>
          </div>
        </div>

        <form onSubmit={handleAddBan} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[#8b949e] font-bold">IP Adresi:</label>
            <input
              type="text"
              placeholder="Örn: 88.241.12.5"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500 font-mono font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[#8b949e] font-bold">Chat Thread ID:</label>
            <input
              type="text"
              placeholder="Örn: 6a8ca3200ab7d66603bba207"
              value={manualThreadId}
              onChange={(e) => setManualThreadId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[#8b949e] font-bold">Engelleme Türü:</label>
            <select
              value={manualType}
              onChange={(e: any) => setManualType(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="tam_ban">🚫 Tam Siteden Banla (Siteye &amp; Chat'e Hiç Giremez)</option>
              <option value="chat_ban">💬 Sadece Canlı Desteği Engelle</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[#8b949e] font-bold">Ban Sebebi (Kullanıcıya Gösterilir):</label>
            <input
              type="text"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || (!manualIp && !manualThreadId)}
              className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-heading uppercase tracking-wider shadow-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              <span>Engellemeyi Şimdi Uygula</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. CANLI / SON ZİYARETÇİLER VE SOHBETLER LİSTESİ (TEK TIKLA BAN) ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">
              Son Bağlanan Müşteriler &amp; Ziyaretçi IP Listesi ({recentThreads.length})
            </h2>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            💡 IP'yi bilmenize gerek yok, sağdaki "Seç &amp; Banla" butonuna basmanız yeterlidir.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
          {recentThreads.map((th: any) => (
            <div
              key={th._id}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${
                th.isBanned
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5 font-heading">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {th.kullaniciAdi}
                </span>

                {th.isBanned ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black uppercase">
                    BANLI
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ● Aktif
                  </span>
                )}
              </div>

              {/* İlan & Kullanıcı İlişkisi Rozetleri */}
              {th.listingBaslik ? (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-black truncate max-w-[180px]">
                      👑 {th.listingBaslik}
                    </span>
                    {th.listingRozet && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px] uppercase">
                        {th.listingRozet}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[#8b949e] font-mono">
                    <span>{th.listingKonum || 'Şehir Yok'}</span>
                    {th.whatsappNumara && <span>📲 {th.whatsappNumara}</span>}
                  </div>
                  <div className="flex items-center justify-between text-[#8b949e] font-mono pt-1 border-t border-white/5">
                    {th.username && <span className="text-amber-400 font-bold">👤 User: {th.username}</span>}
                    {th.password && <span className="text-emerald-400 font-bold">🔑 Şifre: {th.password}</span>}
                  </div>
                </div>
              ) : (
                <div className="px-2 py-1 rounded-lg bg-[#161b22] text-[#8b949e] text-[10px] font-medium border border-white/5">
                  👤 Genel Canlı Destek Ziyaretçisi (Henüz İlan Vermedi)
                </div>
              )}

              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex items-center justify-between text-[#8b949e]">
                  <span>IP Adresi:</span>
                  <span className="font-mono text-amber-300 font-bold">{th.ip || '127.0.0.1'}</span>
                </div>
                <p className="text-xs text-[#c9d1d9] line-clamp-1 font-medium italic">
                  "{th.sonMesajOzeti || 'Mesaj yok'}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#30363d]">
                <span className="text-[9px] text-[#8b949e]">
                  {new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {!th.isBanned && (
                  <button
                    type="button"
                    onClick={() => handleSelectThreadToBan(th)}
                    className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Seç &amp; Banla</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. MEVCUT ENGELLER LİSTESİ ──────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <h2 className="font-black text-base text-white font-heading">Aktif Engelli Listesi ({bans.length})</h2>
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="IP, Thread ID veya sebep ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-red-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-2.5" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredBans.length > 0 ? (
          <div className="divide-y divide-[#30363d] border border-[#30363d] rounded-2xl overflow-hidden bg-[#0d1117]">
            {filteredBans.map((ban) => (
              <div
                key={ban._id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap hover:bg-[#161b22] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black shrink-0">
                    <Ban className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white font-mono">
                        {ban.ip ? `IP: ${ban.ip}` : `Thread ID: #${ban.threadId?.slice(-6)}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        ban.engellemeTuru === 'tam_ban' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ban.engellemeTuru === 'tam_ban' ? '🚫 Tam Site Banı' : '💬 Chat Banı'}
                      </span>
                    </div>

                    <p className="text-xs text-[#8b949e] font-medium">
                      Sebep: <span className="text-white font-bold">{ban.sebep}</span>
                    </p>

                    <span className="text-[10px] text-[#8b949e]">
                      Tarih: {new Date(ban.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnban(ban._id)}
                  className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                  <span>Engeli Kaldır (Unban)</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8b949e]">
            Engelli kullanıcı veya IP bulunmuyor.
          </div>
        )}
      </div>

    </div>
  );
}

