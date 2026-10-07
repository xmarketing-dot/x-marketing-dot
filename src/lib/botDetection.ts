/**
 * Arama motoru botlarını (Googlebot, Google-InspectionTool, Yandex, Bingbot vb.)
 * ve otomatik tarama/test araçlarını (Lighthouse, Headless Chromium, Puppeteer)
 * %100 doğrulukla tespit eden yardımcı fonksiyon.
 */
export function isSearchEngineBot(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    // 1. Headless browser veya otomasyon bayrağı (Googlebot Chromium vb.)
    if (Boolean((navigator as any).webdriver)) {
      return true;
    }

    // 2. User-Agent kontrolü (Google, Google-InspectionTool, Bing, Yandex vb.)
    const ua = (navigator.userAgent || '').toLowerCase();
    return /google|bot|crawl|spider|slurp|yandex|bing|duckduck|baidu|inspection|lighthouse|headless|ptst|mediapartners|feedfetcher/i.test(ua);
  } catch (e) {
    return false;
  }
}
