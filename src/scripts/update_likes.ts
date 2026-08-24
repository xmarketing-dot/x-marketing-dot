import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {}

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import ListingModel from '../models/Listing';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marketing-pazarlama';

async function updateAllListingLikes() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected.');

  const listings = await ListingModel.find({});
  console.log(`Found ${listings.length} listings. Updating likes between 50 - 370...`);

  for (const l of listings) {
    const hash = (l.slug || l._id.toString()).split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    let base = 75;
    if (l.rozet === 'ultravip') {
      base = 280 + (hash % 91); // 280 - 370
    } else if (l.rozet === 'vip') {
      base = 190 + (hash % 85); // 190 - 275
    } else if (l.rozet === 'gold') {
      base = 110 + (hash % 75); // 110 - 185
    } else {
      base = 52 + (hash % 47);  // 52 - 99
    }

    l.likeSayisi = base;
    await l.save();
    console.log(`- [${l.rozet || 'silver'}] ${l.baslik}: ${base} Öneri`);
  }

  console.log('All listing likes updated successfully in the 50 - 370 range!');
  process.exit(0);
}

updateAllListingLikes().catch((err) => {
  console.error('Error updating likes:', err);
  process.exit(1);
});
