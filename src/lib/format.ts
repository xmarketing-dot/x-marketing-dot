export function formatWhatsAppNumber(num: string): string {
  let clean = (num || '').replace(/\D/g, '');
  if (!clean) return '905000000000';
  // Standard Turkish mobile 05xx... -> 905xx...
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '90' + clean.slice(1);
  } else if (clean.length === 10 && clean.startsWith('5')) {
    // Standard Turkish mobile 5xx... -> 905xx...
    clean = '90' + clean;
  }
  // International numbers or fallback
  return clean;
}

export function buildCustomWhatsAppMessage(options: {
  baslik: string;
  slug?: string;
  ilSlug?: string;
  ilceSlug?: string;
  defaultDomain?: string;
}): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (options.defaultDomain || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.besteskort.online');
    
  const fullUrl = options.slug ? `${origin}/ilan/${options.slug}` : (typeof window !== 'undefined' ? window.location.href : origin);
  
  const il = options.ilSlug ? options.ilSlug.charAt(0).toUpperCase() + options.ilSlug.slice(1).replace(/-/g, ' ') : '';
  const ilce = options.ilceSlug ? options.ilceSlug.charAt(0).toUpperCase() + options.ilceSlug.slice(1).replace(/-/g, ' ') : '';
  const loc = il && ilce && il.toLowerCase() !== ilce.toLowerCase()
    ? `${il} / ${ilce}`
    : (ilce || il || '');

  const locPart = loc ? ` [${loc}]` : '';
  return `Merhaba ${options.baslik}${locPart}, ${fullUrl} adresindeki ilanınızı gördüm. Görüşme ve detaylar hakkında bilgi alabilir miyim?`;
}

