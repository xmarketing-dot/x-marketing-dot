'use client';

import React from 'react';

interface ContactButtonsProps {
  numara: string;
  baslik: string;
  listingId?: string;
  slug?: string;
  ilce?: string;
  il?: string;
  customMessage?: string;
  compact?: boolean;
  className?: string;
}

export const OfficialWhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.84 0-3.542-.495-5.013-1.357l-.36-.21-3.725.977.994-3.63-.231-.368c-.947-1.51-1.447-3.262-1.447-5.06 0-5.385 4.382-9.767 9.77-9.767 2.607 0 5.059 1.017 6.903 2.862 1.843 1.845 2.859 4.298 2.859 6.905 0 5.387-4.383 9.768-9.77 9.768m0-21.684C5.938.16.038 6.06.038 13.064c0 2.24.582 4.426 1.689 6.347L0 24l4.721-1.238c1.85 1.008 3.939 1.54 6.069 1.54 6.96 0 12.86-5.9 12.86-12.904 0-3.442-1.34-6.68-3.774-9.114C17.442 1.5 14.204.16 10.763.16z" />
  </svg>
);

import { formatWhatsAppNumber } from '@/lib/format';

export default function WhatsAppButton({
  numara,
  baslik,
  listingId,
  slug,
  ilce,
  il,
  customMessage,
  compact = false,
  className = '',
}: ContactButtonsProps) {
  const formattedNumber = formatWhatsAppNumber(numara);

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://besteskort.devs.surf';
  const fullUrl = slug ? `${origin}/ilan/${slug}` : (typeof window !== 'undefined' ? window.location.href : origin);

  const locTitle = ilce 
    ? `${ilce} Eskort` 
    : il 
    ? `${il} Eskort` 
    : '';

  const adLabel = locTitle ? `${locTitle} — ${baslik}` : baslik;
  const defaultMsg = `Merhaba, ben ${fullUrl} adresindeki "${adLabel}" ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`;

  const finalMessage = customMessage || defaultMsg;
  const message = encodeURIComponent(finalMessage);
  const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).trackEvent) {
      (window as any).trackEvent('whatsapp_click', {
        listingId,
        title: baslik,
        phone: formattedNumber,
      });
    }
    if (listingId) {
      fetch('/api/listings/click-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      }).catch(() => {});
    }
  };

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all font-heading"
          title="WhatsApp'tan Mesaj Gönder"
        >
          <OfficialWhatsAppIcon className="w-4 h-4 fill-slate-950" />
          <span>WhatsApp ile İletişim</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl active:scale-98 transition-all font-heading cursor-pointer"
      >
        <OfficialWhatsAppIcon className="w-5 h-5 fill-slate-950 shrink-0" />
        <span>WhatsApp ile Hemen İletişime Geç</span>
      </a>
    </div>
  );
}

