'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Link2, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  MousePointerClick,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

function MetricCircle({ percent, color = '#10b981', size = 38, strokeWidth = 3.5 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
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

export default function BacklinkManagementPage() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [baslik, setBaslik] = useState('');
  const [url, setUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [nofollow, setNofollow] = useState(false);
  const [konum, setKonum] = useState('footer');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBacklinks();
  }, []);

  const fetchBacklinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/backlinks');
      const data = await res.json();
      if (data.success && data.backlinks) {
        setBacklinks(data.backlinks);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim() || !url.trim()) {
      alert('Lütfen Başlık ve URL alanlarını doldurunuz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baslik: baslik.trim(),
          url: url.trim(),
          anchorText: anchorText.trim() || baslik.trim(),
          nofollow,
          konum,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBaslik('');
        setUrl('');
        setAnchorText('');
        setShowAddForm(false);
        fetchBacklinks();
      } else {
        alert(data.error || 'Eklenemedi.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await fetch('/api/admin/backlinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' }),
      });
      fetchBacklinks();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu backlinki silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/admin/backlinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      });
      fetchBacklinks();
    } catch (e) {}
  };

  const totalClicks = useMemo(() => backlinks.reduce((acc, b) => acc + (b.tiklamaSayisi || 0), 0), [backlinks]);
  const activeCount = useMemo(() => backlinks.filter((b) => b.aktif).length, [backlinks]);
  const dofollowCount = useMemo(() => backlinks.filter((b) => !b.nofollow).length, [backlinks]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full text-left font-sans animate-fadeIn pb-20 md:pb-12">
      
      {/* ── 1. ÜST HEADER BAR & SAYFA KİMLİĞİ ──────────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-lg mt-0.5 sm:mt-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-xl text-white tracking-tight">
                SEO Backlink &amp; Partner Ağı Yönetimi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono font-bold">
                %100 DOFOLLOW AKTİF
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Partner ve uydu siteleri ekleyin. Google ve Yandex botları tarafından doğrudan taranıp indekslenir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yeni Backlink Ekle</span>
          </button>

          <button
            onClick={fetchBacklinks}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI ŞERİDİ ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Toplam Backlink</span>
            <span className="font-mono font-bold text-lg text-white mt-0.5">{backlinks.length}</span>
            <span className="text-[10px] text-slate-500">Kayıtlı partner</span>
          </div>
          <MetricCircle percent={backlinks.length > 0 ? 100 : 0} color="#10b981" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Aktif Yayında</span>
            <span className="font-mono font-bold text-lg text-emerald-400 mt-0.5">{activeCount}</span>
            <span className="text-[10px] text-slate-500">Botlar tarıyor</span>
          </div>
          <MetricCircle percent={backlinks.length ? (activeCount / backlinks.length) * 100 : 0} color="#10b981" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">DoFollow Gücü</span>
            <span className="font-mono font-bold text-lg text-cyan-400 mt-0.5">{dofollowCount}</span>
            <span className="text-[10px] text-slate-500">PageRank aktaran</span>
          </div>
          <MetricCircle percent={backlinks.length ? (dofollowCount / backlinks.length) * 100 : 0} color="#06b6d4" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Toplam Tıklama</span>
            <span className="font-mono font-bold text-lg text-purple-400 mt-0.5">{totalClicks.toLocaleString('tr-TR')}</span>
            <span className="text-[10px] text-slate-500">Dış yönlendirme</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── 3. YENİ BACKLINK EKLEME FORMU ──────────────── */}
      {showAddForm && (
        <form
          onSubmit={handleAddBacklink}
          className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3 animate-fadeIn"
        >
          <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Yeni Backlink &amp; Partner Sitesi Tanımla</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 text-[11px]">Site Adı / Başlık:</label>
              <input
                type="text"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: Kadıköy VIP Rehberi"
                required
                className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 text-[11px]">Hedef Web Sitesi URL:</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://orneksite.com"
                required
                className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 font-mono transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 text-[11px]">Görünecek Metin (Anchor Text):</label>
              <input
                type="text"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder="Boş bırakılırsa Site Adı kullanılır"
                className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 text-[11px]">SEO Bağlantı Tipi:</label>
              <select
                value={nofollow ? 'nofollow' : 'dofollow'}
                onChange={(e) => setNofollow(e.target.value === 'nofollow')}
                className="px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                <option value="dofollow">DoFollow (Önerilen — Google Bot Gücü Aktarır) 🔥</option>
                <option value="nofollow">NoFollow (Sadece Yönlendirme)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              {submitting ? 'Kaydediliyor...' : 'Backlinki Yayına Al ✓'}
            </button>
          </div>
        </form>
      )}

      {/* ── 4. BACKLİNK LİSTESİ TABLOSU ──────────────── */}
      <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
        <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Kayıtlı Backlink Bağlantıları ({backlinks.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Sitenin en altındaki (Footer) partner alanında tüm 81 il ve ilçede otomatik yayınlanır.</p>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-400">Footer Partner Alanı</span>
        </div>

        {backlinks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#070a0f] rounded-xl border border-slate-800">
            Henüz eklenmiş bir backlink bulunmuyor. "Yeni Backlink Ekle" butonuna basarak ilk sitenizi ekleyin.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {backlinks.map((b) => (
              <div
                key={b._id}
                className={`p-3 sm:p-3.5 rounded-xl bg-[#070a0f] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  b.aktif ? 'border-slate-800 hover:border-slate-700' : 'border-rose-500/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    b.aktif ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-white truncate">{b.baslik}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        !b.nofollow
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {!b.nofollow ? 'DOFOLLOW' : 'NOFOLLOW'}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                        b.aktif ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {b.aktif ? 'YAYINDA' : 'PASİF'}
                      </span>
                    </div>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono truncate max-w-sm mt-0.5"
                    >
                      <span>{b.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* İstatistik & Aksiyonlar */}
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 font-mono">Tıklama</span>
                    <span className="font-mono font-bold text-xs text-purple-400">{b.tiklamaSayisi || 0}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggle(b._id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        b.aktif ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      {b.aktif ? 'Durdur' : 'Yayına Al'}
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
