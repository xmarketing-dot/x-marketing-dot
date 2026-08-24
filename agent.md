# İlan Platformu — Teknik Mimari & Build Spec

> Bu dosya bir AI coding agent'a (Claude Code, Cursor, vs.) verilmek üzere hazırlanmıştır.
> Agent bu dosyayı okuyup projeyi baştan sona kurabilmeli. MongoDB connection string ayrıca verilecek.

---

## 0. Proje Özeti

"Letgo tarzı" bölgesel ilan platformu. Kullanıcılar (satıcı/ilan veren) admin'e (yani proje sahibine) bir **chat modülü** üzerinden ulaşır, paket seçer (haftalık/aylık), ilanını girer, kripto ile öder, admin onaylar, ilan anasayfada yayına girer.

Kritik gereksinimler:
- **Sadece mobil görünüm** (masaüstünde site gösterilmeyecek / mobil deneyime yönlendirilecek)
- **SEO çok kritik** — Google, il/ilçe bazlı her aramada bu siteyi bulmalı (81 il + tüm ilçeler)
- **WhatsApp entegrasyonu** — tek tıkla ilan sahibine (ya da admin'e) WhatsApp'tan ulaşma
- **Kripto ödeme**
- **Tamamen dinamik admin panel** — paketler, banner'lar, gold/premium rozetler, onay akışı
- **Next.js + MongoDB**

---

## 1. Teknik Yığın

| Katman | Teknoloji |
|---|---|
| Frontend + SSR/SSG | Next.js 14+ (App Router) |
| DB | MongoDB (Atlas veya self-host) + Mongoose |
| Realtime chat | Socket.IO (ayrı bir Node process veya Next.js custom server) |
| Auth | NextAuth.js (admin için credentials, kullanıcı için OTP/telefon ya da basit email+şifre) |
| Dosya/resim | Cloudinary (Firebase yerine — CDN + otomatik resize/webp, SEO için önemli) |
| Ödeme | Kripto — NOWPayments veya Coinbase Commerce API (custody'e girmeden, webhook ile ödeme onayı) |
| State (admin panel) | Zustand |
| UI | Tailwind CSS (mobile-first, masaüstü breakpoint'leri bilinçli olarak kısıtlanacak) |
| Deployment | Vercel (Next.js) + MongoDB Atlas + ayrı bir küçük VPS/Render (Socket.IO server için, Vercel serverless websocket'e uygun değil) |

---

## 2. "Sadece Mobilde Görünme" ↔ SEO Çelişkisini Çözme (ÖNEMLİ)

Bu, projenin en kritik teknik tuzağı. Yanlış yapılırsa SEO tamamen ölür. Doğrusu şu:

- **Masaüstü kullanıcısını asla sunucu tarafında (server-side) engelleme veya farklı içerik gösterme.** Google 2023'ten beri **mobile-first indexing** kullanıyor — yani Googlebot siteni zaten mobil User-Agent ile tarar. Bu senin lehine.
- Yapılacak şey **cloaking değil, responsive tasarım + UX yönlendirmesi**:
  1. Tüm sayfa aynı HTML'i döner (SSR/SSG), içerik masaüstünde de DOM'da mevcuttur (SEO için şart — Google'ın gördüğü içerik ile kullanıcının gördüğü içerik farklı olmamalı, aksi "cloaking" sayılır ve cezalandırılır).
  2. CSS ile masaüstünde: `max-width: 480px` içinde bir "telefon çerçevesi" simülasyonu göster, geri kalan ekran boş/branding görseli olsun. **Yani içerik DOM'da var ama görsel olarak sadece mobil genişlikte normal render ediliyor.**
  3. Alternatif/ek olarak masaüstünde üstte sabit bir banner: *"Bu site mobil deneyim için tasarlandı, QR kodu okutup telefonundan devam et"* — ama bu banner içeriği GİZLEMEMELİ, üstüne eklenmeli.
  4. **ASLA** `if (isMobile) return content; else return null` gibi server-side/robots bazlı bir engelleme yapma. Bu SEO'yu öldürür.
- `viewport` meta tag'i doğru ayarlanacak, Core Web Vitals mobilde optimize edilecek (asıl trafik zaten mobil gelecek — Google Ads/organik mobil arama).

---

## 3. SEO Mimarisi (Projenin Omurgası)

### 3.1 URL Yapısı
Hiyerarşik ve anlamlı, il/ilçe/kategori bazlı statik rotalar:

```
/                                → Anasayfa
/[il]                            → örn: /istanbul
/[il]/[ilce]                     → örn: /istanbul/beylikduzu
/[il]/[ilce]/[kategori]          → örn: /istanbul/kucukcekmece/tekne-kiralama
/ilan/[slug]-[ilanId]            → İlan detay sayfası
```

Slug formatı: `sarkoy-acik-deniz-tekne-turu-a1b2c3` — kategori + il + benzersiz kısa id.

### 3.2 Statik Üretim (SSG/ISR)
- **81 il** ve **tüm ilçeler** (~970 ilçe) için sayfalar `generateStaticParams` ile build-time'da SSG olarak üretilecek.
- İlan içeren il/ilçe sayfaları `revalidate: 3600` (ISR) ile saatlik güncellensin.
- İlan bulunmayan il/ilçe sayfaları da **boş bırakılmayacak** — "Bu bölgede henüz ilan yok, [en yakın ilçe]'daki ilanlara göz at" gibi internal linking ile hem kullanıcı deneyimi hem de **her il/ilçe URL'sinin indexlenebilir, içerik dolu bir sayfa olması** sağlanacak. Google'ın "thin content" cezasından kaçınmak için bu sayfalarda mutlaka: bölge açıklaması, yakın bölgelere linkler, kategori linkleri bulunmalı.

### 3.3 Dinamik Metadata (her sayfa için)
Next.js `generateMetadata` fonksiyonu ile:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${ilce} ${il} Tekne Kiralama İlanları | [SiteAdi]`,
    description: `${ilce}, ${il} bölgesinde güncel tekne kiralama ilanları...`,
    alternates: { canonical: `https://site.com/${il}/${ilce}` },
    openGraph: { images: [...] },
  }
}
```

### 3.4 JSON-LD Structured Data
Her ilan detay sayfasında `schema.org/Product` + `Offer` + `LocalBusiness`/`Service` (ilan tipine göre) JSON-LD enjekte edilecek. Anasayfa ve kategori sayfalarında `BreadcrumbList` şeması.

### 3.5 Sitemap
- `app/sitemap.ts` — dinamik olarak MongoDB'den tüm il/ilçe/kategori/ilan URL'lerini çekip **sitemap index + parçalı sitemap'ler** (50.000 URL limiti göz önünde, muhtemelen `sitemap-il.xml`, `sitemap-ilanlar-1.xml`, vs.) üretecek.
- `robots.txt` → sitemap index'e referans versin, admin panel ve API route'ları `Disallow` edilsin.

### 3.6 Diğer SEO Teknikleri
- Server-side rendering (Googlebot JS render eder ama SSR/SSG hız + garanti açısından şart).
- `next/image` ile otomatik lazy-load + WebP.
- Her il/ilçe sayfasında **unique içerik** — template'ten şablonik değil, en azından değişken bölge bilgisi (nüfus, bilinen semtler, vs. — statik bir JSON'dan beslenebilir).
- Internal linking: her ilan sayfasından "benzer ilanlar", "aynı ilçedeki diğer ilanlar" linkleri.
- Hızlı LCP için hero görselleri `priority` ile yüklenecek.
- Google Search Console + `sitemap` submit adımı deployment sonrası yapılacak (agent'a not: bunu insan yapacak, kodla otomatikleştirilemez).

---

## 4. MongoDB Şema Tasarımı

### 4.1 `locations` (il/ilçe statik referans — seed data)
```js
{
  _id, il: "İstanbul", ilSlug: "istanbul",
  ilceler: [
    { ad: "Beylikdüzü", slug: "beylikduzu" },
    { ad: "Küçükçekmece", slug: "kucukcekmece" },
    // ...
  ]
}
```
Bu koleksiyon Türkiye'nin 81 il + tüm ilçe verisiyle bir kere seed edilecek (TÜİK il-ilçe listesi kullanılabilir, agent internet erişimi varsa güncel listeyi çeksin, yoksa bilinen statik JSON kullanılsın).

### 4.2 `categories`
```js
{
  _id, ad: "Tekne Kiralama", slug: "tekne-kiralama",
  ikon, aciklama, siraNo, aktif: true
}
```

### 4.3 `packages` (admin panelden dinamik yönetilecek)
```js
{
  _id, ad: "Gold Paket", tip: "haftalik" | "aylik",
  fiyatTL, fiyatUSDT,
  ozellikler: ["Anasayfada öne çıkar", "Slider'da gösterim", "5 fotoğraf", "Öne çıkan rozet"],
  rozet: "gold" | "premium" | "standart",
  maxFotoSayisi: Number,
  anasayfaSlider: Boolean,
  siraOnceligi: Number,   // sıralamada öncelik puanı
  aktif: true
}
```

### 4.4 `listings` (ilanlar)
```js
{
  _id, slug, baslik, aciklama,
  kategoriId, ilSlug, ilceSlug,
  kullaniciId,
  paketId, paketBitisTarihi,
  fotograflar: [{ url, publicId, siraNo }],  // Cloudinary
  anaFotograf: { url, publicId },
  whatsappNumara: "+905xxxxxxxxx",
  fiyat, paraBirimi,
  ozellikler: { ... },  // kategoriye göre esnek alanlar
  rozet: "gold" | "premium" | "standart" | null,
  status: "taslak" | "odeme_bekliyor" | "onay_bekliyor" | "yayinda" | "reddedildi" | "suresi_doldu",
  reddedilmeNedeni: String,
  goruntulenmeSayisi: Number,
  whatsappTiklamaSayisi: Number,
  createdAt, updatedAt, onaylanmaTarihi
}
```

### 4.5 `users` (ilan verenler)
```js
{
  _id, ad, telefon, email, sifreHash,
  chatThreadId,
  createdAt
}
```

### 4.6 `admins`
```js
{ _id, email, sifreHash, rol: "superadmin" | "editor" }
```

### 4.7 `chatThreads` + `chatMessages`
```js
// chatThreads
{ _id, kullaniciId, sonMesajOzeti, okunmadiAdminSayisi, okunmadiKullaniciSayisi, updatedAt }

// chatMessages
{ _id, threadId, gonderenTipi: "user" | "admin", mesaj, ekler: [url], createdAt, okundu }
```
Socket.IO ile realtime, ama mesajlar her zaman Mongo'ya persist edilecek (admin offline olsa bile kullanıcı mesaj bırakabilmeli).

### 4.8 `payments`
```js
{
  _id, listingId, kullaniciId, paketId,
  tutar, paraBirimi: "USDT" | "BTC" | ...,
  saglayici: "nowpayments",
  saglayiciPaymentId,
  status: "pending" | "confirmed" | "failed" | "expired",
  webhookLog: [...],
  createdAt, confirmedAt
}
```

### 4.9 `homepageConfig` (admin'in anasayfayı dinamik yönettiği tekil doküman)
```js
{
  _id: "singleton",
  hero: { baslik, altBaslik, gorselUrl },
  aktifBanner: { aktif: Boolean, metin, link, renk, hedefKitle: "herkes" | "sadece-ucretsiz" },
  sliderIlanIds: [ObjectId],   // gold/premium ilanlar buraya otomatik ya da manuel eklenir
  oneCikanKategoriler: [ObjectId]
}
```

---

## 5. Sayfa Haritası (Next.js App Router)

```
app/
  page.tsx                          → Anasayfa (slider, banner, kategoriler, öne çıkan ilanlar)
  [il]/page.tsx                     → İl bazlı ilan listesi + SEO metni
  [il]/[ilce]/page.tsx              → İlçe bazlı ilan listesi
  [il]/[ilce]/[kategori]/page.tsx   → İlçe + kategori filtreli liste
  ilan/[slug]/page.tsx              → İlan detay (JSON-LD, WhatsApp CTA, galeri)
  ilan-ver/page.tsx                 → Giriş yapmış kullanıcı için ilan oluşturma formu (çok adımlı)
  ilan-ver/paket-sec/page.tsx       → Paket seçim + kripto ödeme başlatma
  chat/page.tsx                     → Kullanıcının admin'le canlı chati
  panelim/page.tsx                  → Kullanıcının kendi ilanlarını yönettiği alan (durum, süre, yenileme)
  giris / kayit /page.tsx

  admin/
    layout.tsx                      → Auth guard (NextAuth middleware)
    page.tsx                        → Dashboard (bekleyen onaylar, ödeme durumları, istatistik)
    ilanlar/page.tsx                → Tüm ilanlar, filtre, onayla/reddet
    ilanlar/[id]/page.tsx           → İlan detay + onay/red aksiyonu
    paketler/page.tsx               → Paket CRUD
    anasayfa-yonetimi/page.tsx      → Banner, slider, hero yönetimi
    chat/page.tsx                   → Tüm kullanıcı thread'leri, admin buradan yanıtlar
    odemeler/page.tsx               → Ödeme/webhook logları

  api/
    listings/route.ts               → CRUD
    payments/webhook/route.ts       → Kripto sağlayıcı webhook endpoint (imza doğrulama şart!)
    chat/socket/...                 → Socket.IO handshake (veya ayrı server)
    sitemap.xml / sitemap/[...]     → Next.js sitemap route handler
```

---

## 6. İlan Verme Akışı (Uçtan Uca)

1. Kullanıcı siteye girer → **chat modülünden** admin'e ulaşır (login şart değil, misafir olarak da mesaj başlatabilir — dönüşüm oranı için önemli).
2. Admin panelinde thread düşer, admin panelini **sürekli açık tutacağı** için anlık bildirim (tarayıcı push notification + ses).
3. Admin kullanıcıya süreç hakkında bilgi verir / kullanıcı direkt **"ilan ver"** akışına da chat'ten bağımsız girebilir.
4. Kullanıcı kayıt olur (telefon+OTP ya da email+şifre).
5. **Paket seçimi** (haftalık/aylık, standart/gold/premium) → fiyat gösterilir (TL karşılığı + kripto karşılığı anlık kur ile).
6. **Kripto ödeme** başlatılır → NOWPayments/Coinbase Commerce'den ödeme adresi/QR üretilir → kullanıcı öder → webhook `payments` koleksiyonunu günceller.
7. Ödeme onaylanınca kullanıcı **ilan formunu** doldurur: kategori, il/ilçe, başlık, açıklama, ana fotoğraf, slider fotoğraflar (Cloudinary'e direkt client-side upload, signed upload preset ile), WhatsApp numarası, fiyat, özel alanlar.
8. Form gönderilince `listing.status = "onay_bekliyor"` olur, admin paneline düşer.
9. Admin panelden **onaylar veya reddeder** (red sebebi kullanıcıya chat/email ile iletilir).
10. Onaylanan ilan `status = "yayinda"` olur, anasayfada/il-ilçe sayfalarında görünür, paket süresine göre `paketBitisTarihi` sonrası otomatik `suresi_doldu` durumuna düşer (cron/Vercel Cron Job).
11. Kullanıcı `panelim` sayfasından ilanını görüntüleme sayısı, WhatsApp tıklama sayısı ile birlikte takip eder, süre bitince yeniden paket satın alıp yenileyebilir.

---

## 7. WhatsApp Entegrasyonu

- İlan detayında sabit alt buton: **"WhatsApp'tan Ulaş"**
- Link: `https://wa.me/${numara}?text=${encodeURIComponent("Merhaba, " + ilan.baslik + " ilanınız hakkında bilgi almak istiyorum.")}`
- Bu bir `<a>` linki, JS gerektirmez — hem SEO hem hız açısından ideal, buton tıklaması `whatsappTiklamaSayisi` artırmak için `onClick`'te API'ye analytics call atılır (link davranışını engellemeden, `target="_blank"`).
- Resmi WhatsApp Business API'ye şu aşamada gerek yok — `wa.me` linki yeterli ve ücretsiz.

---

## 8. Kripto Ödeme Entegrasyonu

- **Öneri: NOWPayments** (custody almaz, çok kripto para destekler, webhook basit) veya **Coinbase Commerce**.
- Akış: `POST /api/payments/create` → sağlayıcıdan `payment_id` + ödeme adresi/QR alınır → kullanıcıya gösterilir → kullanıcı öder → sağlayıcı `POST /api/payments/webhook` çağırır → **IPN secret / HMAC imza doğrulaması** yapılır (şart, aksi halde sahte webhook'la ücretsiz ilan basılabilir) → `payment.status = confirmed` → ilgili `listing` `odeme_bekliyor` → `onay_bekliyor` durumuna geçer.
- Kur hesaplama: TL fiyatını göstermek için CoinGecko/Binance public API'den anlık kur çekilip USDT karşılığı hesaplanabilir (cache'lenmiş, 5 dk'da bir).

---

## 9. Admin Panel Özellikleri (Özet Liste)

- Dashboard: bekleyen onay sayısı, aktif ilan sayısı, günlük görüntülenme, ödeme özeti
- İlan onay/red ekranı (fotoğraf galerisi büyük önizleme ile)
- Paket yönetimi (fiyat, özellik, rozet — tam CRUD)
- Anasayfa yönetimi: hero görseli, banner (aç/kapa, metin, renk, link), slider'a manuel ilan ekleme/çıkarma
- Chat paneli: tüm kullanıcı thread'leri tek ekranda, okunmamış sayaç
- Ödeme logları: her webhook event'i, manuel "ödeme onayla" override butonu (kripto ağı gecikirse admin manuel geçebilsin)
- İl/ilçe bazlı ilan istatistiği (SEO performansını görmek için hangi bölgede kaç ilan var)

---

## 10. Auth Stratejisi

- **Admin**: NextAuth Credentials Provider, `admin/*` route'ları middleware ile korunur, tek/az sayıda admin hesabı.
- **Kullanıcı**: Telefon + OTP (Türkiye pazarı için en doğal — SMS provider: Netgsm/İletimerkezi gibi yerli sağlayıcılar tercih edilebilir) ya da email+şifre. JWT session, NextAuth veya kendi basit implementasyonu.

---

## 11. Faz Planı (MVP → Tam Ürün)

**Faz 1 (MVP):**
- Next.js proje kurulumu, MongoDB bağlantısı, temel şemalar
- İl/ilçe statik sayfalar + SEO temel altyapı (sitemap, metadata, JSON-LD)
- İlan CRUD + admin onay akışı (ödeme olmadan, manuel admin onayı)
- WhatsApp linki
- Mobil-only responsive tasarım

**Faz 2:**
- Chat modülü (Socket.IO)
- Kripto ödeme entegrasyonu + webhook
- Paket sistemi (gold/premium rozet, slider)

**Faz 3:**
- Admin anasayfa yönetimi (dinamik banner/hero)
- Kullanıcı paneli (panelim), otomatik süre dolumu (cron)
- İstatistik/analytics genişletme

Agent'a not: **Faz 1'i çalışır ve deploy edilebilir halde bitirmeden Faz 2'ye geçme.** SEO altyapısı (statik il/ilçe sayfaları + sitemap) en baştan doğru kurulmalı, sonradan eklemek maliyetli olur.

---

## 12. Agent İçin Kurulum Notları

1. `npx create-next-app@latest --typescript --tailwind --app`
2. `mongoose`, `next-auth`, `socket.io` + `socket.io-client`, `cloudinary`, `zustand` kurulacak
3. `.env.local`: `MONGODB_URI`, `CLOUDINARY_*`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NEXTAUTH_SECRET`
4. MongoDB connection string kullanıcı tarafından sağlanacak, agent bağlanıp `locations`, `categories`, `packages` koleksiyonlarını seed edecek
5. Vercel'e deploy edilecek Next.js kısmı; Socket.IO için ayrı bir Node process gerekiyorsa (Vercel serverless'ta persistent websocket sorunlu) Render.com/Railway gibi bir yerde ayrı deploy edilecek, ya da Pusher/Ably gibi managed bir realtime servisi tercih edilebilir (agent karar versin, maliyet/basitlik dengesine göre).

---

## 13. Belirtilmeyen ama Önerilen Ek Noktalar

- **Rate limiting**: chat ve ilan formu spam'e açık, `next-rate-limit` veya basit IP bazlı throttling eklenmeli.
- **Fotoğraf moderasyonu**: uygunsuz içerik yüklenmesine karşı admin onay adımı zaten var ama otomatik bir görsel moderasyon (Cloudinary AI moderation add-on) düşünülebilir.
- **KVKK/Aydınlatma metni**: telefon numarası, WhatsApp gibi kişisel veri toplandığı için gizlilik politikası sayfası şart (hem yasal hem Google Ads onayı için).
- **Google Analytics / Search Console** entegrasyonu kod tarafında `gtag` ile en baştan eklenmeli.