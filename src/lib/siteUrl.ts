import { headers } from 'next/headers';

/**
 * Returns the canonical site URL based on environment variables (fallback).
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  return 'http://localhost:3000';
}

/**
 * Returns the exact dynamic site URL for the current incoming HTTP request.
 * Automatically adapts to any incoming custom domain or subdomain.
 */
export async function getRequestSiteUrl(): Promise<string> {
  try {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  } catch (e) {
    // If called outside request context (e.g. static generation)
  }

  return getSiteUrl();
}

