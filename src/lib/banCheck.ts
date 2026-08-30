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

  // 1. Check IP direct match
  if (banCache.bannedIps.has(cleanIp)) {
    return { isBanned: true, cleanIp, reason: 'IP Tam Ban' };
  }

  // 2. Check permanent device cookie (Modem Reset Hunter)
  const bannedCookie = cookies?.get?.('bms_banned')?.value;
  if (bannedCookie === '1') {
    // This visitor previously got banned on another IP (e.g. reset their modem)
    // Automatically capture their new IP and add to database
    try {
      await connectToDatabase();
      const exists = await BanModel.findOne({ ip: cleanIp, aktif: true }).lean();
      if (!exists) {
        await BanModel.create({
          ip: cleanIp,
          sebep: 'Banlı cihazın yeni IP adresi (Otomatik Tespit)',
          engellemeTuru: 'tam_ban',
          aktif: true,
        });
        banCache.bannedIps.add(cleanIp);
      }
    } catch (e) {
      console.error('Auto ban new modem IP error:', e);
    }

    return { isBanned: true, cleanIp, reason: 'Kalıcı Cihaz Banı (Modem Avcısı)' };
  }

  return { isBanned: false, cleanIp };
}
