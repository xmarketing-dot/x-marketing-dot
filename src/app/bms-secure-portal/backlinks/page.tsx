'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Link2, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  ChevronLeft, 
  ShieldCheck, 
  Eye, 
  MousePointerClick,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';

export default function BacklinkManagementPage() {
  const [backlinks, setBacklinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Yeni Link Formu
  const [baslik, setBaslik] = useState('');
  const [url, setUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [nofollow, setNofollow] = useState(false); // false = dofollow (en güçlü SEO aktarımı)
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
      console.error(e);
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

  const totalClicks = backlinks.reduce((acc, b) => acc + (b.tiklamaSayisi || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto text-left">
      {/* ── ÜST BAŞLIK VE NAVİGASYON ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/bms-secure-portal"
            className="p-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 hover:text-amber-300 transition-colors shrink-0 shadow-lg"
            title="Ana Yönetim Paneline Dön"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                SEO Backlink &amp; Partner Ağı Yönetimi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black font-heading">
                %100 AKTİF &amp; DOFOLLOW
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-0.5">
              Kendi sitelerinizi veya arkadaşlarınızın sitelerini ekleyin. Google ve Yandex botları tarafından doğrudan taranıp indekslenir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yeni Backlink Ekle</span>
          </button>
          <button
            onClick={fetchBacklinks}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── İSTATİSTİK KARTLARI ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-heading font-black uppercase">Toplam Backlink</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-heading font-black text-3xl text-white mt-2">
            {backlinks.length}
          </span>
          <span className="text-[11px] text-[#8b949e]">Sistemde kayıtlı partner siteler</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-emerald-500/30 flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-heading font-black uppercase">Aktif Yayında</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-heading font-black text-3xl text-emerald-400 mt-2">
            {backlinks.filter((b) => b.aktif).length}
          </span>
          <span className="text-[11px] text-emerald-300">Botlar ve kullanıcılar tarafından görülen</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-amber-500/30 flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-heading font-black uppercase">DoFollow (SEO Gücü)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-heading font-black text-3xl text-amber-400 mt-2">
            {backlinks.filter((b) => !b.nofollow).length}
          </span>
          <span className="text-[11px] text-amber-300">Google PageRank aktaran güçlü linkler</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-heading font-black uppercase">Toplam Tıklama</span>
            <MousePointerClick className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-heading font-black text-3xl text-purple-400 mt-2">
            {totalClicks.toLocaleString('tr-TR')}
          </span>
          <span className="text-[11px] text-[#8b949e]">Dış sitelere yönlendirilen kullanıcılar</span>
        </div>
      </div>

      {/* ── YENİ BACKLINK EKLEME FORMU (AKORDEON) ──────────────── */}
      {showAddForm && (
        <form
          onSubmit={handleAddBacklink}
          className="p-6 rounded-3xl bg-[#161b22] border border-blue-500/50 shadow-2xl flex flex-col gap-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <h2 className="font-heading font-black text-base text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Yeni Backlink &amp; Partner Sitesi Tanımla</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8b949e] hover:text-white"
            >
              Kapat ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-heading font-black text-white">Site Adı / Başlık</label>
              <input
                type="text"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: Kadıköy VIP Rehberi"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-heading font-black text-white">Hedef Web Sitesi URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://orneksite.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-heading font-black text-white">Görünecek Metin (Anchor Text)</label>
              <input
                type="text"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder="Boş bırakılırsa Site Adı kullanılır"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-heading font-black text-white">SEO Bağlantı Tipi</label>
              <select
                value={nofollow ? 'nofollow' : 'dofollow'}
                onChange={(e) => setNofollow(e.target.value === 'nofollow')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
              >
                <option value="dofollow">DoFollow (Önerilen — Google Bot Gücü ve Sıralama Aktarır) 🔥</option>
                <option value="nofollow">NoFollow (Sadece Yönlendirme, SEO suyu aktarmaz)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white text-xs font-bold"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-black text-xs shadow-lg shadow-blue-500/20"
            >
              {submitting ? 'Kaydediliyor...' : 'Backlinki Yayına Al ✓'}
            </button>
          </div>
        </form>
      )}

      {/* ── BACKLİNK LİSTESİ TABLOSU ──────────────── */}
      <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            <h2 className="font-heading font-black text-base text-white">
              Kayıtlı Backlink Bağlantıları ({backlinks.length})
            </h2>
          </div>
          <span className="text-xs text-[#8b949e]">
            Sitenin en altındaki (Footer) partner alanında tüm 81 il ve ilçede otomatik yayınlanır.
          </span>
        </div>

        {backlinks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8b949e] bg-[#0d1117] rounded-2xl border border-[#30363d]">
            Henüz eklenmiş bir backlink bulunmuyor. "Yeni Backlink Ekle" butonuna basarak ilk sitenizi ekleyin.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {backlinks.map((b) => (
              <div
                key={b._id}
                className={`p-4 rounded-2xl bg-[#0d1117] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  b.aktif ? 'border-[#30363d] hover:border-blue-500/50' : 'border-red-500/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                    b.aktif ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-black text-sm text-white truncate">{b.baslik}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-heading ${
                        !b.nofollow
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {!b.nofollow ? 'DOFOLLOW' : 'NOFOLLOW'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-heading ${
                        b.aktif ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {b.aktif ? 'YAYINDA' : 'PASİF'}
                      </span>
                    </div>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono truncate max-w-sm mt-0.5"
                    >
                      <span>{b.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* İstatistik & Aksiyonlar */}
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#30363d]/60 pt-2 sm:pt-0">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-[#8b949e]">Tıklama</span>
                    <span className="font-mono font-black text-xs text-purple-400">{b.tiklamaSayisi || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(b._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-colors ${
                        b.aktif ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      {b.aktif ? 'Durdur' : 'Yayına Al'}
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
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
