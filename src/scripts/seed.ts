import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // ignore if not supported
}

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import LocationModel from '../models/Location';
import CategoryModel from '../models/Category';
import PackageModel from '../models/Package';
import AdminModel from '../models/Admin';
import ListingModel from '../models/Listing';
import HomepageConfigModel from '../models/HomepageConfig';
import { turkeyProvinces } from '../data/turkeyLocations';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment!');
  process.exit(1);
}

// 81 Provinces of Turkey & their key districts
const turkeyLocations = [
  {
    il: 'İstanbul',
    ilSlug: 'istanbul',
    ilceler: [
      { ad: 'Adalar', slug: 'adalar' },
      { ad: 'Arnavutköy', slug: 'arnavutkoy' },
      { ad: 'Ataşehir', slug: 'atasehir' },
      { ad: 'Avcılar', slug: 'avcilar' },
      { ad: 'Bağcılar', slug: 'bagcilar' },
      { ad: 'Bahçelievler', slug: 'bahcelievler' },
      { ad: 'Bakırköy', slug: 'bakirkoy' },
      { ad: 'Başakşehir', slug: 'basaksehir' },
      { ad: 'Bayrampaşa', slug: 'bayrampasa' },
      { ad: 'Beşiktaş', slug: 'besiktas' },
      { ad: 'Beykoz', slug: 'beykoz' },
      { ad: 'Beylikdüzü', slug: 'beylikduzu' },
      { ad: 'Beyoğlu', slug: 'beyoglu' },
      { ad: 'Büyükçekmece', slug: 'buyukcekmece' },
      { ad: 'Çatalca', slug: 'catalca' },
      { ad: 'Çekmeköy', slug: 'cekmekoy' },
      { ad: 'Esenler', slug: 'esenler' },
      { ad: 'Esenyurt', slug: 'esenyurt' },
      { ad: 'Eyüpsultan', slug: 'eyupsultan' },
      { ad: 'Fatih', slug: 'fatih' },
      { ad: 'Gaziosmanpaşa', slug: 'gaziosmanpasa' },
      { ad: 'Güngören', slug: 'gungoren' },
      { ad: 'Kadıköy', slug: 'kadikoy' },
      { ad: 'Kağıthane', slug: 'kagithane' },
      { ad: 'Kartal', slug: 'kartal' },
      { ad: 'Küçükçekmece', slug: 'kucukcekmece' },
      { ad: 'Maltepe', slug: 'maltepe' },
      { ad: 'Pendik', slug: 'pendik' },
      { ad: 'Sancaktepe', slug: 'sancaktepe' },
      { ad: 'Sarıyer', slug: 'sariyer' },
      { ad: 'Silivri', slug: 'silivri' },
      { ad: 'Sultanbeyli', slug: 'sultanbeyli' },
      { ad: 'Sultangazi', slug: 'sultangazi' },
      { ad: 'Şile', slug: 'sile' },
      { ad: 'Şişli', slug: 'sisli' },
      { ad: 'Tuzla', slug: 'tuzla' },
      { ad: 'Ümraniye', slug: 'umraniye' },
      { ad: 'Üsküdar', slug: 'uskudar' },
      { ad: 'Zeytinburnu', slug: 'zeytinburnu' },
    ],
  },
  {
    il: 'Ankara',
    ilSlug: 'ankara',
    ilceler: [
      { ad: 'Akyurt', slug: 'akyurt' },
      { ad: 'Altındağ', slug: 'altindag' },
      { ad: 'Ayaş', slug: 'ayas' },
      { ad: 'Bala', slug: 'bala' },
      { ad: 'Beypazarı', slug: 'beypazari' },
      { ad: 'Çamlıdere', slug: 'camlidere' },
      { ad: 'Çankaya', slug: 'cankaya' },
      { ad: 'Çubuk', slug: 'cubuk' },
      { ad: 'Elmadağ', slug: 'elmadag' },
      { ad: 'Etimesgut', slug: 'etimesgut' },
      { ad: 'Evren', slug: 'evren' },
      { ad: 'Gölbaşı', slug: 'golbasi' },
      { ad: 'Güdül', slug: 'gudul' },
      { ad: 'Haymana', slug: 'haymana' },
      { ad: 'Kahramankazan', slug: 'kahramankazan' },
      { ad: 'Kalecik', slug: 'kalecik' },
      { ad: 'Keçiören', slug: 'kecioren' },
      { ad: 'Kızılcahamam', slug: 'kizilcahamam' },
      { ad: 'Mamak', slug: 'mamak' },
      { ad: 'Nallıhan', slug: 'nallihan' },
      { ad: 'Polatlı', slug: 'polatli' },
      { ad: 'Pursaklar', slug: 'pursaklar' },
      { ad: 'Sincan', slug: 'sincan' },
      { ad: 'Şereflikoçhisar', slug: 'sereflikochisar' },
      { ad: 'Yenimahalle', slug: 'yenimahalle' },
    ],
  },
  {
    il: 'İzmir',
    ilSlug: 'izmir',
    ilceler: [
      { ad: 'Aliağa', slug: 'aliaga' },
      { ad: 'Balçova', slug: 'balcova' },
      { ad: 'Bayındır', slug: 'bayindir' },
      { ad: 'Bayraklı', slug: 'bayrakli' },
      { ad: 'Bergama', slug: 'bergama' },
      { ad: 'Beydağ', slug: 'beydag' },
      { ad: 'Bornova', slug: 'bornova' },
      { ad: 'Buca', slug: 'buca' },
      { ad: 'Çeşme', slug: 'cesme' },
      { ad: 'Çiğli', slug: 'cigli' },
      { ad: 'Dikili', slug: 'dikili' },
      { ad: 'Foça', slug: 'foca' },
      { ad: 'Gaziemir', slug: 'gaziemir' },
      { ad: 'Güzelbahçe', slug: 'guzelbahce' },
      { ad: 'Karabağlar', slug: 'karabaglar' },
      { ad: 'Karaburun', slug: 'karaburun' },
      { ad: 'Karşıyaka', slug: 'karsiyaka' },
      { ad: 'Kemalpaşa', slug: 'kemalpasa' },
      { ad: 'Kınık', slug: 'kinik' },
      { ad: 'Kiraz', slug: 'kiraz' },
      { ad: 'Konak', slug: 'konak' },
      { ad: 'Menderes', slug: 'menderes' },
      { ad: 'Menemen', slug: 'menemen' },
      { ad: 'Narlıdere', slug: 'narlidere' },
      { ad: 'Ödemiş', slug: 'odemis' },
      { ad: 'Seferihisar', slug: 'seferihisar' },
      { ad: 'Selçuk', slug: 'selcuk' },
      { ad: 'Tire', slug: 'tire' },
      { ad: 'Torbalı', slug: 'torbali' },
      { ad: 'Urla', slug: 'urla' },
    ],
  },
  {
    il: 'Bursa',
    ilSlug: 'bursa',
    ilceler: [
      { ad: 'Büyükorhan', slug: 'buyukorhan' },
      { ad: 'Gemlik', slug: 'gemlik' },
      { ad: 'Gürsu', slug: 'gursu' },
      { ad: 'Harmancık', slug: 'harmancik' },
      { ad: 'İnegöl', slug: 'inegol' },
      { ad: 'İznik', slug: 'iznik' },
      { ad: 'Karacabey', slug: 'karacabey' },
      { ad: 'Keles', slug: 'keles' },
      { ad: 'Kestel', slug: 'kestel' },
      { ad: 'Mudanya', slug: 'mudanya' },
      { ad: 'Mustafakemalpaşa', slug: 'mustafakemalpasa' },
      { ad: 'Nilüfer', slug: 'nilufer' },
      { ad: 'Orhaneli', slug: 'orhaneli' },
      { ad: 'Orhangazi', slug: 'orhangazi' },
      { ad: 'Osmangazi', slug: 'osmangazi' },
      { ad: 'Yenişehir', slug: 'yenisehir' },
      { ad: 'Yıldırım', slug: 'yildirim' },
    ],
  },
  {
    il: 'Antalya',
    ilSlug: 'antalya',
    ilceler: [
      { ad: 'Akseki', slug: 'akseki' },
      { ad: 'Aksu', slug: 'aksu' },
      { ad: 'Alanya', slug: 'alanya' },
      { ad: 'Demre', slug: 'demre' },
      { ad: 'Döşemealtı', slug: 'dosemealti' },
      { ad: 'Elmalı', slug: 'elmali' },
      { ad: 'Finike', slug: 'finike' },
      { ad: 'Gazipaşa', slug: 'gazipasa' },
      { ad: 'Gündoğmuş', slug: 'gundogmus' },
      { ad: 'İbradı', slug: 'ibradi' },
      { ad: 'Kaş', slug: 'kas' },
      { ad: 'Kemer', slug: 'kemer' },
      { ad: 'Kepez', slug: 'kepez' },
      { ad: 'Konyaaltı', slug: 'konyaalti' },
      { ad: 'Korkuteli', slug: 'korkuteli' },
      { ad: 'Kumluca', slug: 'kumluca' },
      { ad: 'Manavgat', slug: 'manavgat' },
      { ad: 'Muratpaşa', slug: 'muratpasa' },
      { ad: 'Serik', slug: 'serik' },
    ],
  },
  {
    il: 'Muğla',
    ilSlug: 'mugla',
    ilceler: [
      { ad: 'Bodrum', slug: 'bodrum' },
      { ad: 'Dalaman', slug: 'dalaman' },
      { ad: 'Datça', slug: 'datca' },
      { ad: 'Fethiye', slug: 'fethiye' },
      { ad: 'Kavaklıdere', slug: 'kavaklidere' },
      { ad: 'Köyceğiz', slug: 'koycegiz' },
      { ad: 'Marmaris', slug: 'marmaris' },
      { ad: 'Menteşe', slug: 'mentese' },
      { ad: 'Milas', slug: 'milas' },
      { ad: 'Ortaca', slug: 'ortaca' },
      { ad: 'Seydikemer', slug: 'seydikemer' },
      { ad: 'Ula', slug: 'ula' },
      { ad: 'Yatağan', slug: 'yatagan' },
    ],
  },
  {
    il: 'Tekirdağ',
    ilSlug: 'tekirdag',
    ilceler: [
      { ad: 'Çerkezköy', slug: 'cerkezkoy' },
      { ad: 'Çorlu', slug: 'corlu' },
      { ad: 'Ergene', slug: 'ergene' },
      { ad: 'Hayrabolu', slug: 'hayrabolu' },
      { ad: 'Kapaklı', slug: 'kapakli' },
      { ad: 'Malkara', slug: 'malkara' },
      { ad: 'Marmaraereğlisi', slug: 'marmaraereglisi' },
      { ad: 'Muratlı', slug: 'muratli' },
      { ad: 'Saray', slug: 'saray' },
      { ad: 'Süleymanpaşa', slug: 'suleymanpasa' },
      { ad: 'Şarköy', slug: 'sarkoy' },
    ],
  },
];

const starterCategories = [
  { ad: 'Tekne Kiralama', slug: 'tekne-kiralama', ikon: 'Anchor', aciklama: 'Günlük, haftalık saatlik tekne ve yat kiralama ilanları', siraNo: 1 },
  { ad: 'Vasıta & Araç', slug: 'vasita', ikon: 'Car', aciklama: 'Otomobil, arazi aracı, motosiklet ve ticari araçlar', siraNo: 2 },
  { ad: 'Emlak & Gayrimenkul', slug: 'emlak', ikon: 'Home', aciklama: 'Satılık ve kiralık daire, arsa, yazlık ve işyeri ilanları', siraNo: 3 },
  { ad: 'Hizmetler & Usta', slug: 'hizmetler', ikon: 'Wrench', aciklama: 'Tamirat, temizlik, nakliye ve profesyonel hizmetler', siraNo: 4 },
  { ad: 'Ev Eşyaları & İkinci El', slug: 'ev-esyalar', ikon: 'ShoppingBag', aciklama: 'Mobilya, beyaz eşya, elektronik ve ev gereçleri', siraNo: 5 },
  { ad: 'İş İlanları & Eleman', slug: 'is-ilanlari', ikon: 'Briefcase', aciklama: 'Part-time, tam zamanlı bölgesel iş ve eleman ilanları', siraNo: 6 },
];

const starterPackages = [
  {
    ad: 'Silver Paket',
    tip: 'haftalik',
    fiyatTL: 350,
    fiyatUSDT: 10,
    ozellikler: ['7 gün yayın süresi', '5 adet fotoğraf yükleme', 'Silver arama rozeti', 'WhatsApp direkt iletişim'],
    rozet: 'silver',
    maxFotoSayisi: 5,
    anasayfaSlider: false,
    siraOnceligi: 1,
    aktif: true,
  },
  {
    ad: 'Gold Paket',
    tip: 'aylik',
    fiyatTL: 850,
    fiyatUSDT: 25,
    ozellikler: ['30 gün yayın süresi', '10 adet fotoğraf yükleme', 'Gold ışıltılı rozet', 'Anasayfa Gold vitrin gösterimi'],
    rozet: 'gold',
    maxFotoSayisi: 10,
    anasayfaSlider: true,
    siraOnceligi: 5,
    aktif: true,
  },
  {
    ad: 'VIP Paket',
    tip: 'aylik',
    fiyatTL: 1750,
    fiyatUSDT: 50,
    ozellikler: ['30 gün VIP yayın', '15 adet fotoğraf yükleme', 'VIP elit rozet', 'Üst sıralara sabitlenme'],
    rozet: 'vip',
    maxFotoSayisi: 15,
    anasayfaSlider: true,
    siraOnceligi: 10,
    aktif: true,
  },
  {
    ad: 'Ultra VIP Paket',
    tip: 'aylik',
    fiyatTL: 3500,
    fiyatUSDT: 100,
    ozellikler: ['30 gün Ultra VIP yayın', '20 adet fotoğraf yükleme', 'Özel Işıltılı Ultra VIP rozet', 'Anasayfa ana slider & ilk sıra vitrin'],
    rozet: 'ultravip',
    maxFotoSayisi: 20,
    anasayfaSlider: true,
    siraOnceligi: 20,
    aktif: true,
  },
];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected successfully.');

    // 1. Seed Locations
    console.log('📍 Seeding Locations (Provinces & Districts)...');
    for (const loc of turkeyProvinces) {
      await LocationModel.findOneAndUpdate({ ilSlug: loc.ilSlug }, loc, { upsert: true, returnDocument: 'after' });
    }
    console.log(`✅ ${turkeyProvinces.length} Provinces seeded.`);

    // 2. Seed Categories
    console.log('🏷️ Seeding Categories...');
    const createdCategories: any[] = [];
    for (const cat of starterCategories) {
      const savedCat = await CategoryModel.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, returnDocument: 'after' });
      createdCategories.push(savedCat);
    }
    console.log(`✅ ${starterCategories.length} Categories seeded.`);

    // 3. Seed Packages
    console.log('📦 Seeding Packages...');
    for (const pkg of starterPackages) {
      await PackageModel.findOneAndUpdate({ ad: pkg.ad }, pkg, { upsert: true, returnDocument: 'after' });
    }
    console.log(`✅ ${starterPackages.length} Packages seeded.`);

    // 4. Seed Admin Account
    console.log('👤 Seeding Superadmin Account...');
    const adminEmail = 'ownmyofmyowner@gmail.com';
    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('3428914285egypt@', 10);
      await AdminModel.create({
        email: adminEmail,
        sifreHash: passwordHash,
        role: 'superadmin',
      });
      console.log('✅ Superadmin created: ownmyofmyowner@gmail.com');
    } else {
      console.log('ℹ️ Superadmin already exists.');
    }

    // 5. Seed Initial Sample Listings with Ultravip, VIP, Gold, Silver tiers
    console.log('📝 Seeding Sample Listings...');
    const sampleListings = [
      {
        slug: 'sarkoy-acik-deniz-tekne-turu-a1b2c3',
        baslik: 'Şarköy Sahili Ultra VIP Lüks Motoryat Turu & Kiralama',
        aciklama: 'Şarköy Sahilinde 12 kişilik kaptanlı lüks motoryat. Özel turlar ve VIP hizmetler.',
        kategoriId: null,
        ilSlug: 'tekirdag',
        ilceSlug: 'sarkoy',
        anaFotograf: { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=80' },
        fotograflar: [
          { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=80' },
          { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
        ],
        whatsappNumara: '+905300000000',
        fiyat: 4500,
        paraBirimi: 'TL',
        rozet: 'ultravip',
        status: 'yayinda',
        goruntulenmeSayisi: 342,
        whatsappTiklamaSayisi: 58,
      },
      {
        slug: 'beylikduzu-marina-gunluk-tekne-kiralama-b4c5d6',
        baslik: 'Beylikdüzü West Istanbul Marina VIP Motoryat Kiralama',
        aciklama: 'Beylikdüzü Marinasında 15 metre VIP motoryat. Özel adalar ve boğaz turu.',
        kategoriId: null,
        ilSlug: 'istanbul',
        ilceSlug: 'beylikduzu',
        anaFotograf: { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
        fotograflar: [
          { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
          { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80' },
        ],
        whatsappNumara: '+905321112233',
        fiyat: 8500,
        paraBirimi: 'TL',
        rozet: 'vip',
        status: 'yayinda',
        goruntulenmeSayisi: 589,
        whatsappTiklamaSayisi: 114,
      },
      {
        slug: 'bodrum-gulet-kiralama-haftalik-mavi-tur-c7d8e9',
        baslik: 'Bodrum Gold Kaptanlı 6 Kabin Ahşap Gulet',
        aciklama: 'Bodrum çıkışlı Gökova ve Yedi Adalar haftalık lüks gulet kiralama.',
        kategoriId: null,
        ilSlug: 'mugla',
        ilceSlug: 'bodrum',
        anaFotograf: { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80' },
        fotograflar: [
          { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80' },
          { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=80' },
        ],
        whatsappNumara: '+905334445566',
        fiyat: 25000,
        paraBirimi: 'TL',
        goruntulenmeSayisi: 512,
        whatsappTiklamaSayisi: 91,
      },
    ];

    for (const listing of sampleListings) {
      await ListingModel.findOneAndUpdate({ slug: listing.slug }, listing, { upsert: true, new: true });
    }
    console.log(`✅ ${sampleListings.length} Sample listings seeded.`);

    // 6. Homepage config
    await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      {
        hero: {
          baslik: 'Türkiye Geneli Bölgesel İlan ve Hizmet Platformu',
          altBaslik: '81 il ve ilçelerdeki en güncel tekne, vasıta, emlak ve bölgesel hizmet ilanları',
        },
        aktifBanner: {
          aktif: true,
          metin: '🚀 İlanınızı hemen verin, WhatsApp üzerinden anında müşterilere ulaşın!',
          link: '/ilan-ver',
          renk: 'amber',
        },
      },
      { upsert: true }
    );
    console.log('✅ Homepage config initialized.');

    console.log('🎉 Seed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script error:', error);
    process.exit(1);
  }
}

seed();
