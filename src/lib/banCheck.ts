/**
 * Ban sistemi tamamen devre dışı bırakılmıştır.
 * Hiçbir ziyaretçi, IP veya cihaz asla engellenmez.
 */
export function invalidateBanCache() {}

export async function refreshBanCacheIfNeeded() {}

export async function checkIsBanned(
  clientIp: string,
  cookies?: { get: (name: string) => { value: string } | undefined } | null
): Promise<{ isBanned: boolean; cleanIp: string; reason?: string }> {
  const cleanIp = (clientIp || '').split(',')[0].trim();
  return { isBanned: false, cleanIp };
}
