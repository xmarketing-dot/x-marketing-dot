'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Upload,
  ArrowRight,
  Loader2,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Sparkles,
  Link2,
  LayoutTemplate,
  Check,
  MessageCircle,
  Phone,
  Copy,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import ImageCropModal from '@/components/common/ImageCropModal';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { getAdminWhatsAppUrl } from '@/lib/siteConfig';

// ── DESIGN SPEC TOKENS ──
// bg-primary: #0B0E14
// bg-surface: #141824
// bg-elevated: #1C2233
// accent-primary: #FF6A3D
// accent-secondary: #00E0A4
// text-primary: #F5F6FA
// text-secondary: #9AA3B2
// border-subtle: #252B3B

export default function UcretsizReklamPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    baslik: '',
    hedefUrl: '',
    musteriIletisim: '',
    konum: 'her_ikisi' as 'anasayfa' | 'ilan_detay' | 'her_ikisi',
  });

  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [bannerFitMode, setBannerFitMode] = useState<'cover' | 'contain'>('contain');
  const [bannerScale, setBannerScale] = useState<number>(1);

  // VIP Slogan Slide State
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Kırpma Modalı
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Haptic feedback simülasyonu
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(10);
      } catch (e) {}
    }
  };

  // 👑 TÜRKİYE'NİN #1 REKLAM & BANNER ALANI - REKOR İSTATİSTİK SLIDERI
  const promoCards = [
    {
      id: 'visitors',
      icon: Crown,
      badgeTop: "👑 TÜRKİYE'NİN #1 REKLAM & BANNER ALANI",
      title: '180.000+ TEKİL ZİYARETÇİ',
      subtitle: 'SON 1 HAFTALIK REKOR MÜŞTERİ',
      desc: 'Her gün on binlerce ziyaretçi 21:9 tepe banner alanını doğrudan görür ve anında tıklar.',
      statBig: '184.650+',
      statLabel: 'Haftalık Tekil Ziyaretçi',
      highlight: '+18.4% Haftalık Artış 📈',
    },
    {
      id: 'views',
      icon: Flame,
      badgeTop: '🔥 REKLAMLAR ÇOK YOĞUN TALEP GÖRÜYOR',
      title: '648.000+ GÖRÜNTÜLENME',
      subtitle: 'TÜM SAYFALARDA SABİT VİTRİN',
      desc: 'Tepe banner reklamları sitenin tüm sayfalarında ve ilan detaylarında en üst konumda sabit kalır.',
      statBig: '648.200+',
      statLabel: 'Haftalık Banner Gösterimi',
      highlight: '21:9 Ultra Geniş Alan ⚡',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      badgeTop: '💬 DOĞRUDAN CANLI MÜŞTERİ AKIŞI',
      title: '27.000+ WHATSAPP & LİNK',
      subtitle: 'MÜŞTERİLER DİREKT SİZE GELİR',
      desc: 'Ziyaretçiler banner\'a bastığı an sizin WhatsApp hattınıza veya internet sitenize yönlendirilir.',
      statBig: '27.450+',
      statLabel: 'Haftalık Randevu & Lead Tıklaması',
      highlight: '%94.8 Müşteri Dönüşüm Skoru 🎯',
    },
    {
      id: 'free_banner',
      icon: Gift,
      badgeTop: '🎁 24 SAAT %100 ÜCRETSİZ BANNER HEDİYESİ',
      title: '0 ₺ / 24 SAAT HEDİYE',
      subtitle: '21:9 ULTRA BANNER ALANI',
      desc: 'Normalde 10.000 ₺ olan haftalık tepe banner alanı, işletmenize özel 24 saat tamamen bedava.',
      statBig: '0 ₺ / 24S',
      statLabel: '24 Saat %100 Ücretsiz',
      highlight: '%100 Ücretsiz 21:9 Banner 💎',
    },
  ];

  // Otomatik Slide Döngüsü (4.5 sn)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % promoCards.length;
        if (sliderRef.current) {
          const cardWidth = sliderRef.current.clientWidth;
          sliderRef.current.scrollTo({
            left: next * cardWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [promoCards.length]);

  const scrollToSlide = (index: number) => {
    setActiveSlide(index);
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const cardWidth = sliderRef.current.clientWidth;
      const index = Math.round(scrollLeft / cardWidth);
      if (index !== activeSlide && index >= 0 && index < promoCards.length) {
        setActiveSlide(index);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = (file.type || '').toLowerCase();
    const isImage = mime.startsWith('image/');
    if (!isImage) {
      alert('Lütfen geçerli bir görsel dosyası seçin (GIF, PNG, JPG, WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel veya GIF boyutu en fazla 5 MB olabilir.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const isGif = mime === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    if (isGif) {
      setIsUploading(true);
      triggerHaptic();
      try {
        const uploadData = new FormData();
        uploadData.append('files', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const json = await res.json();
        if (json.success && json.urls && json.urls.length > 0) {
          setUploadedUrl(json.urls[0]);
        } else if (json.url) {
          setUploadedUrl(json.url);
        } else {
          alert(json.error || 'GIF yüklenemedi.');
        }
      } catch (err) {
        alert('GIF sunucuya yüklenirken bir hata oluştu.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setIsUploading(true);
    triggerHaptic();

    try {
      const croppedFile = new File([croppedBlob], 'banner-21-9.webp', { type: 'image/webp' });
      const uploadData = new FormData();
      uploadData.append('files', croppedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.urls && json.urls.length > 0) {
        setUploadedUrl(json.urls[0]);
      } else if (json.url) {
        setUploadedUrl(json.url);
      } else {
        alert(json.error || 'Kırpılan görsel yüklenemedi.');
      }
    } catch (err) {
      alert('Görsel yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (!formData.baslik.trim()) {
      alert('Lütfen banner başlığı giriniz.');
      return;
    }
    if (!uploadedUrl) {
      alert('Lütfen 21:9 formatında bir banner görseli veya GIF yükleyiniz.');
      return;
    }
    if (!formData.hedefUrl.trim()) {
      alert('Lütfen tıklayan müşterinin gideceği yönlendirme linkini giriniz.');
      return;
    }
    const cleanDigits = formData.musteriIletisim.replace(/\D/g, '');
    if (!formData.musteriIletisim.trim() || cleanDigits.length < 6) {
      alert('Lütfen geçerli bir WhatsApp iletişim numarası giriniz (Uluslararası tüm ülke numaraları geçerlidir).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baslik: formData.baslik.trim(),
          gorselUrl: uploadedUrl,
          hedefUrl: formData.hedefUrl.trim(),
          sureGun: 1,
          musteriIletisim: formData.musteriIletisim.trim(),
          konum: formData.konum,
          isPromo: true,
          promoType: '1gunluk_ucretsiz',
          fitMode: bannerFitMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const resolvedPass = data.panelSifresi || '123456';
        const cleanDigits = formData.musteriIletisim.replace(/\D/g, '');

        // Otomatik session kaydı: Müşteri panelim açıldığında doğrudan oturum açılabilmesi için
        try {
          localStorage.setItem('panel_user_session', JSON.stringify({
            identifier: cleanDigits || formData.musteriIletisim,
            password: resolvedPass,
            panelSifresi: resolvedPass,
            kullaniciAdi: formData.baslik || 'Banner Müşterisi',
            telefon: formData.musteriIletisim,
            ad: formData.baslik || 'Banner Müşterisi',
            type: 'banner'
          }));
          localStorage.setItem('my_listing_panel_password', resolvedPass);
        } catch (_) {}

        setSuccessData({
          ...data,
          phone: formData.musteriIletisim,
          password: resolvedPass,
        });
      } else {
        alert(data.error || 'Banner reklam başvurusu oluşturulamadı.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string, type: 'user' | 'pass' | 'all') => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      if (type === 'user') {
        setCopiedUser(true);
        setTimeout(() => setCopiedUser(false), 2000);
      } else if (type === 'pass') {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (e) {
      alert('Kopyalama başarısız, lütfen metni seçerek kopyalayınız.');
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // BAŞARI OVERLAY'İ
  // ═════════════════════════════════════════════════════════════════════
  if (successData) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-[#F5F6FA] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#141824] border border-[#252B3B] rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF6A3D] via-yellow-400 to-[#00E0A4]" />

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00E0A4] to-emerald-600 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#00E0A4]/15 border border-[#00E0A4]/30 text-[#00E0A4] text-xs font-mono font-bold tracking-wider uppercase">
              👑 24 SAAT %100 ÜCRETSİZ BANNER AKTİF
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.2px] text-[#F5F6FA]">
              Banner Yayına Hazır!
            </h1>
            <p className="text-sm text-[#9AA3B2] leading-relaxed">
              21:9 Ultra Geniş Reklamınız <strong>24 saat boyunca</strong> en üst tepe vitrinde 0 ₺ (Ücretsiz) olarak gösterilecektir.
            </p>
          </div>

          {/* Credentials Card (Kullanıcı Adı & Şifre & Tek Tıkla Kopyalama) */}
          <div className="w-full bg-[#0B0E14] rounded-2xl border-2 border-emerald-500/40 p-4 sm:p-5 flex flex-col gap-3 text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-[#252B3B] pb-2.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <KeyRound className="w-4 h-4" />
                <span>Müşteri Paneli Giriş Bilgileriniz</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Kaydediniz
              </span>
            </div>

            {/* Kampanya Adı */}
            <div className="flex items-center justify-between border-b border-[#252B3B]/60 pb-2">
              <span className="text-xs text-[#9AA3B2]">Kampanya Adı</span>
              <span className="text-sm font-bold text-[#F5F6FA] truncate max-w-[200px]">{formData.baslik}</span>
            </div>

            {/* Kullanıcı Adı / Telefon */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#9AA3B2] uppercase tracking-wider font-bold">Kullanıcı Adı / Telefon</span>
                <span className="text-sm font-mono font-bold text-[#00E0A4] truncate">{successData.phone}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(successData.phone, 'user')}
                className="px-3 py-1.5 rounded-lg bg-[#252B3B] hover:bg-[#32394d] text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                {copiedUser ? <Check className="w-3.5 h-3.5 text-[#00E0A4] stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUser ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>

            {/* Panel Giriş Şifresi */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#9AA3B2] uppercase tracking-wider font-bold">Panel Giriş Şifreniz</span>
                <span className="text-base font-mono font-black text-amber-400">{successData.password || '123456'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(successData.password || '123456', 'pass')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-[#00E0A4] stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>

            {/* Tek Tıkla Tümünü Kopyala */}
            <button
              type="button"
              onClick={() => handleCopy(`Best Eskort Banner Reklam Panel Giriş Bilgilerim:\nKullanıcı Adı: ${successData.phone}\nŞifre: ${successData.password || '123456'}\nPanel Linki: https://www.besteskort.online/panelim`, 'all')}
              className="w-full py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/20 active:scale-98 transition-all cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{copiedAll ? 'Tüm Bilgiler Kopyalandı!' : 'Tek Tıkla Giriş Bilgilerini Kopyala'}</span>
            </button>

            <p className="text-[11px] text-[#9AA3B2] leading-relaxed">
              💡 Panelinizden banner gösterim ve tıklama sayılarınızı canlı olarak izleyebilir, hedef linkinizi güncelleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <a
              href="/panelim"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-2xl bg-[#FF6A3D] hover:bg-[#ff7d54] text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#FF6A3D]/25 active:scale-[0.97] transition-all cursor-pointer"
            >
              <span>Müşteri Panelime Git (Ayrı Sekme)</span>
              <ExternalLink className="w-4.5 h-4.5 stroke-[2.5]" />
            </a>

            <a
              href={getAdminWhatsAppUrl(`Merhaba, 24 saatlik ücretsiz 21:9 banner başvurusu yaptım (${formData.baslik}). Şifrem: ${successData.password}. Reklamımı onaylar mısınız?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-2xl bg-[#1C2233] hover:bg-[#252B3B] text-[#F5F6FA] font-bold text-xs border border-[#252B3B] flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            >
              <OfficialWhatsAppIcon className="w-4 h-4 fill-[#00E0A4]" />
              <span>WhatsApp ile Hızlı Onay Al</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F5F6FA] flex flex-col selection:bg-[#FF6A3D]/30">
      
      {/* ── 1. STICKY HEADER (GERİ VE GİRİŞ BUTONLARI YOK, NET BAŞLIK) ── */}
      <header className="sticky top-0 z-40 bg-[#0B0E14]/95 backdrop-blur-xl border-b border-[#252B3B] px-4 py-2">
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto text-center">
          <h1 className="text-[16px] sm:text-[17px] font-bold tracking-tight text-[#F5F6FA]">
            Ücretsiz Banner Reklam Ver
          </h1>
          <span className="text-[11px] font-medium text-[#9AA3B2]">
            21:9 Tepe Vitrin 0 ₺ Hediye
          </span>
        </div>
      </header>

      {/* ── 2. ANA İÇERİK (GEREKSİZ BOŞLUK YOK, AKICI VE NET) ── */}
      <main className="max-w-lg mx-auto w-full px-3.5 sm:px-4 py-3 flex flex-col gap-3">

        {/* ════════════════════════════════════════════════════════════════
            A. KRALİYET VIP SLIDE KARTLARI (GEREKSİZ RENK YOK, KOYU LUXURY)
        ════════════════════════════════════════════════════════════════ */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-2.5 pb-0.5"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {promoCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.id}
                  className="w-full min-w-full snap-center rounded-2xl p-3.5 sm:p-4 bg-[#141824] border border-[#252B3B] shadow-md select-none flex flex-col items-center justify-between text-center gap-2"
                >
                  {/* 1. Üst Rozet */}
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1C2233] border border-[#252B3B] text-[#9AA3B2] text-[10px] font-mono font-medium tracking-wider uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#9AA3B2]" />
                      {card.badgeTop}
                    </span>
                  </div>

                  {/* 2. Glowing İkon & Başlıklar */}
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-[#F5F6FA] flex items-center justify-center shadow-sm mb-0.5">
                      <CardIcon className="w-4.5 h-4.5 stroke-[2]" />
                    </div>

                    <h2 className="text-lg font-bold tracking-tight text-[#F5F6FA] leading-tight">
                      {card.title}
                    </h2>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#9AA3B2]">
                      {card.subtitle}
                    </span>
                    <p className="text-[11px] text-[#9AA3B2]/80 font-normal max-w-xs leading-normal mt-0.5">
                      {card.desc}
                    </p>
                  </div>

                  {/* 3. İstatistik & Highlight Rozetleri */}
                  <div className="flex items-center justify-center gap-2 w-full pt-0.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0B0E14] text-[#F5F6FA] border border-[#252B3B]">
                      {card.statBig}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1C2233] text-[#9AA3B2] border border-[#252B3B]">
                      {card.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {promoCards.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-5 bg-[#FF6A3D]' : 'w-1.5 bg-[#252B3B]'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* FORM BAŞLANGICI */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* ════════════════════════════════════════════════════════════════
              B. CANLI REKLAM ALANI ÖNİZLEMESİ (SİTEDE BÖYLE GÖRÜNECEK)
          ════════════════════════════════════════════════════════════════ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-[#252B3B] flex flex-col gap-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F6FA] flex items-center gap-1.5 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-[#FF6A3D]" />
                <span>Canlı Banner Önizleme (Sitede Böyle Görünecek)</span>
              </span>
              <span className="text-[10px] text-[#00E0A4] font-mono font-bold bg-[#00E0A4]/10 px-2 py-0.5 rounded-full border border-[#00E0A4]/20">
                ● 1. Sıra Sabit Vitrin
              </span>
            </div>

            <div className="relative w-full aspect-[21/9] sm:h-36 rounded-xl overflow-hidden bg-[#0B0E14] border border-[#252B3B] flex items-center justify-center">
              {uploadedUrl ? (
                <>
                  <img
                    src={uploadedUrl}
                    alt="Banner Önizleme"
                    style={{
                      objectFit: bannerFitMode,
                      transform: `scale(${bannerScale})`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className={`w-full h-full ${bannerFitMode === 'contain' ? 'bg-[#0B0E14]' : ''}`}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-[#00E0A4] border border-white/10">
                    21:9 Aktif Önizleme
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-3">
                  <Flame className="w-6 h-6 text-[#FF6A3D] animate-bounce" />
                  <span className="font-bold text-xs sm:text-sm text-[#F5F6FA]">
                    {formData.baslik ? formData.baslik : 'BURAYA SİZİN FOTOĞRAFINIZ / GIF REKLAMINIZ GELECEK'}
                  </span>
                  <span className="text-[10px] text-[#9AA3B2] font-mono">
                    Aşağıdan görsel seçtiğinizde anında burada canlanır
                  </span>
                </div>
              )}
            </div>

            {/* Görsel Boyutlandırma / Daraltma / Sığdırma Kontrolleri */}
            {uploadedUrl && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#9AA3B2]">Görsel / GIF Boyutu:</span>
                  <button
                    type="button"
                    onClick={() => { setBannerFitMode('contain'); setBannerScale(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bannerFitMode === 'contain'
                        ? 'bg-[#00E0A4] text-slate-950 shadow-sm'
                        : 'bg-[#141824] text-[#8b949e] hover:text-white border border-[#252B3B]'
                    }`}
                  >
                    Tam Sığdır (Boyunu Daralt)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBannerFitMode('cover'); setBannerScale(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bannerFitMode === 'cover'
                        ? 'bg-[#FF6A3D] text-white shadow-sm'
                        : 'bg-[#141824] text-[#8b949e] hover:text-white border border-[#252B3B]'
                    }`}
                  >
                    Alanı Doldur (Cover)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8b949e] font-mono">Ölçek:</span>
                  <input
                    type="range"
                    min="0.4"
                    max="1.5"
                    step="0.05"
                    value={bannerScale}
                    onChange={(e) => setBannerScale(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-[#1C2233] rounded-lg appearance-none cursor-pointer accent-[#00E0A4]"
                  />
                  <span className="text-[10px] font-mono font-bold text-[#00E0A4] w-8 text-right">
                    %{Math.round(bannerScale * 100)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              1. REKLAM SÜRESİ (24 SAAT 0 ₺ HEDİYE)
          ════════════════════════════════════════════════════════════════ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-[#252B3B] flex flex-col gap-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#F5F6FA] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FF6A3D] text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Reklam Süresi (Hediye Vitrin)</span>
              </span>
              <span className="text-[11px] text-[#00E0A4] font-medium font-mono">Anasayfa + Tüm Şehirler</span>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-[#FF6A3D] bg-[#1C2233] flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#00E0A4]/15 text-[#00E0A4] text-[9px] font-mono font-bold uppercase">
                    %100 Ücretsiz Hediye
                  </span>
                  <span className="text-[10px] font-mono text-[#9AA3B2]">24 Saat Boyunca</span>
                </div>
                <span className="font-bold text-sm text-[#F5F6FA]">
                  24 Saat (1 Günlük Tepe Vitrin)
                </span>
                <span className="text-[11px] text-[#9AA3B2]">
                  Sitenin en üst tepe banner alanında kesintisiz gösterim
                </span>
              </div>

              <div className="flex flex-col items-end gap-0.5 shrink-0 pl-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] text-rose-400 line-through font-mono">1.500 ₺</span>
                  <span className="font-bold text-lg text-[#00E0A4] font-mono">0 ₺</span>
                </div>
                <span className="text-[10px] text-[#00E0A4] font-bold bg-[#00E0A4]/10 px-1.5 py-0.5 rounded border border-[#00E0A4]/20 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Seçili
                </span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              2. BANNER GÖRSELİNİZİ EKLEYİN (CANLI KIRPMA & GIF DESTEKLİ)
          ════════════════════════════════════════════════════════════════ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-[#252B3B] flex flex-col gap-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#F5F6FA] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FF6A3D] text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Banner Görselinizi Ekleyin</span>
              </span>
              <span className="text-[10px] text-[#00E0A4] font-bold bg-[#00E0A4]/10 px-2 py-0.5 rounded-full border border-[#00E0A4]/20">
                Canlı Kırpma &amp; GIF Destekli ✂️
              </span>
            </div>

            {uploadedUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-[#252B3B]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#00E0A4]/15 text-[#00E0A4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#F5F6FA] truncate">
                      Banner Görseli Yüklendi
                    </span>
                    <span className="text-[10px] text-[#9AA3B2] truncate">
                      Canlı görünümü yukarıdaki önizleme kutusunda aktif
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6A3D] hover:bg-[#ff7d54] text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Değiştir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                    title="Görseli Kaldır"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[120px] rounded-xl border-2 border-dashed border-[#252B3B] hover:border-[#FF6A3D]/70 bg-[#0B0E14] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all p-4 text-center group hover:bg-[#141824]"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-7 h-7 text-[#FF6A3D] animate-spin" />
                    <span className="text-xs text-[#9AA3B2]">Görseliniz işleniyor, lütfen bekleyin...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-[#FF6A3D]/15 text-[#FF6A3D] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs sm:text-sm text-[#F5F6FA] font-bold group-hover:text-[#FF6A3D] transition-colors">
                        Fotoğraf veya Hareketli GIF Seçin
                      </span>
                      <span className="text-[10px] text-[#9AA3B2]">
                        Dikey selfie ve fotoğraflar için <strong className="text-[#FF6A3D]">otomatik 21:9 yatay kırpma aracı</strong> açılır.
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ════════════════════════════════════════════════════════════════
              3. REKLAM & İLETİŞİM DETAYLARI
          ════════════════════════════════════════════════════════════════ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141824] border border-[#252B3B] flex flex-col gap-2.5 shadow-md">
            <span className="text-xs sm:text-sm font-bold text-[#F5F6FA] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6A3D] text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Reklam &amp; İletişim Detayları</span>
            </span>

            <div className="grid grid-cols-1 gap-2.5 pt-0.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#9AA3B2] font-semibold flex items-center justify-between">
                  <span>Banner Üst Başlığı (Slogan / Başlık)</span>
                  <span className="text-[10px] text-[#FF6A3D]">Zorunlu</span>
                </label>
                <input
                  type="text"
                  value={formData.baslik}
                  onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                  placeholder="Örn: VIP Rezidans Eşlik & WhatsApp Randevu"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-[#F5F6FA] text-xs placeholder:text-[#9AA3B2]/50 focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D] outline-none font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#9AA3B2] font-semibold flex items-center justify-between">
                  <span>Tıklayan Müşterinin Gideceği Link</span>
                  <span className="text-[10px] text-[#FF6A3D]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA3B2]">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.hedefUrl}
                    onChange={(e) => setFormData({ ...formData, hedefUrl: e.target.value })}
                    placeholder="Örn: https://wa.me/90532xxxxxxx veya profil linkiniz"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-[#F5F6FA] text-xs placeholder:text-[#9AA3B2]/50 focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D] outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#9AA3B2] font-semibold flex items-center justify-between">
                  <span>İletişim / WhatsApp Numaranız</span>
                  <span className="text-[10px] text-[#00E0A4] font-normal font-mono">Tüm Ülkeler / Uluslararası Destekli</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA3B2]">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.musteriIletisim}
                    onChange={(e) => setFormData({ ...formData, musteriIletisim: e.target.value })}
                    placeholder="Örn: 0532 000 00 00 veya +44... (+1, +49, +971 vb.)"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-[#F5F6FA] text-xs placeholder:text-[#9AA3B2]/50 focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D] outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#9AA3B2] font-semibold flex items-center justify-between">
                  <span>Gösterim Konumu</span>
                  <span className="text-[10px] text-[#00E0A4]">En Yüksek Verim</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA3B2]">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={formData.konum}
                    onChange={(e) => setFormData({ ...formData, konum: e.target.value as any })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-[#F5F6FA] text-xs focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D] outline-none font-medium transition-all appearance-none cursor-pointer"
                  >
                    <option value="her_ikisi">Her İkisi (Anasayfa + İlan Detayları) — En Yüksek Verim</option>
                    <option value="anasayfa">Sadece Anasayfa Tepe Banner</option>
                    <option value="ilan_detay">Sadece İlan Detayları Tepe Banner</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              4. DÜZELTİLMİŞ ŞIK, NET VE GÜÇLÜ CTA BUTONU & GÜVENCE
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-2 pt-1 pb-4">
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="w-full h-12.5 sm:h-13 rounded-xl bg-[#FF6A3D] hover:bg-[#ff7d54] text-white font-bold text-[15px] shadow-lg shadow-[#FF6A3D]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Banner Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4.5 h-4.5 fill-white" />
                  <span>Bannerı Ücretsiz Yayınla</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/25 text-xs font-mono font-bold">
                    0 ₺
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AA3B2] text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E0A4] shrink-0" />
              <span>24 saat sonunda otomatik pasife alınır • Hızlı Onay</span>
            </div>
          </div>

        </form>

      </main>

      {/* 21:9 Kırpma Modalı */}
      {cropModalOpen && (
        <ImageCropModal
          imageSrc={rawImageSrc}
          aspectRatio={21 / 9}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropModalOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
      )}
    </div>
  );
}
