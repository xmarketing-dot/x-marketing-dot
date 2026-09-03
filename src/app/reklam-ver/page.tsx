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
    title: '7 Günlük Banner',
    fiyat: 5000,
    desc: 'Anasayfa ve ilan detaylarında 7 gün kesintisiz yayın',
    badge: null,
  },
  {
    gun: 15,
    title: '15 Günlük Banner',
    fiyat: 9000,
    desc: 'En popüler tercih! 15 gün boyunca zirvede görünün',
    badge: 'EN POPÜLER 🔥',
  },
  {
    gun: 30,
    title: '30 Günlük Banner',
    fiyat: 15000,
    desc: 'Tam 1 ay kesintisiz VIP vitrin hakimiyeti (%40 İndirimli)',
    badge: 'EN AVANTAJLI 👑',
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
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full text-left pb-16">
      
      {/* Üst Bar */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anasayfa</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-heading font-black">
          <Crown className="w-3.5 h-3.5" />
          <span>Sponsorlu VIP Banner</span>
        </div>
      </div>

      {/* ADIM 1: SADELEŞTİRİLMİŞ TEK SAYFA FORM */}
      {step === 'form' && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-1.5 text-left">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Sponsorlu Banner Reklamı Ver
            </h1>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Günde 50.000+ tekil müşterinin ekranında en üst sırada görünün. Formu doldurun, anında yayına hazırlayalım.
            </p>
          </div>

          {/* 1. SÜRE SEÇİMİ (3 NET BUTON) */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-heading font-black text-amber-400 uppercase tracking-wider">
              1. Reklam Süresini Seçin
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedGun === pkg.gun;
                return (
                  <button
                    key={pkg.gun}
                    type="button"
                    onClick={() => setSelectedGun(pkg.gun)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] font-heading shadow-md">
                        {pkg.badge}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="font-heading font-black text-sm text-white">{pkg.title}</span>
                      <span className="text-[10px] text-[#8b949e] mt-0.5">{pkg.desc}</span>
                    </div>
                    <span className="font-heading font-black text-base text-amber-400 mt-2">
                      {pkg.fiyat.toLocaleString('tr-TR')} ₺
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. GÖRSEL YÜKLEME & DİKEY FOTOĞRAF KIRPMA ALANI */}
          <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black text-white flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>2. Banner Görseli (Dikey veya Yatay Fotoğraf / GIF)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Canlı Kırpma Destekli ✂️
              </span>
            </div>

            {gorselUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg group">
                <Image src={gorselUrl} alt="Banner Önizleme" fill unoptimized className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGorselUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg"
                  >
                    Görseli Değiştir
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#30363d] hover:border-amber-500/60 bg-[#0d1117] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-4 text-center group"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs text-[#8b949e]">Görseliniz işleniyor, lütfen bekleyin...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold">
                        Fotoğraf veya GIF Seçmek İçin Tıklayın
                      </span>
                      <span className="text-[11px] text-[#8b949e] mt-0.5">
                        Dikey selfie/fotoğraflar için <strong className="text-amber-400">otomatik kırpma penceresi</strong> açılır.
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

          {/* 3. BİLGİLER: BAŞLIK, HEDEF LİNK VE İLETİŞİM */}
          <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
            <span className="text-xs font-heading font-black text-amber-400 uppercase tracking-wider">
              3. Reklam Bilgileri
            </span>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8b949e] font-bold">Banner Üst Yazısı / Başlık</label>
              <input
                type="text"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                placeholder="Örn: VIP Rezidans Eşlik Hizmeti & Randevu"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-500 outline-none font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8b949e] font-bold">Tıklayan Kişinin Gideceği Link</label>
              <input
                type="text"
                value={hedefUrl}
                onChange={(e) => setHedefUrl(e.target.value)}
                placeholder="Örn: https://wa.me/90532xxxxxxx veya profil linkiniz"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-500 outline-none font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8b949e] font-bold">İletişim Numaranız (WhatsApp)</label>
              <input
                type="text"
                value={musteriIletisim}
                onChange={(e) => setMusteriIletisim(e.target.value)}
                placeholder="Örn: 0532 000 00 00"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#484f58] focus:border-amber-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* GÖNDER BUTONU */}
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Ödeme Adımına Geç ({selectedPackage.fiyat.toLocaleString('tr-TR')} ₺)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ADIM 2: ÖDEME EKRANI (NET VE SADE) */}
      {step === 'payment' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#161b22] border border-amber-500/40 shadow-2xl flex flex-col gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Wallet className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="font-heading font-black text-xl text-white">Ödeme Bilgileri</h2>
              <p className="text-xs text-[#8b949e]">
                Banner başvurunuz sisteme kaydedildi. Ödemenizi tamamlayıp dekontu canlı destekten iletebilirsiniz.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b949e]">Seçilen Paket:</span>
                <span className="font-bold text-white">{selectedPackage.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b949e]">Ödenecek Tutar:</span>
                <span className="font-black text-amber-400 text-base">{selectedPackage.fiyat.toLocaleString('tr-TR')} ₺ ({usdtAmount} USDT)</span>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#30363d]">
                <span className="text-[11px] text-[#8b949e] font-bold">Kripto USDT (TRC-20) Adresi:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161b22] border border-[#30363d]">
                  <span className="font-mono text-xs text-amber-300 truncate max-w-[280px]">
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
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/chat"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Canlı Destekten Dekont / Bilgi İlet</span>
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
            <h2 className="font-heading font-black text-2xl text-white">Başvurunuz Alındı!</h2>
            <p className="text-xs text-[#8b949e] max-w-sm leading-relaxed">
              Yönetici ekibimiz ödemenizi ve görselinizi onayladıktan sonra banner'ınız anında yayına girecektir.
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

      {/* DİKEY FOTOĞRAFI 1200x400 BANNER EN/BOY ORANINA CANLI KIRPMA MODALI */}
      {cropModalOpen && tempCropSrc && (
        <ImageCropModal
          imageSrc={tempCropSrc}
          aspectRatio={3} // 1200x400 (3:1)
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
