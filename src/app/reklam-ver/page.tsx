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
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { getAdminWhatsAppUrl } from '@/lib/siteConfig';

const PRESET_TIERS = [
  {
    gun: 1,
    label: '24 Saat',
    sublabel: 'GÜNLÜK DENEME',
    fiyat: 750,
    eskiFiyat: 1000,
    gunlukMaliyet: '750 ₺ / gün',
    desc: '24 saat boyunca tüm anasayfa ve şehirlerde sabit görünüm.',
    badge: '⚡ 24 SAAT ANINDA YAYIN',
    highlight: false,
  },
  {
    gun: 7,
    label: '7 Gün',
    sublabel: 'HAFTALIK VİP',
    fiyat: 3850,
    eskiFiyat: 5500,
    gunlukMaliyet: '550 ₺ / gün',
    desc: 'Haftalık kesintisiz sabit vitrin hakimiyeti.',
    badge: '🔥 1.650 ₺ İNDİRİMLİ',
    highlight: false,
  },
  {
    gun: 15,
    label: '15 Gün',
    sublabel: 'STANDART VİTRİN',
    fiyat: 7000,
    eskiFiyat: 9000,
    gunlukMaliyet: '466 ₺ / gün',
    desc: '15 gün boyunca zirvede kalıp yoğun randevu toplayın.',
    badge: '⭐ EN POPÜLER',
    highlight: false,
  },
  {
    gun: 30,
    label: '30 Gün (1 Ay)',
    sublabel: 'AYLIK MEGA VİP',
    fiyat: 12000,
    eskiFiyat: 16000,
    gunlukMaliyet: '400 ₺ / gün',
    desc: 'Tam 1 ay kesintisiz VIP vitrin + %40 Maksimum Kâr.',
    badge: '👑 EN ÇOK KAZANDIRAN (%40 KÂR)',
    highlight: true,
  },
];

function calculateBannerPrice(days: number): { fiyat: number; eskiFiyat: number; gunlukMaliyet: string } {
  const d = Math.max(1, Number(days) || 1);
  if (d === 1) return { fiyat: 750, eskiFiyat: 1000, gunlukMaliyet: '750 ₺ / gün' };
  if (d === 7) return { fiyat: 3850, eskiFiyat: 5500, gunlukMaliyet: '550 ₺ / gün' };
  if (d === 15) return { fiyat: 7000, eskiFiyat: 9000, gunlukMaliyet: '466 ₺ / gün' };
  if (d === 30) return { fiyat: 12000, eskiFiyat: 16000, gunlukMaliyet: '400 ₺ / gün' };

  // Özel Gün Hesabı (Gün sayısı arttıkça birim maliyet kademeli düşer)
  let unitPrice = 550;
  if (d >= 30) unitPrice = 400;
  else if (d >= 15) unitPrice = 466;
  else if (d >= 7) unitPrice = 500;
  else unitPrice = 600;

  const rawPrice = Math.round(d * unitPrice);
  const oldPrice = Math.round(rawPrice * 1.35);
  const dailyCost = Math.round(rawPrice / d);
  return {
    fiyat: rawPrice,
    eskiFiyat: oldPrice,
    gunlukMaliyet: `${dailyCost.toLocaleString('tr-TR')} ₺ / gün`,
  };
}

export default function ReklamVerPage() {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [selectedGun, setSelectedGun] = useState<number>(7);
  const [isCustomDays, setIsCustomDays] = useState<boolean>(false);
  const [customDaysInput, setCustomDaysInput] = useState<number>(10);
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

  const activeDays = isCustomDays ? Math.max(1, customDaysInput || 1) : selectedGun;
  const currentPricing = calculateBannerPrice(activeDays);

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
          sureGun: activeDays,
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

  const usdtAmount = Math.round(currentPricing.fiyat / 38);
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

          {/* ── 1. SÜRE SEÇİMİ (4 NET KART + İSTEDİĞİN GÜNÜ SEÇ SLIDER/INPUT) ──────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-md">1</span>
                <span>Reklam Süresini Seçin</span>
              </span>
              <span className="text-xs text-[#8b949e] font-medium hidden sm:inline">Anasayfa + Tüm Şehirler</span>
            </div>

            {/* 4 Ana Paket Seçeneği (24 Saat, 7 Gün, 15 Gün, 30 Gün) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_TIERS.map((pkg) => {
                const isSelected = !isCustomDays && selectedGun === pkg.gun;
                return (
                  <div
                    key={pkg.gun}
                    onClick={() => {
                      setIsCustomDays(false);
                      setSelectedGun(pkg.gun);
                    }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px] select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#2d1e06] via-[#1c1407] to-[#120e06] border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/25 scale-[1.03] z-10'
                        : pkg.highlight
                        ? 'bg-[#161b22] border-amber-500/40 hover:border-amber-400'
                        : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    {/* Üst Rozet */}
                    <div className="min-h-[22px]">
                      {pkg.badge ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full font-black text-[9px] font-heading tracking-wider uppercase shadow-md ${
                          pkg.highlight 
                            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 border border-amber-200' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {pkg.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1 my-auto py-1">
                      <span className="text-[11px] font-mono font-black text-amber-400/90 tracking-wider uppercase">
                        {pkg.sublabel}
                      </span>
                      <span className={`font-heading font-black text-xl sm:text-2xl leading-tight ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {pkg.label}
                      </span>
                      <p className="text-xs text-slate-300 font-medium leading-snug mt-1">
                        {pkg.desc}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 pt-3 border-t border-white/15 mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-rose-400/80 line-through font-mono font-bold">
                          {pkg.eskiFiyat.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="font-heading font-black text-2xl text-amber-400 leading-none drop-shadow-sm">
                          {pkg.fiyat.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
                        {pkg.gunlukMaliyet}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* İsteğe Bağlı: Özel Gün Sayısı Belirleme (Custom Days) */}
            <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 ${
              isCustomDays 
                ? 'bg-gradient-to-b from-[#2d1e06] via-[#161b22] to-[#120e06] border-amber-400 ring-2 ring-amber-400/50 shadow-xl' 
                : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
            }`}>
              <div 
                onClick={() => setIsCustomDays(true)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCustomDays ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-[#484f58]'}`}>
                    {isCustomDays && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-black text-sm text-white">
                      Özel Gün Sayısı Belirleyin (İstediğiniz Süre)
                    </span>
                    <span className="text-xs text-[#8b949e]">
                      Örn: 3 gün, 10 gün, 45 gün, 60 gün vb. istediğiniz gün kadar yayınlayın.
                    </span>
                  </div>
                </div>

                <span className="text-xs font-heading font-black text-amber-400 uppercase bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                  ESNEK SÜRE
                </span>
              </div>

              {isCustomDays && (
                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-white/10 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8b949e] font-bold">Yayın Süresi:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={customDaysInput}
                          onChange={(e) => setCustomDaysInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-20 px-3 py-2 rounded-xl bg-[#0d1117] border border-amber-400 text-white font-heading font-black text-base text-center outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <span className="font-heading font-black text-sm text-white">GÜN</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-rose-400/80 line-through font-mono font-bold">
                        {currentPricing.eskiFiyat.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="font-heading font-black text-2xl text-amber-400">
                        {currentPricing.fiyat.toLocaleString('tr-TR')} ₺
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-black bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {currentPricing.gunlukMaliyet}
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={customDaysInput}
                    onChange={(e) => setCustomDaysInput(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-[#0d1117] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-[#8b949e] font-mono px-1">
                    <span>1 Gün (24 Saat)</span>
                    <span>15 Gün</span>
                    <span>30 Gün (1 Ay)</span>
                    <span>60 Gün (2 Ay)</span>
                  </div>
                </div>
              )}
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
                  <span>Reklamı Başlat &amp; Ödeme Adımına Geç ({activeDays} Gün — {currentPricing.fiyat.toLocaleString('tr-TR')} ₺)</span>
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
                <span className="text-[#8b949e]">Seçilen Süre:</span>
                <span className="font-bold text-white font-heading">{activeDays} Gün ({activeDays === 1 ? '24 Saat Anında Yayın' : `${activeDays} Günlük VIP Banner`})</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-[#8b949e]">Ödenecek Tutar:</span>
                <span className="font-black text-amber-400 text-lg sm:text-xl">
                  {currentPricing.fiyat.toLocaleString('tr-TR')} ₺ ({usdtAmount} USDT)
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
              <a
                href={getAdminWhatsAppUrl(
                  `Merhaba, Best Eskort için ${activeDays} Günlük (${currentPricing.fiyat.toLocaleString('tr-TR')} ₺) VIP Banner reklam başvurusu yaptım. Onay ve dekont iletmek istiyorum.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
              >
                <OfficialWhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                <span>WhatsApp ile Dekont / Hızlı Onay Al</span>
              </a>
              <Link
                href="/chat"
                className="w-full py-3.5 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#30363d] transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Site İçi Canlı Destek</span>
              </Link>
              <button
                type="button"
                onClick={() => setStep('success')}
                className="w-full py-3 rounded-xl bg-transparent hover:bg-[#161b22] text-[#8b949e] hover:text-white text-xs font-bold transition-colors"
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
