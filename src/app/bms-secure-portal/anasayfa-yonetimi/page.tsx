'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Crown,
  Check,
  X,
  Search,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  Megaphone,
  Layers,
  ArrowRight,
  Flame,
  ExternalLink,
  ChevronRight,
  Globe,
  Radio,
  Clock,
  CheckCheck,
  Phone,
  Eye,
  Tv,
  Info,
  Calendar,
  DollarSign,
  Film,
  Link2,
  PlayCircle,
  AtSign,
  KeyRound
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

interface TickerItem {
  badge: string;
  text: string;
  link: string;
}

interface SpecialAdEntry {
  _id?: string;
  aktif: boolean;
  ilanId: string | null;
  hedefIlSlug: string;
  gecikmeSaniye: number;
  rozet: string;
}

export interface BosVitrinSlide {
  _id?: string;
  gifUrl: string;
  topBadge: string;
  trafficBadge: string;
  title: string;
  spot: string;
  aktif: boolean;
}

const PRESET_GIF_SUGGESTIONS = [
  {
    name: 'Barbara Palvin Lingerie GIF',
    url: 'https://media.tenor.com/vDokuclgktwAAAAd/barbara-palvin-lingerie.gif',
    topBadge: '🔥 GÜNDE 50.000+ CANLI MÜŞTERİ',
    trafficBadge: '💎 EN ÇOK KAZANDIRAN ALAN',
    title: 'Zirvede Yerini Al, Telefonun Gece Gündüz Çalsın!',
    spot: 'Türkiye\'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.',
  },
  {
    name: 'Tumblr Glamour GIF',
    url: 'https://64.media.tumblr.com/8c1cf789da9ba9a6cca6ee396f6f2dc7/0ed1f7c7e2c38e0a-dc/s500x750/6924e4454a9f477b6d1eaddaf38cb52a1917c51d.gif',
    topBadge: '👑 VIP VİTRİN İLE KAZANCINI KATLA',
    trafficBadge: '⚡ ANINDA MÜŞTERİ AKIŞI',
    title: 'Günde 50.000 Canlı Ziyaretçi Doğrudan Seni Görsün!',
    spot: 'Sayfaya giren herkesin ilk gördüğü dev vitrinde yerini ayırt. Komisyonsuz, doğrudan ve anında randevularını doldur.',
  },
  {
    name: 'Booty Bounce GIF',
    url: 'https://i.looksmax.org/attachments/2022/12/3217147_booty-bounce-2.gif',
    topBadge: '💎 LÜKS & SEÇKİN PRESTİJ',
    trafficBadge: '🔥 %100 GERÇEK MÜŞTERİ',
    title: 'Bu Vitrinde Parlayın, En Çok Kazanan Siz Olun!',
    spot: 'Rakiplerinin önüne geç, anasayfanın 1 numaralı vitrinine yerleş. Saatlerce müşteri aramak yerine müşteriler sana yazsın.',
  },
  {
    name: 'Asian Model GIF',
    url: 'https://media.tenor.com/7rtlPza-UqcAAAAM/asian.gif',
    topBadge: '⚡ ANINDA RANDEVU DOLDURMA',
    trafficBadge: '🚀 GOOGLE & ARAMA LİDERİ',
    title: 'Vitrine Sabitlenin, Müşteri Mesajlarına Yetişemeyin!',
    spot: 'Best Eskort VIP vitrini ile tüm şehirden gelen elit müşterilere ilk sırada ulaşın. WhatsApp randevu trafiğinizi hemen katlayın.',
  },
  {
    name: 'Sexy Girl Lingerie GIF',
    url: 'https://media.tenor.com/UpyRgPYevTMAAAAM/sexy-girl.gif',
    topBadge: '👑 SINIRSIZ GÖRÜNTÜLENME & GÜÇ',
    trafficBadge: '🌟 VIP ÖZEL AYRICALIK',
    title: 'İlanınızı Vitrine Taşıyın, Zirvenin Keyfini Çıkarın!',
    spot: 'Tek tıkla vitrinde yerinizi alın, profesyonel reklam avantajıyla sınırsız kazanç ve maksimum görünürlük elde edin.',
  },
];

const POPULAR_CITIES = [
  { slug: 'tum_turkiye', ad: '🇹🇷 TÜRKİYE GENELİ (Tüm Şehirler & Anasayfa)' },
  { slug: 'istanbul', ad: '📍 İSTANBUL (Tüm İlçeler)' },
  { slug: 'ankara', ad: '📍 ANKARA' },
  { slug: 'izmir', ad: '📍 İZMİR' },
  { slug: 'antalya', ad: '📍 ANTALYA' },
  { slug: 'bursa', ad: '📍 BURSA' },
  { slug: 'adana', ad: '📍 ADANA' },
  { slug: 'eskisehir', ad: '📍 ESKİŞEHİR' },
  { slug: 'gaziantep', ad: '📍 GAZİANTEP' },
  { slug: 'kocaeli', ad: '📍 KOCAELİ' },
  { slug: 'mugla', ad: '📍 MUĞLA (Bodrum/Marmaris/Fethiye)' },
];

export default function AdminHomepageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAd, setSavingAd] = useState(false);
  const [savingGifs, setSavingGifs] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');
  const [bannerMetin, setBannerMetin] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerRozet, setBannerRozet] = useState('👑 VIP DUYURU');
  const [bannerAktif, setBannerAktif] = useState(true);

  // Rotating Ticker Announcements
  const [duyurular, setDuyurular] = useState<TickerItem[]>([
    { badge: '👑 LİDER REHBER', text: '81 İl ve İlçede Türkiye\'nin En Büyük İlan Platformu', link: '/ilan-ver' },
    { badge: '🔥 ANINDA MÜŞTERİ', text: 'İlan Verin, WhatsApp ile Müşterilere Ulaşın!', link: '/ilan-ver' },
    { badge: '💎 VIP VİTRİN', text: 'Google Aramalarında En Üst Sırada Yer Alın', link: '/ilan-ver' },
    { badge: '⚡ CANLI DESTEK', text: '%100 Güvenli & 7/24 Canlı Müşteri Desteği', link: '/chat' },
  ]);

  // Vitrin Boşken Dönecek GIF Havuzu
  const [bosVitrinSliderlar, setBosVitrinSliderlar] = useState<BosVitrinSlide[]>([]);

  // New GIF Form State
  const [newGifUrl, setNewGifUrl] = useState<string>('');
  const [newGifTopBadge, setNewGifTopBadge] = useState<string>('🔥 VİTRİNDE YERİNİZİ ALIN');
  const [newGifTrafficBadge, setNewGifTrafficBadge] = useState<string>('Günde 50.000+ Canlı Müşteri');
  const [newGifTitle, setNewGifTitle] = useState<string>('İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!');
  const [newGifSpot, setNewGifSpot] = useState<string>('Best Eskort VIP Vitrini İle Kazancınızı Katlayın!');

  // Multiple Special Ads State (Çoklu Sponsorlu Popup Reklamları)
  const [ozelIlanReklamlar, setOzelIlanReklamlar] = useState<SpecialAdEntry[]>([]);

  // New Ad Form State
  const [newAdIlanId, setNewAdIlanId] = useState<string>('');
  const [newAdHedefIl, setNewAdHedefIl] = useState<string>('tum_turkiye');
  const [newAdRozet, setNewAdRozet] = useState<string>('🔥 GÜNÜN ÖZEL VIP İLANI');
  const [newAdGecikme, setNewAdGecikme] = useState<number>(4);

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'vip' | 'gold' | 'selected'>('all');
  const [onayMasasiTab, setOnayMasasiTab] = useState<'talepler' | 'vip' | 'tumu'>('talepler');

  const selectedListingForAd = allListings.find((l) => l._id === newAdIlanId);

  // Vitrin talebi olan (satın almış veya bekleyen) ilanlar
  const vitrinRequests = useMemo(() => {
    return allListings.filter((l) => Boolean(l.vitrinIstegi));
  }, [allListings]);

  // VIP & UltraVIP İlanlar
  const vipListings = useMemo(() => {
    return allListings.filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip');
  }, [allListings]);

  // Onay Masasında Gösterilecek İlanlar
  const displayedOnayListings = useMemo(() => {
    if (onayMasasiTab === 'vip') return vipListings;
    if (onayMasasiTab === 'tumu') return allListings;
    return vitrinRequests;
  }, [onayMasasiTab, vipListings, allListings, vitrinRequests]);

  useEffect(() => {
    fetchConfig(true);
    const interval = setInterval(() => {
      fetchConfig(false);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/admin/homepage-config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.config) {
        setHeroBaslik(data.config.hero?.baslik || 'Türkiye\'nin En Güvenilir VIP Eskort İlan Platformu');
        setHeroAltBaslik(data.config.hero?.altBaslik || '81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.');
        setBannerMetin(data.config.aktifBanner?.metin || '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!');
        setBannerLink(data.config.aktifBanner?.link || '/ilan-ver');
        setBannerRozet(data.config.aktifBanner?.rozet || '👑 VIP DUYURU');
        setBannerAktif(data.config.aktifBanner?.aktif ?? true);

        // Multi-ad array loading
        if (Array.isArray(data.config.ozelIlanReklamlar) && data.config.ozelIlanReklamlar.length > 0) {
          setOzelIlanReklamlar(data.config.ozelIlanReklamlar);
        } else if (data.config.ozelIlanReklam?.ilanId) {
          setOzelIlanReklamlar([
            {
              _id: 'ad_legacy',
              aktif: data.config.ozelIlanReklam.aktif ?? true,
              ilanId: data.config.ozelIlanReklam.ilanId.toString(),
              hedefIlSlug: data.config.ozelIlanReklam.hedefIlSlug || 'tum_turkiye',
              gecikmeSaniye: data.config.ozelIlanReklam.gecikmeSaniye || 4,
              rozet: data.config.ozelIlanReklam.rozet || '🔥 GÜNÜN ÖZEL VIP İLANI',
            }
          ]);
        }

        if (Array.isArray(data.config.duyurular) && data.config.duyurular.length > 0) {
          setDuyurular(data.config.duyurular);
        }

        if (Array.isArray(data.config.bosVitrinSliderlar) && data.config.bosVitrinSliderlar.length > 0) {
          setBosVitrinSliderlar(data.config.bosVitrinSliderlar);
        } else {
          setBosVitrinSliderlar(PRESET_GIF_SUGGESTIONS.map((p, idx) => ({
            _id: `promo-${idx + 1}`,
            gifUrl: p.url,
            topBadge: p.topBadge,
            trafficBadge: p.trafficBadge,
            title: p.title,
            spot: p.spot,
            aktif: true,
          })));
        }

        const rawIds = data.config.sliderIlanIds || [];
        setSelectedListingIds(rawIds.map((id: any) => (id?._id ? id._id.toString() : (id?.toString ? id.toString() : String(id)))));
      }
      if (data.allListings) {
        setAllListings(data.allListings);
      }
      if (data.allLocations) {
        setAllLocations(data.allLocations);
      }
    } catch (e) {
      // Silent
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Realtime countdown timer state
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const formatVitrinCountdown = (bitisTarihiStr: string | null | undefined) => {
    if (!bitisTarihiStr) return { text: 'Süresiz / Belirlenmedi', expired: false, color: 'text-amber-400', badgeBg: 'bg-amber-500/10 border-amber-500/30' };
    const bitisTime = new Date(bitisTarihiStr).getTime();
    const diff = bitisTime - currentTime;
    if (diff <= 0) return { text: 'Süresi Doldu (Vitrinden Düştü)', expired: true, color: 'text-red-400', badgeBg: 'bg-red-500/10 border-red-500/30' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text = '';
    if (days > 0) text += `${days}g `;
    text += `${hours}s ${mins}dk`;
    return {
      text: `⏱️ Kalan: ${text}`,
      expired: false,
      color: days > 0 ? 'text-emerald-400' : 'text-amber-300',
      badgeBg: days > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
    };
  };

  // ── GIF HAVUZU YÖNETİMİ FONKSİYONLARI ──
  const saveGifsToDb = async (newGifs: BosVitrinSlide[]) => {
    setSavingGifs(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bosVitrinSliderlar: newGifs,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.config?.bosVitrinSliderlar) {
          setBosVitrinSliderlar(data.config.bosVitrinSliderlar);
        }
        setMessage({ type: 'success', text: `✅ GIF havuzu güncellendi (${newGifs.filter(g => g.aktif !== false).length} aktif GIF anasayfada dönecek)!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'GIF havuzu kaydedilemedi.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'GIF havuzu kaydedilemedi.' });
    } finally {
      setSavingGifs(false);
    }
  };

  const handleAddNewGifSlide = async () => {
    const trimmedUrl = newGifUrl.trim();
    if (!trimmedUrl) {
      alert('Lütfen geçerli bir GIF resim URL adresi girin.');
      return;
    }
    const newSlide: BosVitrinSlide = {
      _id: 'promo-' + Date.now(),
      gifUrl: trimmedUrl,
      topBadge: newGifTopBadge.trim() || '🔥 VİTRİNDE YERİNİZİ ALIN',
      trafficBadge: newGifTrafficBadge.trim() || 'Günde 50.000+ Canlı Müşteri',
      title: newGifTitle.trim() || 'İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!',
      spot: newGifSpot.trim() || 'Best Eskort VIP Vitrini İle Kazancınızı Katlayın!',
      aktif: true,
    };
    const updated = [...bosVitrinSliderlar, newSlide];
    setBosVitrinSliderlar(updated);
    setNewGifUrl('');
    await saveGifsToDb(updated);
  };

  const handleAddPresetGif = async (preset: typeof PRESET_GIF_SUGGESTIONS[0]) => {
    const newSlide: BosVitrinSlide = {
      _id: 'promo-' + Date.now(),
      gifUrl: preset.url,
      topBadge: preset.topBadge,
      trafficBadge: preset.trafficBadge,
      title: preset.title,
      spot: preset.spot,
      aktif: true,
    };
    const updated = [...bosVitrinSliderlar, newSlide];
    setBosVitrinSliderlar(updated);
    await saveGifsToDb(updated);
  };

  const handleToggleGifActive = async (index: number) => {
    const updated = bosVitrinSliderlar.map((item, idx) => {
      if (idx === index) {
        const isCurrentActive = item.aktif !== false;
        return { ...item, aktif: !isCurrentActive };
      }
      return { ...item };
    });
    setBosVitrinSliderlar(updated);
    await saveGifsToDb(updated);
  };

  const handleToggleAllGifs = async (activate: boolean) => {
    const updated = bosVitrinSliderlar.map(slide => ({ ...slide, aktif: activate }));
    setBosVitrinSliderlar(updated);
    await saveGifsToDb(updated);
  };

  const handleRemoveGifSlide = async (index: number) => {
    const updated = bosVitrinSliderlar.filter((_, i) => i !== index);
    setBosVitrinSliderlar(updated);
    await saveGifsToDb(updated);
  };

  const handleUpdateGifSlide = (index: number, field: keyof BosVitrinSlide, value: any) => {
    const updated = [...bosVitrinSliderlar];
    updated[index] = { ...updated[index], [field]: value };
    setBosVitrinSliderlar(updated);
  };

  const handleSaveGifsOnly = async () => {
    await saveGifsToDb(bosVitrinSliderlar);
  };

  // Vitrine Süre Belirleyerek Onaylama
  const handleApproveWithDuration = async (listingId: string, days: number = 1, paketi: 'gunluk' | 'haftalik' = 'gunluk') => {
    if (selectedListingIds.length >= 5 && !selectedListingIds.includes(listingId)) {
      alert('Anasayfa vitrini maksimum 5 slot kapasitesine sahiptir. Lütfen önce mevcut vitrinden bir ilanı çıkarın.');
      return;
    }
    setActionLoadingId(listingId);
    try {
      const nextSelected = Array.from(new Set([...selectedListingIds, listingId])).slice(0, 5);
      setSelectedListingIds(nextSelected);

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignVitrinDuration: {
            listingId,
            days,
            paketi
          }
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `✅ İlan ${days === 1 ? '1 Günlük (24 Saat)' : days + ' Günlük'} olarak VIP Vitrine eklendi ve kullanıcıya onay mesajı gönderildi!`
        });
        fetchConfig(false);
      } else {
        setMessage({ type: 'error', text: 'Vitrin onaylanırken hata oluştu.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Vitrin Süresini Uzatma
  const handleExtendDuration = async (listingId: string, extraDays: number) => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extendVitrinDuration: {
            listingId,
            extraDays
          }
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Vitrin süresi +${extraDays} gün uzatıldı!` });
        fetchConfig(false);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Süre uzatılamadı.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleListing = (id: string) => {
    setSelectedListingIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 5) {
        alert('Anasayfa vitrini maksimum 5 slot kapasitesine sahiptir. Yeni ilan eklemek için önce seçili bir ilanı çıkarınız.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSelectAllVip = () => {
    const vipIds = allListings
      .filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip')
      .map((l) => l._id.toString())
      .slice(0, 5);
    setSelectedListingIds(vipIds);
  };

  // Vitrin Seçimlerini Anında Kaydet
  const handleSaveShowcaseOnly = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const limitedIds = selectedListingIds.slice(0, 5);
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderIlanIds: limitedIds,
        }),
      });
      if (res.ok) {
        setMessage({
          type: 'success',
          text: limitedIds.length === 0
            ? '✅ Vitrin seçimleri temizlendi! Anasayfada 5 slotun tamamında otomatik GIF REKLAM ALANI devreye alındı.'
            : `✅ Vitrin kaydedildi (${limitedIds.length}/5 Slot Canlı İlan, ${5 - limitedIds.length} Slot Boş Reklam dönecek)!`,
        });
        fetchConfig(false);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Vitrin kaydedilemedi.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Bağlantı hatası' });
    } finally {
      setSaving(false);
    }
  };

  // Vitrin seçimlerini anında sıfırla ve veritabanına kaydet
  const handleClearShowcase = async () => {
    setSelectedListingIds([]);
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderIlanIds: [],
        }),
      });
      if (res.ok) {
        setMessage({
          type: 'success',
          text: '✅ Tüm vitrin ilanları temizlendi! Anasayfadaki 5 slotun tamamında GIF reklam havuzu devreye girdi.',
        });
        fetchConfig(false);
      } else {
        setMessage({ type: 'error', text: 'Vitrin temizlenirken bir hata oluştu.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Bağlantı hatası' });
    } finally {
      setSaving(false);
    }
  };

  // Seçili yatay bardan tek tek silme ve anında veritabanına kaydetme
  const handleRemoveShowcaseItem = async (id: string) => {
    const nextSelected = selectedListingIds.filter((item) => item !== id);
    setSelectedListingIds(nextSelected);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderIlanIds: nextSelected,
        }),
      });
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `✅ İlan vitrinden çıkarıldı (${nextSelected.length}/5 Slot Dolu, ${5 - nextSelected.length} Slot Boş Reklam Dönecek).`,
        });
        fetchConfig(false);
      }
    } catch (e) {
      // silent
    }
  };

  // Vitrin Onaylama & Tek Tıkla Slider'a Ekleme
  const handleApproveAndAddToVitrin = async (listingId: string) => {
    if (selectedListingIds.length >= 5 && !selectedListingIds.includes(listingId)) {
      alert('Anasayfa vitrini maksimum 5 slot kapasitesine sahiptir. Lütfen önce mevcut vitrinden bir ilanı çıkarın.');
      return;
    }
    setActionLoadingId(listingId);
    try {
      const nextSelected = Array.from(new Set([...selectedListingIds, listingId])).slice(0, 5);
      setSelectedListingIds(nextSelected);

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderIlanIds: nextSelected,
          approveVitrinListingId: listingId,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ İlan vitrine onaylandı (${nextSelected.length}/5 Slot Dolu, ${5 - nextSelected.length} Slot Boş Reklam Dönecek)!` });
        fetchConfig(false);
      } else {
        setMessage({ type: 'error', text: 'Vitrin onaylanırken bir hata oluştu.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Vitrinden Çıkarma & Vitrin İsteğini Sıfırlama
  const handleRemoveFromVitrin = async (listingId: string) => {
    setActionLoadingId(listingId);
    try {
      const nextSelected = selectedListingIds.filter((id) => id !== listingId);
      setSelectedListingIds(nextSelected);

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliderIlanIds: nextSelected,
          rejectVitrinListingId: listingId,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'İlan vitrinden çıkarıldı ve vitrin talebi kaldırıldı.' });
        fetchConfig();
      } else {
        setMessage({ type: 'error', text: 'İşlem gerçekleştirilemedi.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddAnnouncement = () => {
    setDuyurular([...duyurular, { badge: '⭐ DUYURU', text: 'Yeni kampanya duyurusu...', link: '/ilan-ver' }]);
  };

  const handleRemoveAnnouncement = (index: number) => {
    setDuyurular(duyurular.filter((_, i) => i !== index));
  };

  const handleUpdateAnnouncement = (index: number, field: keyof TickerItem, value: string) => {
    const updated = [...duyurular];
    updated[index] = { ...updated[index], [field]: value };
    setDuyurular(updated);
  };

  // ── ÇOKLU ÖZEL REKLAM YÖNETİMİ FONKSİYONLARI ──
  const handleAddNewSpecialAd = () => {
    if (!newAdIlanId) {
      alert('Lütfen popup olarak gösterilecek bir ilan seçin.');
      return;
    }

    const newAd: SpecialAdEntry = {
      _id: 'ad_' + Date.now(),
      aktif: true,
      ilanId: newAdIlanId,
      hedefIlSlug: newAdHedefIl,
      gecikmeSaniye: newAdGecikme,
      rozet: newAdRozet,
    };

    setOzelIlanReklamlar([newAd, ...ozelIlanReklamlar]);
    setNewAdIlanId('');
  };

  const handleToggleAdActive = (index: number) => {
    const updated = [...ozelIlanReklamlar];
    updated[index].aktif = !updated[index].aktif;
    setOzelIlanReklamlar(updated);
  };

  const handleRemoveSpecialAd = (index: number) => {
    setOzelIlanReklamlar(ozelIlanReklamlar.filter((_, i) => i !== index));
  };

  const handleSaveSpecialAdsOnly = async () => {
    setSavingAd(true);
    setMessage(null);
    try {
      const topActive = ozelIlanReklamlar.find((a) => a.aktif) || ozelIlanReklamlar[0] || null;

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBaslik,
          heroAltBaslik,
          bannerMetin,
          bannerLink,
          bannerAktif,
          bannerRozet,
          duyurular,
          sliderIlanIds: selectedListingIds,
          ozelIlanReklamlar,
          ozelIlanReklam: topActive ? {
            aktif: topActive.aktif,
            ilanId: topActive.ilanId,
            hedefIlSlug: topActive.hedefIlSlug,
            gecikmeSaniye: topActive.gecikmeSaniye,
            rozet: topActive.rozet,
          } : { aktif: false },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Tüm özel reklamlar (${ozelIlanReklamlar.length} Adet) başarıyla kaydedildi ve yayına alındı!` });
        fetchConfig();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Özel reklamlar kaydedilemedi.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Bağlantı hatası' });
    } finally {
      setSavingAd(false);
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const topActive = ozelIlanReklamlar.find((a) => a.aktif) || ozelIlanReklamlar[0] || null;

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBaslik,
          heroAltBaslik,
          bannerMetin,
          bannerLink,
          bannerAktif,
          bannerRozet,
          duyurular,
          sliderIlanIds: selectedListingIds,
          ozelIlanReklamlar,
          bosVitrinSliderlar,
          ozelIlanReklam: topActive ? {
            aktif: topActive.aktif,
            ilanId: topActive.ilanId,
            hedefIlSlug: topActive.hedefIlSlug,
            gecikmeSaniye: topActive.gecikmeSaniye,
            rozet: topActive.rozet,
          } : { aktif: false },
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: selectedListingIds.length === 0
            ? 'Vitrin seçimleri temizlendi! Anasayfada otomatik VIP REKLAM ALANI devreye alındı.'
            : `Tüm anasayfa ayarları ve ${selectedListingIds.length} adet vitrin ilanı başarıyla kaydedildi!`
        });
        fetchConfig();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Ayarlar güncellenirken bir hata oluştu.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredListings = allListings.filter((l) => {
    if (listingFilter === 'vip' && l.rozet !== 'vip' && l.rozet !== 'ultravip') return false;
    if (listingFilter === 'gold' && l.rozet !== 'gold') return false;
    if (listingFilter === 'selected' && !selectedListingIds.includes(l._id.toString())) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.baslik?.toLowerCase().includes(term) ||
      l.ilSlug?.toLowerCase().includes(term) ||
      l.ilceSlug?.toLowerCase().includes(term)
    );
  });

  const getListingById = (id: string | null) => {
    if (!id) return null;
    return allListings.find((l) => l._id.toString() === id.toString()) || null;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left pb-16">

      {/* ── ÜST DASHBOARD HEADER & CANLI METRİKLER ──────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#161b22] via-[#12161c] to-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl text-white font-heading">
                  Anasayfa, Vitrin &amp; Reklam Yönetim Merkezi
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                  SaaS Control
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Vitrin onay masası, üst slider rotasyonu, sponsorlu popup reklamları ve 81 il hedefleme matrisi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => fetchConfig(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-md"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs uppercase font-heading shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[2.5]" />}
              <span>{saving ? 'Kaydediliyor...' : 'Tümünü Kaydet & Yayına Al'}</span>
            </button>
          </div>
        </div>

        {/* Canlı Durum Kartları / Sayaçlar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5 text-xs">
          {/* 1. Vitrinde Yayında */}
          <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8b949e]">Vitrinde Yayında</span>
              <span className="text-sm sm:text-base font-black text-white font-mono">{selectedListingIds.length} İlan</span>
            </div>
          </div>

          {/* 2. Onay Bekleyen Vitrinler */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${vitrinRequests.length > 0
              ? 'bg-amber-500/10 border-amber-500/40 animate-pulse'
              : 'bg-[#0d1117] border-[#21262d]'
            }`}>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8b949e]">Vitrin Talepleri</span>
              <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
                {vitrinRequests.length} Talep
              </span>
            </div>
          </div>

          {/* 3. Aktif Popup Reklamlar */}
          <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8b949e]">Popup Reklamları</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                {ozelIlanReklamlar.filter((a) => a.aktif).length} Aktif
              </span>
            </div>
          </div>

          {/* 4. Canlı Anasayfa Durumu */}
          <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${selectedListingIds.length > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
              }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8b949e]">Anasayfa Üst Modu</span>
              <span className={`text-xs font-black truncate font-heading ${selectedListingIds.length > 0 ? 'text-amber-400' : 'text-purple-300'
                }`}>
                {selectedListingIds.length > 0 ? '👑 İlan Vitrini' : '📢 VIP Reklam Alanı'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg'
            : 'bg-red-500/10 border border-red-500/30 text-red-400 shadow-lg'
          }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── 2 SÜTUNLU GENİŞ WEB DASHBOARD DÜZENİ ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ══════════════════════════════════════════════════════════════
            SOL SÜTUN (KOLON 7-8): VİTRİN ONAY MASASI & SLIDER HAVUZU & HERO
           ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

          {/* ── 1. VİTRİN TALEPLERİ & ONAY MASASI (BEKLEYENLER) ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-amber-500/50 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Crown className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-white font-heading">
                      Vitrin Talepleri &amp; Onay Masası
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase font-mono">
                      {displayedOnayListings.length} İlan Listeleniyor
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e]">
                    Vitrin paketi talep edenleri veya tüm VIP profilleri buradan tek tıkla inceleyip anasayfa vitrinine ekleyebilirsiniz.
                  </p>
                </div>
              </div>

              {/* Filtre Tabları */}
              <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-xl border border-[#30363d] self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setOnayMasasiTab('talepler')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${onayMasasiTab === 'talepler'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-[#8b949e] hover:text-white'
                    }`}
                >
                  🔥 Talepler ({vitrinRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOnayMasasiTab('vip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${onayMasasiTab === 'vip'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-[#8b949e] hover:text-white'
                    }`}
                >
                  👑 VIP İlanlar ({vipListings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOnayMasasiTab('tumu')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${onayMasasiTab === 'tumu'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-[#8b949e] hover:text-white'
                    }`}
                >
                  Tümü ({allListings.length})
                </button>
              </div>
            </div>

            {/* Vitrin İstek Listesi */}
            {displayedOnayListings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0d1117] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-9 h-9 text-emerald-400/80" />
                <span className="font-bold text-sm text-white">Şu anda onay bekleyen yeni vitrin talebi bulunmuyor.</span>
                <p className="text-xs text-[#8b949e] max-w-md">
                  Kullanıcılar ilan verirken vitrin talep ettiğinde veya panelimden satın aldığında burada anında listelenir. Dilerseniz mevcut VIP ilanları doğrudan vitrine ekleyebilirsiniz:
                </p>
                <button
                  type="button"
                  onClick={() => setOnayMasasiTab('vip')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 mt-1"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>VIP İlanları Görüntüle ({vipListings.length})</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {displayedOnayListings.map((reqListing) => {
                  const isAlreadyInVitrin = selectedListingIds.includes(reqListing._id.toString());
                  const isLoadingAction = actionLoadingId === reqListing._id.toString();

                  return (
                    <div
                      key={reqListing._id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isAlreadyInVitrin
                          ? 'bg-[#0d1117] border-emerald-500/40 shadow-sm'
                          : 'bg-[#0d1117] border-amber-500/60 shadow-lg shadow-amber-500/5'
                        }`}
                    >
                      {/* İlan Bilgisi */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                          <Image
                            src={reqListing.anaFotograf?.url || reqListing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                            alt={reqListing.baslik}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-white truncate font-heading">
                              {reqListing.baslik}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                              {reqListing.rozet?.toUpperCase() || 'VIP'}
                            </span>
                            {isAlreadyInVitrin ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                                ● Vitrinde Yayında
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[9px] font-bold flex items-center gap-1">
                                  ⏳ Onay Bekliyor
                                </span>
                                {reqListing.vitrinPaketi === 'haftalik' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white font-black text-[10px] uppercase font-mono shadow-md flex items-center gap-1 animate-pulse">
                                    👑 HAFTALIK VIP (6.000 ₺) TALEP EDİLDİ
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[10px] uppercase font-mono shadow-md flex items-center gap-1 animate-pulse">
                                    ⚡ GÜNLÜK (2.000 ₺) TALEP EDİLDİ
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 text-[11px] text-[#8b949e] mt-1.5 flex-wrap">
                            {reqListing.kullaniciAdi ? (
                              <span className="flex items-center gap-1 text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25" title="Kullanıcı Adı">
                                <AtSign className="w-3 h-3 text-amber-400" />
                                <span>{reqListing.kullaniciAdi}</span>
                              </span>
                            ) : (
                              <span className="text-[#8b949e] text-[10px] font-mono">@sahipsiz</span>
                            )}
                            <span className="flex items-center gap-1 text-white/80">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              <span className="capitalize">{reqListing.ilSlug} / {reqListing.ilceSlug}</span>
                            </span>
                            {reqListing.whatsappNumara && (
                              <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                                <Phone className="w-3 h-3" />
                                <span>{reqListing.whatsappNumara}</span>
                              </span>
                            )}
                            {reqListing.panelSifresi && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[#0d1117] text-amber-300 font-mono font-bold border border-amber-500/30 text-[10px] flex items-center gap-1">
                                <KeyRound className="w-2.5 h-2.5 text-amber-400" />
                                <span>Şifre: {reqListing.panelSifresi}</span>
                              </span>
                            )}
                            {/* Vitrin Kalan Süre Rozeti */}
                            {reqListing.vitrinBitisTarihi && (
                              <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${formatVitrinCountdown(reqListing.vitrinBitisTarihi).badgeBg} ${formatVitrinCountdown(reqListing.vitrinBitisTarihi).color}`}>
                                {formatVitrinCountdown(reqListing.vitrinBitisTarihi).text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#30363d] flex-wrap">
                        <Link
                          href={`/ilan/${reqListing.slug}`}
                          target="_blank"
                          className="p-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition-colors"
                          title="İlanı Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {isAlreadyInVitrin ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleExtendDuration(reqListing._id.toString(), 1)}
                              disabled={isLoadingAction}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-black transition-all border border-amber-500/30"
                              title="Vitrin süresine +1 Gün ekle"
                            >
                              +1 Gün
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExtendDuration(reqListing._id.toString(), 7)}
                              disabled={isLoadingAction}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-black transition-all border border-amber-500/30"
                              title="Vitrin süresine +7 Gün ekle"
                            >
                              +7 Gün
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromVitrin(reqListing._id.toString())}
                              disabled={isLoadingAction}
                              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                            >
                              {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                              <span>Çıkar</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Günlük Onay Butonu */}
                            <button
                              type="button"
                              onClick={() => handleApproveWithDuration(reqListing._id.toString(), 1, 'gunluk')}
                              disabled={isLoadingAction}
                              className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${reqListing.vitrinPaketi === 'gunluk'
                                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30 scale-105'
                                  : 'bg-[#21262d] hover:bg-[#30363d] text-amber-300 border border-[#30363d]'
                                }`}
                            >
                              {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              <span>👑 1 Günlük Onayla (2.000 ₺)</span>
                            </button>

                            {/* Haftalık Onay Butonu */}
                            <button
                              type="button"
                              onClick={() => handleApproveWithDuration(reqListing._id.toString(), 7, 'haftalik')}
                              disabled={isLoadingAction}
                              className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${reqListing.vitrinPaketi === 'haftalik'
                                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white ring-2 ring-purple-300 shadow-purple-500/30 scale-105'
                                  : 'bg-[#21262d] hover:bg-[#30363d] text-purple-300 border border-[#30363d]'
                                }`}
                            >
                              {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                              <span>💎 1 Haftalık Onayla (6.000 ₺)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromVitrin(reqListing._id.toString())}
                              disabled={isLoadingAction}
                              className="p-2.5 rounded-xl bg-[#21262d] hover:bg-red-500/20 text-[#8b949e] hover:text-red-400 border border-[#30363d] transition-colors"
                              title="Vitrin Talebini Reddet"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 2. VİTRİN BOŞKEN DÖNECEK VIP GIF & REKLAM HAVUZU YÖNETİMİ ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-purple-500/40 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-black shadow-md">
                  <Film className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-white font-heading">
                      Vitrin Boşken Dönecek VIP GIF &amp; Reklam Havuzu
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-black text-[10px] uppercase font-mono border border-purple-500/30">
                      {bosVitrinSliderlar.filter(s => s.aktif).length} / {bosVitrinSliderlar.length} Aktif
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e]">
                    Vitrinde canlı ilan yokken anasayfanın tepesinde dönecek hareketli GIF&apos;leri, profesyonel sloganları ve rozetleri yönetin. İstediğiniz GIF URL&apos;sini ekleyin, düzenleyin veya silin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGifsOnly}
                disabled={savingGifs}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase font-heading transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
              >
                {savingGifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{savingGifs ? 'Kaydediliyor...' : 'GIF Havuzunu Kaydet'}</span>
              </button>
            </div>

            {/* Yeni GIF Ekleme Kartı */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-purple-500/30 flex flex-col gap-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>Yeni GIF &amp; Vitrin Reklamı Ekle</span>
                </span>
                <span className="text-[10px] text-[#8b949e] font-mono">Tenor / Giphy / Tumblr / Görsel Linki Desteklenir</span>
              </div>

              {/* Form Alanları */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* Sol: URL ve Canlı Önizleme */}
                <div className="md:col-span-6 flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#8b949e] flex items-center justify-between">
                    <span>GIF Resim URL Adresi *</span>
                    {newGifUrl && <span className="text-emerald-400 text-[10px]">✓ Önizleme aktif</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newGifUrl}
                      onChange={(e) => setNewGifUrl(e.target.value)}
                      placeholder="https://media.tenor.com/.../example.gif"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                    />
                    <Link2 className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
                  </div>

                  {/* Canlı GIF Önizleme Mini Kutusu */}
                  {newGifUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-black border border-purple-500/40 mt-1">
                      <Image
                        src={newGifUrl}
                        alt="Yeni GIF Önizleme"
                        fill
                        unoptimized
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                        <span className="text-[10px] text-white font-bold truncate">Canlı Önizleme</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sağ: Rozetler ve Başlık */}
                <div className="md:col-span-6 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                      Üst Rozet
                      <input
                        type="text"
                        value={newGifTopBadge}
                        onChange={(e) => setNewGifTopBadge(e.target.value)}
                        placeholder="🔥 VİTRİNDE YERİNİZİ ALIN"
                        className="px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                      Trafik Rozeti
                      <input
                        type="text"
                        value={newGifTrafficBadge}
                        onChange={(e) => setNewGifTrafficBadge(e.target.value)}
                        placeholder="Günde 50.000+ Canlı Müşteri"
                        className="px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    Ana Slogan / Başlık
                    <input
                      type="text"
                      value={newGifTitle}
                      onChange={(e) => setNewGifTitle(e.target.value)}
                      placeholder="İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!"
                      className="px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-bold text-[#8b949e]">
                    Alt Açıklama Spotu
                    <input
                      type="text"
                      value={newGifSpot}
                      onChange={(e) => setNewGifSpot(e.target.value)}
                      placeholder="Best Eskort VIP Vitrini İle Kazancınızı Katlayın!"
                      className="px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Tek Tıkla Hazır Önerilen GIF'leri Ekleme */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#8b949e] font-bold uppercase">Hızlı Ekle:</span>
                  {PRESET_GIF_SUGGESTIONS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddPresetGif(preset)}
                      className="px-2 py-1 rounded-lg bg-[#161b22] hover:bg-purple-950/60 border border-[#30363d] hover:border-purple-400 text-[#c9d1d9] hover:text-purple-300 text-[10px] font-medium transition-all"
                      title={preset.url}
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddNewGifSlide}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs uppercase font-heading flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>GIF&apos;i Havuza Ekle</span>
                </button>
              </div>
            </div>

            {/* Mevcut GIF Havuzu Listesi */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider font-heading">
                    Tanımlı GIF Slider Listesi ({bosVitrinSliderlar.length})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    {bosVitrinSliderlar.filter(s => s.aktif !== false).length} Yayında
                  </span>
                </div>

                {/* Hızlı Toplu Kontrol */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAllGifs(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[10px] font-black uppercase transition-all border border-emerald-500/30"
                  >
                    ✓ Tümünü Aktif Et
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllGifs(false)}
                    className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-orange-500/20 text-[#8b949e] hover:text-orange-300 text-[10px] font-bold uppercase transition-all border border-[#30363d]"
                  >
                    ○ Tümünü Pasif Yap
                  </button>
                </div>
              </div>

              {bosVitrinSliderlar.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] text-center text-xs text-[#8b949e]">
                  Henüz GIF slider bulunmuyor. Yukarıdan yeni bir GIF URL&apos;si ekleyebilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {bosVitrinSliderlar.map((slide, idx) => {
                    const isActive = slide.aktif !== false;
                    return (
                      <div
                        key={slide._id || idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${isActive
                            ? 'bg-[#0d1117] border-emerald-500/40 shadow-md shadow-emerald-500/5'
                            : 'bg-[#0d1117]/60 border-[#30363d] opacity-60'
                          }`}
                      >
                        {/* Üst Bar: GIF Thumbnail + Rozetler + Aksiyonlar */}
                        <div className="flex items-start gap-3">
                          {/* Canlı GIF Görseli */}
                          <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-black border border-[#30363d] shrink-0">
                            <Image
                              src={slide.gifUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=200'}
                              alt={slide.title || 'GIF'}
                              fill
                              unoptimized
                              className="object-cover object-center"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-purple-300 font-bold">
                              #{idx + 1}
                            </div>
                          </div>

                          {/* Sağ Üst Başlık & Butonlar */}
                          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-purple-300 font-bold uppercase truncate max-w-[150px]">
                                {slide.topBadge}
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleGifActive(idx)}
                                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1 ${isActive
                                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/30'
                                      : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e]'
                                    }`}
                                  title={isActive ? "GIF'i gizle (pasif yap)" : "GIF'i yayına al (aktif yap)"}
                                >
                                  <span>{isActive ? '● AKTİF (YAYINDA)' : '○ PASİF (GİZLİ)'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveGifSlide(idx)}
                                  className="p-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                  title="GIF'i Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <span className="font-bold text-xs text-white line-clamp-1 font-heading">
                              {slide.title}
                            </span>

                            <span className="text-[11px] text-[#8b949e] line-clamp-1">
                              {slide.spot}
                            </span>
                          </div>
                        </div>

                        {/* Düzenlenebilir Input Alanları */}
                        <div className="flex flex-col gap-2 pt-1 border-t border-white/5 text-xs">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#8b949e] flex items-center justify-between">
                              <span>GIF URL</span>
                              <a
                                href={slide.gifUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:underline flex items-center gap-0.5 text-[10px]"
                              >
                                <span>Bağlantıyı Aç</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </label>
                            <input
                              type="text"
                              value={slide.gifUrl}
                              onChange={(e) => handleUpdateGifSlide(idx, 'gifUrl', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#8b949e]">Üst Rozet</label>
                              <input
                                type="text"
                                value={slide.topBadge}
                                onChange={(e) => handleUpdateGifSlide(idx, 'topBadge', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#8b949e]">Trafik Rozeti</label>
                              <input
                                type="text"
                                value={slide.trafficBadge}
                                onChange={(e) => handleUpdateGifSlide(idx, 'trafficBadge', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#8b949e]">Slogan / Başlık</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleUpdateGifSlide(idx, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#8b949e]">Spot Açıklama</label>
                            <input
                              type="text"
                              value={slide.spot}
                              onChange={(e) => handleUpdateGifSlide(idx, 'spot', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-purple-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── 3. ANASAYFA ÜST VİTRİN SLIDER HAVUZU & İLAN SEÇİCİ ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-white font-heading">
                    Anasayfa 5'li Vitrin Slider Havuzu (Maks. 5 İlan)
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Toplam 5 vitrin slotu bulunur. Seçilen ilanlar döner, <b>kalan boş slotlarda ise otomatik Boş Vitrin Reklamı gösterilir.</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllVip}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-all"
                >
                  İlk 5 VIP'i Seç
                </button>
                <button
                  type="button"
                  onClick={handleClearShowcase}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-all"
                  title="Tüm seçimleri temizle ve anasayfada 5 slotun tamamında reklam alanına geç"
                >
                  Tümünü Temizle
                </button>
                <button
                  type="button"
                  onClick={handleSaveShowcaseOnly}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>Vitrini Kaydet ({selectedListingIds.length}/5)</span>
                </button>
              </div>
            </div>

            {/* Seçili İlanların Yatay Çubuğu */}
            <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Şu Anda Vitrinde Yayında Olanlar ({selectedListingIds.length} / 5 Slot)</span>
                </span>
                {selectedListingIds.length === 0 ? (
                  <span className="text-purple-300 font-bold text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    📢 Vitrin Boş: 5 Slotun Tamamında VIP Reklam Dönecek
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    👑 {selectedListingIds.length} Canlı İlan + {5 - selectedListingIds.length} Boş Reklam Slotu
                  </span>
                )}
              </div>

              {selectedListingIds.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {selectedListingIds.map((id) => {
                    const matched = allListings.find((l) => l._id.toString() === id);
                    if (!matched) return null;
                    const countdown = formatVitrinCountdown(matched.vitrinBitisTarihi);

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161b22] border border-amber-500/40 text-xs text-white shrink-0 group shadow-md"
                      >
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={matched.anaFotograf?.url || matched.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=60'}
                            alt={matched.baslik}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold max-w-[130px] truncate">{matched.baslik}</span>
                          <span className={`text-[9px] font-mono font-bold ${countdown.color}`}>
                            {countdown.text}
                          </span>
                        </div>

                        {/* Süre Ekleme Butonları */}
                        <button
                          type="button"
                          onClick={() => handleExtendDuration(id, 1)}
                          className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[9px] font-bold"
                          title="+1 Gün Ekle"
                        >
                          +1G
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExtendDuration(id, 7)}
                          className="px-1.5 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-[9px] font-bold"
                          title="+7 Gün Ekle"
                        >
                          +7G
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveShowcaseItem(id)}
                          className="p-1 rounded hover:bg-red-500 text-[#8b949e] hover:text-white transition-colors ml-1"
                          title="Vitrinden Çıkar ve Kaydet"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-[#8b949e]">
                  Vitrinde gösterilmek üzere henüz ilan seçilmedi. Vitrin boş olduğunda anasayfada otomatik olarak VIP GIF reklam havuzu gösterilir.
                </span>
              )}
            </div>

            {/* Arama & Kategori Filtresi */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="İlan başlığı, il veya ilçe adı yazarak ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setListingFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${listingFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-[#21262d] text-[#8b949e]'
                    }`}
                >
                  Tümü ({allListings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingFilter('vip')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${listingFilter === 'vip' ? 'bg-amber-500 text-slate-950' : 'bg-[#21262d] text-[#8b949e]'
                    }`}
                >
                  VIP ({allListings.filter(l => l.rozet === 'vip' || l.rozet === 'ultravip').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingFilter('gold')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${listingFilter === 'gold' ? 'bg-amber-500 text-slate-950' : 'bg-[#21262d] text-[#8b949e]'
                    }`}
                >
                  Gold ({allListings.filter(l => l.rozet === 'gold').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingFilter('selected')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${listingFilter === 'selected' ? 'bg-amber-500 text-slate-950' : 'bg-[#21262d] text-[#8b949e]'
                    }`}
                >
                  Seçili ({selectedListingIds.length})
                </button>
              </div>
            </div>

            {/* İlan Seçim Kartları Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredListings.map((listing) => {
                const isSelected = selectedListingIds.includes(listing._id.toString());
                const countdown = formatVitrinCountdown(listing.vitrinBitisTarihi);

                return (
                  <div
                    key={listing._id}
                    onClick={() => handleToggleListing(listing._id.toString())}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-md'
                        : 'bg-[#21262d] border-[#363b42] hover:border-amber-500/40'
                      }`}
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                      <Image
                        src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                        alt={listing.baslik}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-xs text-white truncate font-heading">
                        {listing.baslik}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold uppercase mt-0.5">
                        {listing.ilSlug} / {listing.ilceSlug}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="text-[9px] uppercase font-bold text-[#8b949e] px-1.5 py-0.2 rounded bg-black/40">
                          {listing.rozet || 'STANDART'}
                        </span>
                        {listing.vitrinBitisTarihi && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${countdown.badgeBg} ${countdown.color}`}>
                            {countdown.text}
                          </span>
                        )}
                        {listing.vitrinIstegi && (
                          <span className="text-[9px] text-yellow-300 font-bold">
                            👑 Vitrin İstiyor
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-[#30363d] text-transparent'
                      }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 3. HERO & METİN KARŞILAMA AYARLARI ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#30363d] pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white font-heading">Anasayfa Hero &amp; Karşılama Metinleri</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
                Ana Başlık (H1)
                <input
                  type="text"
                  value={heroBaslik}
                  onChange={(e) => setHeroBaslik(e.target.value)}
                  placeholder="Örn: Türkiye'nin En Güvenilir VIP Eskort İlan Platformu"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
                Alt Açıklama Spotu
                <input
                  type="text"
                  value={heroAltBaslik}
                  onChange={(e) => setHeroAltBaslik(e.target.value)}
                  placeholder="Örn: 81 il ve tüm ilçelerde doğrulanmış eskort ilanları..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </label>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            SAĞ SÜTUN (KOLON 5-4): ÇOKLU POPUP REKLAMLARI & TICKER & DURUM
           ══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">

          {/* ── 4. ÇOKLU SPONSORLU POPUP REKLAMLARI (KONUM HEDEFLİ) ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  Sponsorlu Popup Reklamları
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSaveSpecialAdsOnly}
                disabled={savingAd}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                {savingAd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            {/* Yeni Reklam Ekleme */}
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-3">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Yeni Popup Reklamı Oluştur</span>
              </span>

              {/* İlan Seçimi */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#8b949e]">Yayınlanacak İlan *</label>
                <select
                  value={newAdIlanId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setNewAdIlanId(chosenId);
                    if (chosenId) {
                      const matched = allListings.find((l) => l._id === chosenId);
                      if (matched?.ilSlug) {
                        if (matched.ilceSlug) {
                          setNewAdHedefIl(`${matched.ilSlug}/${matched.ilceSlug}`);
                          setNewAdRozet(`👑 ${matched.ilSlug.toUpperCase()} / ${matched.ilceSlug.toUpperCase()} VIP VİTRİN`);
                        } else {
                          setNewAdHedefIl(matched.ilSlug);
                          setNewAdRozet(`👑 ${matched.ilSlug.toUpperCase()} VIP VİTRİN İLANI`);
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- Listeden Bir İlan Seçin --</option>
                  {allListings.map((l) => (
                    <option key={l._id} value={l._id}>
                      [{l.ilSlug?.toUpperCase()}{l.ilceSlug ? ` / ${l.ilceSlug?.toUpperCase()}` : ''}] {l.baslik}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hedef İl & İlçe */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#8b949e]">Hedef Gösterim Konumu</label>
                <select
                  value={newAdHedefIl}
                  onChange={(e) => setNewAdHedefIl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-medium"
                >
                  <option value="tum_turkiye">🇹🇷 TÜRKİYE GENELİ (Tüm Şehirler &amp; Anasayfa)</option>

                  {selectedListingForAd && selectedListingForAd.ilSlug && (
                    <optgroup label="── SEÇİLİ İLANIN KENDİ KONUMU ──">
                      {selectedListingForAd.ilceSlug && (
                        <option value={`${selectedListingForAd.ilSlug}/${selectedListingForAd.ilceSlug}`}>
                          🎯 SADECE {selectedListingForAd.ilSlug.toUpperCase()} / {selectedListingForAd.ilceSlug.toUpperCase()}
                        </option>
                      )}
                      <option value={selectedListingForAd.ilSlug}>
                        📍 TÜM {selectedListingForAd.ilSlug.toUpperCase()}
                      </option>
                    </optgroup>
                  )}

                  <optgroup label="── POPÜLER BÜYÜKŞEHİR İLÇELERİ ──">
                    <option value="istanbul">📍 İSTANBUL (Tüm İlçeler)</option>
                    <option value="istanbul/beylikduzu">↳ İSTANBUL / Beylikdüzü</option>
                    <option value="istanbul/kadikoy">↳ İSTANBUL / Kadıköy</option>
                    <option value="istanbul/sisli">↳ İSTANBUL / Şişli</option>
                    <option value="istanbul/besiktas">↳ İSTANBUL / Beşiktaş</option>
                    <option value="ankara">📍 ANKARA (Tüm İlçeler)</option>
                    <option value="ankara/cankaya">↳ ANKARA / Çankaya</option>
                    <option value="izmir">📍 İZMİR (Tüm İlçeler)</option>
                    <option value="izmir/karsiyaka">↳ İZMİR / Karşıyaka</option>
                    <option value="antalya">📍 ANTALYA (Tüm İlçeler)</option>
                    <option value="bursa">📍 BURSA (Tüm İlçeler)</option>
                  </optgroup>

                  {allLocations.length > 0 && (
                    allLocations.map((loc: any) => (
                      <optgroup key={loc.ilSlug} label={`── ${loc.il.toUpperCase()} ──`}>
                        <option value={loc.ilSlug}>📍 TÜM {loc.il.toUpperCase()}</option>
                        {Array.isArray(loc.ilceler) && loc.ilceler.map((ilce: any) => (
                          <option key={ilce.slug} value={`${loc.ilSlug}/${ilce.slug}`}>
                            ↳ {loc.il.toUpperCase()} / {ilce.ad}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
              </div>

              {/* Rozet & Gecikme */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#8b949e]">Rozet Metni</label>
                  <input
                    type="text"
                    value={newAdRozet}
                    onChange={(e) => setNewAdRozet(e.target.value)}
                    placeholder="🔥 VIP İLAN"
                    className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#8b949e]">Gecikme (Sn)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newAdGecikme}
                    onChange={(e) => setNewAdGecikme(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNewSpecialAd}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs uppercase font-heading flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all mt-1"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Reklamı Listeye Ekle</span>
              </button>
            </div>

            {/* Tanımlı Reklam Listesi */}
            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              <span className="text-xs font-black text-white uppercase tracking-wider font-heading flex items-center justify-between">
                <span>Aktif Reklam Havuzu ({ozelIlanReklamlar.length})</span>
              </span>

              {ozelIlanReklamlar.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8b949e] bg-[#0d1117] rounded-xl border border-[#30363d]">
                  Henüz özel popup reklamı eklenmedi.
                </div>
              ) : (
                ozelIlanReklamlar.map((ad, idx) => {
                  const listing = getListingById(ad.ilanId);
                  return (
                    <div
                      key={ad._id || idx}
                      className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${ad.aktif
                          ? 'bg-[#0d1117] border-amber-500/50 shadow-sm'
                          : 'bg-[#0d1117]/60 border-[#30363d] opacity-60'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-300 font-bold uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          {ad.rozet}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAdActive(idx)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${ad.aktif ? 'bg-emerald-500 text-slate-950' : 'bg-[#21262d] text-[#8b949e]'
                              }`}
                          >
                            {ad.aktif ? '● AKTİF' : '○ PASİF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialAd(idx)}
                            className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {listing ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=50'}
                              alt={listing.baslik}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-white truncate">{listing.baslik}</span>
                            <span className="text-[10px] text-amber-400 uppercase">
                              Hedef: {ad.hedefIlSlug} | {ad.gecikmeSaniye}s
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-400 font-mono">⚠️ İlan silinmiş</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── 5. KAYAN DUYURU ŞERİDİ (TICKER) ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">Kayan Duyuru Şeridi</h2>
              </div>
              <button
                type="button"
                onClick={handleAddAnnouncement}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase font-heading flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {duyurular.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.badge}
                      onChange={(e) => handleUpdateAnnouncement(idx, 'badge', e.target.value)}
                      placeholder="👑 DUYURU"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-amber-300 font-bold text-xs"
                    />
                    <input
                      type="text"
                      value={item.link}
                      onChange={(e) => handleUpdateAnnouncement(idx, 'link', e.target.value)}
                      placeholder="/ilan-ver"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncement(idx)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateAnnouncement(idx, 'text', e.target.value)}
                    placeholder="Duyuru metni..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── SAYFA ALTI SABİT KAYDET BUTONU ──────────────── */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 flex items-center gap-2 active:scale-95 transition-all font-heading"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 stroke-[2.5]" />}
          <span>{saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet & Yayına Al'}</span>
        </button>
      </div>

    </div>
  );
}
