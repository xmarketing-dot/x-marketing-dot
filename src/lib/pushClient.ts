export async function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return null;
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return null;
    }

    const reg = await navigator.serviceWorker.ready;
    const keyRes = await fetch('/api/push/public-key');
    if (!keyRes.ok) return null;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return null;

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = await urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    if (subscription) {
      const ua = window.navigator.userAgent.toLowerCase();
      const platform = /iphone|ipad|ipod/.test(ua) ? 'ios' : (/android|mobile/.test(ua) ? 'android' : 'desktop');
      const browser = /chrome|crios/.test(ua) ? 'Chrome' : (/safari/.test(ua) ? 'Safari' : 'Other');

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          visitorId: localStorage.getItem('analytics_visitor_id') || 'v_anon',
          platform,
          browser,
          hostname: window.location.hostname,
        }),
      });
      return subscription;
    }
  } catch (err) {
    console.debug('[Push] Error subscribing to push:', err);
  }
  return null;
}
