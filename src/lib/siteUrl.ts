/**
 * Returns the canonical site URL based on environment variables.
 * Priority: SITE_URL → VERCEL_URL → localhost (dev only)
 * NOTE: Use SITE_URL (not NEXT_PUBLIC_SITE_URL) since this is server-side only.
 */
export function getSiteUrl(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
