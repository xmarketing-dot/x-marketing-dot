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
  // Yalnızca açık otomasyon / saldırı sinyalleri tespit edilirse engelleme yap. Meşru arama motoru botları asla yasaklanmaz.
  const ua = (req.headers.get('user-agent') || '').toLowerCase();

  const isSearchEngineOrSocial =
    ua.includes('google') ||
    ua.includes('yandex') ||
    ua.includes('bing') ||
    ua.includes('duckduck') ||
    ua.includes('applebot') ||
    ua.includes('twitterbot') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('whatsapp') ||
    ua.includes('telegrambot') ||
    ua.includes('slackbot');

  if (!isSearchEngineOrSocial) {
    const pathLower = pathname.toLowerCase();
    const isObviousAutomation =
      ua.includes('headless') ||
      ua.includes('puppeteer') ||
      ua.includes('playwright') ||
      ua.includes('selenium') ||
      ua.includes('webdriver') ||
      ua.includes('python-requests') ||
      ua.includes('python') ||
      ua.includes('aiohttp') ||
      ua.includes('scrapy') ||
      ua.includes('curl/') ||
      ua.includes('wget/') ||
      ua.includes('go-http-client') ||
      ua.includes('libwww-perl') ||
      ua.includes('okhttp') ||
      ua.includes('semrush') ||
      ua.includes('ahrefs') ||
      ua.includes('mj12bot') ||
      ua.includes('dotbot') ||
      ua.includes('petalbot') ||
      ua.includes('bytespider') ||
      ua.includes('megaindex') ||
      ua.includes('blexbot') ||
      ua.includes('dataforseo') ||
      ua.includes('claudebot') ||
      ua.includes('gptbot') ||
      ua.includes('ccbot');

    const isKnownExploitProbe =
      pathLower.includes('/.git') ||
      pathLower.includes('/.env') ||
      pathLower.includes('/wp-admin') ||
      pathLower.includes('/phpmyadmin') ||
      pathLower.includes('eval(') ||
      pathLower.includes('select%20') ||
      pathLower.includes('<script') ||
      pathLower.includes('cmd=');

    const isAggressiveBot = isObviousAutomation || isKnownExploitProbe;

    if (isAggressiveBot) {
      return new NextResponse('Access Denied: Automated scraping or probing prohibited.', {
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
