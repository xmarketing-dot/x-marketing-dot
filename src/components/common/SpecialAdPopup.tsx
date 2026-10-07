'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { X, Flame, ChevronRight, Crown, MapPin, ShieldCheck } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import { trackEvent } from '@/components/common/AnalyticsTracker';

interface SpecialAdItem {
  _id?: string;
  aktif: boolean;
  ilanId?: string | null;
  hedefIlSlug?: string;
  gecikmeSaniye?: number;
  baslik?: string;
  spotMetin?: string;
  rozet?: string;
  ilan?: {
    _id: string;
    slug: string;
    baslik: string;
    ilSlug: string;
    ilceSlug: string;
    anaFotograf?: { url: string };
    fotograflar?: { url: string }[];
    whatsappNumara?: string;
    rozet?: string;
    status?: string;
  };
}

export default function SpecialAdPopup() {
  const [activeAds, setActiveAds] = useState<SpecialAdItem[]>([]);
  const [currentAd, setCurrentAd] = useState<SpecialAdItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Extract current location context from pathname (e.g. /istanbul, /istanbul/kadikoy)
  const { currentCitySlug, currentDistrictSlug } = useMemo(() => {
    if (!pathname || pathname === '/') return { currentCitySlug: '', currentDistrictSlug: '' };
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] && !['kategori', 'ilan', 'ara', 'sehirler', 'bms-secure-portal', 'chat', 'panelim', 'ilan-ver', 'reklam-ver'].includes(segments[0])) {
      return {
        currentCitySlug: segments[0].toLowerCase(),
        currentDistrictSlug: segments[1] ? segments[1].toLowerCase() : '',
      };
    }
    return { currentCitySlug: '', currentDistrictSlug: '' };
  }, [pathname]);

  useEffect(() => {
    // 0. Search bot check: Arama motoru botlarına asla popup gösterme
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|crawler|spider|robot/i.test(ua)) {
        return;
      }
    }

    // 1. Strictly MOBILE-ONLY: Don't show on desktop web, admin portal or chat
    if (pathname?.startsWith('/bms-secure-portal') || pathname === '/chat') {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return;
    }

    // 2. SESSION CONTROL: Kullanıcı oturumu boyunca (tarayıcı sekmesi kapanana kadar) sadece 1 KEZ göster!
    // Sayfa değiştirildiğinde tekrar tekrar patlamasın.
    if (typeof window !== 'undefined') {
      const isAlreadyShown = sessionStorage.getItem('bms_popup_shown_session');
      if (isAlreadyShown === 'true') {
        return;
      }
    }

    // Fetch config
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        const adsList: SpecialAdItem[] = [];

        // Check multi-ad array
        if (Array.isArray(data?.config?.ozelIlanReklamlar)) {
          data.config.ozelIlanReklamlar.forEach((ad: SpecialAdItem) => {
            if (ad.aktif && ad.ilan && (ad.ilan.status === 'yayinda' || !ad.ilan.status)) {
              adsList.push(ad);
            }
          });
        }

        // Fallback to legacy single ad if array is empty
        if (adsList.length === 0 && data?.config?.ozelIlanReklam?.aktif && data?.config?.ozelIlanReklam?.ilan) {
          adsList.push(data.config.ozelIlanReklam);
        }

        if (adsList.length > 0) {
          setActiveAds(adsList);

          // ── KATI ŞEHİR / İLÇE HEDEFLEME ALGORİTMASI ──
          // Kullanıcının bulunduğu şehir: 1. URL'deki şehir slug'ı veya 2. IP üzerinden algılanan detectedCity
          const detectedCity = (data?.detectedCity || '').toLowerCase().trim();
          const effectiveCity = currentCitySlug || detectedCity;
          const effectiveDistrict = currentDistrictSlug || '';

          // A) Konum Eşleşen Reklamlar (Sadece kullanıcının şehrine / ilçesine ait olanlar)
          const locationMatched = adsList.filter((ad) => {
            const target = (ad.hedefIlSlug || '').toLowerCase().trim();
            const listingCity = (ad.ilan?.ilSlug || '').toLowerCase().trim();
            const listingDistrict = (ad.ilan?.ilceSlug || '').toLowerCase().trim();

            // Eğer hedef "tum_turkiye" ise genel havuza aittir, buraya girmez
            if (!target || target === 'tum_turkiye' || target === 'hepsi' || target === 'all') {
              return false;
            }

            // İlçe hedeflemesi eşleşmesi (örn: istanbul/beylikduzu veya beylikduzu)
            if (effectiveDistrict && (target.includes(effectiveDistrict) || listingDistrict === effectiveDistrict)) {
              return true;
            }

            // İl hedeflemesi eşleşmesi (örn: "eskisehir", "istanbul", "izmir")
            if (effectiveCity && (target === effectiveCity || target.startsWith(`${effectiveCity}/`) || listingCity === effectiveCity)) {
              return true;
            }

            return false;
          });

          // B) Tüm Türkiye Genel Reklamları (Her şehirdeki kullanıcıya gösterilebilir)
          const generalAds = adsList.filter((ad) => {
            const target = (ad.hedefIlSlug || '').toLowerCase().trim();
            return !target || target === 'tum_turkiye' || target === 'hepsi' || target === 'all';
          });

          // KESİN KURAL:
          // 1. Kullanıcının şehrine özel reklam varsa onu göster.
          // 2. Yoksa Tüm Türkiye genel reklamı varsa onu göster.
          // 3. Başka şehre (örn. Eskişehir) ait reklamı İstanbul'daki veya alakasız kullanıcıya ASLA GÖSTERME (candidates boş kalır).
          const candidates = locationMatched.length > 0 ? locationMatched : generalAds;

          if (candidates.length === 0) {
            setCurrentAd(null);
            setIsOpen(false);
            return;
          }

          // C) Sıralı Rotasyon: Session'daki index'i okuyup sıradaki reklamı seç
          let cycleIdx = 0;
          if (typeof window !== 'undefined') {
            const savedIdx = parseInt(sessionStorage.getItem('bms_special_ad_cycle_idx') || '0', 10);
            cycleIdx = (savedIdx >= 0 && savedIdx < candidates.length) ? savedIdx : 0;
            sessionStorage.setItem('bms_special_ad_cycle_idx', String((cycleIdx + 1) % candidates.length));
          }

          const selected = candidates[cycleIdx] || candidates[0];
          setCurrentAd(selected);
        }
      })
      .catch(() => {});
  }, [pathname, currentCitySlug]);

  useEffect(() => {
    if (!currentAd || !currentAd.aktif) return;

    // Check session again
    if (typeof window !== 'undefined') {
      const isAlreadyShown = sessionStorage.getItem('bms_popup_shown_session');
      if (isAlreadyShown === 'true') {
        return;
      }
    }

    const delayMs = Math.max(2, currentAd.gecikmeSaniye || 3) * 1000;

    let timer: NodeJS.Timeout | null = null;
    let triggered = false;

    const showAd = () => {
      if (triggered) return;
      triggered = true;

      // Mark session as shown so it never pops up again in this browser tab/session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bms_popup_shown_session', 'true');
      }

      setIsOpen(true);

      const lId = currentAd?.ilan?._id || currentAd?.ilanId;
      const lSlug = currentAd?.ilan?.slug;
      const lTitle = currentAd?.ilan?.baslik || currentAd?.baslik;
      const lCity = currentAd?.hedefIlSlug || currentAd?.ilan?.ilSlug;

      trackEvent('special_ad_impression', {
        listingId: lId,
        slug: lSlug,
        title: lTitle,
        targetCity: lCity,
      });
      if ((window as any).trackListingImpression && lId) {
        (window as any).trackListingImpression({
          listingId: lId,
          slug: lSlug,
          title: lTitle,
          city: lCity,
        });
      }
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };

    // Trigger on timer (e.g. 3 seconds)
    timer = setTimeout(() => {
      showAd();
    }, delayMs);

    // Or trigger when user scrolls down 180px
    const handleScroll = () => {
      if (window.scrollY > 180) {
        showAd();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentAd]);

  // Extract all photos from selected listing
  const photos = useMemo(() => {
    const list: string[] = [];
    if (currentAd?.ilan?.anaFotograf?.url) {
      list.push(currentAd.ilan.anaFotograf.url);
    }
    if (Array.isArray(currentAd?.ilan?.fotograflar)) {
      currentAd.ilan.fotograflar.forEach((f) => {
        if (f?.url && !list.includes(f.url)) list.push(f.url);
      });
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=800');
    }
    return list;
  }, [currentAd]);

  // Auto-rotate photos in popup if multiple photos exist
  useEffect(() => {
    if (!isOpen || photos.length <= 1) return;
    const interval = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isOpen, photos.length]);

  // Touch Swipe Handlers for Mobile in Popup
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    if (distance > 40) {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    } else if (distance < -40) {
      setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (!isOpen || !currentAd || !currentAd.aktif) return null;

  const listing = currentAd.ilan;
  const targetSlug = listing?.slug || '';
  const displayTitle = listing?.baslik || currentAd.baslik || 'Özel VIP İlan';
  const displayLocation = listing ? `${listing.ilSlug?.toUpperCase()} / ${listing.ilceSlug?.toUpperCase()}` : 'TÜRKİYE GENELİ';
  const targetUrl = targetSlug ? `/ilan/${targetSlug}` : '/ilan-ver';

  const popupOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const popupAdUrl = targetSlug ? `${popupOrigin}/ilan/${targetSlug}` : popupOrigin;
  const ilName = listing?.ilSlug ? listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1) : '';
  const ilceName = listing?.ilceSlug ? listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1) : '';
  const popupLoc = ilName && ilceName && ilName.toLowerCase() !== ilceName.toLowerCase()
    ? `${ilName} - ${ilceName} Eskort`
    : (ilceName ? `${ilceName} Eskort` : (ilName ? `${ilName} Eskort` : ''));
  const popupAdLabel = popupLoc ? `${popupLoc} — ${displayTitle}` : displayTitle;
  const popupMessage = `Merhaba, ben ${popupAdUrl} adresindeki "${popupAdLabel}" özel vitrin ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`;

  const formattedWa = listing?.whatsappNumara ? formatWhatsAppNumber(listing.whatsappNumara) : '';
  const waUrl = formattedWa
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(popupMessage)}`
    : null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bms_popup_shown_session', 'true');
    }
    setIsOpen(false);
  };

  const handleGoToAd = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bms_popup_shown_session', 'true');
    }
    setIsOpen(false);
    trackEvent('special_ad_click', {
      listingId: listing?._id,
      title: displayTitle,
      targetUrl,
    });
    router.push(targetUrl);
  };

  return (
    <div 
      onClick={handleClose}
      className="md:hidden fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[360px] sm:max-w-[380px] rounded-[32px] overflow-hidden bg-[#12161f] border-2 border-amber-400 shadow-[0_0_90px_rgba(245,158,11,0.7)] flex flex-col animate-in zoom-in-95 duration-300 my-auto"
      >
        
        {/* Kapat Butonu (Sağ Üst) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/80 text-white hover:text-amber-400 border border-white/20 flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-xl"
          title="Kapat"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* ── 1. DİKEY (PORTRAIT) FOTOĞRAF ALANI ──────────────── */}
        <div 
          onClick={handleGoToAd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-[4/5] w-full bg-[#0d1117] overflow-hidden cursor-pointer group"
        >
          {photos.map((src, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === activePhotoIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={src}
                alt={displayTitle}
                fill
                sizes="(max-width: 640px) 360px, 380px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority={idx === 0}
              />
            </div>
          ))}

          {/* Üst Karartma & Rozet */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12161f] via-black/20 to-black/60 z-20 pointer-events-none" />

          {/* Sol Üst Sponsorlu Rozeti */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-black text-[11px] font-heading shadow-lg backdrop-blur-md border border-amber-300">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>{currentAd.rozet || 'SPONSORLU VIP'}</span>
          </div>

          {/* Fotoğraf Sayısı / Dot Göstergeleri */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activePhotoIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. BİLGİ & AKSİYON ALANI (ALT KISIM) ──────────────── */}
        <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-[#12161f] text-left">
          {/* Başlık ve Konum */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider font-heading">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{displayLocation}</span>
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Doğrulanmış
              </span>
            </div>
            <h3 
              onClick={handleGoToAd}
              className="text-lg font-black text-white font-heading hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {displayTitle}
            </h3>
            <p className="text-xs text-[#8b949e] line-clamp-2">
              {currentAd.spotMetin || 'Seçkin ve güvenilir görüşmeler için WhatsApp üzerinden anında randevu oluşturabilirsiniz.'}
            </p>
          </div>

          {/* Aksiyon Butonları (WhatsApp ve İlanı İncele) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('bms_popup_shown_session', 'true');
                  }
                  trackEvent('special_ad_whatsapp_click', {
                    listingId: listing?._id,
                    title: displayTitle,
                    city: listing?.ilSlug,
                  });
                  setIsOpen(false);
                }}
                className="col-span-1 py-3 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={handleGoToAd}
              className={`${
                waUrl ? 'col-span-1' : 'col-span-2'
              } py-3 px-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all`}
            >
              <span>İlanı İncele</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
