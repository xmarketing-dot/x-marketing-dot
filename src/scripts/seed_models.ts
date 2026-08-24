import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {}

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import ListingModel from '../models/Listing';
import VipModel from '../models/VipModel';

async function seedModels() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in env');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB. Seeding Exclusive Celebrity & Influencer SEO Pages...');

  const modelsData = [
    {
      slug: 'gizem-bagdacicek',
      baslik: 'Gizem Bağdaçiçek — VIP Fenomen Model Biyografisi & Özel Fotoğrafları',
      tamAd: 'Gizem Bağdaçiçek',
      unvan: 'Dijital Fenomen & VIP Model',
      isVerifiedProfile: true,
      likeSayisi: 24890,
      yas: 26,
      boy: 171,
      kilo: 53,
      gogusOlcusu: '85C (Doğal)',
      sacRengi: 'Siyah',
      gozRengi: 'Koyu Kahve',
      diller: ['Türkçe', 'İngilizce'],
      hizmetMekanlari: ['Sosyal Medya', 'OnlyFans', 'Twitter / X', 'Dijital'],
      biyografi: `Gizem Bağdaçiçek, Türkiye'de sosyal medya, Twitter ve dijital içerik platformlarında milyonlarca hayran kitlesine ulaşmış, güzelliği ve cesur paylaşımlarıyla fenomen haline gelmiş en popüler dijital modellerden biridir.

Kusursuz fiziği, samimi ve doğal tavırlarıyla dijital dünyada trendleri belirleyen Gizem Bağdaçiçek, OnlyFans ve Twitter üzerinden ürettiği içeriklerle adından sıkça söz ettirmektedir.

Bu sayfa; Gizem Bağdaçiçek'in doğrulanmış biyografisi, fiziksel ölçüleri ve hayran topluluğunun paylaştığı bağımsız değerlendirmeler için hazırlanmış özel bir VIP profildir.`,
      ilSlug: 'istanbul',
      ilceSlug: 'sisli',
      whatsappNumara: '',
      fiyat: 0,
      paraBirimi: 'TL',
      rozet: 'ultravip',
      status: 'yayinda',
      goruntulenmeSayisi: 84900,
      whatsappTiklamaSayisi: 0,
      anaFotograf: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      },
      fotograflar: [
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
        { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' },
        { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800' },
        { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800' },
      ],
      anonimYorumlar: [
        {
          yazar: 'Burak_34',
          yorum: 'Hastayım buna abi ya... Türkiye OnlyFans ve Twitter aleminin tartışmasız 1 numarası!',
          puan: 5,
          onayli: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        },
        {
          yazar: 'Emre V.',
          yorum: 'Fiziği gerçekten kusursuz. Her paylaştığı video olay oluyor, güzelliği bambaşka.',
          puan: 5,
          onayli: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          yazar: 'Kadir_İst',
          yorum: 'Böyle bir enerji ve tatlılık yok. Gerçekten sosyal medyadaki en iyi fenomen kadın.',
          puan: 5,
          onayli: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        },
        {
          yazar: 'Anonim Fan',
          yorum: 'Gözleri ve gülüşü aşırı büyüleyici. Twitter’da takip etmeyen çok şey kaybeder.',
          puan: 5,
          onayli: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        }
      ]
    },
    {
      slug: 'merve-ozdemir',
      baslik: 'Merve Özdemir — VIP Fenomen Model & Dijital Portföy',
      tamAd: 'Merve Özdemir',
      unvan: 'VIP Model & Creator',
      isVerifiedProfile: true,
      likeSayisi: 16400,
      yas: 24,
      boy: 174,
      kilo: 54,
      gogusOlcusu: '85C (Doğal)',
      sacRengi: 'Kumral',
      gozRengi: 'Ela',
      diller: ['Türkçe', 'İngilizce', 'Rusça'],
      hizmetMekanlari: ['Sosyal Medya', 'Dijital Moda', 'İstanbul'],
      biyografi: `Merve Özdemir, sosyal medyada tarzı, zarafeti ve estetik paylaşımlarıyla dikkat çeken ünlü bir dijital modeldir.

İstanbul merkezli olarak dijital moda çekimleri, influencer projeleri ve sosyal medya içerikleri üretmektedir. Yüksek etkileşim oranları ve estetik tarzıyla dijital mecraların parlayan yıldızlarındandır.`,
      ilSlug: 'istanbul',
      ilceSlug: 'kadikoy',
      whatsappNumara: '',
      fiyat: 0,
      paraBirimi: 'TL',
      rozet: 'ultravip',
      status: 'yayinda',
      goruntulenmeSayisi: 52300,
      whatsappTiklamaSayisi: 0,
      anaFotograf: {
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      },
      fotograflar: [
        { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800' },
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
      ],
      anonimYorumlar: [
        {
          yazar: 'Serkan K.',
          yorum: 'Merve tam bir zarafet abidesi. Instagram ve Twitter fotoğrafları muhteşem.',
          puan: 5,
          onayli: true,
          createdAt: new Date(),
        },
        {
          yazar: 'Murat_99',
          yorum: 'Boyu ve fiziği manken gibi, gerçekten çok kaliteli bir model.',
          puan: 5,
          onayli: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        }
      ]
    }
  ];

  for (const m of modelsData) {
    await ListingModel.findOneAndUpdate(
      { slug: m.slug },
      { $set: m },
      { upsert: true, returnDocument: 'after' }
    );

    await VipModel.findOneAndUpdate(
      { slug: m.slug },
      { 
        $set: {
          slug: m.slug,
          tamAd: m.tamAd,
          unvan: m.unvan,
          biyografi: m.biyografi,
          ilSlug: m.ilSlug,
          ilceSlug: m.ilceSlug,
          whatsappNumara: m.whatsappNumara || '',
          fiyat: m.fiyat || 0,
          likeSayisi: m.likeSayisi,
          goruntulenmeSayisi: m.goruntulenmeSayisi,
          yas: m.yas,
          boy: m.boy,
          kilo: m.kilo,
          gogusOlcusu: m.gogusOlcusu,
          sacRengi: m.sacRengi,
          gozRengi: m.gozRengi,
          diller: m.diller,
          hizmetMekanlari: m.hizmetMekanlari,
          anaFotografUrl: m.anaFotograf.url,
          fotograflar: m.fotograflar.map((f: any) => f.url),
          anonimYorumlar: m.anonimYorumlar,
          isVerified: true,
          aktif: true,
        } 
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`✓ Seeded Exclusive Celebrity Model: ${m.tamAd} -> https://besteskort.com/${m.slug}`);
  }

  console.log('Seeding finished successfully.');
  process.exit(0);
}

seedModels().catch((e) => {
  console.error(e);
  process.exit(1);
});
