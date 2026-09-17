'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Sparkles,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  Star,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Search,
  Check,
  MapPin,
  BadgeCheck,
  Wifi,
  Battery,
  Phone,
  Clock,
  Sparkle,
  Layers,
  Heart,
  Sliders,
  DollarSign,
  MessageCircle,
  Gift,
  TrendingUp,
  Users,
  Eye,
  Award,
  Medal,
  Info,
  Image as ImageIcon,
  Copy,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';
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

export default function UcretsizIlanPage() {
  const router = useRouter();

  // Form State
  const [kategori, setKategori] = useState<string>('vip');
  const [eskortIsmi, setEskortIsmi] = useState<string>('');
  const [baslik, setBaslik] = useState<string>('');
  const [aciklama, setAciklama] = useState<string>('');
  const [ilSlug, setIlSlug] = useState<string>('istanbul');
  const [ilceSlug, setIlceSlug] = useState<string>('kadikoy');
  const [whatsappNumara, setWhatsappNumara] = useState<string>('');

  // Fotoğraflar
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Var olan 3 adet örnek görsel (Sadece örnek referans olarak durur, forma eklenmez)
  const existingSamplePhotos = [
    'https://media.istockphoto.com/id/497710038/tr/foto%C4%9Fraf/beautiful-brunette-girl-sexy-buttocks.jpg?s=612x612&w=0&k=20&c=eayHQZ0fKbWn8NUtLTg7GKcfegdg1fXFW7nd4CajmSM=',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfsSVLXhC_AWiIPBzcrB11LeByy-xhCrRHE-KDFF_x-kLhTYKy4rJ2zxo_&s=10',
    'https://static.vecteezy.com/system/resources/previews/037/746/231/non_2x/beautiful-young-woman-relaxes-under-a-waterfall-sexy-girl-in-a-bikini-posing-near-a-waterfall-in-the-tropics-photo.jpg',
  ];

  // Gönderim & Başarı State
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // VIP Slogan Slide State
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Haptic feedback simülasyonu
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(10);
      } catch (e) {}
    }
  };

  // 👑 TÜRKİYE'NİN EN GÜÇLÜ ESKORT PLATFORMU - REKOR İSTATİSTİK SLIDERI
  const promoCards = [
    {
      id: 'visitors',
      icon: Crown,
      badgeTop: "👑 TÜRKİYE'NİN EN GÜÇLÜ ESKORT PLATFORMU",
      title: '180.000+ TEKİL ZİYARETÇİ',
      subtitle: 'SON 1 HAFTALIK REKOR MÜŞTERİ',
      desc: 'Her gün on binlerce tekil müşteri en kaliteli ilanları arıyor ve doğrudan WhatsApp üzerinden randevu alıyor.',
      statBig: '184.650+',
      statLabel: 'Haftalık Tekil Ziyaretçi',
      highlight: '+18.4% Rekor Artış 📈',
    },
    {
      id: 'views',
      icon: Flame,
      badgeTop: '🔥 İLANLAR ÇOK YOĞUN TALEP GÖRÜYOR',
      title: '648.000+ GÖRÜNTÜLENME',
      subtitle: '81 İL VE İLÇELERDE SABİT VİTRİN',
      desc: 'İlanlar sitenin en üst sıralarında ve arama sayfalarında yüz binlerce kez görüntüleniyor.',
      statBig: '648.200+',
      statLabel: 'Haftalık Görüntülenme',
      highlight: 'Kesintisiz Canlı Trafik ⚡',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      badgeTop: '💬 DOĞRUDAN CANLI MÜŞTERİ AKIŞI',
      title: '27.000+ WHATSAPP TIKLAMASI',
      subtitle: 'MÜŞTERİLER DİREKT SİZE YAZAR',
      desc: 'İlanların WhatsApp tıklama oranı rekor seviyede! Müşteriler tek tıkla doğrudan sizin WhatsApp hattınıza ulaşır.',
      statBig: '27.450+',
      statLabel: 'Haftalık WhatsApp Tıklaması',
      highlight: '%94.8 Randevu Dönüşümü 🎯',
    },
    {
      id: 'free_vip',
      icon: Gift,
      badgeTop: '🎁 24 SAAT %100 ÜCRETSİZ KRALİYET VIP VİTRİNİ',
      title: '0 ₺ / 24 SAAT HEDİYE',
      subtitle: 'KRALİYET VIP VİTRİNİ BEDAVA',
      desc: 'Haftalık 7.000 ₺ değerindeki Kraliyet VIP vitrini, sistemimizi deneyimlemeniz için 24 saat boyunca tamamen 0 ₺.',
      statBig: '0 ₺ / 24S',
      statLabel: '24 Saat %100 Ücretsiz',
      highlight: '%100 Ücretsiz Hediye 💎',
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

  // Kategoriler
  const kategoriler = [
    {
      id: 'vip',
      name: 'Kraliyet VIP',
      sub: 'En Yüksek Öncelikli Vitrin',
      icon: Crown,
      badge: '50 SINIR',
      color: 'text-amber-400',
    },
    {
      id: 'bagimsiz',
      name: 'Bağımsız & Bireysel',
      sub: 'Kendi Yerinde Hizmet Veren',
      icon: ShieldCheck,
      badge: 'POPÜLER',
      color: 'text-emerald-400',
    },
    {
      id: 'elit',
      name: 'Elit Eşlik & Model',
      sub: 'Özel Davet & Seyahat',
      icon: Star,
      badge: 'ÖZEL',
      color: 'text-cyan-400',
    },
    {
      id: 'masaj',
      name: 'VIP Masaj & Terapi',
      sub: 'Rahatlatıcı & Profesyonel',
      icon: Sparkles,
      badge: 'TREND',
      color: 'text-purple-400',
    },
  ];

  const selectedProvince = turkeyProvinces.find((p) => p.ilSlug === ilSlug) || turkeyProvinces[0];
  const availableDistricts = selectedProvince ? selectedProvince.ilceler : [];

  // Fotoğraf Yükleme
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = photos.length;
    const remainingSlots = 7 - currentCount;

    if (remainingSlots <= 0) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingPhotos(true);
    triggerHaptic();

    const uploadData = new FormData();
    for (let i = 0; i < filesToUpload.length; i++) {
      uploadData.append('files', filesToUpload[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        setPhotos((prev) => [...prev, ...data.urls].slice(0, 7));
      } else {
        alert(data.error || 'Fotoğraf yüklenemedi.');
      }
    } catch (err) {
      alert('Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    triggerHaptic();
    const updated = photos.filter((_, idx) => idx !== index);
    setPhotos(updated);
    if (coverIndex >= updated.length) {
      setCoverIndex(0);
    }
  };

  // İlan Gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (!baslik.trim()) {
      alert('Lütfen bir ilan başlığı yazınız.');
      return;
    }
    if (!aciklama.trim()) {
      alert('Lütfen detaylı açıklama yazınız.');
      return;
    }
    if (photos.length < 3) {
      alert('Lütfen galerinizden en az 3 adet fotoğraf yükleyiniz!');
      return;
    }
    if (photos.length > 7) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz!');
      return;
    }
    const cleanDigits = whatsappNumara.replace(/\D/g, '');
    if (!whatsappNumara.trim() || cleanDigits.length < 6) {
      alert('Lütfen geçerli bir WhatsApp telefon numarası giriniz (Uluslararası tüm ülke numaraları geçerlidir).');
      return;
    }

    setSubmitting(true);
    try {
      const savedThreadId = typeof window !== 'undefined' ? localStorage.getItem('best_eskort_chat_thread_id') : null;
      const visitorId = typeof window !== 'undefined' ? localStorage.getItem('bms_vid') : null;

      const payload = {
        baslik: baslik.trim(),
        aciklama: aciklama.trim(),
        ilSlug,
        ilceSlug,
        whatsappNumara: whatsappNumara.trim(),
        tamAd: eskortIsmi.trim() || baslik.trim().split(' ')[0] || 'VIP Model',
        fiyat: 2500,
        rozet: 'vip',
        yayinSuresi: 'gunluk',
        anaFotografUrl: photos[coverIndex] || photos[0],
        fotograflar: photos.map((url, idx) => ({ url, siraNo: idx })),
        chatThreadId: savedThreadId || null,
        visitorId: visitorId || null,
        isPromo: true,
        promoType: '1gunluk_ucretsiz',
      };

      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const resolvedPass = data.panelSifresi || '849201';
        const cleanPhone = whatsappNumara.replace(/\D/g, '');

        // Otomatik session kaydı: Müşteri panelim açıldığında doğrudan oturum açılabilmesi için
        try {
          localStorage.setItem('panel_user_session', JSON.stringify({
            identifier: cleanPhone || whatsappNumara,
            password: resolvedPass,
            panelSifresi: resolvedPass,
            kullaniciAdi: eskortIsmi || 'İlan Sahibi',
            telefon: whatsappNumara,
            ad: eskortIsmi || 'İlan Sahibi',
            type: 'user'
          }));
          localStorage.setItem('my_listing_panel_password', resolvedPass);
        } catch (_) {}

        setSuccessData({
          ...data,
          phone: whatsappNumara,
          password: resolvedPass,
        });
      } else {
        alert(data.error || 'İlan oluşturulamadı.');
      }
    } catch (err: any) {
      alert('Bir hata oluştu: ' + err.message);
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
              👑 24 SAAT VIP YAYIN HAKKI AKTİF EDİLDİ
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.2px] text-[#F5F6FA]">
              İlanınız Yayına Hazır!
            </h1>
            <p className="text-sm text-[#9AA3B2] leading-relaxed">
              İlanınız 24 saat boyunca en üst VIP vitrinde <strong>0 ₺ (Ücretsiz)</strong> olarak binlerce müşteriye gösterilecektir.
            </p>
          </div>

          {/* Credentials Card (Kullanıcı Adı & Şifre & Tek Tıkla Kopyalama) */}
          <div className="w-full bg-[#0B0E14] rounded-2xl border-2 border-amber-500/40 p-4 sm:p-5 flex flex-col gap-3 text-left shadow-xl">
            <div className="flex items-center justify-between border-b border-[#252B3B] pb-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <KeyRound className="w-4 h-4" />
                <span>Panel Giriş Bilgileriniz</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                Kaydediniz
              </span>
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
                <span className="text-base font-mono font-black text-[#FF6A3D]">{successData.password || '849201'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(successData.password || '849201', 'pass')}
                className="px-3 py-1.5 rounded-lg bg-[#FF6A3D]/20 hover:bg-[#FF6A3D]/30 text-[#FF6A3D] border border-[#FF6A3D]/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                {copiedPass ? <Check className="w-3.5 h-3.5 text-[#00E0A4] stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>

            {/* Tek Tıkla Tümünü Kopyala */}
            <button
              type="button"
              onClick={() => handleCopy(`Best Eskort Panel Giriş Bilgilerim:\nKullanıcı Adı: ${successData.phone}\nŞifre: ${successData.password || '849201'}\nPanel Linki: https://www.besteskort.online/panelim`, 'all')}
              className="w-full py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedAll ? 'Tüm Bilgiler Kopyalandı!' : 'Tek Tıkla Giriş Bilgilerini Kopyala'}</span>
            </button>

            <p className="text-[11px] text-[#9AA3B2] leading-relaxed">
              💡 Panelinizden ilan fotoğraflarınızı, telefon numaranızı ve bilgilerinizi dilediğiniz zaman güncelleyebilir, istatistiklerinizi canlı takip edebilirsiniz.
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
              href={getAdminWhatsAppUrl(`Merhaba, 24 saatlik ücretsiz VIP ilan başvurusu yaptım (${eskortIsmi}). Şifrem: ${successData.password}. İlanımı onaylar mısınız?`)}
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
            Ücretsiz VIP İlan Ver
          </h1>
          <span className="text-[11px] font-medium text-[#9AA3B2]">
            24 Saatlik 0 ₺ Hediye Vitrin
          </span>
        </div>
      </header>

      {/* ── 2. ANA İÇERİK (GEREKSİZ BOŞLUKLAR AZALTILDI, AKICI DÜZEN) ── */}
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
                  {/* 1. Üst Rozet (Sade & Zarif) */}
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1C2233] border border-[#252B3B] text-[#9AA3B2] text-[10px] font-mono font-medium tracking-wider uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#9AA3B2]" />
                      {card.badgeTop}
                    </span>
                  </div>

                  {/* 2. İkon & Başlıklar */}
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

                  {/* 3. İstatistik & Highlight */}
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

          {/* Slider Noktaları */}
          <div className="flex items-center gap-1.5 pt-0.5">
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

        {/* ════════════════════════════════════════════════════════════════
            B. NATIVE FORM (SIKI, DÜZENLİ, PROFESYONEL)
        ════════════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* 1. VİTRİN KATEGORİSİ (3'LÜ ANASAYFA KARTLARI - VIP SEÇİLİ) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-[#9AA3B2] uppercase">
                1. Vitrin Kategorisi
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#00E0A4]/15 border border-[#00E0A4]/30 text-[#00E0A4] text-[10px] font-mono font-bold">
                👑 VIP SEÇİLİ
              </span>
            </div>

            {/* 3'LÜ VİTRİN KARTLARI */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full items-center">
              {/* GOLD */}
              <div className="relative rounded-xl p-1 bg-gradient-to-b from-[#2b210a] via-[#1a1406] to-[#0f0b02] text-amber-200 border border-amber-500/30 opacity-60 select-none">
                <div className="w-full h-full rounded-lg border border-amber-400/30 p-1.5 flex flex-col items-center justify-between text-center min-h-[110px]">
                  <span className="text-[8px] font-black tracking-wider uppercase text-amber-400/80">
                    GOLD
                  </span>
                  <div className="flex flex-col items-center my-auto py-0.5">
                    <Award className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="font-black text-sm text-amber-300 leading-none">GOLD</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-400/80">
                    Standart
                  </span>
                </div>
              </div>

              {/* VIP (SEÇİLİ) */}
              <div className="relative rounded-xl p-1 bg-gradient-to-b from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 shadow-xl shadow-amber-500/30 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0B0E14] transform scale-102 z-10 select-none">
                <div className="w-full h-full rounded-lg border-2 border-slate-950/60 p-1.5 flex flex-col items-center justify-between text-center min-h-[118px]">
                  <span className="text-[8px] font-black tracking-wider uppercase text-slate-950">
                    👑 VIP
                  </span>
                  <div className="flex flex-col items-center my-auto py-0.5">
                    <Crown className="w-4.5 h-4.5 text-slate-950 fill-slate-950/20 mb-0.5" />
                    <span className="font-black text-lg text-slate-950 leading-none">VIP</span>
                  </div>
                  <span className="text-[8px] font-mono font-black px-2 py-0.5 rounded-full bg-slate-950 text-amber-300">
                    0 ₺ SEÇİLİ
                  </span>
                </div>
              </div>

              {/* SILVER */}
              <div className="relative rounded-xl p-1 bg-gradient-to-b from-[#222a36] via-[#161c24] to-[#0d1218] text-slate-100 border border-slate-400/30 opacity-60 select-none">
                <div className="w-full h-full rounded-lg border border-slate-300/30 p-1.5 flex flex-col items-center justify-between text-center min-h-[110px]">
                  <span className="text-[8px] font-black tracking-wider uppercase text-slate-400">
                    SILVER
                  </span>
                  <div className="flex flex-col items-center my-auto py-0.5">
                    <Medal className="w-4 h-4 text-slate-300 mb-0.5" />
                    <span className="font-black text-sm text-slate-100 leading-none">SILVER</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                    Alt Sıra
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. YAYIN SÜRESİ */}
          <div className="flex flex-col gap-1.5 bg-[#141824] p-3.5 sm:p-4 rounded-2xl border border-[#252B3B] shadow-sm">
            <label className="flex flex-col gap-1 text-xs font-bold text-[#F5F6FA]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                İlan Yayın Süresi *
              </span>
              <select
                disabled
                className="px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-emerald-500/40 text-emerald-400 font-bold text-xs focus:outline-none"
              >
                <option value="gunluk">📅 1 Günlük (24 Saat VIP Vitrin - 0 ₺ Hediye)</option>
              </select>
            </label>
          </div>

          {/* 2. İLAN BAŞLIĞI VE DETAYLI AÇIKLAMA */}
          <div className="flex flex-col gap-3 bg-[#141824] p-3.5 sm:p-4 rounded-2xl border border-[#252B3B] shadow-sm">
            <label className="flex flex-col gap-1 text-xs font-bold text-[#F5F6FA]">
              İlan Başlığı *
              <input
                type="text"
                required
                placeholder="Örn: İstanbul Beylikdüzü VIP Hizmet"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold text-[#F5F6FA]">
              Detaylı Açıklama *
              <textarea
                required
                rows={3}
                placeholder="İlanınızın detaylarını buraya yazın..."
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
              />
            </label>
          </div>

          {/* 3. ÇOKLU FOTOĞRAF YÜKLEME ALANI (EN AZ 3, EN FAZLA 7 RESİM) */}
          <div className="flex flex-col gap-3 bg-[#141824] p-3.5 sm:p-4 rounded-2xl border border-[#252B3B] shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Fotoğraf Yükleme (En Az 3, En Fazla 7 Resim) *</span>
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                photos.length >= 3
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {photos.length} / 7 Fotoğraf
              </span>
            </div>

            <p className="text-[11px] text-[#9AA3B2]">
              Galerinizden kendi fotoğraflarınızı seçip yükleyin (En az 3, en fazla 7 adet).
            </p>

            {/* DOSYA SEÇİM BUTONU */}
            {photos.length < 7 ? (
              <label className="relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/15 cursor-pointer transition-all text-center gap-2 group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={uploadingPhotos}
                />

                {uploadingPhotos ? (
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Fotoğraflar Yükleniyor...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                      <Upload className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">
                        📱 Galeriden Kendi Fotoğraflarını Yükle
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium mt-0.5">
                        {photos.length === 0 ? 'En az 3 fotoğraf ekleyin' : `${7 - photos.length} adet daha ekleyebilirsiniz`}
                      </span>
                    </div>
                  </>
                )}
              </label>
            ) : (
              <div className="p-3 rounded-2xl bg-[#0B0E14] border border-amber-500/40 text-center flex flex-col items-center gap-1">
                <span className="font-bold text-xs text-amber-400">Maksimum 7 Fotoğraf Yüklendi ✅</span>
                <span className="text-[10px] text-[#9AA3B2]">Yeni resim eklemek için mevcut fotoğraflardan birini silebilirsiniz.</span>
              </div>
            )}

            {/* KULLANICININ YÜKLEDİĞİ GERÇEK FOTOĞRAFLARIN LİSTESİ */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-1">
                {photos.map((url, idx) => {
                  const isCover = idx === coverIndex;
                  return (
                    <div
                      key={idx}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 flex flex-col justify-between p-2 bg-[#0B0E14] ${
                        isCover ? 'border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30' : 'border-[#252B3B]'
                      }`}
                    >
                      <img src={url} alt={`Fotoğraf ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10" />

                      <div className="relative z-20 flex items-center justify-between w-full">
                        {isCover ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-slate-950" />
                            Kapak
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic();
                              setCoverIndex(idx);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-[#141824]/90 text-amber-400 font-bold text-[10px] hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                          >
                            Kapak Yap
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="p-1 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* KULLANICI HENÜZ YÜKLEMEDİYSE: VAR OLAN 3 ÖRNEK RESİM ÖRNEK OLARAK GÖSTERİLİR */
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#0B0E14]/60 border border-dashed border-[#252B3B]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#9AA3B2] font-semibold">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Örnek Görseller (Galerinizden kendi fotoğraflarınızı yükleyiniz):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
                  {existingSamplePhotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#141824] border border-[#252B3B] flex items-end p-1.5">
                      <img src={url} alt={`Örnek Görsel ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover grayscale" />
                      <span className="relative z-10 text-[9px] font-bold text-white bg-black/70 px-1 rounded">Örnek #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. BÖLGE SEÇİMİ */}
          <div className="flex flex-col gap-3 bg-[#141824] p-3.5 sm:p-4 rounded-2xl border border-[#252B3B] shadow-sm">
            <h2 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Bölge Seçimi</span>
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1 text-xs font-bold text-[#F5F6FA]">
                İl Seçin *
                <select
                  value={ilSlug}
                  onChange={(e) => {
                    const newIl = e.target.value;
                    const prov = turkeyProvinces.find((p) => p.ilSlug === newIl);
                    setIlSlug(newIl);
                    setIlceSlug(prov && prov.ilceler.length > 0 ? prov.ilceler[0].slug : '');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {turkeyProvinces.map((p) => (
                    <option key={p.ilSlug} value={p.ilSlug} className="bg-[#141824] text-white">
                      {p.il}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-[#F5F6FA]">
                İlçe Seçin *
                <select
                  value={ilceSlug}
                  onChange={(e) => setIlceSlug(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {availableDistricts.map((d: any) => (
                    <option key={d.slug} value={d.slug} className="bg-[#141824] text-white">
                      {d.ad}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* 5. WHATSAPP İLETİŞİM NUMARASI */}
          <div className="flex flex-col gap-2 bg-[#141824] p-3.5 sm:p-4 rounded-2xl border border-[#252B3B] shadow-sm">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#F5F6FA]">
              <div className="flex items-center justify-between">
                <span>WhatsApp Telefon Numarası *</span>
                <span className="text-[10px] text-[#00E0A4] font-normal font-mono">Tüm Ülkeler / Uluslararası Destekli</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Örn: 0532 000 00 00 veya +44... (+1, +49, +971 vb.)"
                  value={whatsappNumara}
                  onChange={(e) => setWhatsappNumara(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-[#252B3B] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors font-medium"
                />
                <Phone className="w-4 h-4 text-[#9AA3B2] absolute left-3 top-3" />
              </div>
            </label>
          </div>

          {/* 6. DÜZELTİLMİŞ ŞIK, NET VE GÜÇLÜ CTA BUTONU */}
          <div className="flex flex-col gap-2 pt-1 pb-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12.5 sm:h-13 rounded-xl bg-[#FF6A3D] hover:bg-[#ff7d54] text-white font-bold text-[15px] shadow-lg shadow-[#FF6A3D]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>VIP İlanınız Yayınlanıyor...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4.5 h-4.5 fill-white" />
                  <span>İlanı Ücretsiz Yayınla</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/25 text-xs font-mono font-bold">
                    0 ₺
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AA3B2] text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E0A4] shrink-0" />
              <span>Aynı kişi 24 saatte 1 ilan verebilir • 24 saat sonra otomatik sona erer</span>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
