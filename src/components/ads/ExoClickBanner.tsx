'use client';

import React, { useEffect, useRef } from 'react';
import { isSearchEngineBot } from '@/lib/botDetection';

interface Props {
  zoneId?: string;
  className?: string;
}

export default function ExoClickBanner({ zoneId = '6050980', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Arama motoru botlarına ve kamu denetleyicilerine reklam scriptini yükleme (SEO & BTK koruması)
    if (isSearchEngineBot()) return;

    const triggerServe = () => {
      try {
        const w = window as any;
        w.AdProvider = w.AdProvider || [];
        w.AdProvider.push({ serve: {} });
      } catch (e) {
        // sessizce geç
      }
    };

    // 1. ExoClick ad-provider scriptini güvenle yükle
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
      // Script zaten yüklüyse gecikmeli serve tetikle (DOM hazır olsun)
      setTimeout(triggerServe, 50);
    }
  }, [zoneId]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center justify-center overflow-hidden my-1 sm:my-2 ${className}`}
    >
      <div className="w-full max-w-[330px] flex items-center justify-center rounded-2xl bg-[#090d16]/90 border border-amber-500/20 p-1.5 shadow-lg shadow-black/50 overflow-hidden">
        <ins
          className="eas6a97888e10"
          data-zoneid={zoneId}
          data-keywords="keywords"
          style={{ display: 'inline-block', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}
