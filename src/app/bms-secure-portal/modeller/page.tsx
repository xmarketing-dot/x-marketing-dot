'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Crown, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Save, 
  X, 
  Loader2, 
  Flame, 
  Heart, 
  Eye, 
  BadgeCheck,
  Upload,
  Globe
} from 'lucide-react';

interface VipModelItem {
  _id: string;
  slug: string;
  tamAd: string;
  unvan: string;
  platformlar: string[];
  biyografi: string;
  likeSayisi: number;
  goruntulenmeSayisi: number;
  yas: number;
  boy: number;
  kilo: number;
  gogusOlcusu: string;
  sacRengi: string;
  gozRengi: string;
  burc: string;
  diller: string[];
  anaFotografUrl: string;
  fotograflar: string[];
  isVerified: boolean;
  createdAt: string;
}

export default function AdminVipModelsPage() {
  const [models, setModels] = useState<VipModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedModel, setSelectedModel] = useState<VipModelItem | null>(null);
  const [formData, setFormData] = useState({
    tamAd: '',
    slug: '',
    unvan: 'Dijital Fenomen & VIP Model',
    platformlar: 'OnlyFans, Twitter / X, Instagram, TikTok',
    biyografi: '',
    likeSayisi: 24890,
    yas: 25,
    boy: 171,
    kilo: 53,
    gogusOlcusu: '85C (Doğal)',
    sacRengi: 'Siyah',
    gozRengi: 'Koyu Kahve',
    burc: 'Akrep',
    diller: 'Türkçe, İngilizce',
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/models');
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedModel(null);
    setFormData({
      tamAd: '',
      slug: '',
      unvan: 'Dijital Fenomen & VIP Model',
      platformlar: 'OnlyFans, Twitter / X, Instagram, TikTok',
      biyografi: '',
      likeSayisi: 24890,
      yas: 25,
      boy: 171,
      kilo: 53,
      gogusOlcusu: '85C (Doğal)',
      sacRengi: 'Siyah',
      gozRengi: 'Koyu Kahve',
      burc: 'Akrep',
      diller: 'Türkçe, İngilizce',
    });
    setPhotoUrls(['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800']);
    setModalMode('create');
  };

  const handleOpenEdit = (item: VipModelItem) => {
    setSelectedModel(item);
    setFormData({
      tamAd: item.tamAd || '',
      slug: item.slug || '',
      unvan: item.unvan || 'Dijital Fenomen & VIP Model',
      platformlar: Array.isArray(item.platformlar) ? item.platformlar.join(', ') : 'OnlyFans, Twitter / X, Instagram',
      biyografi: item.biyografi || '',
      likeSayisi: item.likeSayisi || 24890,
      yas: item.yas || 25,
      boy: item.boy || 171,
      kilo: item.kilo || 53,
      gogusOlcusu: item.gogusOlcusu || '85C (Doğal)',
      sacRengi: item.sacRengi || 'Siyah',
      gozRengi: item.gozRengi || 'Koyu Kahve',
      burc: item.burc || 'Akrep',
      diller: Array.isArray(item.diller) ? item.diller.join(', ') : 'Türkçe, İngilizce',
    });
    setPhotoUrls(item.fotograflar && item.fotograflar.length > 0 ? item.fotograflar : [item.anaFotografUrl]);
    setModalMode('edit');
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
      }
    } catch (err) {
      alert('Resim yükleme hatası.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tamAd) {
      alert('Model adı gereklidir!');
      return;
    }

    setSubmitting(true);
    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const bodyPayload = {
        ...(modalMode === 'edit' ? { id: selectedModel?._id } : {}),
        ...formData,
        anaFotografUrl: photoUrls[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        fotograflar: photoUrls,
      };

      const res = await fetch('/api/admin/models', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (res.ok) {
        alert(modalMode === 'create' ? 'Yeni VIP Fenomen Model başarıyla oluşturuldu!' : 'Fenomen profili güncellendi!');
        setModalMode(null);
        fetchModels();
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      alert('Kayıt sırasında bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu VIP Model sayfasını tamamen silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/models?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setModels((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      alert('Silinemedi.');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-full text-left selection:bg-rose-500 selection:text-white">
      
      {/* ── 1. HEADER BAR ──────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-xl">
            <Crown className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading flex items-center gap-2">
              <span>👑 VIP Fenomen &amp; Model Masası</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black">
                {models.length} Model
              </span>
            </h1>
            <p className="text-xs text-[#8b949e]">
              Gizem Bağdaçiçek, Merve Özdemir gibi ünlü VIP fenomenlerin özel SEO sayfalarını, fotoğraflarını ve biyografilerini buradan yönetin. (Telefon, ücret ve konum içermez).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider font-heading shadow-lg shadow-rose-600/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Yeni VIP Fenomen Ekle</span>
          </button>

          <button
            onClick={fetchModels}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. MODEL KARTLARI LİSTESİ ──────────────── */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          <span className="text-xs text-[#8b949e] font-bold">VIP Fenomenler Yükleniyor...</span>
        </div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map((m) => (
            <div
              key={m._id}
              className="p-5 rounded-[28px] bg-[#161b22] border-2 border-rose-500/40 shadow-2xl flex flex-col justify-between gap-4 hover:border-rose-400 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-rose-400/80 shadow-md">
                  <Image
                    src={m.anaFotografUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={m.tamAd}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="80px"
                  />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-base text-white font-heading truncate">
                      {m.tamAd}
                    </span>
                    <span className="text-blue-400 text-xs font-bold">✓</span>
                  </div>

                  <span className="text-[11px] text-rose-400 font-bold font-mono mt-0.5">
                    /{m.slug}
                  </span>

                  <span className="text-[11px] text-[#8b949e] font-medium mt-1">
                    👑 {m.unvan || 'Dijital Fenomen & VIP Model'}
                  </span>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      👍 {m.likeSayisi || 24890} Like
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {m.yas} Yaş / {m.boy}cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Biyografi Özeti */}
              <p className="text-xs text-[#c9d1d9] line-clamp-2 leading-relaxed italic bg-[#0d1117] p-3 rounded-xl border border-white/5">
                "{m.biyografi || 'VIP fenomen model portföyü'}"
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-heading">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(m)}
                  className="py-2.5 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs border border-[#363b42] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Düzenle</span>
                </button>

                <Link
                  href={`/${m.slug}`}
                  target="_blank"
                  className="py-2.5 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-cyan-300 font-bold text-xs border border-[#363b42] flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Sayfaya Git</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(m._id)}
                  className="py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs border border-red-500/30 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-[#161b22] border border-[#30363d] text-center text-xs text-[#8b949e]">
          Henüz VIP Fenomen Model eklenmemiş. Yukarıdaki butona basarak ilk modeli ekleyebilirsiniz!
        </div>
      )}

      {/* ── 3. MODAL: VIP FENOMEN OLUŞTURMA & DÜZENLEME FORMU ──────────────── */}
      {modalMode && (
        <div 
          onClick={() => setModalMode(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#161b22] border-2 border-rose-500/60 rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-lg text-white font-heading">
                    {modalMode === 'create' ? 'Yeni VIP Fenomen Profili Ekle' : 'VIP Fenomen Profilini Düzenle'}
                  </h3>
                  <span className="text-xs text-rose-400 font-bold">
                    Doğrudan Kök Dizin SEO URL'si (/{formData.slug || 'slug'}), Biyografi &amp; Fotoğraflar
                  </span>
                </div>
              </div>

              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-heading">
              
              {/* Model Adı & Özel URL Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Model Sahne / Tam Adı *
                  <input
                    type="text"
                    required
                    placeholder="Örn: Gizem Bağdaçiçek"
                    value={formData.tamAd}
                    onChange={(e) => setFormData({ ...formData, tamAd: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-rose-400 font-black text-sm focus:outline-none focus:border-rose-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Özel SEO URL Slug *
                  <input
                    type="text"
                    placeholder="Örn: gizem-bagdacicek"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs font-mono focus:outline-none focus:border-rose-400"
                  />
                </label>
              </div>

              {/* Unvan & Platformlar & Like */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Fenomen Unvanı
                  <input
                    type="text"
                    value={formData.unvan}
                    onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white font-bold text-xs focus:outline-none focus:border-rose-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  Sosyal Platformlar
                  <input
                    type="text"
                    placeholder="OnlyFans, Twitter / X, Instagram"
                    value={formData.platformlar}
                    onChange={(e) => setFormData({ ...formData, platformlar: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white font-bold text-xs focus:outline-none focus:border-rose-400"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                  👍 Başlangıç Like / Hayran Sayısı
                  <input
                    type="number"
                    value={formData.likeSayisi}
                    onChange={(e) => setFormData({ ...formData, likeSayisi: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-rose-500/40 text-rose-300 font-bold text-xs focus:outline-none focus:border-rose-400"
                  />
                </label>
              </div>



              {/* Biyografi Metni */}
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                Özel Fenomen Biyografisi (SEO Odaklı Google Tanıtımı)
                <textarea
                  rows={4}
                  required
                  value={formData.biyografi}
                  onChange={(e) => setFormData({ ...formData, biyografi: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-rose-400 font-medium"
                />
              </label>

              {/* Fotoğraf Yükleme / Galeri */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">Doğrulanmış Model Fotoğrafları ({photoUrls.length})</span>
                  <label className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-rose-400 border border-rose-500/30 text-xs font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Yükleniyor...' : '+ Fotoğraf Yükle'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {photoUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#30363d] group">
                      <Image src={url} alt={`Foto ${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="w-1/3 py-3.5 px-4 rounded-xl bg-[#21262d] text-white font-bold text-xs border border-[#363b42]"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{modalMode === 'create' ? 'VIP Modeli Şimdi Yayınla' : 'Değişiklikleri Kaydet'}</span>
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

