'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Crown, 
  Upload, 
  Check, 
  ArrowRight, 
  Loader2, 
  Wallet, 
  MessageSquare,
  ChevronLeft,
  Copy,
  Scissors,
  Flame,
  Sparkles
} from 'lucide-react';
import ImageCropModal from '@/components/common/ImageCropModal';

const PACKAGES = [
  {
    gun: 7,
    title: '7 Günlük Başlangıç',
    fiyat: 3000,
    eskiFiyat: 5000,
    gunluk: '428 ₺/gün',
    desc: 'Hızlı deneme & anlık müşteri trafiği',
    badge: '2.000 ₺ İNDİRİM 🔥',
    isBest: false,
  },
  {
    gun: 15,
    title: '15 Günlük Standart',
    fiyat: 7000,
    eskiFiyat: 9000,
    gunluk: '466 ₺/gün',
    desc: 'Bölgesel hakimiyet & yoğun WhatsApp randevusu',
    badge: 'POPÜLER TERCİH ⚡',
    isBest: false,
  },
  {
    gun: 30,
    title: '30 Günlük (1 Ay) VIP',
    fiyat: 13000,
    eskiFiyat: 15000,
    gunluk: '433 ₺/gün',
    desc: 'Tam 1 ay kesintisiz sabit vitrin + %35 Maksimum Kâr',
    badge: '👑 EN ÇOK KAZANDIRAN (%35 KÂR)',
    isBest: true,
  },
];

export default function ReklamVerPage() {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [selectedGun, setSelectedGun] = useState<number>(15);
  const [baslik, setBaslik] = useState('');
  const [hedefUrl, setHedefUrl] = useState('');
  const [musteriIletisim, setMusteriIletisim] = useState('');
  const [gorselUrl, setGorselUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Kırpma Modal Durumları
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempCropSrc, setTempCropSrc] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPackage = PACKAGES.find((p) => p.gun === selectedGun) || PACKAGES[1];

  // Dosya Seçildiğinde (PC / Mobil)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Hareketli GIF ise -> Animasyon bozulmasın diye kırpma olmadan doğrudan yükle
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    if (isGif) {
      uploadFileDirectly(file);
      e.target.value = '';
      return;
    }

    // 2. Normal Fotoğraf (JPG/PNG/WEBP/Dikey/Yatay) -> Canlı Kırpma Aracını Aç
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setTempCropSrc(result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Doğrudan Dosya Yükleme (GIF veya hazır görseller için)
  const uploadFileDirectly = async (file: File | Blob, customName?: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const uploadFile = file instanceof File ? file : new File([file], customName || 'banner.jpg', { type: 'image/jpeg' });
      formData.append('files', uploadFile);

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

  // Kırpma Tamamlandığında (Crop Modal'dan gelen Blob)
  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setTempCropSrc('');
    await uploadFileDirectly(croppedBlob, `banner_crop_${Date.now()}.jpg`);
  };

  // Form Gönderimi
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim() || !gorselUrl || !hedefUrl.trim() || !musteriIletisim.trim()) {
      alert('Lütfen başlık, hedef link, iletişim numaranızı ve banner görselinizi ekleyiniz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          konum: 'her_ikisi', // Varsayılan olarak tüm sayfalarda (Anasayfa + İlan Detay) en yüksek verim
          baslik: baslik.trim(),
          gorselUrl,
          hedefUrl: hedefUrl.trim(),
          sureGun: selectedGun,
          musteriIletisim: musteriIletisim.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
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
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full text-left pb-20 px-2 sm:px-0 animate-fadeIn">
      
      {/* ── ÜST BAR & GERİ DÖNÜŞ ──────────────── */}
      <div className="flex items-center justify-between border-b border-[#30363d]/80 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8b949e] hover:text-amber-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Vitrine Geri Dön</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-400 border border-amber-500/30 text-xs font-heading font-black tracking-wide">
          <Crown className="w-3.5 h-3.5 fill-amber-400" />
          <span>VIP Sabit Banner Reklamı</span>
        </div>
      </div>

      {/* ADIM 1: YÜKSEK DÖNÜŞÜMLÜ PREMIUM REKLAM FORMU */}
      {step === 'form' && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
          
          {/* ── HERO BAŞLIK & DEĞER ÖNERİSİ ──────────────── */}
          <div className="flex flex-col gap-3 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black w-fit font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GÜNLÜK 50.000+ MÜŞTERİNİN ZİRVESİNDE YERİNİZİ ALIN</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              Anasayfa &amp; Tüm Şehirlerde <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                En Tepede Sabit Banner
              </span> Reklamı
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              Ziyaretçilerin siteye girdiği anda ilk gördüğü en prestijli alanda yerinizi ayırtın. Tüm WhatsApp ve arama trafiğini doğrudan kendi numaranıza çekin.
            </p>
          </div>

          {/* ── CANLI REKLAM ALANI ÖNİZLEMESİ (MÜŞTERİ NE ALDIĞINI GÖRSÜN) ──────────────── */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1407] via-[#161b22] to-[#0d1117] border border-amber-500/30 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Canlı Banner Önizleme (Sitede Böyle Görünecek)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ● 1. Sıra Sabit
              </span>
            </div>

            <div className="relative w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-black/60 border border-amber-500/40 flex items-center justify-center">
              {gorselUrl ? (
                <Image src={gorselUrl} alt="Önizleme" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-4">
                  <Flame className="w-7 h-7 text-amber-400/60 animate-bounce" />
                  <span className="font-heading font-black text-xs sm:text-sm text-white/90">
                    {baslik ? baslik : 'BURAYA SİZİN FOTOĞRAFINIZ / GIF REKLAMINIZ GELECEK'}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    Aşağıdan görsel yüklediğinizde anında burada canlanır
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── 1. SÜRE SEÇİMİ (NET, AYRIK, ÜST ÜSTE BİNMEYEN LÜKS KARTLAR) ──────────────── */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                <span>Reklam Süresini Seçin</span>
              </span>
              <span className="text-[11px] text-[#8b949e]">Tüm sayfalarda kesintisiz yayın</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedGun === pkg.gun;
                return (
                  <div
                    key={pkg.gun}
                    onClick={() => setSelectedGun(pkg.gun)}
                    className={`relative p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[170px] select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#2d1e06] via-[#1c1407] to-[#120e06] border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/25 scale-[1.02] z-10'
                        : pkg.isBest
                        ? 'bg-[#161b22] border-amber-500/40 hover:border-amber-400 hover:bg-[#1a2029]'
                        : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58] hover:bg-[#1a2029]'
                    }`}
                  >
                    {/* Üst Rozet */}
                    {pkg.badge && (
                      <div className="absolute -top-3 right-3 z-20">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] font-heading shadow-lg uppercase tracking-wider ${
                          pkg.isBest 
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 border border-amber-200' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-heading font-black text-sm sm:text-base ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                          {pkg.title}
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-[#484f58]'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8b949e] leading-snug mt-0.5">{pkg.desc}</p>
                    </div>

                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#8b949e] line-through font-mono">
                          {pkg.eskiFiyat.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="font-heading font-black text-xl text-amber-400 leading-none mt-0.5">
                          {pkg.fiyat.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-md border border-emerald-500/30">
                        {pkg.gunluk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2. GÖRSEL YÜKLEME ALANI (DİKEY / YATAY / GIF DESTEKLİ) ──────────────── */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-heading font-black text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                <span>Banner Görselinizi Ekleyin</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Canlı Kırpma &amp; GIF Destekli ✂️
              </span>
            </div>

            {gorselUrl ? (
              <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border-2 border-amber-500/80 shadow-2xl group">
                <Image src={gorselUrl} alt="Banner Önizleme" fill unoptimized className="object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGorselUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs shadow-lg transition-transform active:scale-95"
                  >
                    Görseli Değiştir
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[140px] rounded-xl border-2 border-dashed border-[#30363d] hover:border-amber-500/80 bg-[#0d1117] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-5 text-center group hover:bg-[#12161c]"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs text-[#8b949e]">Görseliniz işleniyor, lütfen bekleyin...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs sm:text-sm text-white font-heading font-bold group-hover:text-amber-400 transition-colors">
                        Fotoğraf veya Hareketli GIF Seçin
                      </span>
                      <span className="text-[11px] text-[#8b949e]">
                        Dikey selfie ve fotoğraflar için <strong className="text-amber-400">otomatik yatay kırpma aracı</strong> açılır.
                      </span>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* ── 3. REKLAM HEDEFİ & İLETİŞİM BİLGİLERİ ──────────────── */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg">
            <span className="text-xs sm:text-sm font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
              <span>Reklam &amp; İletişim Detayları</span>
            </span>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8b949e] font-bold flex items-center justify-between">
                  <span>Banner Üst Başlığı (Örn: Model Adı / Slogan)</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">Opsiyonel</span>
                </label>
                <input
                  type="text"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  placeholder="Örn: VIP Rezidans Eşlik & WhatsApp Randevu"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8b949e] font-bold">
                  Tıklayan Müşterinin Gideceği Link <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={hedefUrl}
                  onChange={(e) => setHedefUrl(e.target.value)}
                  placeholder="Örn: https://wa.me/90532xxxxxxx veya profil linkiniz"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8b949e] font-bold">
                  İletişim / WhatsApp Numaranız <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={musteriIletisim}
                  onChange={(e) => setMusteriIletisim(e.target.value)}
                  placeholder="Örn: 0532 000 00 00"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── GÖNDER BUTONU & GÜVENCE VURGUSU ──────────────── */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-heading font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-amber-500/30 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Reklamı Başlat &amp; Ödeme Adımına Geç ({selectedPackage.fiyat.toLocaleString('tr-TR')} ₺)</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#8b949e] font-medium text-center">
              <span>✓ 7/24 Canlı Destek</span>
              <span>•</span>
              <span>✓ 15 Dakikada Hızlı Onay</span>
              <span>•</span>
              <span>✓ Kripto (USDT) / Havale</span>
            </div>
          </div>
        </form>
      )}

      {/* ADIM 2: ÖDEME EKRANI (NET, LÜKS VE SADE) */}
      {step === 'payment' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161b22] border border-amber-500/40 shadow-2xl flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Wallet className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading font-black text-2xl text-white">Ödeme Bilgileri</h2>
              <p className="text-xs sm:text-sm text-[#8b949e]">
                Banner başvurunuz başarıyla oluşturuldu. Ödemenizi tamamladıktan sonra canlı destekten anında onay alabilirsiniz.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3.5 text-left">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-[#8b949e]">Seçilen Paket:</span>
                <span className="font-bold text-white">{selectedPackage.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-[#8b949e]">Ödenecek Tutar:</span>
                <span className="font-black text-amber-400 text-lg sm:text-xl">
                  {selectedPackage.fiyat.toLocaleString('tr-TR')} ₺ ({usdtAmount} USDT)
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[#30363d]">
                <span className="text-xs text-[#8b949e] font-bold">Kripto USDT (TRC-20) Cüzdan Adresi:</span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="font-mono text-xs sm:text-sm text-amber-300 truncate max-w-[260px] sm:max-w-[400px]">
                    {cryptoAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cryptoAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 ml-2 shadow-md transition-all active:scale-95 flex items-center gap-1 font-heading"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/chat"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Canlı Destekten Dekont / Bilgi İlet</span>
              </Link>
              <button
                type="button"
                onClick={() => setStep('success')}
                className="w-full py-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white text-xs font-bold transition-colors"
              >
                Ödemeyi Yaptım, Onay Bekliyorum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: BAŞARI EKRANI */}
      {step === 'success' && (
        <div className="p-8 sm:p-10 rounded-3xl bg-[#161b22] border border-emerald-500/40 shadow-2xl flex flex-col items-center text-center gap-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">Başvurunuz Alındı!</h2>
            <p className="text-xs sm:text-sm text-[#8b949e] max-w-sm leading-relaxed">
              Yönetici ekibimiz ödemenizi ve görselinizi onayladıktan sonra banner'ınız anında yayına girecektir.
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            Anasayfaya Dön
          </Link>
        </div>
      )}

      {/* FOTOĞRAF KIRPMA MODALI */}
      {cropModalOpen && tempCropSrc && (
        <ImageCropModal
          imageSrc={tempCropSrc}
          aspectRatio={4 / 1} // Sabit banner için 4:1 geniş format
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropModalOpen(false);
            setTempCropSrc('');
          }}
        />
      )}

    </div>
  );
}
