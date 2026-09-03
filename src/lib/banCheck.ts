import connectToDatabase from '@/lib/mongodb';
import BanModel from '@/models/Ban';

interface BanCacheData {
  bannedIps: Set<string>;
  bannedThreads: Set<string>;
  lastFetched: number;
}

const banCache: BanCacheData = {
  bannedIps: new Set(),
  bannedThreads: new Set(),
  lastFetched: 0,
};

const CACHE_TTL = 10000; // 10 seconds RAM cache for high-speed checks

export function invalidateBanCache() {
  banCache.lastFetched = 0;
}

export async function refreshBanCacheIfNeeded() {
  const now = Date.now();
  if (now - banCache.lastFetched < CACHE_TTL) {
    return;
  }

  try {
    await connectToDatabase();
    const activeBans = await BanModel.find({
      aktif: true,
      engellemeTuru: 'tam_ban',
    }).select('ip threadId').lean();

    const ips = new Set<string>();
    const threads = new Set<string>();

    activeBans.forEach((b: any) => {
      if (b.ip) ips.add(b.ip.trim());
      if (b.threadId) threads.add(b.threadId.trim());
    });

    banCache.bannedIps = ips;
    banCache.bannedThreads = threads;
    banCache.lastFetched = now;
  } catch (err) {
    console.error('refreshBanCacheIfNeeded error:', err);
  }
}

export async function checkIsBanned(
  clientIp: string,
  cookies?: { get: (name: string) => { value: string } | undefined } | null
): Promise<{ isBanned: boolean; cleanIp: string; reason?: string }> {
  const cleanIp = (clientIp || '').split(',')[0].trim();

  // Admin / loopback safe guards
  if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return { isBanned: false, cleanIp };
  }

  await refreshBanCacheIfNeeded();

  // Yalnızca panelden yöneticinin bizzat IP olarak eklediği aktif banları kontrol et
  if (banCache.bannedIps.has(cleanIp)) {
    return { isBanned: true, cleanIp, reason: 'IP Tam Ban' };
  }

  return { isBanned: false, cleanIp };
}
