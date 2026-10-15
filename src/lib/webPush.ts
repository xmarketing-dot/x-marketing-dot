import webpush from 'web-push';

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDbkYOHhubhOKS9ykYm-yF-BnqSMabS-GTblV9jpCsir_GNHA-v_wSU-ZSoaNi3Kt2kF3vuo9th-F4SNwqPRG-Y';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'f-SCK1ndgm7BErIpUZ7Xsw9DHgGBSzXaUnKOQkZewoA';
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@besteskort.online';

try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.error('[WebPush] Error setting VAPID details:', err);
}

export default webpush;
