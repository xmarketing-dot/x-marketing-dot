import { NextRequest, NextResponse } from 'next/server';
import { resolveTargetFromHost } from '@/lib/domainHelper';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-current-path', pathname);
  if (pathname.startsWith('/bms-secure-portal')) {
    requestHeaders.set('x-is-admin', 'true');
  }

  // ── 0. GÜVENLİK KİLİDİ: /api/admin/* ENDPOINT'LERİNİ EDGE SEVİYESİNDE MÜHÜRLE ──
  // Giriş endpoint'i hariç tüm /api/admin rotalarında bms_admin_auth çerezi zorunludur!
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth/login')) {
    const adminAuthCookie = req.cookies.get('bms_admin_auth')?.value;
    if (!adminAuthCookie || adminAuthCookie !== 'authenticated_superadmin_session_token') {
      return NextResponse.json(
        { error: 'Erişim Engellendi: Bu endpoint için yönetici yetkilendirmesi gereklidir.' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Statik dosyalar ve dahili Next yollarını pas geç
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Admin portalına her koşulda tam erişim ver ve ban çerezini temizle
  if (pathname.startsWith('/bms-secure-portal')) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    res.cookies.delete('bms_banned');
    return res;
  }

  // ── SALDIRGAN BOT, SCRAPER VE KOPYALAYICI KALKANI ──
  // Vercel Function & ISR Writes kotasını tüketen botları Edge seviyesinde anında engelle (0 CPU, 0 Maliyet)
  const ua = (req.headers.get('user-agent') || '').toLowerCase();

  // ── 1. MEŞRU ARAMA MOTORLARI & SOSYAL MEDYA BOTLARI İÇİN DOKUNULMAZLIK (VIP WHITELIST) ──
  // Google, Yandex, Bing, DuckDuckGo, Apple ve sosyal medya botları ASLA engellenmez (SEO %100 Güvencede!)
  const isSearchEngineOrSocial = 
    ua.includes('google') ||       // Googlebot, Google-InspectionTool, Storebot-Google, AdsBot-Google, Lighthouse
    ua.includes('yandex') ||       // YandexBot, YandexMobileBot, YandexDirect, YandexMetrika
    ua.includes('bing') ||         // Bingbot, BingPreview, msnbot
    ua.includes('duckduck') ||     // DuckDuckBot
    ua.includes('applebot') ||     // Applebot
    ua.includes('twitterbot') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('whatsapp') ||
    ua.includes('telegrambot');

  if (!isSearchEngineOrSocial) {
    const isAggressiveBot = 
      ua.includes('headlesschrome') ||
      ua.includes('puppeteer') ||
      ua.includes('playwright') ||
      ua.includes('selenium') ||
      ua.includes('python-requests') ||
      ua.includes('aiohttp') ||
      ua.includes('scrapy') ||
      ua.includes('go-http-client') ||
      ua.includes('libwww-perl') ||
      ua.includes('semrushbot') ||
      ua.includes('ahrefsbot') ||
      ua.includes('mj12bot') ||
      ua.includes('dotbot') ||
      ua.includes('petalbot') ||
      ua.includes('bytespider') ||
      ua.includes('megaindex') ||
      ua.includes('blexbot') ||
      ua.includes('dataforseobot') ||
      ua.includes('claudebot') ||
      ua.includes('gptbot') ||
      ua.includes('ccbot') ||
      (ua.startsWith('curl/') && !pathname.startsWith('/api/test')) ||
      (ua.startsWith('wget/') && !pathname.startsWith('/api/test'));

    if (isAggressiveBot) {
      return new NextResponse('Access Denied: Automated scraping prohibited.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
      });
    }
  }

  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';

  // Doğrudan *.vercel.app domaininden gelenleri ana domaine yönlendir (301 Kalıcı Yönlendirme)
  if (hostname.includes('.vercel.app') && !pathname.startsWith('/api') && !pathname.startsWith('/bms-secure-portal')) {
    return NextResponse.redirect(new URL(`https://besteskort.devs.surf${pathname}${url.search}`), 301);
  }

  const targetLoc = resolveTargetFromHost(hostname);

  // Eğer bu domain belirli bir il veya ilçeye bağlıysa ve anasayfaya (/) geldiyse:
  if (targetLoc && pathname === '/') {
    if (targetLoc.ilceSlug) {
      // Örn: beylikduzuescort.devs.surf -> /istanbul/beylikduzu içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}/${targetLoc.ilceSlug}`, req.url), {
        request: { headers: requestHeaders },
      });
    } else if (targetLoc.ilSlug) {
      // Örn: istanbulescort.devs.surf -> /istanbul içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}`, req.url), {
        request: { headers: requestHeaders },
      });
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
