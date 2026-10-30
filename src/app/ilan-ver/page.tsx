'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Upload,
  Loader2,
  Phone,
  Image as ImageIcon,
  Trash2,
  Headphones,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ChevronLeft,
  Copy,
  ExternalLink,
  Check,
  Flame,
  Star,
  Building2,
  MapPin,
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useAdminWhatsApp } from '@/lib/siteConfig';

export default function CreateListingPage() {
  const router = useRouter();
  const { getWaUrl, openWhatsApp } = useAdminWhatsApp();
  const [step, setStep] = useState<1 | 2>(1); // 1: Vitrin Kademesi Seçimi, 2: İlan Bilgileri Formu

  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    ilSlug: 'istanbul',
    ilceSlug: 'genel',
    rozet: 'vip',
    yayinSuresi: 'haftalik',
    whatsappNumara: '',
    vitrinIstegi: false,
    vitrinPaketi: 'haftalik',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('vitrin') === '1') {
        setFormData((prev) => ({
          ...prev,
          vitrinIstegi: true,
          rozet: 'vip',
          vitrinPaketi: 'haftalik',
        }));
      }
    }
  }, []);

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [coverPhotoIdx, setCoverPhotoIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdListing, setCreatedListing] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Var olan 3 adet örnek görsel (Sadece örnek referans olarak durur, forma eklenmez)
  const existingSamplePhotos = [
    'https://media.istockphoto.com/id/497710038/tr/foto%C4%9Fraf/beautiful-brunette-girl-sexy-buttocks.jpg?s=612x612&w=0&k=20&c=eayHQZ0fKbWn8NUtLTg7GKcfegdg1fXFW7nd4CajmSM=',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfsSVLXhC_AWiIPBzcrB11LeByy-xhCrRHE-KDFF_x-kLhTYKy4rJ2zxo_&s=10',
    'https://static.vecteezy.com/system/resources/previews/037/746/231/non_2x/beautiful-young-woman-relaxes-under-a-waterfall-sexy-girl-in-a-bikini-posing-near-a-waterfall-in-the-tropics-photo.jpg',
  ];

  const selectedProvince =
    turkeyProvinces.find((p) => p.ilSlug === formData.ilSlug) || turkeyProvinces[0];

  // ── VİTRİN KADEMELERİ (ESKİ LÜKS TASARIM + YENİ CYBER VURUŞLAR, FİYATSIZ) ──
  const tiers = [
    {
      id: 'gold',
      name: 'Gold Vitrin',
      icon: '⭐',
      badge: '100 SINIR • GOLD İLAN',
      title: 'GOLD',
      theme: 'gold',
      limit: '100 İlan Sınırı',
      highlight: 'Şehir Aramalarında Lider',
      cardBg:
        'bg-gradient-to-b from-[#2b210a] via-[#1a1406] to-[#0f0b02] text-amber-200 border border-amber-500/50 shadow-xl',
      innerBorder: 'border-amber-400/50',
      titleColor: 'text-amber-300',
      ornamentColor: 'text-amber-400',
      subColor: 'text-amber-400/80',
      desc: 'Maksimum 100 kontenjanla sınırlandırılmış şehir ve ilçe listelemelerinde daima ilk sıralarda öne çıkan popüler ilan vitrini.',
      features: [
        'Maksimum 100 model kontenjan sınırı',
        'Bölgesel aramalarda üst sıralarda öne çıkma',
        'Gold İlan rozeti ve doğrudan WhatsApp bağlantısı',
        'Mobil uyumlu tam sayfa detay vitrini',
      ],
    },
    {
      id: 'vip',
      name: 'VIP Vitrin',
      icon: '👑',
      badge: '50 SINIR • VIP İLAN',
      title: 'VIP',
      theme: 'vip',
      limit: '50 İlan Sınırı (Özel)',
      highlight: 'Anasayfa & 81 İlde #1 Sıra',
      cardBg:
        'bg-gradient-to-b from-[#ffd700] via-[#f59e0b] to-[#b45309] text-slate-950 border-2 border-amber-300 shadow-2xl shadow-amber-500/30',
      innerBorder: 'border-slate-950/60',
      titleColor: 'text-slate-950',
      ornamentColor: 'text-slate-950',
      subColor: 'text-slate-950/90',
      desc: 'Maksimum 50 seçkin kontenjan ile anasayfada ve tüm aramalarda en üst sırada sabit kalma garantisi.',
      features: [
        'Maksimum 50 İlan Sınırı (En Seçkin Kontenjan)',
        'Anasayfa en üst dev vitrinde sabit gösterim',
        '81 İl ve İlçe aramalarında #1 sırada yer alma',
        'VIP Doğrulanmış Rozet & Özel Lazer Parlama Efekti',
        'Tek tıkla doğrudan WhatsApp ve Çağrı yönlendirmesi',
        '7/24 Öncelikli Temsilci & Ajans Desteği',
      ],
    },
    {
      id: 'silver',
      name: 'Silver Standart',
      icon: '⚡',
      badge: '200 SINIR • SILVER İLAN',
      title: 'SILVER',
      theme: 'silver',
      limit: '200 İlan Sınırı',
      highlight: 'Standart Bölge Gösterimi',
      cardBg:
        'bg-gradient-to-b from-[#222a36] via-[#161c24] to-[#0d1218] text-slate-100 border border-slate-400/40 shadow-xl',
      innerBorder: 'border-slate-300/40',
      titleColor: 'text-slate-100',
      ornamentColor: 'text-slate-300',
      subColor: 'text-slate-400',
      desc: 'Maksimum 200 kontenjanla standart liste gösterimi ve doğrudan müşteri iletişimi.',
      features: [
        'Maksimum 200 kontenjan sınırı',
        'İlgili şehir ve ilçe listesinde standart yayın',
        'Doğrulanmış profil ve doğrudan WhatsApp iletişimi',
        'Müşteri paneli üzerinden anında güncelleme',
      ],
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = photoUrls.length;
    const remainingSlots = 7 - currentCount;

    if (remainingSlots <= 0) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz!');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
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
        setPhotoUrls((prev) => [...prev, ...data.urls].slice(0, 7));
      } else {
        alert(data.error || 'Dosya yükleme hatası.');
      }
    } catch (err) {
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const removePhotoUrl = (index: number) => {
    const updated = photoUrls.filter((_, idx) => idx !== index);
    setPhotoUrls(updated);
    if (coverPhotoIdx >= updated.length) {
      setCoverPhotoIdx(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photoUrls.length < 3) {
      alert('Lütfen galerinizden en az 3 adet fotoğraf yükleyiniz!');
      return;
    }

    if (photoUrls.length > 7) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz!');
      return;
    }

    setLoading(true);
    const coverUrl = photoUrls[coverPhotoIdx] || photoUrls[0];
    const savedThreadId =
      typeof window !== 'undefined'
        ? localStorage.getItem('best_eskort_chat_thread_id')
        : null;
    const visitorId =
      typeof window !== 'undefined' ? localStorage.getItem('bms_vid') : null;

    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anaFotografUrl: coverUrl,
          fotograflar: photoUrls.map((url) => ({ url })),
          chatThreadId: savedThreadId || null,
          visitorId: visitorId || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.listing) {
        setCreatedListing(data.listing);
        if (data.panelSifresi) {
          setGeneratedPassword(data.panelSifresi);
          localStorage.setItem('my_listing_panel_password', data.panelSifresi);
          try {
            const cleanPhone = formData.whatsappNumara.replace(/\D/g, '');
            localStorage.setItem(
              'panel_user_session',
              JSON.stringify({
                identifier: cleanPhone || formData.whatsappNumara,
                password: data.panelSifresi,
                panelSifresi: data.panelSifresi,
                kullaniciAdi: formData.baslik,
                telefon: formData.whatsappNumara,
                ad: formData.baslik,
                type: 'user',
              })
            );
          } catch (_) {}
        }

        if (data.chatThreadId) {
          localStorage.setItem('best_eskort_chat_thread_id', data.chatThreadId);
          localStorage.setItem(
            'last_created_listing_id',
            data.listing?._id || 'true'
          );
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        alert('İlan eklenirken bir hata oluştu.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  // ── BAŞARI EKRANI (FİYATSIZ, GÜVENLİ & DOĞRUDAN ONAY) ────────────────
  if (createdListing) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-6 min-h-[80vh] max-w-xl mx-auto w-full">
        {/* Onay İkonu */}
        <div className="relative mt-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.5)] animate-pulse">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 font-heading bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full w-fit mx-auto flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>İlan Kaydınız Başarıyla Alındı</span>
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight leading-snug">
            Yönetici Onayı &amp; <span className="text-rose-400">Canlı Yayın</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto font-medium">
            İlanınız hazırlandı. 5 dakika içinde anında vitrinde yayına alınması için WhatsApp üzerinden yönetici temsilcimize mesaj atmanız yeterlidir.
          </p>
        </div>

        {/* KULLANICI ADI & ŞİFRE BİLGİLENDİRME KUTUSU */}
        <div className="w-full p-5 rounded-3xl bg-[#0c101b] border border-rose-500/30 flex flex-col gap-3 text-left shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-rose-300 font-heading font-black text-sm">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Müşteri Paneli Giriş Bilgileriniz</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px]">
              Kayıtlı
            </span>
          </div>

          {/* Kullanıcı Adı / Telefon */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070a13] border border-white/10">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Kullanıcı Adı / Telefon
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400 truncate">
                {formData.whatsappNumara}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(formData.whatsappNumara);
                setCopiedUser(true);
                setTimeout(() => setCopiedUser(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#161b26] hover:bg-[#202736] text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 font-heading cursor-pointer"
            >
              {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUser ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>

          {/* Panel Giriş Şifresi */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070a13] border border-white/10">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                İlan Düzenleme Şifreniz
              </span>
              <span className="text-base font-mono font-black text-amber-400">
                {generatedPassword || '849201'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword || '849201');
                setCopiedPass(true);
                setTimeout(() => setCopiedPass(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 font-heading cursor-pointer"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPass ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>

          {/* Tek Tıkla Tüm Bilgileri Kopyala */}
          <button
            type="button"
            onClick={() => {
              const allText = `Best Eskort Panel Giriş Bilgilerim:\nKullanıcı Adı: ${formData.whatsappNumara}\nŞifre: ${generatedPassword || '849201'}\nPanel Linki: https://www.besteskort.online/panelim`;
              navigator.clipboard.writeText(allText);
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 2000);
            }}
            className="w-full py-2.5 rounded-xl bg-[#161b26] hover:bg-[#202736] text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-500/20 active:scale-98 transition-all cursor-pointer font-heading"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedAll ? 'Tüm Bilgiler Kopyalandı!' : 'Tek Tıkla Giriş Bilgilerini Kopyala'}</span>
          </button>
        </div>

        {/* ── BÜYÜK WHATSAPP ONAY BUTONU ──────────────── */}
        <div className="flex flex-col gap-3 w-full font-heading">
          <a
            href={getWaUrl(
              `Merhaba, "${formData.baslik}" başlıklı ilanımı web sitenizden oluşturdum. İlan Düzenleme Şifrem: ${generatedPassword}. İlanımın 5 dakika içinde anında vitrine alınması için yazıyorum.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openWhatsApp(
                `Merhaba, "${formData.baslik}" başlıklı ilanımı web sitenizden oluşturdum. İlan Düzenleme Şifrem: ${generatedPassword}. İlanımın 5 dakika içinde anında vitrine alınması için yazıyorum.`
              );
            }}
            className="w-full py-4 px-6 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-sm shadow-xl shadow-green-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer"
          >
            <OfficialWhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
            <span>WhatsApp ile İlanımı Anında Yayına Al ➔</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => router.push('/chat')}
              className="py-3 px-3 rounded-2xl bg-[#161b26] hover:bg-[#202736] text-white font-bold text-xs border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-rose-400" />
              <span>Canlı Destek</span>
            </button>

            <a
              href="/panelim"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-[#161b26] hover:bg-[#202736] text-amber-300 font-bold text-xs border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Müşteri Panelim</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>7/24 Aktif Yönetici Teyidi &amp; Kesintisiz Gizlilik</span>
        </div>
      </div>
    );
  }

  const currentTierObj = tiers.find((t) => t.id === formData.rozet) || tiers[0];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col items-center">
      {/* ── ÜST BAR: GERİ DÖNÜŞ VE MÜŞTERİ PANELİ ──────────────── */}
      <div className="w-full max-w-3xl px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anasayfa</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/panelim"
            className="px-3 py-1.5 rounded-xl bg-[#161b26] hover:bg-[#202736] text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-1.5 font-heading"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Müşteri Panelim</span>
          </Link>

          <button
            onClick={() => router.push('/chat')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-1 font-heading uppercase tracking-wider cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Canlı Destek</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl px-4 py-6 flex flex-col gap-6 text-center">
        {/* ── 1. ORTALANMIŞ GÖRKEMLİ HERO BAŞLIK & KÖKLÜ AJANS VURGUSU (İNCE ÇERÇEVELİ KART) ──────────────── */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0c101b]/80 border border-white/15 shadow-xl flex flex-col items-center gap-3 relative overflow-hidden backdrop-blur-sm">
          {/* Hafif arka plan ışıması */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-24 bg-rose-500/10 blur-2xl pointer-events-none rounded-full" />

          <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/30 via-pink-600/25 to-amber-500/20 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>TÜRKİYE'NİN LİDER &amp; EN KÖKLÜ İLAN AJANSI</span>
          </div>

          <h1 className="relative z-10 text-2xl sm:text-4xl font-heading font-black text-white uppercase tracking-tight leading-tight max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            ZİRVEDE YERİNİ AL,{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              MÜŞTERİLERİNE DOĞRUDAN ULAŞ
            </span>
          </h1>

          <p className="relative z-10 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Türkiye'nin en başarılı bireysel modelleri ve seçkin eskort ajansları 3 yılı aşkın süredir bizimle çalışıyor. 81 ilde milyonlarca aktif ziyaretçiye güvenle ulaşın.
          </p>

          {/* ── 4 GÜVEN & BAŞARI ÇİPİ (3 YIL GÜNCELLENDİ) ──────────────── */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
            <div className="p-2.5 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-rose-400 font-heading font-black text-base sm:text-lg leading-none">
                3+ Yıl
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Köklü Güven
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-amber-400 font-heading font-black text-base sm:text-lg leading-none">
                81 İl
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Tam Kapsama
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-emerald-400 font-heading font-black text-base sm:text-lg leading-none">
                %100
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Gizlilik Güvencesi
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#141824] border border-white/10 flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-cyan-400 font-heading font-black text-base sm:text-lg leading-none">
                5 Dk
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Anında Canlı Yayın
              </span>
            </div>
          </div>
        </div>

        {/* Adım Göstergesi (TAB SEÇİMLERİ - ÇERÇEVENİN DIŞINDA) */}
        <div className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto -mt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-heading ${
              step === 1
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                : 'bg-[#161b26] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            1. Vitrin Seçimi
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-heading ${
              step === 2
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                : 'bg-[#161b26] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            2. İlan Bilgileri
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            ADIM 1: VİTRİN KADEMESİ SEÇİMİ (3'LÜ YAN YANA LÜKS KARTLAR, FİYATSIZ)
        ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="flex flex-col gap-4 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="font-black text-xs uppercase tracking-widest text-slate-300 font-heading flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Vitrin Kademeleri</span>
              </span>
              <span className="text-[11px] text-amber-400 font-bold font-mono">
                Paketi Seç &amp; Devam Et
              </span>
            </div>

            {/* 3'LÜ YAN YANA LÜKS VİTRİN KARTLARI SEÇİMİ (MOBİLDE DE YAN YANA 3 KOLON) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full items-stretch">
              {tiers.map((tier) => {
                const isSelected = formData.rozet === tier.id;
                const isVip = tier.theme === 'vip';

                return (
                  <div
                    key={tier.id}
                    onClick={() => setFormData({ ...formData, rozet: tier.id })}
                    className={`group relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl select-none flex flex-col justify-between ${
                      tier.cardBg
                    } ${
                      isSelected
                        ? isVip
                          ? 'ring-4 ring-rose-500 ring-offset-2 ring-offset-[#070a13] scale-[1.02] z-20 shadow-[0_0_30px_rgba(244,63,94,0.5)]'
                          : 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#070a13] scale-[1.02] z-20 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* VIP Parlama & Dönen Efekt */}
                    {isVip && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none -z-10 animate-pulse" />
                    )}

                    {/* İÇ ALTIN ÇERÇEVE */}
                    <div
                      className={`relative w-full h-full rounded-xl sm:rounded-2xl border-2 ${tier.innerBorder} p-1.5 sm:p-3 flex flex-col items-center justify-between text-center overflow-hidden min-h-[160px] sm:min-h-[195px]`}
                    >
                      {/* 1. ÜST: ROZET & ORNAMENT */}
                      <div className="flex flex-col items-center gap-0.5 w-full">
                        <span
                          className={`text-[7.5px] sm:text-[9.5px] font-heading font-black tracking-[0.14em] uppercase truncate max-w-full ${tier.subColor}`}
                        >
                          {tier.badge}
                        </span>

                        <div
                          className={`flex items-center justify-center gap-1 sm:gap-1.5 w-full my-0.5 opacity-90 ${tier.ornamentColor}`}
                        >
                          <span className="h-[1.5px] w-2 sm:w-6 bg-current opacity-60"></span>
                          <span className="text-[8px] sm:text-xs">✦</span>
                          <span className="h-[1.5px] w-2 sm:w-6 bg-current opacity-60"></span>
                        </div>
                      </div>

                      {/* 2. ORTA: BÜYÜK BAŞLIK & İKON & FİYATSIZ AYRICALIK */}
                      <div className="flex flex-col items-center justify-center my-auto py-0.5">
                        <div
                          className={`text-xl sm:text-3xl mb-0.5 group-hover:scale-125 transition-transform ${
                            isVip
                              ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]'
                              : 'drop-shadow-sm'
                          }`}
                        >
                          {tier.icon}
                        </div>

                        <span
                          className={`font-heading font-black text-xl sm:text-3xl tracking-wider leading-none ${
                            tier.titleColor
                          } ${isVip ? 'drop-shadow-md' : 'drop-shadow-sm'}`}
                        >
                          {tier.title}
                        </span>

                        <span
                          className={`font-heading font-black text-[8px] sm:text-[10px] tracking-[0.18em] uppercase mt-1 ${tier.subColor}`}
                        >
                          {tier.limit}
                        </span>

                        {/* FİYATSIZ ÖNE ÇIKAN ÖZELLİK VURGUSU */}
                        <div className="flex flex-col items-center mt-1.5 pt-1 border-t border-current/20 w-full">
                          <span
                            className={`font-heading font-black text-[9px] sm:text-[11px] leading-tight tracking-tight ${tier.titleColor}`}
                          >
                            {tier.highlight}
                          </span>
                        </div>
                      </div>

                      {/* 3. ALT: SEÇİM DURUMU */}
                      <div className="flex flex-col items-center w-full pt-1">
                        <div
                          className={`flex items-center justify-center gap-1 w-full mb-1 opacity-80 ${tier.ornamentColor}`}
                        >
                          <span className="h-[1px] flex-1 bg-current opacity-40"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span className="h-[1px] flex-1 bg-current opacity-40"></span>
                        </div>

                        <span
                          className={`text-[8.5px] sm:text-[10px] font-heading font-black px-2 py-0.5 rounded-full shadow-md tracking-wider ${
                            isSelected
                              ? isVip
                                ? 'bg-slate-950 text-amber-300 border-2 border-slate-950'
                                : 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-black/40 text-current border border-current/25'
                          }`}
                        >
                          {isSelected ? '✓ SEÇİLDİ' : 'SEÇ'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SEÇİLEN KADEMENİN AYRICALIKLARI */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101b] border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="text-base">{currentTierObj.icon}</span>
                  <span>{currentTierObj.name} Ayrıcalıkları</span>
                </span>
                <span className="text-[11px] text-amber-400 font-bold font-mono">
                  Dahil Olan Özellikler
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {currentTierObj.desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {currentTierObj.features.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* İLERLE BUTONU (ÖZEL LAZER PARLAMA) */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:brightness-110 active:scale-98 transition-all text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer"
            >
              <span>{currentTierObj.name} ile İlan Bilgilerini Doldur</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* VEYA WHATSAPP İLE HIZLI BAŞVURU */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                VEYA WHATSAPP'TAN YAZIN BİZ EKLEYELİM
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <a
              href={getWaUrl(
                `Merhaba, "${currentTierObj.name}" ile ilan vermek istiyorum. Ajansınız üzerinden doğrudan ilan kaydı ve vitrin desteği alabilir miyim?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openWhatsApp(
                  `Merhaba, "${currentTierObj.name}" ile ilan vermek istiyorum. Ajansınız üzerinden doğrudan ilan kaydı ve vitrin desteği alabilir miyim?`
                );
              }}
              className="w-full py-4 px-5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-sm shadow-xl shadow-green-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer"
            >
              <OfficialWhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
              <span>WhatsApp ile Doğrudan Temsilciye Ulaş</span>
            </a>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ADIM 2: İLAN BİLGİLERİ FORMU (BASİT & ETKİLİ)
        ══════════════════════════════════════════════════ */}
        {step === 2 && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 text-left animate-in fade-in duration-300"
          >
            {/* SEÇİLEN KADEME BİLGİSİ */}
            <div className="p-3.5 rounded-2xl bg-[#0c101b] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-lg">
                  {currentTierObj.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Seçilen Vitrin Kategorisi:
                  </span>
                  <span className="font-black text-sm text-amber-300 font-heading">
                    {currentTierObj.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-xl bg-[#161b26] hover:bg-[#202736] text-white text-xs font-bold transition-all border border-white/10 font-heading cursor-pointer"
              >
                Değiştir
              </button>
            </div>

            {/* BÖLGE SEÇİMİ (İL & İLÇE) */}
            <div className="flex flex-col gap-3 bg-[#0c101b] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-300 uppercase tracking-wider font-heading">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Yayınlanacak Bölge (81 İl Kapsama) *</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  <span>İl Seçin *</span>
                  <select
                    value={formData.ilSlug}
                    onChange={(e) => {
                      const newIl = e.target.value;
                      setFormData({
                        ...formData,
                        ilSlug: newIl,
                        ilceSlug: 'genel',
                      });
                    }}
                    className="px-3.5 py-3 rounded-xl bg-[#161b26] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400"
                  >
                    {turkeyProvinces.map((p) => (
                      <option key={p.ilSlug} value={p.ilSlug}>
                        {p.il}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-slate-200">
                  <span>İlçe Seçin *</span>
                  <select
                    value={formData.ilceSlug}
                    onChange={(e) =>
                      setFormData({ ...formData, ilceSlug: e.target.value })
                    }
                    className="px-3.5 py-3 rounded-xl bg-[#161b26] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 font-bold"
                  >
                    <option
                      value="genel"
                      className="font-bold text-amber-400 bg-[#0c101b]"
                    >
                      🌟 TÜM İL (Genel - Tüm İlçelerde Gösterim)
                    </option>
                    {selectedProvince.ilceler.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.ad}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* İLAN BAŞLIĞI VE AÇIKLAMA */}
            <div className="flex flex-col gap-3 bg-[#0c101b] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-200">
                <span>İlan Başlığı *</span>
                <input
                  type="text"
                  required
                  placeholder="Örn: Beylikdüzü Sıcak & Samimi Buluşmalar"
                  value={formData.baslik}
                  onChange={(e) =>
                    setFormData({ ...formData, baslik: e.target.value })
                  }
                  className="px-4 py-3 rounded-xl bg-[#161b26] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-200">
                <span>Detaylı Tanıtım Açıklaması *</span>
                <textarea
                  required
                  rows={4}
                  placeholder="Hizmet detaylarınızı, beklentilerinizi ve kendinizi tanıtın..."
                  value={formData.aciklama}
                  onChange={(e) =>
                    setFormData({ ...formData, aciklama: e.target.value })
                  }
                  className="px-4 py-3 rounded-xl bg-[#161b26] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 transition-colors"
                />
              </label>
            </div>

            {/* FOTOĞRAF YÜKLEME ALANI (EN AZ 3, EN FAZLA 7) */}
            <div className="flex flex-col gap-3 bg-[#0c101b] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-xs text-rose-300 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>Fotoğraflarınız (En Az 3, En Fazla 7 Resim) *</span>
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    photoUrls.length >= 3
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {photoUrls.length} / 7 Fotoğraf
                </span>
              </div>

              {photoUrls.length < 7 ? (
                <label className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-rose-500/40 hover:border-rose-400 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-all text-center gap-2 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Fotoğraflar Yükleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Upload className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-white font-heading">
                          📱 Galeriden Kendi Fotoğraflarını Seç &amp; Yükle
                        </span>
                        <span className="text-[10px] text-rose-400 font-bold mt-0.5">
                          {photoUrls.length === 0
                            ? 'En az 3 fotoğraf yükleyin'
                            : `${7 - photoUrls.length} adet daha ekleyebilirsiniz`}
                        </span>
                      </div>
                    </>
                  )}
                </label>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#161b26] border border-rose-500/30 text-center flex flex-col items-center gap-0.5">
                  <span className="font-bold text-xs text-emerald-400">
                    Maksimum 7 Fotoğraf Yüklendi ✅
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Yeni fotoğraf için mevcutlardan birini silebilirsiniz.
                  </span>
                </div>
              )}

              {/* YÜKLENEN FOTOĞRAFLARIN ÖNİZLEMESİ */}
              {photoUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5 mt-1">
                  {photoUrls.map((url, idx) => {
                    const isCover = idx === coverPhotoIdx;
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden border-2 flex flex-col justify-between p-2 h-36 bg-[#070a13] ${
                          isCover
                            ? 'border-rose-400 shadow-lg shadow-rose-500/20'
                            : 'border-white/10'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Fotoğraf ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10" />

                        <div className="relative z-20 flex items-center justify-between">
                          {isCover ? (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] flex items-center gap-1 shadow-md font-heading">
                              <Star className="w-3 h-3 fill-white" />
                              Kapak
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverPhotoIdx(idx)}
                              className="px-2 py-0.5 rounded-lg bg-black/80 text-rose-300 font-bold text-[10px] hover:bg-rose-600 hover:text-white transition-colors font-heading cursor-pointer"
                            >
                              Kapak Yap
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removePhotoUrl(idx)}
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
                /* KULLANICI HENÜZ YÜKLEMEDİYSE: 3 ADET ÖRNEK FOTOĞRAF GÖSTERİLİR */
                <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#070a13] border border-dashed border-white/15">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Örnek Görseller (Galerinizden kendi fotoğraflarınızı yükleyiniz):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 opacity-60 pointer-events-none">
                    {existingSamplePhotos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#161b26] border border-white/10 flex items-end p-1.5"
                      >
                        <img
                          src={url}
                          alt={`Örnek Görsel ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover grayscale"
                        />
                        <span className="relative z-10 text-[9px] font-bold text-white bg-black/80 px-1 rounded">
                          Örnek #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WHATSAPP İLETİŞİM NUMARASI */}
            <div className="flex flex-col gap-2 bg-[#0c101b] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Telefon Numaranız *</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="0532 000 00 00"
                  value={formData.whatsappNumara}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumara: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#161b26] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400 transition-colors font-mono font-medium"
                />
              </label>
              <span className="text-[10px] text-slate-400">
                Müşterileriniz profilinizdeki tek tıkla WhatsApp butonuna bastığında bu numaraya yönlendirilir.
              </span>
            </div>

            {/* ── ANASAYFA EN ÜST DEV VİTRİN TALEP TOGGLE (FİYATSIZ, SAF AVANTAJ) ── */}
            <div
              onClick={() =>
                setFormData({
                  ...formData,
                  vitrinIstegi: !formData.vitrinIstegi,
                })
              }
              className={`p-4 rounded-3xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none shadow-xl ${
                formData.vitrinIstegi
                  ? 'bg-gradient-to-r from-rose-950/40 via-[#161b26] to-[#0c101b] border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-[#0c101b] border-white/10 hover:border-rose-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shrink-0 transition-transform ${
                    formData.vitrinIstegi
                      ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-600/30'
                      : 'bg-[#161b26] text-slate-400'
                  }`}
                >
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-xs sm:text-sm text-white">
                    👑 Anasayfa En Üst VIP Vitrinde Yer Almak İstiyorum
                  </span>
                  <span className="text-[11px] text-slate-300 mt-0.5">
                    İlanınız sayfanın en tepesinde dev vitrinde dönsün, 3 kat daha fazla doğrudan müşteri kazanın.
                  </span>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                  formData.vitrinIstegi
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'border-white/20 bg-[#161b26]'
                }`}
              >
                {formData.vitrinIstegi && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>

            {/* BUTONLAR: GERİ VE YAYINA GÖNDER */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-4 px-4 rounded-2xl bg-[#161b26] hover:bg-[#202736] text-white font-extrabold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 font-heading cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:brightness-110 active:scale-98 transition-all text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'İlanınız Hazırlanıyor...' : 'İlanımı Anında Yayına Gönder'}
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* VEYA WHATSAPP İLE ADMIN'E ULAŞ */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                VEYA DOĞRUDAN WHATSAPP'TAN YAZIN
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <a
              href={getWaUrl(
                `Merhaba, "${formData.baslik || 'Yeni İlan'}" için ajansınız üzerinden doğrudan ilan vermek istiyorum.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openWhatsApp(
                  `Merhaba, "${formData.baslik || 'Yeni İlan'}" için ajansınız üzerinden doğrudan ilan vermek istiyorum.`
                );
              }}
              className="w-full py-4 px-5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-sm shadow-xl shadow-green-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider cursor-pointer"
            >
              <OfficialWhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
              <span>WhatsApp ile Temsilciye Yaz (5 Dk'da Yayın)</span>
            </a>
          </form>
        )}

        {/* ── KURUMSAL AJANS & GÜVENİLİRLİK BİLGİLENDİRME ALANI (EN ALTTA) ──────────────── */}
        <div className="p-5 rounded-3xl bg-[#0c101b] border border-white/10 flex flex-col gap-3 text-left shadow-lg">
          <div className="flex items-center gap-2 text-rose-300 font-heading font-black text-xs uppercase tracking-wider border-b border-white/10 pb-2">
            <Building2 className="w-4 h-4 text-rose-400" />
            <span>Ajanslar &amp; Menajerler İçin Özel Hizmet</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Birden fazla modelle çalışan eskort ajansları, menajerlik ofisleri ve bağımsız ekipler için toplu ilan yönetimi, özel vitrin sıralaması ve 7/24 öncelikli VIP temsilci desteğimiz mevcuttur.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Türkiye Çapında 120+ Onaylı Partner Ajans &amp; %100 Veri Gizliliği</span>
          </div>
        </div>
      </div>
    </div>
  );
}
