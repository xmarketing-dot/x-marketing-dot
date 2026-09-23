import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Google Service Account JSON dosyasını veya ENV değişkenlerini okur.
 */
function getServiceAccountCredentials(): ServiceAccountKey | null {
  try {
    // 1. Vercel & Production: Ortam değişkenlerinden (ENV) oku
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    }
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      return {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        token_uri: 'https://oauth2.googleapis.com/token',
      };
    }

    // 2. Local geliştirme ortamı için JSON dosyasını ara
    if (process.env.NODE_ENV !== 'production') {
      const rootDir = process.cwd();
      const files = fs.readdirSync(rootDir);
      const jsonKeyFile = files.find(
        (f) => f.endsWith('.json') && !['package.json', 'package-lock.json', 'tsconfig.json'].includes(f)
      );
      if (jsonKeyFile) {
        const raw = fs.readFileSync(path.join(rootDir, jsonKeyFile), 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.client_email && parsed.private_key) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Service account key read error:', err);
  }
  return null;
}

/**
 * Harici kütüphane bağımlılığı olmadan yerel JWT ile Google OAuth2 Access Token üretir.
 */
async function getGoogleAccessToken(): Promise<string | null> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  const credentials = getServiceAccountCredentials();
  if (!credentials || !credentials.client_email || !credentials.private_key) {
    console.warn('Google Service Account bilgisi bulunamadı.');
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenUri = credentials.token_uri || 'https://oauth2.googleapis.com/token';

  // JWT Header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  // JWT Payload (Indexing API Scope)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${b64Header}.${b64Payload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  signer.end();

  const signature = signer.sign(credentials.private_key, 'base64url');
  const jwt = `${signInput}.${signature}`;

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google OAuth2 token error:', errText);
    return null;
  }

  const tokenData = await res.json();
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
  };

  return tokenData.access_token;
}

export interface GoogleIndexingNotificationResult {
  url: string;
  status: number;
  success: boolean;
  message?: string;
}

/**
 * Tek bir URL'i Google Indexing API'ye (URL_UPDATED) anlık olarak bildirir.
 */
export async function publishUrlToGoogle(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<GoogleIndexingNotificationResult> {
  const token = await getGoogleAccessToken();
  if (!token) {
    return {
      url,
      status: 401,
      success: false,
      message: 'Google Service Account yetkilendirme anahtarı doğrulanamadı.',
    };
  }

  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        url,
        status: res.status,
        success: true,
        message: 'Googlebot anında URL tarama kuyruğuna aldı.',
      };
    } else {
      return {
        url,
        status: res.status,
        success: false,
        message: data.error?.message || 'Google Indexing API hatası',
      };
    }
  } catch (err: any) {
    return {
      url,
      status: 500,
      success: false,
      message: err.message || 'Bağlantı hatası',
    };
  }
}

/**
 * Toplu URL listesini Google Indexing API'ye paralel/kontrollü batch olarak iletir.
 */
export async function batchPublishUrlsToGoogle(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ total: number; successCount: number; failCount: number; results: GoogleIndexingNotificationResult[] }> {
  const results: GoogleIndexingNotificationResult[] = [];
  let successCount = 0;
  let failCount = 0;

  // Google Indexing API saniye başına kota sınırına dikkat ederek paralel gönder
  const chunkSize = 10;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map((u) => publishUrlToGoogle(u, type)));

    for (const r of chunkResults) {
      results.push(r);
      if (r.success) successCount++;
      else failCount++;
    }

    if (i + chunkSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return {
    total: urls.length,
    successCount,
    failCount,
    results,
  };
}
