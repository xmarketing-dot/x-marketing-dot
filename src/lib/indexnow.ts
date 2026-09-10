import { getSiteUrl } from '@/lib/siteUrl';

// IndexNow standart 32-karakter doğrulama anahtarı
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '9b8ca2b97769a1ce9b8ca2b97769a1ce';

export interface IndexNowResult {
  success: boolean;
  submittedCount: number;
  message: string;
  endpoints: {
    yandex?: boolean;
    bing?: boolean;
    indexnow?: boolean;
    googleSitemapPing?: boolean;
  };
}

/**
 * Dinamik URL listesini ait oldukları domain/subdomain bazında gruplar ve her domain için
 * IndexNow (Yandex, Bing, IndexNow) ve Google Sitemap bildirimlerini anlık olarak iletir.
 */
export async function submitToIndexNow(
  urls: string | string[],
  fallbackHost?: string
): Promise<IndexNowResult> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  if (urlList.length === 0) {
    return {
      success: false,
      submittedCount: 0,
      message: 'Gönderilecek URL bulunamadı.',
      endpoints: {},
    };
  }

  const defaultBaseUrl = getSiteUrl();

  // 1. URL'leri ait oldukları dinamik hostname'e göre grupla
  const groupedByHost = new Map<string, string[]>();

  for (const rawUrl of urlList) {
    if (!rawUrl) continue;
    let fullUrl = rawUrl;
    let hostname = fallbackHost || '';

    try {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        const parsed = new URL(rawUrl);
        hostname = parsed.hostname;
        fullUrl = rawUrl;
      } else {
        const parsedBase = new URL(defaultBaseUrl);
        hostname = fallbackHost || parsedBase.hostname;
        fullUrl = `${parsedBase.protocol}//${hostname}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
      }
    } catch {
      continue;
    }

    if (!hostname) continue;

    if (!groupedByHost.has(hostname)) {
      groupedByHost.set(hostname, []);
    }
    groupedByHost.get(hostname)!.push(fullUrl);
  }

  const endpointsStatus: Record<string, boolean> = {
    yandex: false,
    indexnow: false,
    bing: false,
    googleSitemapPing: false,
  };

  let totalSubmitted = 0;

  // 2. Her dinamik domain/subdomain grubu için ayrı ayrı IndexNow ve Ping gönderimi yap
  for (const [hostname, hostUrls] of groupedByHost.entries()) {
    totalSubmitted += hostUrls.length;

    const payload = {
      host: hostname,
      key: INDEXNOW_KEY,
      keyLocation: `https://${hostname}/${INDEXNOW_KEY}.txt`,
      urlList: hostUrls.slice(0, 10000),
    };

    const indexNowEndpoints = [
      { name: 'yandex', url: 'https://yandex.com/indexnow' },
      { name: 'indexnow', url: 'https://api.indexnow.org/indexnow' },
      { name: 'bing', url: 'https://www.bing.com/indexnow' },
    ];

    // A. IndexNow Gönderimleri (Yandex & Bing)
    await Promise.all(
      indexNowEndpoints.map(async (ep) => {
        try {
          const res = await fetch(ep.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(payload),
          });
          if (res.status === 200 || res.status === 202) {
            endpointsStatus[ep.name] = true;
          }
        } catch {
          // Silent catch for resilience
        }
      })
    );

    // B. Google & Yandex Sitemap Anlık Ping Gönderimi
    try {
      const sitemapUrl = encodeURIComponent(`https://${hostname}/sitemap.xml`);
      const googlePing = fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(() => null);
      const yandexPing = fetch(`https://blogs.yandex.ru/pings/?status=success&url=${sitemapUrl}`).catch(() => null);
      await Promise.all([googlePing, yandexPing]);
      endpointsStatus.googleSitemapPing = true;
    } catch {
      // Silent
    }
  }

  const atLeastOneSuccess = Object.values(endpointsStatus).some(Boolean);

  return {
    success: atLeastOneSuccess,
    submittedCount: totalSubmitted,
    message: atLeastOneSuccess
      ? `${totalSubmitted} adres dinamik domainler (${Array.from(groupedByHost.keys()).join(', ')}) üzerinden IndexNow ve arama motorlarına iletildi.`
      : 'İndeks bildiriminde bağlantı hatası oluştu.',
    endpoints: endpointsStatus,
  };
}
