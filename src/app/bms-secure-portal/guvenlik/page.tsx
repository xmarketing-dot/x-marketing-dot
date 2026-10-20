'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  ShieldCheck,
  Activity,
  Flame,
  Radio
} from 'lucide-react';
import { adminPortalCache } from '@/lib/adminPortalCache';

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
  listingBaslik?: string;
  listingRozet?: string;
  listingKonum?: string;
  whatsappNumara?: string;
  username?: string;
  password?: string;
  updatedAt: string;
}

function MetricCircle({ percent, color = '#ef4444', size = 38, strokeWidth = 3.5 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100);
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

export default function AdminSecurityPage() {
  const [bans, setBans] = useState<BanItem[]>(() => adminPortalCache.get<BanItem[]>('bms_security_bans') || []);
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>(() => adminPortalCache.get<RecentThread[]>('bms_security_threads') || []);
  const [loading, setLoading] = useState(() => !adminPortalCache.has('bms_security_bans'));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manuel Ban Form State
  const [manualIp, setManualIp] = useState('');
  const [manualThreadId, setManualThreadId] = useState('');
  const [manualType, setManualType] = useState<'tam_ban' | 'chat_ban'>('tam_ban');
  const [manualReason, setManualReason] = useState('Kural ihlali / Spam nedeniyle engellendi');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBans(!adminPortalCache.has('bms_security_bans'));
  }, []);

  const fetchBans = async (showLoading: boolean | any = true) => {
    const shouldShow = showLoading === true;
    if (shouldShow && !adminPortalCache.has('bms_security_bans')) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/admin/bans');
      const data = await res.json();
      if (data.bans) {
        setBans(data.bans);
        adminPortalCache.set('bms_security_bans', data.bans);
      }
      if (data.recentThreads) {
        setRecentThreads(data.recentThreads);
        adminPortalCache.set('bms_security_threads', data.recentThreads);
      }
    } catch (e) {
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

  const filteredBans = useMemo(() => {
    return bans.filter((b) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (b.ip || '').toLowerCase().includes(term) ||
        (b.threadId || '').toLowerCase().includes(term) ||
        (b.sebep || '').toLowerCase().includes(term)
      );
    });
  }, [bans, searchTerm]);

  const tamBanCount = useMemo(() => bans.filter((b) => b.engellemeTuru === 'tam_ban').length, [bans]);
  const chatBanCount = useMemo(() => bans.filter((b) => b.engellemeTuru === 'chat_ban').length, [bans]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full text-left font-sans animate-fadeIn pb-20 md:pb-12">
      
      {/* ── 1. ÜST HEADER BAR & SAYFA KİMLİĞİ ──────────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-lg mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-xl text-white tracking-tight">
                Güvenlik &amp; IP/Chat Ban Masası
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] sm:text-[10px] font-mono font-bold">
                {bans.length} ENGELLİ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Ziyaretçileri IP ve canlı chat üzerinden tek tıkla engelleyin, engelli listesini yönetin.
            </p>
          </div>
        </div>

        <button
          onClick={fetchBans}
          disabled={loading}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">Verileri Yenile</span>
          <span className="sm:hidden">Yenile</span>
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-medium ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── 2. EXECUTIVE KPI ŞERİDİ ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Toplam Engelli</span>
            <span className="font-mono font-bold text-lg text-white mt-0.5">{bans.length}</span>
            <span className="text-[10px] text-slate-500">Kayıtlı ceza</span>
          </div>
          <MetricCircle percent={bans.length > 0 ? 100 : 0} color="#f43f5e" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Tam Site Banı</span>
            <span className="font-mono font-bold text-lg text-rose-400 mt-0.5">{tamBanCount}</span>
            <span className="text-[10px] text-slate-500">Siteye erişemez</span>
          </div>
          <MetricCircle percent={bans.length ? (tamBanCount / bans.length) * 100 : 0} color="#e11d48" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Chat Banı</span>
            <span className="font-mono font-bold text-lg text-amber-400 mt-0.5">{chatBanCount}</span>
            <span className="text-[10px] text-slate-500">Sadece chat kilitli</span>
          </div>
          <MetricCircle percent={bans.length ? (chatBanCount / bans.length) * 100 : 0} color="#f59e0b" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">İzlenen IP'ler</span>
            <span className="font-mono font-bold text-lg text-cyan-400 mt-0.5">{recentThreads.length}</span>
            <span className="text-[10px] text-slate-500">Aktif oturum</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── 3. MANUEL / SEÇİMLİ BAN FORMU ──────────────── */}
      <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <span>Engelleme Uygulama Paneli</span>
            </h2>
            <p className="text-[11px] text-slate-400">Aşağıdaki ziyaretçilerden birine tıklarsanız IP ve ID bilgileri buraya otomatik dolar.</p>
          </div>
          <span className="text-xs font-mono font-medium text-rose-400">IP &amp; Chat Güvenlik</span>
        </div>

        <form onSubmit={handleAddBan} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 text-[11px]">Hedef IP Adresi:</label>
            <input
              type="text"
              placeholder="Örn: 88.241.12.5"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500/60 font-mono transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 text-[11px]">Chat Thread ID (Opsiyonel):</label>
            <input
              type="text"
              placeholder="Örn: 6a8ca3200ab7d66603bba207"
              value={manualThreadId}
              onChange={(e) => setManualThreadId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500/60 font-mono transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 text-[11px]">Engelleme Türü:</label>
            <select
              value={manualType}
              onChange={(e: any) => setManualType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500/60 transition-colors"
            >
              <option value="tam_ban">🚫 Tam Siteden Banla (Siteye &amp; Chat'e Hiç Giremez)</option>
              <option value="chat_ban">💬 Sadece Canlı Desteği Engelle</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 text-[11px]">Ban Sebebi (Kullanıcıya Gösterilir):</label>
            <input
              type="text"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500/60 transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || (!manualIp && !manualThreadId)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              <span>Engellemeyi Şimdi Uygula</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 4. CANLI BAĞLANAN MÜŞTERİLER & ZİYARETÇİ LİSTESİ ──────────────── */}
      <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Son Bağlanan Müşteriler &amp; Ziyaretçi IP Listesi ({recentThreads.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">IP'yi bilmenize gerek yok; "Seç &amp; Banla" butonuna dokunarak formu anında doldurabilirsiniz.</p>
          </div>
          <span className="text-xs font-mono font-medium text-cyan-400">Canlı Oturumlar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
          {recentThreads.map((th: any) => (
            <div
              key={th._id}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                th.isBanned
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  {th.kullaniciAdi}
                </span>

                {th.isBanned ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-mono font-bold uppercase">
                    BANLI
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ● Aktif
                  </span>
                )}
              </div>

              {th.listingBaslik ? (
                <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-300 font-semibold truncate max-w-[180px]">
                      👑 {th.listingBaslik}
                    </span>
                    {th.listingRozet && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[8px] font-bold uppercase border border-amber-500/30">
                        {th.listingRozet}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[9px]">
                    <span>{th.listingKonum || 'Şehir Yok'}</span>
                    {th.whatsappNumara && <span>📲 {th.whatsappNumara}</span>}
                  </div>
                </div>
              ) : (
                <div className="px-2 py-1 rounded bg-slate-950/50 text-slate-400 text-[10px] border border-slate-800/60">
                  Genel Canlı Destek Ziyaretçisi
                </div>
              )}

              <div className="flex flex-col gap-0.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>IP:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{th.ip || '127.0.0.1'}</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                  "{th.sonMesajOzeti || 'Mesaj yok'}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {!th.isBanned && (
                  <button
                    type="button"
                    onClick={() => handleSelectThreadToBan(th)}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-[10px] flex items-center gap-1 transition-all active:scale-95"
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

      {/* ── 5. AKTİF ENGELLİLER TABLOSU ──────────────── */}
      <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Aktif Engelli Listesi ({bans.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Veritabanında kayıtlı tüm IP ve chat ban cezaları.</p>
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="IP veya sebep ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-rose-500/60 focus:outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-900/40 border border-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredBans.length > 0 ? (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#070a0f]">
            {filteredBans.map((ban) => (
              <div
                key={ban._id}
                className="p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white font-mono">
                        {ban.ip ? `IP: ${ban.ip}` : `Thread ID: #${ban.threadId?.slice(-6)}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        ban.engellemeTuru === 'tam_ban' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {ban.engellemeTuru === 'tam_ban' ? '🚫 Tam Site Banı' : '💬 Chat Banı'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Sebep: <span className="text-slate-200">{ban.sebep}</span>
                    </p>

                    <span className="text-[10px] text-slate-500 font-mono">
                      Tarih: {new Date(ban.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUnban(ban._id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                  <span>Engeli Kaldır</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Engelli kullanıcı veya IP bulunmuyor.
          </div>
        )}
      </div>

    </div>
  );
}
