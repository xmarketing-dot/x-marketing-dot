const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function unbanAll() {
  const MONGODB_URI = "mongodb+srv://serkanbilsel_db_user:AALnyRDCcQxDfgpz@cluster0.nj0njt0.mongodb.net/marketing_pazarlama?retryWrites=true&w=majority";
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");
  
  const res = await mongoose.connection.collection('bans').deleteMany({});
  console.log("Bans deleted completely:", res.deletedCount);
  await mongoose.disconnect();
}

unbanAll().catch(console.error);
