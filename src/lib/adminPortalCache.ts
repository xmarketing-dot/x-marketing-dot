// src/lib/adminPortalCache.ts
/**
 * BMS Secure Portal - High-Speed Stale-While-Revalidate Memory Cache
 * 
 * Amaç: Admin portalinde menüler arasında gezinirken her defasında sıfırdan skeleton
 * yükleme çıkmasını engellemek, sayfaları 0ms gecikmeyle (anında) açmak ve arka planda
 * verileri sessizce tazeleyerek veri kaybı olmadan en güncel bilgiyi sunmak.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AdminPortalCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Önbellekten veriyi getirir. Yoksa null döner.
   */
  get<T = any>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  /**
   * Önbelleğe veriyi kaydeder ve zaman damgası vurur.
   */
  set<T = any>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Anahtarın önbellekte olup olmadığını kontrol eder.
   */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * İlan eklendiğinde, silindiğinde veya güncellendiğinde önbelleği temizlemek veya güncellemek için.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Tüm önbelleği temizler (Çıkış yapıldığında vs.)
   */
  clear(): void {
    this.store.clear();
  }

  getTimestamp(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.timestamp : null;
  }
}

// Global tekil nesne (Tarayıcı sekmesi boyunca RAM'de yaşar)
export const adminPortalCache = new AdminPortalCache();
