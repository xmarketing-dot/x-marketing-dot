'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  KeyRound, 
  Phone, 
  Sparkles, 
  Upload, 
  Loader2, 
  Check, 
  Trash2, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  Edit3,
  MapPin,
  Save,
  Clock
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

export default function IlanDuzenlePage() {
  const [telefon, setTelefon] = useState('');
  const [panelSifresi, setPanelSifresi] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [listing, setListing] = useState<any>(null);
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    whatsappNumara: '',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    fiyat: 0,
    tamAd: '',
    yas: '',
    boy: '',
    kilo: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);

  // 1. GİRİŞ YAP & İLANI ÇEK
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefon.trim() || !panelSifresi.trim()) {
      alert('Lütfen telefon numaranızı ve ilan şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/listings/edit-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get',
          telefon: telefon.trim(),
          panelSifresi: panelSifresi.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.listing) {
        setListing(data.listing);
        setFormData({
          baslik: data.listing.baslik || '',
          aciklama: data.listing.aciklama || '',
          whatsappNumara: data.listing.whatsappNumara || '',
          ilSlug: data.listing.ilSlug || 'istanbul',
          ilceSlug: data.listing.ilceSlug || 'beylikduzu',
          fiyat: data.listing.fiyat || 0,
          tamAd: data.listing.tamAd || '',
          yas: data.listing.yas?.toString() || '',
          boy: data.listing.boy?.toString() || '',
          kilo: data.listing.kilo?.toString() || '',
        });

        const imgList = (data.listing.fotograflar || []).map((f: any) => f.url).filter(Boolean);
        if (imgList.length === 0 && data.listing.anaFotograf?.url) {
          imgList.push(data.listing.anaFotograf.url);
        }
        setPhotos(imgList);
        setAuthenticated(true);
      } else {
        alert(data.error || 'İlan bulunamadı.');
      }
    } catch (err: any) {
      alert('Giriş hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fotoğraf Yükleme
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 7) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz.');
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      for (let i = 0; i < files.length; i++) {
        uploadData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.urls) {
        setPhotos((prev) => [...prev, ...data.urls].slice(0, 7));
      } else {
        alert(data.error || 'Fotoğraf yüklenemedi.');
      }
    } catch (err: any) {
      alert('Yükleme hatası: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 2. İLANI GÜNCELLE VE KAYDET
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.baslik.trim() || !formData.aciklama.trim() || !formData.whatsappNumara.trim()) {
      alert('Lütfen başlık, açıklama ve telefon alanlarını doldurunuz.');
      return;
    }

    if (photos.length === 0) {
      alert('Lütfen en az 1 adet fotoğraf ekleyiniz.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/listings/edit-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          telefon: telefon.trim(),
          panelSifresi: panelSifresi.trim(),
          updateData: {
            ...formData,
            fotograflar: photos.map((url) => ({ url })),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('İlanınız başarıyla güncellendi ve kaydedildi!');
        setListing(data.listing);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Güncelleme kaydedilemedi.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedProvince = turkeyProvinces.find((p) => p.ilSlug === formData.ilSlug) || turkeyProvinces[0];

  return (
    <div className="flex flex-col gap-6 px-4 py-8 max-w-xl mx-auto w-full text-left pb-24">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
        <Link
          href="/ilan-ver"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>İlan Ver Ekranına Dön</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-heading font-black">
          <Edit3 className="w-3.5 h-3.5" />
          <span>İlan Düzenleme Portalı</span>
        </div>
      </div>

      {/* ADIM 1: GİRİŞ EKRANI (ŞİFRE + TELEFON) */}
      {!authenticated ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-5 p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-heading font-black text-lg text-white">İlan Düzenleme Girişi</h1>
              <span className="text-xs text-[#8b949e]">
                İlanınızı verirken size verilen 6 haneli şifre ile giriş yapın.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">WhatsApp / Telefon Numaranız</label>
              <div className="relative">
                <input
                  type="text"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="0532 000 00 00"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#8b949e] focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">6 Haneli İlan Şifreniz</label>
              <input
                type="text"
                value={panelSifresi}
                onChange={(e) => setPanelSifresi(e.target.value)}
                placeholder="Örn: 849201"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder:text-[#8b949e] focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>İlanımı Bul &amp; Düzenle</span>}
          </button>

          <p className="text-[11px] text-center text-[#8b949e]">
            Şifrenizi unuttuysanız canlı chatten temsilcimizle iletişime geçebilirsiniz.
          </p>
        </form>
      ) : (
        /* ADIM 2: İLAN DÜZENLEME FORMU */
        <form onSubmit={handleSave} className="flex flex-col gap-5 animate-fadeIn">
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-heading font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* İlan Durumu Kartı */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#8b949e] font-heading font-bold uppercase">Mevcut İlan Durumu</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-black ${
                  listing?.status === 'yayinda' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {listing?.status === 'yayinda' ? 'YAYINDA ✓' : 'ONAY BEKLİYOR ⏳'}
                </span>
                <span className="text-xs font-bold text-amber-400">{listing?.rozet?.toUpperCase()} VİTRİN</span>
              </div>
            </div>

            {listing?.slug && (
              <Link
                href={`/ilan/${listing.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>İlanı Gör</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Fotoğraf Düzenleme */}
          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-black text-white">İlan Fotoğrafları ({photos.length}/7)</label>
              <label className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-black cursor-pointer transition-colors flex items-center gap-1">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <span>Fotoğraf Ekle</span>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group">
                  <Image src={url} alt={`Fotoğraf ${idx + 1}`} fill className="object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                      KAPAK
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded bg-red-600/90 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Temel Bilgiler Formu */}
          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">İlan Başlığı</label>
              <input
                type="text"
                value={formData.baslik}
                onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">İlan Açıklaması &amp; Hizmet Detayı</label>
              <textarea
                rows={4}
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-black text-white">İl</label>
                <select
                  value={formData.ilSlug}
                  onChange={(e) => {
                    const newIl = e.target.value;
                    const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                    setFormData({
                      ...formData,
                      ilSlug: newIl,
                      ilceSlug: prov?.ilceler[0]?.slug || 'merkez',
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                >
                  {turkeyProvinces.map((p) => (
                    <option key={p.ilSlug} value={p.ilSlug}>
                      {p.il}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-heading font-black text-white">İlçe</label>
                <select
                  value={formData.ilceSlug}
                  onChange={(e) => setFormData({ ...formData, ilceSlug: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                >
                  {selectedProvince.ilceler.map((ilce) => (
                    <option key={ilce.slug} value={ilce.slug}>
                      {ilce.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">WhatsApp İletişim Numarası</label>
              <input
                type="text"
                value={formData.whatsappNumara}
                onChange={(e) => setFormData({ ...formData, whatsappNumara: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#30363d]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8b949e]">Yaş</label>
                <input
                  type="number"
                  value={formData.yas}
                  onChange={(e) => setFormData({ ...formData, yas: e.target.value })}
                  placeholder="23"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8b949e]">Boy (cm)</label>
                <input
                  type="number"
                  value={formData.boy}
                  onChange={(e) => setFormData({ ...formData, boy: e.target.value })}
                  placeholder="172"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#8b949e]">Kilo (kg)</label>
                <input
                  type="number"
                  value={formData.kilo}
                  onChange={(e) => setFormData({ ...formData, kilo: e.target.value })}
                  placeholder="55"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /><span>Değişiklikleri Kaydet &amp; Güncelle</span></>}
          </button>
        </form>
      )}
    </div>
  );
}
