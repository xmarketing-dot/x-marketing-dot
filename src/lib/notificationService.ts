import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';
import AnnouncementBarModel from '@/models/AnnouncementBar';
import ListingModel from '@/models/Listing';

export async function createNotification(params: {
  title: string;
  message: string;
  url?: string;
  imageUrl?: string;
  type?: 'admin_broadcast' | 'announcement_bar' | 'new_listing' | 'pwa_prompt' | 'system';
  badge?: string;
  sourceId?: string;
}) {
  try {
    await connectToDatabase();
    if (params.sourceId) {
      const existing = await SiteNotificationModel.findOne({ sourceId: params.sourceId });
      if (existing) {
        existing.title = params.title;
        existing.message = params.message;
        existing.url = params.url || existing.url;
        existing.imageUrl = params.imageUrl || existing.imageUrl;
        existing.badge = params.badge || existing.badge;
        await existing.save();
        return existing;
      }
    }

    const created = await SiteNotificationModel.create({
      title: params.title,
      message: params.message,
      url: params.url || '/',
      imageUrl: params.imageUrl || '',
      type: params.type || 'system',
      badge: params.badge || 'BİLDİRİM',
      sourceId: params.sourceId,
      isActive: true,
    });
    return created;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

export async function syncAnnouncementBarNotification() {
  try {
    await connectToDatabase();
    const bar = await AnnouncementBarModel.findOne();
    if (!bar || !bar.title) return;

    await createNotification({
      title: bar.title,
      message: bar.description || 'Yeni VIP duyurumuz yayında. Detayları keşfedin.',
      url: bar.targetUrl || '/',
      imageUrl: bar.mediaUrl || '',
      type: 'announcement_bar',
      badge: bar.badgeText || 'DUYURU',
      sourceId: `announcement_${bar.campaignId || 'v1'}`,
    });
  } catch (err) {
    console.debug('syncAnnouncementBarNotification error:', err);
  }
}

export async function syncRecentListingsNotifications() {
  try {
    await connectToDatabase();
    const count = await SiteNotificationModel.countDocuments();
    if (count > 0) return; // Zaten bildirimler varsa geçmişi doldurma

    const recentListings = await ListingModel.find({ status: { $in: ['yayinda', 'onay_bekliyor'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const listing of recentListings) {
      const img = (listing.anaFotograf as any)?.url || (listing.fotograflar && listing.fotograflar[0]) || '';
      await createNotification({
        title: `🌟 Yeni VIP İlan: ${listing.baslik}`,
        message: `${(listing.ilSlug || 'İSTANBUL').toUpperCase()} bölgesinde yeni doğrulanmış profil yayında!`,
        url: `/ilan/${listing.slug}`,
        imageUrl: img,
        type: 'new_listing',
        badge: (listing.rozet || 'VIP').toUpperCase(),
        sourceId: `listing_${listing._id}`,
      });
    }
  } catch (err) {
    console.debug('syncRecentListingsNotifications error:', err);
  }
}
