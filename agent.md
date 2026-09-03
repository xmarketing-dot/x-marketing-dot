# Best Eskort — Teknik Mimari, Kurallar & Agent Spec

> Bu dosya projenin gerçek amacını, teknik kararlarını ve agent'a ait **altın kuralları** içerir.
> Projeye dokunan her agent bu dosyayı baştan sona okumalıdır.

---

## 0. Projenin Gerçek Amacı

**Best Eskort**, Türkiye genelinde 81 il ve tüm ilçelerde **eskort ve escort bayan ilan platformu**dur.
Kullanıcılar ilan verip modellerini tanıtır, müşteriler doğrudan WhatsApp üzerinden irtibat kurar.

Platform hedefleri:
- Google ve Yandex'te **"[şehir] eskort"** aramalarında ilk sayfalarda çıkmak
- Her modelin kendi ilan sayfasının Google'da **doğrudan model adıyla** indexlenmesi
- İlan veren bayanların fotoğraf ve bilgilerini güvenli şekilde yayınlaması
- Admin'in tüm ilanları, paketleri ve kullanıcıları yönetmesi

---

## ALTIN KURALLAR (İHLAL EDİLEMEZ)

### 1. ASLA GOOGLE/YANDEX BOTLARI ENGELLENMEYECEK
Googlebot, YandexBot, Bingbot, AdsBot-Google gibi arama motoru botları HİÇBİR KOŞULDA engellenemez.
- Middleware'deki whitelist korunacak
- robots.txt'e Disallow: / gibi bir kural eklenmeyecek
- Sitemap her zaman güncel ve geçerli URL'ler içerecek

### 2. ASLA YEREL DOSYA SİSTEMİNE YAZMA (VERCEL)
Vercel production ortamında tüm yollar READ-ONLY'dir (/tmp hariç).
- Resim yüklemeleri MongoDB GridFS'e kaydedilir
- fs.writeFile veya path.join(process.cwd(), 'public', ...) YASAK
- GridFS route: POST /api/upload → GET /api/img/[id]

### 3. ASLA BASE64 DATA URL'İ VERİTABANINA KAYDETME
Fotoğraf URL'leri veritabanında data:image/...;base64,... formatında saklanamaz.
- Sitemap'e base64 URL sızarsa Google Search Console hatası verir
- Tüm resimler GridFS'e yüklenip /api/img/[id] URL'i olarak saklanır

### 4. ASLA KULLANICI "PUSHLA" DEMEDEN GIT PUSH YAPILMAZ
- npx tsc --noEmit --skipLibCheck sıfır hata göstermeli
- Kullanıcı açıkça "pushla" / "gönder" / "canlıya al" demeden git push yasak

### 5. ASLA VARSAYIMSAL SUÇLAMA VE ADLİ YORUM
- Log analizi sonuçları "kesin kanıt" olarak sunulamaz
- Korelasyon nedensellik değildir. Hipotez olarak sunulur.

### 6. REVALIDATE SÜRESİ KISALTILMAZ
- İl/İlçe ve model sayfaları: revalidate = 86400 (24 saat)
- Sitemap: revalidate = 43200 (12 saat)

### 7. /api/admin ROTLARI DAİMA KİLİTLİ KALACAK
Edge middleware'de bms_admin_auth çerezi kontrolü kaldırılamaz.

---

## 1. Teknik Yığın

| Katman | Teknoloji |
|---|---|
| Frontend + SSR | Next.js 15 (App Router) |
| DB | MongoDB Atlas + Mongoose |
| Resim Depolama | MongoDB GridFS (uploads bucket) |
| Resim Servis | GET /api/img/[id] |
| Realtime chat | Socket.IO |
| Auth (Admin) | Özel çerez (bms_admin_auth) |
| UI | Tailwind CSS (mobile-first) |
| Deployment | Vercel + MongoDB Atlas |

---

## 2. Dosya Yükleme Mimarisi

POST /api/upload:
  - sharp ile WebP dönüşümü + watermark ("BEST ESKORT" diyagonal su damgası)
  - MongoDB GridFS'e kaydedilir
  - { url: "/api/img/<GridFS-ObjectId>" } döner

GET /api/img/[id]:
  - GridFS'ten buffer çekilir
  - Cache-Control: max-age=31536000, immutable
  - Content-Type: image/webp

/public/uploads klasörüne yazma ARTIK KULLANILMIYOR — Vercel'de EROFS hatası verir.

---

## 3. SEO Mimarisi

### URL Yapısı
- /                          → Anasayfa
- /[il]                      → örn: /istanbul
- /[il]/[ilce]               → örn: /istanbul/beylikduzu
- /ilan/[slug]               → İlan detay
- /kategori/[slug]           → vip / gold / silver

### Kritik SEO Kuralları
- Title formatı: "${ilce} Eskort & Escort Bayan İlanları (2026 Teyitli) | ${il} Vip Escort"
- İstanbul, İzmir, Ankara, Antalya, Bursa → priority: 1.0, changeFrequency: hourly
- Beylikdüzü, Kadıköy, Şişli, Beşiktaş, Alsancak → priority: 0.95, hourly
- Her ilçe sayfasında TÜM ilçeler iç bağlantı matrisinde linklenir
- BreadcrumbList + FAQPage + AggregateRating JSON-LD her sayfada zorunlu
- Sitemap'e base64 URL ve /api/img/ URL'leri eklenmez

### Arama Motoru Bot Whitelist (middleware.ts — DOKUNULAMAZ)
google, yandex, bing, duckduck, applebot, twitterbot, facebookexternalhit, whatsapp, telegrambot

---

## 4. Admin Panel (bms-secure-portal)

URL: /bms-secure-portal
Erişim: bms_admin_auth=authenticated_superadmin_session_token çerezi zorunlu

Özellikler:
- İlan onay / red / düzenleme
- Canlı Ziyaretçi Akış Günlüğü (şüpheli botları gösterir)
- Google SERP Sıralama Takip Motoru
- Ban yönetimi (IP bazlı)
- Paket yönetimi (VIP / Gold / Silver)

---

## 5. Güvenlik Mimarisi

Edge Middleware (middleware.ts):
1. /api/admin/* → bms_admin_auth çerezi yoksa 401
2. Arama motoru botları → VIP bypass
3. AWS/HeadlessChrome/Scraper botları → 403
4. Normal kullanıcılar → normal akış

Upload Güvenliği:
- Max 10 fotoğraf / istek, Max 10MB / fotoğraf
- Sadece image/* MIME tipi kabul edilir

---

## 6. Bilinen Sorunlar ve Alınan Kararlar

| Sorun | Çözüm | Tarih |
|---|---|---|
| Vercel EROFS (read-only FS) | GridFS'e geçildi | Eylül 2026 |
| Sitemap'te base64 URL | addImage() filtresi eklendi | Eylül 2026 |
| 382K bot isteği - 9.48GB kota | revalidate=86400 + Edge bot engeli | Ağustos 2026 |
| /api/admin açık endpoint | Edge middleware cookie guard | Ağustos 2026 |
| Rakip Yandex Metrika sayacı koda girdi | Kaldırıldı | Ağustos 2026 |

---

## 7. Deploy Kontrol Listesi

- npx tsc --noEmit --skipLibCheck → 0 hata
- Resim yükleme testi (GridFS)
- /api/img/[id] URL'i tarayıcıda açılıyor mu?
- Google Search Console - Sitemap hatası var mı?
- Middleware bot whitelist korunuyor mu?
- git push yalnızca kullanıcı "pushla" dedikten sonra
