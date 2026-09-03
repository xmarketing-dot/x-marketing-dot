'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Megaphone, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  Check, 
  ArrowRight, 
  Loader2, 
  Wallet, 
  MessageSquare,
  ChevronLeft,
  Calendar,
  Eye,
  MousePointerClick,
  Copy
} from 'lucide-react';

const PACKAGES = [
  {
    id: 7,
    title: '1 Haftalık Sponsor Banner',
    fiyat: 5000,
    gun: 7,
    populer: false,
    desc: 'Anasayfa veya İlan Detay sayfalarında 7 gün kesintisiz gösterim.',
  },
  {
    id: 15,
    title: '15 Günlük Süper Vitrin',
    fiyat: 9000,
    gun: 15,
    populer: true,
    desc: 'En çok tercih edilen paket! 15 gün boyunca 750.000+ gösterim.',
  },
  {
    id: 30,
    title: '30 Günlük Aylık Hakimiyet',
    fiyat: 15000,
    gun: 30,
    populer: false,
    desc: '30 gün tam ay garantisi. En yüksek indirim oranı & VIP görünürlük.',
  },
];

export default function ReklamVerPage() {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [selectedGun, setSelectedGun] = useState<number>(15);
  const [konum, setKonum] = useState<'anasayfa' | 'ilan_detay' | 'her_ikisi'>('her_ikisi');
  const [baslik, setBaslik] = useState('');
  const [hedefUrl, setHedefUrl] = useState('');
  const [musteriIletisim, setMusteriIletisim] = useState('');
  const [gorselUrl, setGorselUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdBannerId, setCreatedBannerId] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedPackage = PACKAGES.find((p) => p.gun === selectedGun) || PACKAGES[1];

  // Fotoğraf Yükleme (Sharp & GridFS Entegrasyonu)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        setGorselUrl(data.urls[0]);
      } else {
        alert(data.error || 'Fotoğraf yüklenemedi');
      }
    } catch (err: any) {
      alert('Yükleme hatası: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim() || !gorselUrl || !hedefUrl.trim() || !musteriIletisim.trim()) {
      alert('Lütfen tüm zorunlu alanları ve banner görselini doldurunuz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          konum,
          baslik: baslik.trim(),
          gorselUrl,
          hedefUrl: hedefUrl.trim(),
          sureGun: selectedGun,
          musteriIletisim: musteriIletisim.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedBannerId(data.bannerId);
        setStep('payment');
      } else {
        alert(data.error || 'Başvuru alınamadı.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const usdtAmount = Math.round(selectedPackage.fiyat / 38);
  const cryptoAddress = 'TYDzsTqW4m8m5jP24944yCq2HwQJzV9999';

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-xl mx-auto w-full text-left pb-24">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anasayfa</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-heading font-black">
          <Crown className="w-3.5 h-3.5" />
          <span>Sponsor Banner Vitrini</span>
        </div>
      </div>

      {/* ADIM 1: FORM */}
      {step === 'form' && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-col gap-1.5 text-left">
            <h1 className="font-heading font-black text-2xl text-white">
              Sponsorlu Banner Reklamı Ver
            </h1>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Günlük 50.000+ tekil ziyaretçinin gördüğü anasayfa ve ilan detay banner alanlarında yerinizi alın.
            </p>
          </div>

          {/* 1. Paket Seçimi */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-heading font-black text-[#8b949e] uppercase tracking-wider">
              1. Yayın Süresi &amp; Paket Seçin
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedGun === pkg.gun;
                return (
                  <div
                    key={pkg.gun}
                    onClick={() => setSelectedGun(pkg.gun)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10'
                        : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-sm text-white">{pkg.title}</span>
                        {pkg.populer && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black font-heading">
                            EN POPÜLER
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8b949e]">{pkg.desc}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-heading font-black text-base text-amber-400">
                        {pkg.fiyat.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-[10px] text-[#8b949e] font-mono">~{Math.round(pkg.fiyat / 38)} USDT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Konum Seçimi */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-heading font-black text-[#8b949e] uppercase tracking-wider">
              2. Reklam Gösterim Alanı
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'her_ikisi', label: 'Tüm Sayfalar (Full)' },
                { id: 'anasayfa', label: 'Sadece Anasayfa' },
                { id: 'ilan_detay', label: 'Sadece İlan Detay' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKonum(opt.id as any)}
                  className={`p-3 rounded-xl border text-xs font-heading font-bold transition-all text-center ${
                    konum === opt.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Banner Bilgileri */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#161b22] border border-[#30363d]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">Reklam Başlığı / Slogan</label>
              <input
                type="text"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: VIP Kadıköy Rezidans Eşlik & WhatsApp"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#8b949e] focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">
                Hedef Link (Tıklayan Kişi Nereye Gidecek?)
              </label>
              <input
                type="text"
                value={hedefUrl}
                onChange={(e) => setHedefUrl(e.target.value)}
                placeholder="Örn: https://wa.me/90532xxxxxxx veya web siteniz"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#8b949e] focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-heading font-black text-white">
                İletişim Numaranız (WhatsApp / Telegram)
              </label>
              <input
                type="text"
                value={musteriIletisim}
                onChange={(e) => setMusteriIletisim(e.target.value)}
                placeholder="Örn: +90 532 000 00 00 veya @kullaniciadi"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#8b949e] focus:border-amber-500 outline-none"
              />
            </div>

            {/* Banner Görseli Yükle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-heading font-black text-white">
                Banner Görseli (1200x400 Yatay Önerilir)
              </label>
              {gorselUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-amber-500/50 group">
                  <Image src={gorselUrl} alt="Yüklenen Banner" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setGorselUrl('')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] font-bold shadow-lg"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <label className="w-full h-28 rounded-xl border-2 border-dashed border-[#30363d] hover:border-amber-500/50 bg-[#0d1117] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-amber-400" />
                      <span className="text-xs text-[#8b949e] font-medium">Görsel Seçmek İçin Dokunun</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Ödeme Adımına Geç ({selectedPackage.fiyat.toLocaleString('tr-TR')} ₺)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ADIM 2: ÖDEME EKRANI */}
      {step === 'payment' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#161b22] border border-amber-500/40 shadow-2xl flex flex-col gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Wallet className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="font-heading font-black text-xl text-white">Ödeme Bekleniyor</h2>
              <p className="text-xs text-[#8b949e]">
                Banner başvurunuz oluşturuldu ve Telegram üzerinden yöneticiye iletildi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b949e]">Paket:</span>
                <span className="font-bold text-white">{selectedPackage.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b949e]">Tutar:</span>
                <span className="font-black text-amber-400 text-base">{selectedPackage.fiyat.toLocaleString('tr-TR')} ₺ ({usdtAmount} USDT TRC-20)</span>
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-[#30363d]">
                <span className="text-[10px] text-[#8b949e]">USDT (TRC-20) Cüzdan Adresi:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="font-mono text-[11px] text-amber-300 truncate max-w-[280px]">
                    {cryptoAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cryptoAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/chat"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ödeme Dekontunu Canlı Chat'ten İlet</span>
              </Link>
              <button
                type="button"
                onClick={() => setStep('success')}
                className="w-full py-3 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white text-xs font-bold transition-colors"
              >
                Ödemeyi Yaptım, Onay Bekliyorum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: BAŞARI EKRANI */}
      {step === 'success' && (
        <div className="p-8 rounded-3xl bg-[#161b22] border border-emerald-500/40 shadow-2xl flex flex-col items-center text-center gap-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading font-black text-2xl text-white">Talebiniz Alındı!</h2>
            <p className="text-xs text-[#8b949e] max-w-sm leading-relaxed">
              Yönetici ekibimiz ödemenizi ve görselinizi onayladıktan sonra reklamınız anında yayına girecektir.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs shadow-lg hover:bg-amber-400 transition-colors"
          >
            Anasayfaya Dön
          </Link>
        </div>
      )}
    </div>
  );
}
