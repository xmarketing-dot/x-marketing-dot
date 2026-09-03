const fs = require('fs');

async function inspectYandexHtml() {
  const html = fs.readFileSync('scratch/yandex_test.html', 'utf8');
  console.log('HTML loaded, length:', html.length);

  // Yandex search results are inside li.serp-item or class organic__url or link_theme_normal
  // Let's find all external organic URLs
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/g;
  let m;
  const results = [];
  const seen = new Set();

  while ((m = linkRegex.exec(html)) !== null) {
    const rawHref = m[1];
    if (!rawHref.startsWith('http')) continue;
    try {
      const u = new URL(rawHref);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      if (
        host.includes('yandex.') ||
        host.includes('ya.ru') ||
        host.includes('w3.org') ||
        host.includes('schema.org') ||
        host.includes('google.')
      ) continue;

      if (!seen.has(host)) {
        seen.add(host);
        results.push({ host, fullUrl: rawHref });
      }
    } catch (e) {}
  }

  console.log(`Extracted ${results.length} unique organic domains from Yandex:`);
  results.slice(0, 15).forEach((r, idx) => {
    console.log(`Rank #${idx + 1}: ${r.host} -> ${r.fullUrl.slice(0, 80)}`);
  });
}

inspectYandexHtml();
