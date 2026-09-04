import { headers } from 'next/headers';

/**
 * Returns the canonical site URL based on environment variables (fallback).
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  // Asla gizli Vercel preview URL'lerini sitemap veya canonical meta etiketlerine sızdırma!
  return 'https://besteskort.devs.surf';
}

/**
 * Returns the exact dynamic site URL for the current incoming HTTP request.
 * Automatically adapts to any incoming custom domain or subdomain.
 */
export async function getRequestSiteUrl(): Promise<string> {
  try {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  } catch (e) {
    // If called outside request context (e.g. static generation)
  }

  return getSiteUrl();
}

/**
 * Subdomain veya ana domain durumuna göre en doğru canonical URL'i hesaplar.
 * Eğer gelen istek zaten o il/ilçeye ait özel bir subdomain ise (örn: istanbulescort.devs.surf),
 * canonical URL olarak subdomainin anasayfasını (/) gösterir; böylece Yandex ve Google subdomain anasayfasını dizine alır.
 */
export function getCanonicalUrlForLocation(siteUrl: string, ilSlug: string, ilceSlug?: string): string {
  try {
    const url = new URL(siteUrl);
    const host = url.hostname.toLowerCase();
    
    // Eğer ilçe subdomaini ise (örn: beylikduzuescort.devs.surf veya beylikduzueskort.devs.surf)
    if (ilceSlug) {
      const cleanIlce = ilceSlug.replace(/[-_]/g, '');
      if (host.includes(cleanIlce)) {
        return siteUrl;
      }
    }

    // Eğer il subdomaini ise (örn: istanbulescort.devs.surf veya izmireskort.devs.surf)
    if (!ilceSlug && ilSlug) {
      const cleanIl = ilSlug.replace(/[-_]/g, '');
      if (host.includes(cleanIl)) {
        return siteUrl;
      }
    }
  } catch (e) {
    // URL parsing hatasında fallback
  }

  if (ilceSlug) {
    return `${siteUrl}/${ilSlug}/${ilceSlug}`;
  }
  return `${siteUrl}/${ilSlug}`;
}

