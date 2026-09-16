const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const res = await User.updateMany(
    { isOnline: true, $or: [{ lastActiveAt: { $lt: twoMinutesAgo } }, { lastActiveAt: { $exists: false } }] },
    { $set: { isOnline: false } }
  );
  console.log('Expired inactive users to offline count:', res.modifiedCount);
  
  const currentOnline = await User.find({ isOnline: true }).lean();
  console.log('Real online users now count:', currentOnline.length);
  process.exit(0);
}
fix();
