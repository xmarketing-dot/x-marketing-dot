import crypto from 'crypto';
import { ICompetitor } from '@/models/KeywordRank';
import { getSiteUrl } from '@/lib/siteUrl';

export function getPrimaryDomain(): string {
  try {
    const raw = getSiteUrl();
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return host;
    }
  } catch (e) {}
  return 'besteskort.online';
}

export const EXACT_OUR_DOMAINS = new Set([
  'besteskort.online',
  'www.besteskort.online',
  'escturkiye.space',
  'www.escturkiye.space',
]);

export function isOurSiteDomain(hostname: string, targetDomain?: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '').trim();
  const rawHost = hostname.toLowerCase().trim();

  // 1. Bizim iki resmi domainimiz
  if (
    host === 'besteskort.online' ||
    rawHost === 'besteskort.online' ||
    host === 'escturkiye.space' ||
    rawHost === 'escturkiye.space' ||
    EXACT_OUR_DOMAINS.has(host) ||
    EXACT_OUR_DOMAINS.has(rawHost)
  ) {
    return true;
  }

  // 2. Takip kaydında özel olarak belirtilmiş spesifik hedef domain varsa
  if (targetDomain) {
    const cleanTarget = targetDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .replace(/^www\./, '')
      .trim();

    if (cleanTarget && (host === cleanTarget || rawHost === cleanTarget)) {
      return true;
    }
  }

  return false;
}

export const NOISE_DOMAINS = [
  'google.', 'gstatic.', 'youtube.', 'w3.org', 'schema.org', 'yandex.', 'ya.ru', 'yastatic.', 'mds.yandex.',
  'passport.yandex', 'mail.ru', 'bing.', 'microsoft.', 'live.com', 'msn.com', 'duckduckgo.', 'apple.',
  'twitter.', 'x.com', 'facebook.', 'instagram.', 't.me', 'telegram.', 'reddit.', 'github.', 'wikipedia.',
  'cam.ac.uk', 'who.int', 'crazygames.', 'newsmax.', 'tanstack.', 'wordplays.', 'obsproject.', 'zhihu.',
  'baidu.', 'spotify.', 'safelinks.', 'outlook.', 'office.', 'cloudflare.', 'support.google', 'googleusercontent',
  'mercadolivre', 'elevenforum', 'closeddownrestaurants', 'fitsmallbusiness', 'worldscholarshipforum', 'news12',
  'vk.ru', 'vk.com', 'ok.ru', 'tiktok.com'
];

export function isNoiseDomain(host: string): boolean {
  if (!host || host.length < 4) return true;
  return NOISE_DOMAINS.some(n => host.includes(n));
}

/**
 * GOOGLE & ORGANİK ARAMA MOTORU (SERPER POOL + DUCKDUCKGO TR ORGANİK YEDEK)
 */
export async function scrapeGoogleSerp(
  keyword: string,
  targetDomain: string,
  customApiKey?: string
): Promise<{ position: number; competitors: ICompetitor[]; foundUrl?: string; foundDomain?: string; engine: 'google' | 'ddg_organic' | 'none' }> {
  const keyCandidates: string[] = [];
  if (customApiKey && customApiKey.trim()) keyCandidates.push(customApiKey.trim());
  if (process.env.SERPER_API_KEYS) {
    process.env.SERPER_API_KEYS.split(',').map(k => k.trim()).filter(Boolean).forEach(k => keyCandidates.push(k));
  }
  if (process.env.SERPER_API_KEY) {
    keyCandidates.push(process.env.SERPER_API_KEY.trim());
  }
  keyCandidates.push('8078961d0c92f23ce765317915a6a500b20c2889');

  const uniqueKeys = [...new Set(keyCandidates)];

  for (const apiKey of uniqueKeys) {
    try {
      const serperUrl = `https://google.serper.dev/search`;
      const pagePromises = Array.from({ length: 5 }, (_, i) => i + 1).map(page =>
        fetch(serperUrl, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: keyword,
            gl: 'tr',
            hl: 'tr',
            page
          }),
          signal: AbortSignal.timeout(6000)
        })
          .then(async r => {
            if (!r.ok) return { page, organic: [], creditError: r.status === 400 };
            const data = await r.json();
            return { page, organic: data.organic || [], creditError: false };
          })
          .catch(() => ({ page, organic: [], creditError: false }))
      );

      const pagesData = await Promise.all(pagePromises);
      const hasCreditError = pagesData.some(p => p.creditError);
      if (hasCreditError) {
        continue;
      }

      pagesData.sort((a, b) => a.page - b.page);

      const competitors: ICompetitor[] = [];
      let foundPosition = 0;
      let foundUrl = '';
      let foundDomain = '';
      const seenDomains = new Set<string>();

      for (const pageItem of pagesData) {
        const pageNum = pageItem.page;
        const organicResults = pageItem.organic;

        organicResults.forEach((result: any, idx: number) => {
          if (!result.link || !result.link.startsWith('http')) return;

          try {
            const parsed = new URL(result.link);
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

            if (isNoiseDomain(hostname) || seenDomains.has(hostname)) return;
            seenDomains.add(hostname);

            const realPos = (pageNum - 1) * 10 + (idx + 1);
            const isOurSite = isOurSiteDomain(hostname, targetDomain);

            if (isOurSite) {
              if (foundPosition === 0) {
                foundPosition = realPos;
                foundUrl = result.link;
                foundDomain = hostname;
              }
            } else {
              if (competitors.length < 3) {
                competitors.push({
                  position: realPos,
                  domain: hostname,
                  title: result.title || hostname,
                });
              }
            }
          } catch (e) {}
        });
      }

      if (seenDomains.size > 0 || foundPosition > 0) {
        return { position: foundPosition, competitors, foundUrl, foundDomain, engine: 'google' };
      }
    } catch (err) {
      // Continue to next key or fallback
    }
  }

  // 2. ADIM: DuckDuckGo Türkiye Organik İndeksine Geç
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}&kl=tr-tr`;
    const res = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const html = await res.text();
      const rawLinks = [...html.matchAll(/uddg=([^&"]+)/g)].map(m => decodeURIComponent(m[1]));
      const cleanUrls = [...new Set(rawLinks)].filter(u => u.startsWith('http') && !u.includes('duckduckgo.com'));

      let foundPosition = 0;
      let foundUrl = '';
      let foundDomain = '';
      const competitors: ICompetitor[] = [];
      const seenDomains = new Set<string>();
      let rankCounter = 1;

      for (const link of cleanUrls) {
        try {
          const parsed = new URL(link);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
          if (isNoiseDomain(hostname) || seenDomains.has(hostname)) continue;
          seenDomains.add(hostname);

          const isOurSite = isOurSiteDomain(hostname, targetDomain);
          if (isOurSite) {
            if (foundPosition === 0) {
              foundPosition = rankCounter;
              foundUrl = link;
              foundDomain = hostname;
            }
          } else if (competitors.length < 3) {
            competitors.push({
              position: rankCounter,
              domain: hostname,
              title: hostname,
            });
          }
          rankCounter++;
          if (rankCounter > 50) break;
        } catch (e) {}
      }

      return { position: foundPosition, competitors, foundUrl, foundDomain, engine: 'ddg_organic' };
    }
  } catch (ddgErr) {
    // Silent
  }

  return { position: 0, competitors: [], foundUrl: '', foundDomain: '', engine: 'none' };
}

export function generateRealisticYandexHeaders() {
  const ts = Math.floor(Date.now() / 1000);
  const uid = Math.floor(Math.random() * 900000000 + 100000000);
  const fuid = crypto.randomBytes(16).toString('hex');
  const yandexuid = `${uid}${ts}`;
  const yp = `${ts + 31536000}.ygu.1#${ts + 31536000}.sp.1`;
  const ys = `udn.cDrFn21haWwucnU%3D#wprid.${ts}${Math.floor(Math.random()*900000+100000)}-${Math.floor(Math.random()*900000000+100000000)}-touch-TURKEY`;
  const cookie = `yandexuid=${yandexuid}; fuid01=${fuid}; yp=${yp}; ys=${ys}; mda=0; i=${crypto.randomBytes(12).toString('base64')}; my=YycCAQA=; is_gdpr=0; is_gdpr_b=CP+dEBCc3wE=; font_loaded=ys-4-text-regular`;

  return {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Cookie': cookie,
    'Referer': 'https://yandex.com.tr/',
  };
}

export function extractUrlsFromYandexHtml(html: string): string[] {
  const unescaped = html
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\u002F/g, '/')
    .replace(/\\u0022/g, '"')
    .replace(/\\"/g, '"');

  const regexes = [
    /href="([^"]+)"/g,
    /"url"\s*:\s*"([^"]+)"/g,
    /"greenUrl"\s*:\s*\{"url"\s*:\s*"([^"]+)"/g,
    /"link"\s*:\s*"([^"]+)"/g,
    /"path"\s*:\s*"([^"]+)"/g,
    /"rawUrl"\s*:\s*"([^"]+)"/g,
    /data-url="([^"]+)"/g,
  ];

  const found: string[] = [];
  for (const rx of regexes) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(unescaped)) !== null) {
      const val = m[1];
      if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
        found.push(val);
      }
    }
  }

  return found;
}

/**
 * YANDEX SERP MOTORU (MULTI-MIRROR FAILOVER + GERÇEKÇİ PARMAK İZİ)
 */
export async function scrapeYandexSerp(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[]; foundUrl?: string; foundDomain?: string; isBlocked: boolean }> {
  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  let foundUrl = '';
  let foundDomain = '';
  const seenDomains = new Set<string>();
  let rankCounter = 1;
  let scannedAnyValidPage = false;

  const mirrors = [
    (p: number) => `https://yandex.com.tr/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://ya.ru/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://yandex.com/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
  ];

  const pages = [0, 1, 2, 3]; // İlk 4 sayfa (~40-50 sonuç)

  for (const pageIdx of pages) {
    if (foundPosition > 0) break;

    let pageSuccess = false;

    for (const makeUrl of mirrors) {
      if (pageSuccess) break;

      try {
        const url = makeUrl(pageIdx);
        const headers = generateRealisticYandexHeaders();
        const res = await fetch(url, { headers });

        if (res.ok) {
          const html = await res.text();
          const isBlockedHtml = html.includes('SmartCaptcha') || html.includes('Verification') || html.length < 4000;

          if (isBlockedHtml) {
            continue;
          }

          const extractedUrls = extractUrlsFromYandexHtml(html);
          if (extractedUrls.length === 0) continue;

          scannedAnyValidPage = true;
          pageSuccess = true;

          for (const rawHref of extractedUrls) {
            try {
              const parsed = new URL(rawHref);
              const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

              if (isNoiseDomain(hostname) || seenDomains.has(hostname)) {
                continue;
              }

              seenDomains.add(hostname);

              const isOurSite = isOurSiteDomain(hostname, targetDomain);

              if (isOurSite) {
                if (foundPosition === 0) {
                  foundPosition = rankCounter;
                  foundUrl = rawHref;
                  foundDomain = hostname;
                }
              } else {
                if (competitors.length < 3) {
                  competitors.push({
                    position: rankCounter,
                    domain: hostname,
                    title: hostname,
                  });
                }
              }

              rankCounter++;
              if (rankCounter > 60) break;
            } catch (e) {}
          }
        }
      } catch (err) {
        // Devam et
      }
    }

    if (pageIdx < 3 && foundPosition === 0) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  const isBlocked = !scannedAnyValidPage && foundPosition === 0;
  return { position: foundPosition, competitors, foundUrl, foundDomain, isBlocked };
}
