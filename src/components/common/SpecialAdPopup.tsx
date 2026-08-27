'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { X, Flame, ChevronRight, Crown, MapPin, ShieldCheck } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';

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
  const hasDismissedThisVisitRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Extract current location context from pathname (e.g. /istanbul, /istanbul/kadikoy)
  const currentCitySlug = useMemo(() => {
    if (!pathname || pathname === '/') return '';
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] && segments[0] !== 'kategori' && segments[0] !== 'ilan' && segments[0] !== 'ara' && segments[0] !== 'sehirler') {
      return segments[0].toLowerCase();
    }
    return '';
  }, [pathname]);

  useEffect(() => {
    // Strictly MOBILE-ONLY: Don't show on desktop web, admin portal or chat
    if (pathname?.startsWith('/bms-secure-portal') || pathname === '/chat') {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return;
    }

    // Fetch config
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        const adsList: SpecialAdItem[] = [];

        // Check new multi-ad array
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

          // ── AKILLI KONUM VE SIRALI ROTASYON ALGORİTMASI ──
          // 1. Kullanıcının bulunduğu şehre özel reklamları önceliklendir (Geo-Targeting)
          const cityMatched = adsList.filter((ad) => {
            const targetCity = (ad.hedefIlSlug || '').toLowerCase();
            const listingCity = (ad.ilan?.ilSlug || '').toLowerCase();
            return currentCitySlug && (targetCity === currentCitySlug || listingCity === currentCitySlug);
          });

          // 2. Tüm Türkiye genel reklamları
          const generalAds = adsList.filter((ad) => {
            const targetCity = (ad.hedefIlSlug || '').toLowerCase();
            return !targetCity || targetCity === 'tum_turkiye' || targetCity === 'hepsi';
          });

          const candidates = cityMatched.length > 0 ? cityMatched : (generalAds.length > 0 ? generalAds : adsList);

          // 3. Sıralı Rotasyon: Session'daki index'i okuyup sıradaki reklamı seç
          let cycleIdx = 0;
          if (typeof window !== 'undefined') {
            const savedIdx = parseInt(sessionStorage.getItem('bms_special_ad_cycle_idx') || '0', 10);
            cycleIdx = (savedIdx >= 0 && savedIdx < candidates.length) ? savedIdx : 0;
            // Next time, show next ad in rotation
            sessionStorage.setItem('bms_special_ad_cycle_idx', String((cycleIdx + 1) % candidates.length));
          }

          const selected = candidates[cycleIdx] || candidates[0];
          setCurrentAd(selected);
        }
      })
      .catch(() => {});
  }, [pathname, currentCitySlug]);

  useEffect(() => {
    if (!currentAd || !currentAd.aktif || hasDismissedThisVisitRef.current) return;

    const delayMs = Math.max(2, currentAd.gecikmeSaniye || 4) * 1000;

    let timer: NodeJS.Timeout | null = null;
    let triggered = false;

    const showAd = () => {
      if (triggered || hasDismissedThisVisitRef.current) return;
      triggered = true;
      setIsOpen(true);
      if (typeof window !== 'undefined' && (window as any).trackEvent) {
        (window as any).trackEvent('special_ad_impression', {
          listingId: currentAd?.ilan?._id || currentAd?.ilanId,
          title: currentAd?.ilan?.baslik || currentAd?.baslik,
          targetCity: currentAd?.hedefIlSlug || currentAd?.ilan?.ilSlug,
        });
      }
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };

    // Trigger on timer (e.g. 4 seconds)
    timer = setTimeout(() => {
      showAd();
    }, delayMs);

    // Or trigger when user scrolls down 200px
    const handleScroll = () => {
      if (window.scrollY > 200) {
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

  const formattedWa = listing?.whatsappNumara ? formatWhatsAppNumber(listing.whatsappNumara) : '';
  const waUrl = formattedWa
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`Merhaba, "${displayTitle}" özel vitrin ilanınız hakkında bilgi almak istiyorum.`)}`
    : null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    hasDismissedThisVisitRef.current = true;
    setIsOpen(false);
  };

  const handleGoToAd = () => {
    hasDismissedThisVisitRef.current = true;
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      if ((window as any).trackEvent) {
        (window as any).trackEvent('special_ad_click', {
          listingId: listing?._id,
          title: displayTitle,
          targetUrl,
        });
      }
    }
    router.push(targetUrl);
  };

  return (
    <div 
      onClick={handleClose}
      className="md:hidden fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[32px] overflow-hidden bg-[#161b22] border-2 border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.6)] flex flex-col animate-in zoom-in-95 duration-300 my-auto"
      >
        
        {/* Kapat Butonu (Sağ Üst) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/80 text-white hover:text-amber-400 border border-white/20 flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-lg"
          title="Kapat"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* ── 1. DİKEY (PORTRAIT) 3/4 FOTOĞRAF ALANI ──────────────── */}
        <div 
          onClick={handleGoToAd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-[3/4] w-full bg-[#0d1117] overflow-hidden cursor-pointer group"
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
                alt={`${displayTitle} - Foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[1.02]"
                loading="lazy"
              />
            </div>
          ))}

          {/* Karartma Gradyanı */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-black/50 z-10 pointer-events-none" />

          {/* Sol Üst Sponsorlu Rozeti */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-[9px] uppercase font-heading tracking-wider shadow-lg flex items-center gap-1">
              <Crown className="w-3 h-3 fill-slate-950" />
              <span>{currentAd.rozet || '🔥 GÜNÜN ÖZEL VIP İLANI'}</span>
            </span>
          </div>

          {/* Fotoğraf Slide Nokta Göstergeleri */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center gap-1 pointer-events-none">
              {photos.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === activePhotoIdx
                      ? 'w-4 bg-amber-400 shadow-sm shadow-black'
                      : 'w-1.5 bg-white/50 backdrop-blur-sm'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. ALT BİLGİ & DÖNÜŞÜM ALANI ──────────────── */}
        <div className="p-4 pt-3 flex flex-col gap-2.5 text-center bg-[#161b22]">
          
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{displayLocation}</span>
              <span className="text-emerald-400 font-mono text-[9px]">● Doğrulandı</span>
            </div>

            <h2 className="font-black text-sm sm:text-base text-white font-heading tracking-tight leading-snug drop-shadow-md text-amber-300 line-clamp-2">
              {displayTitle}
            </h2>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col gap-2 pt-0.5 font-heading">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  hasDismissedThisVisitRef.current = true;
                  setIsOpen(false);
                  if ((window as any).trackEvent) {
                    (window as any).trackEvent('special_ad_whatsapp_click', {
                      listingId: listing?._id,
                      title: displayTitle,
                    });
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                <span>WhatsApp ile Hemen Yaz</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleGoToAd}
              className="w-full py-2 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs border border-[#30363d] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Profili &amp; Fotoğrafları İncele</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-[10px] text-[#8b949e] hover:text-white transition-colors"
          >
            Kapat ve Devam Et
          </button>

        </div>

      </div>
    </div>
  );
}
