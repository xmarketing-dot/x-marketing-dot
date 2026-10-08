'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isSearchEngineBot } from '@/lib/botDetection';

interface Props {
  zoneId?: string;
  className?: string;
}

export default function ExoClickBanner({ zoneId = '6050980', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    // Arama motoru botlarına ve kamu denetleyicilerine reklam scriptini yükleme (SEO & BTK koruması)
    if (isSearchEngineBot()) return;

    // Reklam içeriği gerçekten geldiyse (Görsel veya Link) alanı görünür yap
    const checkContent = () => {
      if (insRef.current) {
        const hasImg = !!insRef.current.querySelector('img');
        const hasA = !!insRef.current.querySelector('a');
        const hasChildren = insRef.current.children.length > 0;
        if (hasImg || hasA || hasChildren) {
          setHasAd(true);
          return true;
        }
      }
      return false;
    };

    // 1. ExoClick özel olaylarını (events) dinle
    const handleLoaded = () => setHasAd(true);
    document.addEventListener(`creativeLoaded-${zoneId}`, handleLoaded);
    document.addEventListener(`creativeDisplayed-${zoneId}`, handleLoaded);

    // 2. DOM Değişikliğini Dinle (AdBlock yoksa ve reklam enjekte edilirse)
    let observer: MutationObserver | null = null;
    if (insRef.current && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        if (checkContent() && observer) {
          observer.disconnect();
        }
      });
      observer.observe(insRef.current, { childList: true, subtree: true });
    }

    // 3. Periyodik kontrol
    const interval = setInterval(() => {
      if (checkContent()) {
        clearInterval(interval);
      }
    }, 300);

    const triggerServe = () => {
      try {
        const w = window as any;
        w.AdProvider = w.AdProvider || [];
        w.AdProvider.push({ serve: {} });
      } catch (e) {
        // sessizce geç
      }
    };

    // 4. ExoClick ad-provider scriptini yükle
    const scriptId = 'exoclick-ad-provider-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/javascript';
      script.async = true;
      script.src = 'https://a.magsrv.com/ad-provider.js';
      script.onload = () => {
        setTimeout(triggerServe, 50);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(triggerServe, 50);
    }

    return () => {
      document.removeEventListener(`creativeLoaded-${zoneId}`, handleLoaded);
      document.removeEventListener(`creativeDisplayed-${zoneId}`, handleLoaded);
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, [zoneId]);

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-300 ${
        hasAd
          ? `flex flex-col items-center justify-center my-1.5 sm:my-2 select-none exoclick-responsive-box has-ad ${className}`
          : 'h-0 min-h-0 m-0 p-0 overflow-hidden opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={
          hasAd
            ? 'w-auto max-w-[308px] h-[106px] max-h-[110px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-amber-500/40 bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] p-0.5 flex items-center justify-center'
            : 'w-full'
        }
      >
        <ins
          ref={insRef}
          className="eas6a97888e10"
          data-zoneid={zoneId}
          data-keywords="casino,slot,bet,dating,escort,live"
          data-block-ad-types="0"
          data-ex-av="name"
          style={hasAd ? { display: 'block', width: '300px', height: '100px', margin: '0 auto' } : { display: 'block', width: '100%' }}
        />
      </div>
    </div>
  );
}
