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
  ArrowLeft,
  ArrowUp,
  ArrowDown,
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
  KeyRound,
  Edit3
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { turkeyProvinces } from '@/data/turkeyLocations';
import { parsePhoneNumber, setClientAdminWhatsApp } from '@/lib/siteConfig';

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
    spot: "Türkiye'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.",
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
  ...turkeyProvinces.map((p) => ({
    slug: p.ilSlug,
    ad: `📍 ${p.il.toUpperCase()} (Tüm İlçeler & İl Geneli)`,
  })),
];

function MetricCircle({ percent, color = '#f59e0b', size = 42, strokeWidth = 3.5 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-black text-white">
        %{Math.round(safePercent)}
      </span>
    </div>
  );
}

export default function AnasayfaYonetimiPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTicker, setSavingTicker] = useState(false);
  const [savingAd, setSavingAd] = useState(false);
  const [savingGifs, setSavingGifs] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hero Section
  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');

  // Aktif Banner
  const [bannerMetin, setBannerMetin] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerRozet, setBannerRozet] = useState('');
  const [bannerAktif, setBannerAktif] = useState(true);

  // Kayan Duyurular (Ticker)
  const [duyurular, setDuyurular] = useState<TickerItem[]>([]);

  // Boş Vitrin GIF Slider Havuzu
  const [bosVitrinSliderlar, setBosVitrinSliderlar] = useState<BosVitrinSlide[]>([]);
  const [newGifUrl, setNewGifUrl] = useState('');
  const [newGifTopBadge, setNewGifTopBadge] = useState('🔥 VİTRİNDE YERİNİZİ ALIN');
  const [newGifTrafficBadge, setNewGifTrafficBadge] = useState('Günde 50.000+ Canlı Müşteri');
  const [newGifTitle, setNewGifTitle] = useState('İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!');
  const [newGifSpot, setNewGifSpot] = useState('Best Eskort VIP Vitrini İle Kazancınızı Katlayın!');

  // VIP WhatsApp
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [savingAdminWa, setSavingAdminWa] = useState(false);
  const [adminWaSuccess, setAdminWaSuccess] = useState(false);

  // Multiple Special Ads State (Çoklu Sponsorlu Popup Reklamları)
  const [ozelIlanReklamlar, setOzelIlanReklamlar] = useState<SpecialAdEntry[]>([]);
  const [popupStatsMap, setPopupStatsMap] = useState<Record<string, {
    impressions: number;
    uniqueVisitors: number;
    clicks: number;
    whatsappClicks: number;
    totalClicks: number;
    ctr: string;
  }>>({});
  const [totalPopupStats, setTotalPopupStats] = useState<{
    impressions: number;
    uniqueVisitors: number;
    clicks: number;
    whatsappClicks: number;
    totalClicks: number;
    ctr: string;
  }>({ impressions: 0, uniqueVisitors: 0, clicks: 0, whatsappClicks: 0, totalClicks: 0, ctr: '0.0' });

  // New Ad Form State
  const [newAdIlanId, setNewAdIlanId] = useState<string>('');
  const [newAdHedefIl, setNewAdHedefIl] = useState<string>('tum_turkiye');
  const [newAdRozet, setNewAdRozet] = useState<string>('🔥 GÜNÜN ÖZEL VIP İLANI');
  const [newAdGecikme, setNewAdGecikme] = useState<number>(4);

  // Popup Reklam Düzenleme State'i
  const [editingAdIdx, setEditingAdIdx] = useState<number | null>(null);
  const [editingAdData, setEditingAdData] = useState<SpecialAdEntry | null>(null);

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'vip' | 'gold' | 'selected'>('all');
  const [onayMasasiTab, setOnayMasasiTab] = useState<'talepler' | 'popup' | 'vip' | 'tumu'>('talepler');
  const [activeMainTab, setActiveMainTab] = useState<'vitrin' | 'popup' | 'gif' | 'duyuru' | 'whatsapp'>('vitrin');

  const selectedListingForAd = allListings.find((l) => l._id === newAdIlanId);

  // Vitrin ve Popup talebi olan ilanlar
  const vitrinRequests = useMemo(() => {
    return allListings.filter((l) => Boolean(l.vitrinIstegi));
  }, [allListings]);

  const popupRequests = useMemo(() => {
    return allListings.filter((l) => Boolean(l.popupTalepEdildi) || Boolean(l.isPopupActive));
  }, [allListings]);

  // VIP & UltraVIP İlanlar
  const vipListings = useMemo(() => {
    return allListings.filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip');
  }, [allListings]);

  // Onay Masasında Gösterilecek İlanlar
  const displayedOnayListings = useMemo(() => {
    if (onayMasasiTab === 'popup') return popupRequests;
    if (onayMasasiTab === 'vip') return vipListings;
    if (onayMasasiTab === 'tumu') return allListings;
    return vitrinRequests;
  }, [onayMasasiTab, popupRequests, vipListings, allListings, vitrinRequests]);

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
      if (data.config && isInitial) {
        setHeroBaslik(data.config.hero?.baslik || 'Türkiye\'nin En Güvenilir VIP Eskort İlan Platformu');
        setHeroAltBaslik(data.config.hero?.altBaslik || '81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.');
        setBannerMetin(data.config.aktifBanner?.metin || '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!');
        setBannerLink(data.config.aktifBanner?.link || '/ilan-ver');
        setBannerRozet(data.config.aktifBanner?.rozet || '👑 VIP DUYURU');
        setBannerAktif(data.config.aktifBanner?.aktif ?? true);
        if (data.config.adminWhatsApp) {
          setAdminWhatsApp(data.config.adminWhatsApp);
          setClientAdminWhatsApp(data.config.adminWhatsApp);
        }

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
      if (data.popupStatsMap) {
        setPopupStatsMap(data.popupStatsMap);
      }
      if (data.totalPopupStats) {
        setTotalPopupStats(data.totalPopupStats);
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
    if (diff <= 0) return { text: 'Süresi Doldu (Vitrinden Düştü)', expired: true, color: 'text-rose-400', badgeBg: 'bg-rose-500/10 border-rose-500/30' };

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

  // ── SIRA DEĞİŞTİRME FONKSİYONU (SLOT ORDER SWAP) ──
  const handleMoveShowcaseOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedListingIds.length) return;
    const nextSelected = [...selectedListingIds];
    const temp = nextSelected[index];
    nextSelected[index] = nextSelected[targetIdx];
    nextSelected[targetIdx] = temp;
    setSelectedListingIds(nextSelected);

    try {
      await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sliderIlanIds: nextSelected }),
      });
      setMessage({
        type: 'success',
        text: `✅ Vitrin sıralaması güncellendi (${index + 1}. Sıra ↔ ${targetIdx + 1}. Sıra yer değiştirdi)!`
      });
    } catch {
      // silent
    }
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

  // Popup Reklamını Süreli Onaylama (Günlük 1.000 TL)
  const handleApprovePopupWithDuration = async (listingId: string, days: number = 1, hedefSehir: string = 'tum_turkiye') => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignPopupDuration: {
            listingId,
            days,
            hedefSehir
          }
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `⚡ İlan ${days} Günlük (${(days * 1000).toLocaleString('tr-TR')} ₺) Modal Popup Reklamı olarak yayına alındı!`
        });
        fetchConfig(false);
      } else {
        setMessage({ type: 'error', text: 'Popup onaylanırken hata oluştu.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Popup Süresini Uzatma
  const handleExtendPopupDuration = async (listingId: string, extraDays: number) => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extendPopupDuration: {
            listingId,
            extraDays
          }
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `⚡ Popup süresi +${extraDays} gün uzatıldı!` });
        fetchConfig(false);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Popup süresi uzatılamadı.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Popup Reklamından Çıkarma
  const handleRemoveFromPopup = async (listingId: string) => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          removePopupListingId: listingId
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'İlan popup reklam havuzundan çıkarıldı.' });
        fetchConfig(false);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Popup kaldırılamadı.' });
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

  const handleAddAnnouncement = (preset?: { badge: string; text: string; link: string }) => {
    if (preset) {
      setDuyurular([...duyurular, preset]);
    } else {
      setDuyurular([...duyurular, { badge: '🎁 ÜCRETSİZ İLAN', text: 'HEMEN ÜCRETSİZ İLAN VERİN, BİNLERCE MÜŞTERİYE ANINDA ULAŞIN!', link: '/ilan-ver' }]);
    }
  };

  const handleRemoveAnnouncement = (index: number) => {
    setDuyurular(duyurular.filter((_, i) => i !== index));
  };

  const handleUpdateAnnouncement = (index: number, field: keyof TickerItem, value: string) => {
    const updated = [...duyurular];
    updated[index] = { ...updated[index], [field]: value };
    setDuyurular(updated);
  };

  const handleSaveTickerOnly = async () => {
    setSavingTicker(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duyurular,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Kayan duyuru şeridi (${duyurular.length} Adet duyuru) başarıyla kaydedildi ve anında yayına alındı!` });
        fetchConfig(true);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Duyurular kaydedilemedi.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Bağlantı hatası' });
    } finally {
      setSavingTicker(false);
    }
  };

  // ── ÇOKLU ÖZEL REKLAM YÖNETİMİ & DÜZENLEME FONKSİYONLARI ──
  const saveSpecialAdsToDb = async (adsList: SpecialAdEntry[], customSuccessMsg?: string) => {
    setSavingAd(true);
    setMessage(null);
    try {
      const topActive = adsList.find((a) => a.aktif) || adsList[0] || null;
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ozelIlanReklamlar: adsList,
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
          text: customSuccessMsg || `✅ Özel reklamlar (${adsList.length} Adet) başarıyla kaydedildi!`,
        });
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

  const handleAddNewSpecialAd = async () => {
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

    const updated = [newAd, ...ozelIlanReklamlar];
    setOzelIlanReklamlar(updated);
    setNewAdIlanId('');
    await saveSpecialAdsToDb(updated, `✅ Yeni popup reklamı havuzuna eklendi ve yayına alındı!`);
  };

  const handleStartEditAd = (index: number) => {
    setEditingAdIdx(index);
    setEditingAdData({ ...ozelIlanReklamlar[index] });
  };

  const handleCancelEditAd = () => {
    setEditingAdIdx(null);
    setEditingAdData(null);
  };

  const handleSaveEditedAd = async (index: number) => {
    if (!editingAdData) return;
    const updated = [...ozelIlanReklamlar];
    updated[index] = { ...editingAdData };
    setOzelIlanReklamlar(updated);
    setEditingAdIdx(null);
    setEditingAdData(null);

    const targetLabel = updated[index].hedefIlSlug ? updated[index].hedefIlSlug.toUpperCase() : 'TÜRKİYE GENELİ';
    await saveSpecialAdsToDb(updated, `✅ Reklam ayarları güncellendi (Yeni Hedef: ${targetLabel})!`);
  };

  const handleToggleAdActive = async (index: number) => {
    const updated = [...ozelIlanReklamlar];
    updated[index].aktif = !updated[index].aktif;
    setOzelIlanReklamlar(updated);
    await saveSpecialAdsToDb(updated, `✅ Reklam durumu ${updated[index].aktif ? 'AKTİF' : 'PASİF'} olarak güncellendi!`);
  };

  const handleRemoveSpecialAd = async (index: number) => {
    if (!confirm('Bu popup reklamını havuzdan tamamen silmek istediğinize emin misiniz?')) return;
    const updated = ozelIlanReklamlar.filter((_, i) => i !== index);
    setOzelIlanReklamlar(updated);
    if (editingAdIdx === index) {
      setEditingAdIdx(null);
      setEditingAdData(null);
    }
    await saveSpecialAdsToDb(updated, '✅ Reklam havuzdan silindi.');
  };

  const handleSaveSpecialAdsOnly = async () => {
    await saveSpecialAdsToDb(ozelIlanReklamlar);
  };

  const handleQuickSaveWhatsApp = async () => {
    const trimmed = adminWhatsApp.trim();
    if (!trimmed) {
      alert('Lütfen geçerli bir telefon numarası girin.');
      return;
    }
    setSavingAdminWa(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWhatsApp: trimmed }),
      });
      if (res.ok) {
        setClientAdminWhatsApp(trimmed);
        setAdminWaSuccess(true);
        setTimeout(() => setAdminWaSuccess(false), 5000);
      } else {
        alert('Numara kaydedilemedi');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingAdminWa(false);
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
          adminWhatsApp,
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
        if (adminWhatsApp && adminWhatsApp.trim()) {
          setClientAdminWhatsApp(adminWhatsApp.trim());
        }
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

      {/* ── ÜST DASHBOARD HEADER & CANLI METRİKLER (OBSIDIAN EXECUTIVE) ──────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-md shrink-0">
              <Sliders className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl sm:text-2xl text-white font-heading">
                  Anasayfa, Vitrin &amp; Reklam Yönetim Merkezi
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                  Cyber Luxury
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                5&apos;li vitrin slider masası, sıralama kontrolü, sponsorlu popup reklamları ve reklam GIF havuzu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => fetchConfig(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white border border-slate-800 font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>Yenile</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[2.5]" />}
              <span>{saving ? 'Kaydediliyor...' : 'Tümünü Kaydet & Yayına Al'}</span>
            </button>
          </div>
        </div>

        {/* Canlı Durum Kartları / Sayaçlar with MetricCircle */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          {/* 1. Vitrinde Yayında */}
          <div 
            onClick={() => setActiveMainTab('vitrin')}
            className={`p-4 rounded-2xl bg-[#070a0f] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              activeMainTab === 'vitrin' ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vitrinde Yayında</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">{selectedListingIds.length} / 5</span>
              <span className="text-[10px] text-slate-500">Maksimum 5 slot</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle percent={(selectedListingIds.length / 5) * 100} color="#f59e0b" size={42} />
            </div>
          </div>

          {/* 2. Onay Bekleyen Vitrinler */}
          <div 
            onClick={() => setActiveMainTab('vitrin')}
            className={`p-4 rounded-2xl bg-[#070a0f] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              vitrinRequests.length > 0 ? 'border-amber-500/60 ring-2 ring-amber-500/20' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Vitrin Talepleri</span>
                {vitrinRequests.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </div>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">{vitrinRequests.length} Talep</span>
              <span className="text-[10px] text-slate-500">Onay bekleyen ilan</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle percent={allListings.length > 0 ? (vitrinRequests.length / allListings.length) * 100 : 0} color="#fbbf24" size={42} />
            </div>
          </div>

          {/* 3. Aktif Popup Reklamlar */}
          <div 
            onClick={() => setActiveMainTab('popup')}
            className={`p-4 rounded-2xl bg-[#070a0f] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              activeMainTab === 'popup' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400">Popup Reklamları</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {ozelIlanReklamlar.filter((a) => a.aktif).length} Aktif
              </span>
              <span className="text-[10px] text-slate-500">İl hedefli popup</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle 
                percent={ozelIlanReklamlar.length > 0 ? (ozelIlanReklamlar.filter((a) => a.aktif).length / ozelIlanReklamlar.length) * 100 : 0} 
                color="#10b981" 
                size={42} 
              />
            </div>
          </div>

          {/* 4. Boş Vitrin GIF Havuzu */}
          <div 
            onClick={() => setActiveMainTab('gif')}
            className={`p-4 rounded-2xl bg-[#070a0f] border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between shadow-lg relative overflow-hidden group ${
              activeMainTab === 'gif' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-col min-w-0 z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400">Boş Vitrin GIF Havuzu</span>
              <span className="text-xl sm:text-2xl font-black text-purple-300 font-mono mt-0.5">
                {bosVitrinSliderlar.length} GIF
              </span>
              <span className="text-[10px] text-slate-500">Otomatik rotasyon</span>
            </div>
            <div className="flex items-center gap-2 z-10">
              <MetricCircle percent={100} color="#a855f7" size={42} />
            </div>
          </div>
        </div>

        {/* ── SENIOR OBSIDIAN TAB CONTROLLER BAR ──────────────── */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMainTab('vitrin')}
            className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeMainTab === 'vitrin' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
                : 'bg-[#070a0f] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>1. Vitrin Slider Masası</span>
            <span className="px-2 py-0.5 rounded-full bg-black/50 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              {selectedListingIds.length}/5 Slot
            </span>
            {vitrinRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">
                {vitrinRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('popup')}
            className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeMainTab === 'popup' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold shadow-md shadow-emerald-500/10'
                : 'bg-[#070a0f] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>2. Sponsorlu Popup Reklamları</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#0c1017] text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
              {ozelIlanReklamlar.filter((a) => a.aktif).length} Aktif
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('gif')}
            className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeMainTab === 'gif' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 font-bold shadow-md shadow-purple-500/10'
                : 'bg-[#070a0f] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Film className="w-4 h-4 text-purple-400" />
            <span>3. Boş Vitrin GIF Havuzu</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#0c1017] text-purple-300 border border-purple-500/30 text-[9px] font-mono font-bold">
              {bosVitrinSliderlar.length} GIF
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('duyuru')}
            className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeMainTab === 'duyuru' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold shadow-md shadow-amber-500/10'
                : 'bg-[#070a0f] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>4. Kayan Duyuru &amp; Hero Metinleri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('whatsapp')}
            className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeMainTab === 'whatsapp' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold shadow-md shadow-emerald-500/10'
                : 'bg-[#070a0f] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <OfficialWhatsAppIcon className="w-4 h-4 text-emerald-400" />
            <span>5. VIP WhatsApp Hattı</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg'
          }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── TAB 1: VİTRİN & SLIDER MASASI ──────────────── */}
      {activeMainTab === 'vitrin' && (
        <div className="flex flex-col gap-6 w-full">

          {/* ── BÖLÜM 1: 5-SLOT GÖRSEL KONTROL BOARD'U (SLOT 1 - SLOT 5 DECK) ── */}
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-white font-heading">
                      Anasayfa 5&apos;li Vitrin Slider Deck (Canlı Sıralama)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase font-mono">
                      {selectedListingIds.length} / 5 Slot Dolu
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Anasayfada ilk görünen model <b>1. Slot</b>&apos;tadır. Sol/Sağ oklarla sırayı anında değiştirebilir, süresini uzatabilir veya slotu boşaltabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllVip}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="En popüler ilk 5 VIP ilanı slotlara yerleştir"
                >
                  ⚡ İlk 5 VIP&apos;i Seç
                </button>
                <button
                  type="button"
                  onClick={handleClearShowcase}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Tüm slotları boşalt ve otomatik VIP reklam havuzuna geçir"
                >
                  Tümünü Boşalt
                </button>
                <button
                  type="button"
                  onClick={handleSaveShowcaseOnly}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Vitrini Kaydet</span>
                </button>
              </div>
            </div>

            {/* 5 Dedicated Slot Deck Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
              {[0, 1, 2, 3, 4].map((slotIdx) => {
                const listingId = selectedListingIds[slotIdx];
                const listing = listingId ? allListings.find((l) => l._id.toString() === listingId) : null;
                const countdown = listing ? formatVitrinCountdown(listing.vitrinBitisTarihi) : null;

                if (listing) {
                  return (
                    <div
                      key={listing._id || slotIdx}
                      className="p-3.5 rounded-2xl bg-[#070a0f] border-2 border-amber-500/60 shadow-xl flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-amber-400 transition-all"
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] font-mono flex items-center gap-1 shadow-sm">
                          <Crown className="w-3 h-3 fill-slate-950" />
                          <span>SLOT {slotIdx + 1} {slotIdx === 0 ? '(1. SIRA)' : ''}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Sola / Yukarı Taşı */}
                          <button
                            type="button"
                            disabled={slotIdx === 0}
                            onClick={() => handleMoveShowcaseOrder(slotIdx, 'up')}
                            className="p-1 rounded bg-slate-900 hover:bg-amber-500 text-slate-400 hover:text-slate-950 border border-slate-800 disabled:opacity-20 transition-all cursor-pointer"
                            title="Önceki Sıraya Al"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          {/* Sağa / Aşağı Taşı */}
                          <button
                            type="button"
                            disabled={slotIdx === selectedListingIds.length - 1}
                            onClick={() => handleMoveShowcaseOrder(slotIdx, 'down')}
                            className="p-1 rounded bg-slate-900 hover:bg-amber-500 text-slate-400 hover:text-slate-950 border border-slate-800 disabled:opacity-20 transition-all cursor-pointer"
                            title="Sonraki Sıraya Al"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveShowcaseItem(listing._id.toString())}
                            className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer ml-1"
                            title="Vitrinden Çıkar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Photo & Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#0c1017] border border-amber-500/40 shrink-0">
                          <Image
                            src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                            alt={listing.baslik}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-black text-xs text-white truncate font-heading" title={listing.baslik}>
                            {listing.baslik}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold uppercase truncate">
                            {listing.ilSlug} / {listing.ilceSlug}
                          </span>
                          {listing.whatsappNumara && (
                            <span className="text-[10px] text-emerald-400 font-mono font-bold truncate flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {listing.whatsappNumara}
                            </span>
                          )}
                          {listing.kullaniciAdi && (
                            <span className="text-[9px] text-slate-400 font-mono truncate">
                              @{listing.kullaniciAdi}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Countdown badge */}
                      {countdown && (
                        <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${countdown.badgeBg} ${countdown.color} text-center font-mono`}>
                          {countdown.text}
                        </div>
                      )}

                      {/* Quick Extend Actions */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleExtendDuration(listing._id.toString(), 1)}
                          className="py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-bold border border-amber-500/30 transition-all text-center cursor-pointer"
                        >
                          +1 Gün
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExtendDuration(listing._id.toString(), 7)}
                          className="py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-white text-[10px] font-bold border border-purple-500/30 transition-all text-center cursor-pointer"
                        >
                          +7 Gün
                        </button>
                      </div>
                    </div>
                  );
                }

                // Empty Slot
                return (
                  <div
                    key={slotIdx}
                    className="p-4 rounded-2xl bg-[#070a0f]/60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between items-center text-center gap-3 min-h-[190px]"
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] font-bold">
                        SLOT {slotIdx + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">BOŞ</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 my-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-800">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">Boş Reklam Slotu</span>
                      <p className="text-[10px] text-slate-500 max-w-[140px] leading-tight">
                        Bu slotta otomatik VIP GIF reklamı döner.
                      </p>
                    </div>

                    <a
                      href="#onay-masasi"
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 font-bold text-[10px] uppercase font-heading border border-slate-800 transition-all text-center"
                    >
                      + İlan Seç &amp; Ata
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BÖLÜM 2: VİTRİN TALEPLERİ, ONAY MASASI & İLAN SEÇİCİ ── */}
          <div id="onay-masasi" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SOL SÜTUN (7 KOLON): Vitrin Onay Masası (Talepler & VIP Havuzu) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#0c1017] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-lg text-white font-heading">
                        Vitrin Adayları &amp; Onay Masası
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase font-mono">
                        {displayedOnayListings.length} İlan
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Müşterilerin talep ettiği paketleri inceleyin ve tek tıkla anasayfa vitrinine ekleyin.
                    </p>
                  </div>
                </div>

                {/* Filtre Tabları */}
                <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-xl border border-slate-800 self-start sm:self-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => setOnayMasasiTab('talepler')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${onayMasasiTab === 'talepler'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    🔥 Vitrin Talepleri ({vitrinRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnayMasasiTab('popup')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${onayMasasiTab === 'popup'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-sm'
                        : 'text-purple-400 hover:text-white'
                      }`}
                  >
                    ⚡ Popup Talepleri ({popupRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnayMasasiTab('vip')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${onayMasasiTab === 'vip'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    👑 VIP İlanlar ({vipListings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnayMasasiTab('tumu')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${onayMasasiTab === 'tumu'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    Tümü ({allListings.length})
                  </button>
                </div>
              </div>

              {/* Vitrin İstek Listesi */}
              {displayedOnayListings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#070a0f] border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400/80" />
                  <span className="font-bold text-sm text-white">Şu anda onay bekleyen yeni vitrin talebi bulunmuyor.</span>
                  <p className="text-xs text-slate-400 max-w-md">
                    Kullanıcılar ilan verirken vitrin talep ettiğinde veya panelden satın aldığında burada anında listelenir. Dilerseniz mevcut VIP ilanları doğrudan vitrine ekleyebilirsiniz:
                  </p>
                  <button
                    type="button"
                    onClick={() => setOnayMasasiTab('vip')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 mt-1 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>VIP İlanları Görüntüle ({vipListings.length})</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {displayedOnayListings.map((reqListing) => {
                    const slotIndex = selectedListingIds.indexOf(reqListing._id.toString());
                    const isAlreadyInVitrin = slotIndex !== -1;
                    const isLoadingAction = actionLoadingId === reqListing._id.toString();

                    return (
                      <div
                        key={reqListing._id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isAlreadyInVitrin
                            ? 'bg-[#070a0f] border-emerald-500/40 shadow-sm'
                            : 'bg-[#070a0f] border-amber-500/50 shadow-md'
                          }`}
                      >
                        {/* İlan Bilgisi */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#0c1017] border border-slate-800 shrink-0">
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
                                  ● Slot {slotIndex + 1}&apos;de Yayında
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[9px] font-bold flex items-center gap-1">
                                    ⏳ Onay Bekliyor
                                  </span>
                                  {reqListing.vitrinPaketi === 'haftalik' ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white font-black text-[10px] uppercase font-mono shadow-md flex items-center gap-1 animate-pulse">
                                      👑 HAFTALIK VIP (6.000 ₺)
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-[10px] uppercase font-mono shadow-md flex items-center gap-1 animate-pulse">
                                      ⚡ GÜNLÜK (2.000 ₺)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                              {reqListing.kullaniciAdi ? (
                                <span className="flex items-center gap-1 text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                                  <AtSign className="w-3 h-3 text-amber-400" />
                                  <span>{reqListing.kullaniciAdi}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px] font-mono">@sahipsiz</span>
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
                              {reqListing.vitrinBitisTarihi && (
                                <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${formatVitrinCountdown(reqListing.vitrinBitisTarihi).badgeBg} ${formatVitrinCountdown(reqListing.vitrinBitisTarihi).color}`}>
                                  {formatVitrinCountdown(reqListing.vitrinBitisTarihi).text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-wrap">
                          <Link
                            href={`/ilan/${reqListing.slug}`}
                            target="_blank"
                            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Canlı İlanı Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Vitrin Aksiyonları */}
                          {isAlreadyInVitrin ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleExtendDuration(reqListing._id.toString(), 1)}
                                disabled={isLoadingAction}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-black transition-all border border-amber-500/30 cursor-pointer"
                                title="Vitrin süresine +1 Gün ekle"
                              >
                                +1G Vitrin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExtendDuration(reqListing._id.toString(), 7)}
                                disabled={isLoadingAction}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white text-[11px] font-black transition-all border border-purple-500/30 cursor-pointer"
                                title="Vitrin süresine +7 Gün ekle"
                              >
                                +7G Vitrin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromVitrin(reqListing._id.toString())}
                                disabled={isLoadingAction}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                <span>Vitrinden Çıkar</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Günlük Onay Butonu */}
                              <button
                                type="button"
                                onClick={() => handleApproveWithDuration(reqListing._id.toString(), 1, 'gunluk')}
                                disabled={isLoadingAction}
                                className={`px-3 py-2 rounded-xl text-xs font-black uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${reqListing.vitrinPaketi === 'gunluk'
                                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800'
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
                                className={`px-3 py-2 rounded-xl text-xs font-black uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${reqListing.vitrinPaketi === 'haftalik'
                                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-white ring-2 ring-purple-300 shadow-purple-500/30'
                                    : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800'
                                  }`}
                              >
                                {isLoadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                                <span>💎 1 Haftalık Onayla (6.000 ₺)</span>
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

            {/* SAĞ SÜTUN (5 KOLON): İlan Havuzu & Doğrudan Slot Atama */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white font-heading">
                    Tüm İlanlar Havuzu
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredListings.length} İlan
                </span>
              </div>

              {/* Arama Input */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Başlık, il veya ilçe adı yaz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Filtre Pill'leri */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setListingFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${listingFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                >
                  Tümü ({allListings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingFilter('vip')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${listingFilter === 'vip' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                >
                  VIP ({allListings.filter(l => l.rozet === 'vip' || l.rozet === 'ultravip').length})
                </button>
                <button
                  type="button"
                  onClick={() => setListingFilter('selected')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${listingFilter === 'selected' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                >
                  Vitrindekiler ({selectedListingIds.length})
                </button>
              </div>

              {/* İlan Listesi */}
              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredListings.map((listing) => {
                  const slotIdx = selectedListingIds.indexOf(listing._id.toString());
                  const isSelected = slotIdx !== -1;

                  return (
                    <div
                      key={listing._id}
                      onClick={() => handleToggleListing(listing._id.toString())}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/80 shadow-md'
                          : 'bg-[#070a0f] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-[#0c1017] border border-slate-800 shrink-0">
                          <Image
                            src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=60'}
                            alt={listing.baslik}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-xs text-white truncate font-heading">
                            {listing.baslik}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold uppercase truncate">
                            {listing.ilSlug} / {listing.ilceSlug}
                          </span>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                            <span className="font-mono">{listing.rozet?.toUpperCase() || 'STANDART'}</span>
                            {isSelected && (
                              <span className="font-bold text-amber-300 font-mono">
                                • SLOT {slotIdx + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-slate-800 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SPONSORLU POPUP REKLAMLARI ──────────────── */}
      {activeMainTab === 'popup' && (
        <div className="w-full flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/30">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-white font-heading">
                    Sponsorlu Modal Popup Reklamları (İl / İlçe Hedefli)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Kullanıcı sayfaya girdiğinde belirlenen saniye sonra otomatik açılan dev görsel VIP model reklamları.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveSpecialAdsOnly}
                disabled={savingAd}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {savingAd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            {/* Yeni Reklam Ekleme Formu */}
            <div className="p-5 rounded-2xl bg-[#070a0f] border border-emerald-500/30 flex flex-col gap-3.5 shadow-lg">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Yeni Popup Reklamı Ekle</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* İlan Seçimi */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Yayınlanacak İlan *</label>
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
                    className="w-full px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">-- Listeden Bir İlan Seçin --</option>
                    {allListings.map((l) => (
                      <option key={l._id} value={l._id}>
                        [{l.ilSlug?.toUpperCase()}{l.ilceSlug ? ` / ${l.ilceSlug?.toUpperCase()}` : ''}] {l.baslik}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hedef Gösterim Konumu */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Hedef Gösterim Konumu</label>
                  <select
                    value={newAdHedefIl}
                    onChange={(e) => setNewAdHedefIl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none font-medium"
                  >
                    <option value="tum_turkiye">🇹🇷 TÜRKİYE GENELİ (Tüm Şehirler &amp; Anasayfa)</option>
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.ad}</option>
                    ))}
                  </select>
                </div>

                {/* Gecikme Saniyesi */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Açılış Gecikmesi (Saniye)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={newAdGecikme}
                      onChange={(e) => setNewAdGecikme(Number(e.target.value) || 4)}
                      className="w-24 px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewSpecialAd}
                      disabled={!newAdIlanId}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-heading disabled:opacity-40 transition-all cursor-pointer"
                    >
                      + Popup Ekle &amp; Yayına Al
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Popup Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ozelIlanReklamlar.map((ad, idx) => {
                const listing = getListingById(ad.ilanId);
                const stats = ad.ilanId ? popupStatsMap[ad.ilanId] : null;

                return (
                  <div
                    key={ad._id || idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      ad.aktif ? 'bg-[#070a0f] border-emerald-500/40 shadow-lg' : 'bg-[#070a0f]/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#0c1017] border border-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                        🎯 {ad.hedefIlSlug?.toUpperCase() || 'TÜRKİYE'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleAdActive(idx)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          ad.aktif ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ad.aktif ? '● AKTİF' : '○ PASİF'}
                      </button>
                    </div>

                    {listing ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-[#0c1017] border border-slate-800 shrink-0">
                          <Image
                            src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                            alt={listing.baslik}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-xs text-white truncate font-heading">{listing.baslik}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                            ⏱️ {ad.gecikmeSaniye} sn sonra açılır
                          </span>
                          {stats && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                              <span>👁️ {stats.impressions}</span>
                              <span>👆 {stats.totalClicks}</span>
                              <span className="text-emerald-400 font-bold">%{stats.ctr} CTR</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-rose-400">İlan silinmiş veya bulunamadı.</span>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialAd(idx)}
                        className="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer text-[11px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Kaldır</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: BOŞ VİTRİN GIF HAVUZU ──────────────── */}
      {activeMainTab === 'gif' && (
        <div className="w-full flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black border border-purple-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-white font-heading">
                    Boş Vitrin Reklam GIF Havuzu
                  </h2>
                  <p className="text-xs text-slate-400">
                    Vitrinde boş kalan slotlarda otomatik dönen yüksek çekicilikli VIP tanıtım GIF&apos;leri.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllGifs(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Tümünü Aç
                </button>
                <button
                  type="button"
                  onClick={handleSaveGifsOnly}
                  disabled={savingGifs}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {savingGifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Kaydet</span>
                </button>
              </div>
            </div>

            {/* Hazır Önerilen Presetler */}
            <div className="p-4 rounded-2xl bg-[#070a0f] border border-purple-500/30 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-purple-300 font-heading uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Tek Tıkla Hazır VIP Reklam GIF&apos;i Ekle</span>
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {PRESET_GIF_SUGGESTIONS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddPresetGif(preset)}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
                  >
                    <span>+ {preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Yeni Özel GIF Ekle */}
            <div className="p-4 rounded-2xl bg-[#070a0f] border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-white font-heading uppercase">Özel GIF URL&apos;si Ekle</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="url"
                  placeholder="https://.../ornek.gif"
                  value={newGifUrl}
                  onChange={(e) => setNewGifUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Başlık: Zirvede Yerini Al..."
                  value={newGifTitle}
                  onChange={(e) => setNewGifTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddNewGifSlide}
                className="self-start px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase font-heading transition-all cursor-pointer"
              >
                + GIF Havuzuna Ekle
              </button>
            </div>

            {/* Mevcut GIF Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {bosVitrinSliderlar.map((slide, sIdx) => (
                <div
                  key={slide._id || sIdx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    slide.aktif !== false ? 'bg-[#070a0f] border-purple-500/40 shadow-lg' : 'bg-[#070a0f]/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[#0c1017] border border-slate-800 group">
                    <img
                      src={slide.gifUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleGifActive(sIdx)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          slide.aktif !== false ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {slide.aktif !== false ? 'AKTİF' : 'PASİF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGifSlide(sIdx)}
                        className="p-1 rounded-full bg-rose-500 text-white cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleUpdateGifSlide(sIdx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-800 text-white font-bold text-xs focus:border-purple-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={slide.spot}
                      onChange={(e) => handleUpdateGifSlide(sIdx, 'spot', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-800 text-slate-400 text-[11px] focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: KAYAN DUYURU & HERO METİNLERİ ──────────────── */}
      {activeMainTab === 'duyuru' && (
        <div className="w-full flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-white font-heading">
                    Kayan Duyuru &amp; Hero Metinleri
                  </h2>
                  <p className="text-xs text-slate-400">
                    Anasayfanın en tepesindeki duyuru şeridi ve ana başlık ayarları.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveTickerOnly}
                disabled={savingTicker}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {savingTicker ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>

            {/* Hero Başlıkları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#070a0f] border border-slate-800">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Ana Başlığı</label>
                <input
                  type="text"
                  value={heroBaslik}
                  onChange={(e) => setHeroBaslik(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Alt Başlığı</label>
                <input
                  type="text"
                  value={heroAltBaslik}
                  onChange={(e) => setHeroAltBaslik(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Duyuru Listesi */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-heading uppercase">Kayan Ticker Duyuruları ({duyurular.length})</span>
                <button
                  type="button"
                  onClick={() => handleAddAnnouncement()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 font-bold text-xs border border-slate-800 transition-all cursor-pointer"
                >
                  + Yeni Duyuru Ekle
                </button>
              </div>

              {duyurular.map((d, dIdx) => (
                <div key={dIdx} className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex items-center gap-2.5 flex-wrap">
                  <input
                    type="text"
                    value={d.badge}
                    onChange={(e) => handleUpdateAnnouncement(dIdx, 'badge', e.target.value)}
                    placeholder="Rozet"
                    className="w-32 px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-800 text-amber-300 font-bold text-xs"
                  />
                  <input
                    type="text"
                    value={d.text}
                    onChange={(e) => handleUpdateAnnouncement(dIdx, 'text', e.target.value)}
                    placeholder="Duyuru metni"
                    className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={d.link}
                    onChange={(e) => handleUpdateAnnouncement(dIdx, 'link', e.target.value)}
                    placeholder="Link (/ilan-ver)"
                    className="w-36 px-2.5 py-1.5 rounded-lg bg-[#0c1017] border border-slate-800 text-slate-400 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncement(dIdx)}
                    className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: VIP WHATSAPP HATTI ──────────────── */}
      {activeMainTab === 'whatsapp' && (
        <div className="w-full flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black border border-emerald-500/30">
                  <OfficialWhatsAppIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-white font-heading">
                    Admin VIP WhatsApp Hattı
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sitede vitrin satın alma, reklam talepleri ve müşteri destek butonlarının bağlandığı resmi hat.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#070a0f] border border-emerald-500/30 flex flex-col gap-4 max-w-xl">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-300">Resmi WhatsApp Telefon Numarası</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={adminWhatsApp}
                    onChange={(e) => setAdminWhatsApp(e.target.value)}
                    placeholder="0530 000 00 00"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0c1017] border border-slate-800 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickSaveWhatsApp}
                    disabled={savingAdminWa}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase font-heading transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingAdminWa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Kaydet</span>
                  </button>
                </div>
              </label>

              {adminWaSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  WhatsApp hattı başarıyla güncellendi!
                </span>
              )}

              {adminWhatsApp && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Canlı Bağlantıyı Test Et:</span>
                  <a
                    href={`https://wa.me/${adminWhatsApp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-mono font-bold text-xs transition-all flex items-center gap-1.5 border border-emerald-500/30"
                  >
                    <span>wa.me/{adminWhatsApp.replace(/\D/g, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
