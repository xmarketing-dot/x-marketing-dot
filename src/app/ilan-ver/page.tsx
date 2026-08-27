'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderTicker from '@/components/common/HeaderTicker';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Star,
  Award,
  Medal,
  MessageSquare,
  CheckCircle,
  Clock,
  Upload,
  Loader2,
  Phone,
  Image as ImageIcon,
  Trash2,
  Headphones,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Zap,
  KeyRound,
  LayoutDashboard,
  Info
} from 'lucide-react';
import { turkeyProvinces } from '@/data/turkeyLocations';

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1: Paket Seçimi, 2: İlan Bilgileri Formu

  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    ilSlug: 'istanbul',
    ilceSlug: 'beylikduzu',
    rozet: 'vip',
    yayinSuresi: 'haftalik',
    whatsappNumara: '',
  });

  // Kullanıcının yükleyeceği gerçek fotoğraflar - Sıfırdan başlar!
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [coverPhotoIdx, setCoverPhotoIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdListing, setCreatedListing] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  // Var olan 3 adet örnek görsel (Sadece örnek referans olarak durur, forma eklenmez)
  const existingSamplePhotos = [
    'https://media.istockphoto.com/id/497710038/tr/foto%C4%9Fraf/beautiful-brunette-girl-sexy-buttocks.jpg?s=612x612&w=0&k=20&c=eayHQZ0fKbWn8NUtLTg7GKcfegdg1fXFW7nd4CajmSM=',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfsSVLXhC_AWiIPBzcrB11LeByy-xhCrRHE-KDFF_x-kLhTYKy4rJ2zxo_&s=10',
    'https://static.vecteezy.com/system/resources/previews/037/746/231/non_2x/beautiful-young-woman-relaxes-under-a-waterfall-sexy-girl-in-a-bikini-posing-near-a-waterfall-in-the-tropics-photo.jpg',
  ];

  const selectedProvince = turkeyProvinces.find((p) => p.ilSlug === formData.ilSlug) || turkeyProvinces[0];

  const tiers = [
    {
      id: 'vip',
      name: 'VIP Vitrin',
      icon: Crown,
      badge: 'EN ÇOK TERCİH EDİLEN 🔥',
      gradient: 'from-amber-500/25 via-[#1a1508] to-[#161b22]',
      border: 'border-amber-500/80 ring-1 ring-amber-400/30',
      tagColor: 'bg-amber-500 text-slate-950',
      titleColor: 'text-amber-400',
      desc: 'Anasayfada ve tüm aramalarda en üst sırada sabit kalma garantisi.',
      features: [
        'Anasayfa en üst vitrinde sabit gösterim',
        '81 İl ve İlçe aramalarında #1 sırada yer alma',
        'VIP Doğrulanmış Rozet & Özel Altın Parlama Efekti',
        'Tek tıkla doğrudan WhatsApp ve Çağrı yönlendirmesi',
        '7/24 Öncelikli Temsilci Desteği'
      ]
    },
    {
      id: 'gold',
      name: 'Gold Vitrin',
      icon: Award,
      badge: 'POPÜLER 🥇',
      gradient: 'from-yellow-600/20 via-[#140e03] to-[#161b22]',
      border: 'border-yellow-600/50',
      tagColor: 'bg-yellow-600 text-white',
      titleColor: 'text-yellow-300',
      desc: 'Şehir ve ilçe listelemelerinde öne çıkan ilan vitrini.',
      features: [
        'Bölgesel aramalarda öne çıkma',
        'Gold İlan rozeti ve iletişim bağlantısı',
        'Mobil uyumlu tam sayfa detay vitrini'
      ]
    },
    {
      id: 'silver',
      name: 'Silver Standart',
      icon: Medal,
      badge: 'STANDART 🥈',
      gradient: 'from-slate-700/20 via-[#161b22] to-[#161b22]',
      border: 'border-[#30363d]',
      tagColor: 'bg-slate-700 text-white',
      titleColor: 'text-slate-300',
      desc: 'Standart liste gösterimi ve doğrudan müşteri iletişimi.',
      features: [
        'İlgili şehir ve ilçe listesinde standart yayın',
        'Doğrulanmış profil ve doğrudan iletişim'
      ]
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Maksimum 7 fotoğraf sınırı
    const currentCount = photoUrls.length;
    const remainingSlots = 7 - currentCount;

    if (remainingSlots <= 0) {
      alert('En fazla 7 adet fotoğraf yükleyebilirsiniz!');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Maksimum 7 fotoğraf sınırı nedeniyle sadece ilk ${remainingSlots} adet dosya seçildi.`);
    }

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
    const savedThreadId = typeof window !== 'undefined' ? localStorage.getItem('best_eskort_chat_thread_id') : null;

    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          anaFotografUrl: coverUrl,
          fotograflar: photoUrls.map((url) => ({ url })),
          chatThreadId: savedThreadId || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.listing) {
        setCreatedListing(data.listing);
        if (data.panelSifresi) {
          setGeneratedPassword(data.panelSifresi);
          localStorage.setItem('my_listing_panel_password', data.panelSifresi);
        }

        try {
          const chatRes = await fetch('/api/chat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              threadId: savedThreadId,
              kullaniciAdi: `İlan Sahibi: ${formData.baslik}` 
            }),
          });
          const chatData = await chatRes.json();
          if (chatData.thread?._id) {
            localStorage.setItem('best_eskort_chat_thread_id', chatData.thread._id);
            localStorage.setItem('last_created_listing_id', data.listing?._id || 'true');
            window.dispatchEvent(new Event('storage'));

            await fetch('/api/chat/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                threadId: chatData.thread._id,
                gonderenTipi: 'user',
                mesaj: `Merhaba yönetici, "${formData.baslik}" başlıklı ${formData.rozet.toUpperCase()} ilanımı oluşturdum. Panel Şifrem: ${data.panelSifresi || 'Talepli'}. Ödeme yöntemleri için bilgi bekliyorum.`,
              }),
            });
          }
        } catch (err) {
          // Silent
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

  // ── BAŞARI VE ÖDEME YÖNLENDİRME EKRANI ────────────────
  if (createdListing) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-6 min-h-[75vh] max-w-lg mx-auto">
        <div className="relative mt-2">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.35)] animate-pulse">
            <CreditCard className="w-10 h-10 stroke-[2.5]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs ring-4 ring-[#0d1117]">
            ✓
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 font-heading bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full w-fit mx-auto">
            İlan Bilgileriniz Başarıyla Alındı
          </span>
          <h1 className="font-black text-2xl sm:text-3xl text-white font-heading tracking-tight leading-snug">
            Ödeme Yöntemleri &amp; <span className="text-amber-400">Yönetici Onayı</span>
          </h1>
          <p className="text-sm sm:text-base text-[#c9d1d9] leading-relaxed max-w-md mt-1 font-medium">
            Ödeme yöntemleri (IBAN/Havale, Kripto/USDT) ve ilanınızın anında yayına girmesi için yöneticiyle iletişime geçin.
          </p>
        </div>

        {/* KRİPTO ÖDEME CÜZDAN KARTI */}
        <div className="w-full">
          <CryptoPaymentCard onChatClick={() => router.push('/chat')} />
        </div>

        {/* KULLANICI ADI & ŞİFRE BİLGİLENDİRME KUTUSU */}
        <div className="w-full p-5 rounded-3xl bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border-2 border-amber-500/50 flex flex-col gap-3 text-left shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-heading font-black text-sm">
              <KeyRound className="w-4 h-4" />
              <span>Kullanıcı İlan Paneli Girişi:</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs font-heading border border-emerald-500/30">
              Admin Onaylı
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#f0f6fc] leading-relaxed font-medium">
            🛡️ Ödemeniz teyit edildikten sonra yöneticimiz size özel <strong className="text-amber-300 font-bold">Kullanıcı Adı ve Şifrenizi</strong> iletecektir. Panelinize girerek ilanlarınızı düzenleyebilir, kalan sürenizi görebilir ve yeni ilanlar ekleyebilirsiniz.
          </p>
        </div>

        {/* CANLI DESTEK & PANEL BUTONLARI */}
        <div className="flex flex-col gap-3 w-full font-heading mt-1">
          <button
            onClick={() => router.push('/chat')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Headphones className="w-5 h-5 stroke-[2.5]" />
            <span>Yönetici ile Canlı Görüş &amp; Öde ➔</span>
          </button>

          <button
            onClick={() => router.push('/panelim')}
            className="w-full py-4 px-6 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs border border-[#363b42] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>İlan Yönetim Panelime Git</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>7/24 Aktif Yönetici &amp; Anında Onay</span>
        </div>
      </div>
    );
  }

  const currentTierObj = tiers.find(t => t.id === formData.rozet) || tiers[0];

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-xl mx-auto pb-12">

      {/* ── ÜST CANLI DESTEK BANNERI ──────────────── */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-amber-500/25 via-[#1a1508] to-[#0d1117] border-2 border-amber-400 p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                <Headphones className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#161b22] animate-pulse" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base text-white font-heading tracking-tight flex items-center gap-1.5">
                <span>Canlı Destek &amp; Temsilci</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                  Online
                </span>
              </span>
              <span className="text-[11px] text-amber-300/80 font-bold">
                ⚡ Sorularınız için 7/24 temsilcimiz hazır
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/chat')}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 font-heading uppercase tracking-wider"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
            <span>Bağlan</span>
          </button>
        </div>

        <div>
          <h1 className="font-black text-xl text-white font-heading">
            {step === 1 ? 'Adım 1: Vitrin Paketinizi Seçin' : 'Adım 2: İlan Bilgilerini Doldurun'}
          </h1>
          <p className="text-xs text-[#c9d1d9] mt-1 leading-relaxed">
            {step === 1
              ? 'İlanınızın görünürlüğünü belirleyecek vitrin paketini seçip devam edin.'
              : 'Seçtiğiniz paket için ilan detaylarını ve fotoğrafları ekleyin.'}
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 1 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 2 ? 'bg-amber-400' : 'bg-white/20'}`} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ADIM 1: PAKET SEÇİMİ EKRANI
      ══════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <span className="font-black text-xs uppercase tracking-widest text-[#8b949e] font-heading flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vitrin Kademeleri</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold">Paketi Seç &amp; Devam Et</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = formData.rozet === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setFormData({ ...formData, rozet: tier.id })}
                  className={`relative rounded-3xl bg-gradient-to-br ${tier.gradient} p-5 border cursor-pointer transition-all duration-200 shadow-xl ${isSelected ? `${tier.border} scale-[1.01]` : 'border-[#30363d] opacity-80 hover:opacity-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-[#21262d] text-white'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black text-base font-heading ${tier.titleColor}`}>
                          {tier.name}
                        </span>
                        <span className="text-[10px] text-[#8b949e] font-bold">
                          {tier.badge}
                        </span>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-[#484f58]'
                      }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>

                  <p className="text-xs text-[#8b949e] mt-3 font-medium">
                    {tier.desc}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#c9d1d9]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* İLERLE BUTONU */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all font-heading uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <span>{currentTierObj.name} ile Devam Et</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ADIM 2: VERİ FORMU DOLDURMA AŞAMASI
      ══════════════════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in duration-300">

          {/* SEÇİLEN PAKET ÖZETİ & GERİ DEĞİŞTİRME */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8b949e] font-semibold">Seçilen Vitrin Paketi:</span>
                <span className="font-black text-sm text-amber-400 font-heading">{currentTierObj.name}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all border border-[#363b42]"
            >
              Değiştir
            </button>
          </div>

          {/* YAYIN SÜRESİ */}
          <div className="flex flex-col gap-4 bg-[#161b22] p-5 rounded-3xl border border-[#30363d] shadow-xl">
            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-heading">
                <Clock className="w-4 h-4" />
                İlan Yayın Süresi *
              </span>
              <select
                value={formData.yayinSuresi}
                onChange={(e) => setFormData({ ...formData, yayinSuresi: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#21262d] border border-emerald-500/50 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="gunluk">📅 1 Günlük (24 Saat Yayın)</option>
                <option value="haftalik">📆 1 Haftalık (7 Gün Yayın)</option>
                <option value="aylik">🗓️ 1 Aylık (30 Gün Yayın)</option>
              </select>
            </label>
          </div>

          {/* İLAN BAŞLIĞI VE AÇIKLAMA */}
          <div className="flex flex-col gap-4 bg-[#161b22] p-5 rounded-3xl border border-[#30363d] shadow-xl">
            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              İlan Başlığı *
              <input
                type="text"
                required
                placeholder="Örn: İstanbul Beylikdüzü VIP Hizmet"
                value={formData.baslik}
                onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              Detaylı Açıklama *
              <textarea
                required
                rows={4}
                placeholder="İlanınızın detaylarını buraya yazın..."
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                className="px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
            </label>
          </div>

          {/* ÇOKLU FOTOĞRAF YÜKLEME ALANI (EN FAZLA 7 FOTOĞRAF) */}
          <div className="flex flex-col gap-4 bg-[#161b22] p-5 rounded-3xl border border-[#30363d] shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <ImageIcon className="w-4 h-4" />
                <span>Fotoğraf Yükleme (En Az 3, En Fazla 7 Resim) *</span>
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                photoUrls.length >= 3 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {photoUrls.length} / 7 Fotoğraf
              </span>
            </div>

            <p className="text-[11px] text-[#8b949e]">
              Galerinizden kendi fotoğraflarınızı seçip yükleyin (En az 3, en fazla 7 adet).
            </p>

            {/* DOSYA SEÇİM BUTONU */}
            {photoUrls.length < 7 ? (
              <label className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer transition-all text-center gap-2 group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Fotoğraflar Yükleniyor...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-white font-heading">
                        📱 Galeriden Kendi Fotoğraflarını Yükle
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                        {photoUrls.length === 0 ? 'En az 3 fotoğraf ekleyin' : `${7 - photoUrls.length} adet daha ekleyebilirsiniz`}
                      </span>
                    </div>
                  </>
                )}
              </label>
            ) : (
              <div className="p-4 rounded-2xl bg-[#21262d] border border-amber-500/40 text-center flex flex-col items-center gap-1">
                <span className="font-bold text-xs text-amber-400">Maksimum 7 Fotoğraf Yüklendi ✅</span>
                <span className="text-[10px] text-[#8b949e]">Yeni resim eklemek için mevcut fotoğraflardan birini silebilirsiniz.</span>
              </div>
            )}

            {/* KULLANICININ YÜKLEDİĞİ GERÇEK FOTOĞRAFLARIN LİSTESİ */}
            {photoUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mt-1">
                {photoUrls.map((url, idx) => {
                  const isCover = idx === coverPhotoIdx;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden border-2 flex flex-col justify-between p-2 h-36 bg-[#0d1117] ${isCover ? 'border-amber-400 shadow-lg shadow-amber-500/20' : 'border-[#30363d]'
                        }`}
                    >
                      <img src={url} alt={`Fotoğraf ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10" />

                      <div className="relative z-20 flex items-center justify-between">
                        {isCover ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md font-heading">
                            <Star className="w-3 h-3 fill-slate-950" />
                            Kapak
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCoverPhotoIdx(idx)}
                            className="px-2 py-0.5 rounded-lg bg-[#161b22]/90 text-amber-400 font-bold text-[10px] hover:bg-amber-500 hover:text-slate-950 transition-colors font-heading"
                          >
                            Kapak Yap
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removePhotoUrl(idx)}
                          className="p-1 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition-colors"
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
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#0d1117]/60 border border-dashed border-[#30363d]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e] font-semibold">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Örnek Görseller (Galerinizden kendi fotoğraflarınızı yükleyiniz):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
                  {existingSamplePhotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#21262d] border border-[#30363d] flex items-end p-1.5">
                      <img src={url} alt={`Örnek Görsel ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover grayscale" />
                      <span className="relative z-10 text-[9px] font-bold text-white bg-black/70 px-1 rounded">Örnek #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ŞEHİR & İLÇE SEÇİMİ */}
          <div className="flex flex-col gap-4 bg-[#161b22] p-5 rounded-3xl border border-[#30363d] shadow-xl">
            <h2 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <span>Bölge Seçimi</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                İl Seçin *
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
                  className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {turkeyProvinces.map((p) => (
                    <option key={p.ilSlug} value={p.ilSlug}>{p.il}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
                İlçe Seçin *
                <select
                  value={formData.ilceSlug}
                  onChange={(e) => setFormData({ ...formData, ilceSlug: e.target.value })}
                  className="px-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {selectedProvince.ilceler.map((d) => (
                    <option key={d.slug} value={d.slug}>{d.ad}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* WHATSAPP İLETİŞİM NUMARASI */}
          <div className="flex flex-col gap-4 bg-[#161b22] p-5 rounded-3xl border border-[#30363d] shadow-xl">
            <label className="flex flex-col gap-1.5 text-xs font-extrabold text-[#f0f6fc]">
              WhatsApp Telefon Numarası *
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="0532 000 00 00"
                  value={formData.whatsappNumara}
                  onChange={(e) => setFormData({ ...formData, whatsappNumara: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:outline-none focus:border-amber-400 transition-colors font-medium"
                />
                <Phone className="w-4 h-4 text-[#8b949e] absolute left-3 top-3.5" />
              </div>
            </label>
          </div>

          {/* BUTONLAR: GERİ DÖN & ONAYA GÖNDER */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-4 px-4 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-extrabold text-xs border border-[#363b42] transition-all flex items-center justify-center gap-1.5 font-heading"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Paket Değiştir</span>
            </button>

            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 font-heading uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? 'İlan Gönderiliyor...' : 'İlanı Onaya Gönder'}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>
      )}

    </div>
  );
}

