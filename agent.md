# Best Eskort — Teknik Mimari, Kurallar, Tasarım Standartları & Agent Spec

> **Son Güncelleme:** 19 Ekim 2026  
> **Sürüm:** `v2.4.0 — Senior Cyber Luxury & Floating Live Mesh`  
> **Durum:** Güncel, aktif üretim ve yönetim mimarisi  
> Bu dosya projenin gerçek amacını, teknik kararlarını, admin portalı tasarım prensiplerini ve agent'a ait **altın kuralları** içerir. Projeye dokunan her geliştirici ve yapay zeka ajanı bu kurallara istisnasız uymak zorundadır.

---

## 0. Projenin Gerçek Amacı

**Best Eskort**, Türkiye genelinde 81 il ve tüm ilçelerde **eskort ve escort bayan ilan platformu**dur.  
Kullanıcılar ilan verip modellerini tanıtır, müşteriler doğrudan WhatsApp veya yerleşik canlı sohbet üzerinden irtibat kurar.

Platform hedefleri:
- Google ve Yandex'te **"[şehir] eskort"** aramalarında ilk sayfalarda çıkmak
- Her modelin kendi ilan sayfasının Google'da **doğrudan model adıyla** indexlenmesi
- İlan veren bayanların fotoğraf ve bilgilerini güvenli şekilde yayınlaması
- Admin'in tüm ilanları, paketleri, canlı trafiği ve kullanıcıları tek bir kurumsal merkezden yönetmesi

---

## ALTIN KURALLAR (İHLAL EDİLEMEZ)

### 1. ASLA GOOGLE/YANDEX BOTLARI ENGELLENMEYECEK
Googlebot, YandexBot, Bingbot, AdsBot-Google gibi arama motoru botları HİÇBİR KOŞULDA engellenemez.
- Middleware'deki whitelist daima korunmalıdır.
- `robots.txt` dosyasına `Disallow: /` gibi engelleyici kural eklenemez.
- Sitemap her zaman güncel, geçerli ve 200 dönen URL'ler içermelidir.

### 2. ASLA YEREL DOSYA SİSTEMİNE YAZMA (VERCEL READ-ONLY)
Vercel production ortamında tüm yollar READ-ONLY'dir (`/tmp` hariç).
- Resim yüklemeleri MongoDB GridFS'e kaydedilir.
- `fs.writeFile` veya `path.join(process.cwd(), 'public', ...)` kullanımı KESİNLİKLE YASAKTIR.
- GridFS route: `POST /api/upload` → `GET /api/img/[id]`

### 3. ASLA BASE64 DATA URL'İ VERİTABANINA KAYDETME
Fotoğraf URL'leri veritabanında `data:image/...;base64,...` formatında saklanamaz.
- Sitemap'e base64 URL sızarsa Google Search Console dizin hatası verir.
- Tüm resimler GridFS'e yüklenip `/api/img/[id]` URL'i olarak saklanır.

### 4. DERLEME VE TYPE CHECK ZORUNLULUĞU
- Yapılan her değişiklikten sonra `npx tsc --noEmit` çalıştırılmalı ve 0 hata vermelidir.
- Kod kalıntısı, kullanılmayan ölü component veya yarım kalmış refactor bırakılamaz.

### 5. ASLA VARSAYIMSAL SUÇLAMA VE ADLİ YORUM
- Log analizi sonuçları "kesin kanıt" olarak sunulamaz.
- Korelasyon nedensellik değildir; hipotez olarak sunulur.

### 6. REVALIDATE SÜRESİ KISALTILMAZ
- İl/İlçe ve model sayfaları: `revalidate = 86400` (24 saat)
- Sitemap: `revalidate = 43200` (12 saat)

### 7. /api/admin ROTLARI VE PORTAL DAİMA KİLİTLİ KALACAK
Edge middleware'de `bms_admin_auth` çerezi kontrolü kaldırılamaz.

---

## 1. Teknik Yığın

| Katman | Teknoloji / Kütüphane | Amaç |
|---|---|---|
| **Frontend + SSR** | Next.js 15 (App Router, React 19) | Server-side rendering, SEO, dinamik rotalama |
| **Veritabanı** | MongoDB Atlas + Mongoose | Esnek doküman modeli, analitik koleksiyonları |
| **Medya Depolama** | MongoDB GridFS (`uploads` bucket) | Vercel uyumlu, kalıcı ve ölçeklenebilir görsel barındırma |
| **Görsel İşleme** | Sharp | WebP optimizasyonu + dinamik "BEST ESKORT" watermark |
| **Realtime İletişim** | SSE + Event Emitter & Polling | Canlı chat, anlık ziyaretçi radarı ve bildirimler |
| **Yönetici Kimlik** | Edge Cookie (`bms_admin_auth`) | SHA-256 korumalı, yetkisiz erişime kapalı oturum |
| **Tasarım Dili** | Tailwind CSS (Obsidian & Emerald) | Senior Cyber Luxury, yüksek bilgi yoğunluğu |
| **İkonografi** | Lucide React | Modern, tutarlı arayüz sembolleri |

---

## 2. BMS Secure Portal Tasarım İlkeleri (Senior Cyber Luxury)

Admin paneli (`/bms-secure-portal`), **karanlık siber estetik, minimalizm, sıfır dikkat dağınıklığı ve yüksek operasyonel hız** prensiplerine göre tasarlanmıştır. Tüm alt sayfalar istisnasız bu sisteme uymak zorundadır:

### 2.1 Renk Paleti ve Token Standartları
* **Ana Zemin (Deep Obsidian):** `#070a0f` — Sayfa gövdesi ve ana viewport zemini.
* **Konteyner / Kart Zemini (Dark Slate Navy):** `#0c1017` — Kartlar, paneller, modal gövdeleri, tablolar.
* **İç Öğe / Input / Çip Zemini:** `#070a0f` veya `bg-slate-900/60` — Giriş alanları, filtre butonları, ikincil kutular.
* **Kenarlık Standartları:** `border-slate-800` (ana sınırlar) veya `border-slate-800/80`.
* **Vurgu Rengi (Cyber Emerald):** `#10b981` (`text-emerald-400`, `bg-emerald-500/15`, `border-emerald-500/30`, `hover:bg-emerald-500`) — Birincil butonlar, aktif sekmeler, onay göstergeleri, canlı trafik ışıkları.
* **Metrik Vurguları (Cyan / Electric Blue):** `#06b6d4` (`text-cyan-400`) — KPI sayıları, oturum süreleri, teknik analizler.
* **Uyarı / Beklemede Vurgusu (Amber Gold):** `#f59e0b` (`text-amber-400`, `bg-amber-500/10`) — Onay bekleyen ilanlar, süre uyarıları.
* **Kritik / Yasak / Red Vurgusu (Rose):** `#f43f5e` (`text-rose-400`, `bg-rose-500/10`) — IP ban, silme aksiyonları, acil hatalar.
* **YASAKLI RENKLER:** Eski GitHub bordoları (`#161b22`, `#30363d`), ekranı boydan boya kaplayan kırmızı/sarı gradyan uyarı şeritleri panellerde kullanılamaz.

### 2.2 Tipografi ve Hiyerarşi
* **Başlıklar:** `text-sm font-semibold` veya `text-base font-bold text-white tracking-tight`. Kaba, devasa başlıklar yasaktır.
* **Gövde Metinleri:** `text-xs text-slate-400` veya `text-xs text-slate-300`.
* **Etiketler & Kategoriler:** `text-[10px] font-mono uppercase tracking-wider text-slate-500`.
* **Sayılar, Tarihler ve IP'ler:** Daima `font-mono` (örnek: `text-xs font-mono text-emerald-400`).

### 2.3 Konteyner Geometrisi (Border Radius)
* **Ana Kartlar ve Modallar:** Kesinlikle `rounded-2xl`. (Eski kaba `rounded-[32px]` veya `rounded-[36px]` kullanılamaz).
* **İç Öğeler, Butonlar ve Girdiler:** `rounded-xl`.
* **Rozetler ve Etiketler:** `rounded-lg` veya `rounded-full`.
* **Telefon Simülasyonu İstisnası:** Yalnızca bildirim masası kilit ekranı telefon önizleme çerçevesi için `rounded-[36px]` geçerlidir.

---

## 3. Canlı Mesajlaşma Mimarisi: Facebook Tarzı Yüzen Chat (Floating Live Chat)

Admin portalı genelinde müşteriyle canlı iletişim, sayfa değiştirmeyi gerektirmeyen **Facebook Messenger tarzı sağ alt yüzen widget (`AdminFloatingChat`)** ile sağlanır.

### Temel Çalışma Kuralları:
1. **Global Varlık:** `AdminFloatingChat`, `AdminAuthGate.tsx` içinde en üst seviyede monte edilmiştir; admin panelin hangi alt sayfasına (İlanlar, Analiz, Ayarlar, Kullanıcılar vs.) giderse gitsin widget sağ altta konumunu ve durumunu korur.
2. **Özel Sayfa İstisnası:** Admin doğrudan `/bms-secure-portal/chat` tam ekran çalışma masasına girdiğinde, çift widget oluşmaması için yüzen pencere otomatik gizlenir.
3. **Sıfır Sayfa Sıçraması (Zero Window Jump):** Mesaj listesi güncellendiğinde veya yeni mesaj geldiğinde ASLA `window.scrollTo` veya `scrollIntoView()` tetiklenemez. Otomatik kaydırma yalnızca iç mesaj konteynerinin `scrollTop = scrollHeight` değeri ile izole edilir.
4. **Hızlı Konuşma Değiştirici (Thread Switcher):** Widget içerisinde sol çekmece veya yatay avatar hapları ile açık ilan/ziyaretçi konuşmaları arasında sayfa yenilemeden tek tıkla geçiş yapılır.
5. **Ses ve Bildirim:** Web Audio API ile polifonik bildirim tonu çalınır. Admin ses tercihini (`bms_floating_chat_sound`) tarayıcıda saklayabilir.
6. **Ekranı Boğan Eski Bildirimlerin İptali:** Ekranın tepesini kaplayan ve tıklandığında admini başka sayfaya fırlatan eski `AdminGlobalLiveNotification` kaldırılmıştır; tek yetkili `AdminFloatingChat`'tir.

---

## 4. BMS Secure Portal Modül Haritası

Portal alt sayfaları ve üstlendikleri operasyonel roller:

1. **`/bms-secure-portal` (Ana Komuta Merkezi & Canlı Trafik):**
   - Gerçek zamanlı ziyaretçi akışı, aktif sayfalar, anlık bot/müşteri tespiti.
   - Google SERP sıralama ve dönüşüm analizleri, WhatsApp tıklama istatistikleri.
   - Canlı radar modalı ve online kullanıcı denetimi.
2. **`/bms-secure-portal/ilanlar` (İlan Moderasyonu):**
   - Bekleyen ilan onay/red, düzenleme, fotoğraf inceleme, paket atama.
   - Hızlı telefon toplu güncelleme ve şehir filtreleri.
3. **`/bms-secure-portal/kullanicilar` (Kullanıcı & Model Hesapları):**
   - Kayıtlı modellerin şifre, telefon, aktiflik ve panel erişim kontrolleri.
4. **`/bms-secure-portal/chat` (Tam Ekran Canlı Chat Masası):**
   - Yoğun müşteri mesajlaşması için genişletilmiş iki sütunlu konsol.
5. **`/bms-secure-portal/anasayfa-yonetimi` (Vitrin & Sıralama Masası):**
   - VIP vitrin istekleri, popup banner yönetimi, ana sayfa spot metinleri.
6. **`/bms-secure-portal/banners` (Banner Reklam Masası):**
   - Masaüstü ve mobil reklam alanları, tıklama sayaçları ve görsel yükleme.
7. **`/bms-secure-portal/backlinks` (SEO Backlink Ağı):**
   - Dış SEO ortaklıkları, dofollow link takibi ve sağlık kontrolleri.
8. **`/bms-secure-portal/site-yonetimi` (Site Ayarları & Duyuru Barı):**
   - Genel SEO meta ayarları, resmi WhatsApp numarası, üst duyuru çubuğu.
9. **`/bms-secure-portal/guvenlik` (Güvenlik & IP Ban Duvarı):**
   - Şüpheli IP engelleme, saldırı logları, sistem kilit kuralları.
10. **`/bms-secure-portal/bildirimler` (Push & Web Bildirim Masası):**
    - Web push gönderimi, cihaz hedefleme, kilit ekranı canlı simülasyonu.

---

## 5. Güvenlik ve Bot Koruması Mimarisi

Edge Middleware (`middleware.ts`):
1. `/api/admin/*` ve `/bms-secure-portal/*` → `bms_admin_auth` çerezi yoksa anında oturum kapısına yönlendirilir / 401 döner.
2. Arama motoru botları (Google, Yandex, Bing vs.) → Whitelist üzerinden engelsiz geçer.
3. Kötü niyetli scraper botlar (Headless, Scrapy, curl, bilinen veri hırsızları) → 403 Forbidden ile karşılanır.
4. Upload Güvenliği: Maksimum 10 fotoğraf / istek, fotoğraf başına maksimum 10MB, yalnızca geçerli `image/*` MIME tipleri.

---

## 6. Bilinen Sorunlar ve Alınan Kararlar Günlüğü

| Konu / Sorun | Çözüm / Karar | Tarih |
|---|---|---|
| **Eski Derin Analitik Modülü** | Performansı düşüren, mükerrer veri üreten `derin-analiz` modülü ve API'si tamamen kaldırıldı; kod kalıntıları temizlendi. | 19 Ekim 2026 |
| **Yüzen Chat Sayfa Sıçraması** | Mesaj akışındaki `scrollIntoView()` kaldırılarak iç konteyner `scrollTop` kontrolüne geçildi; ana ekran kayması sıfırlandı. | 19 Ekim 2026 |
| **Admin Tasarım Uyuşmazlığı** | Portalın 9 alt sayfası ve oturum açma kapısı tek tek elden geçirilerek **Senior Cyber Luxury (Obsidian & Emerald)** sistemine eşitlendi. | 19 Ekim 2026 |
| **Çakışan Kırmızı Bildirim Bandı** | `AdminGlobalLiveNotification` silindi; ekranı kaplayan kırmızı banner iptal edilip yetki `AdminFloatingChat`'e verildi. | 19 Ekim 2026 |
| **Vercel EROFS (Read-only FS)** | Fiziksel disk yazımı tamamen yasaklandı, MongoDB GridFS sistemine geçildi. | Eylül 2026 |
| **Sitemap Base64 Sızıntısı** | `addImage()` süzgeciyle base64 formatındaki resimlerin arama motoru dizinine gitmesi engellendi. | Eylül 2026 |
| **Aşırı Bot Kota Tüketimi** | İl/ilçe sayfalarında `revalidate=86400` + Edge middleware bot filtreleme kuralı devreye alındı. | Ağustos 2026 |

---

## 7. Geliştirici & Deploy Kontrol Listesi

Bir değişiklik yapıldıktan sonra commit öncesinde mutlaka kontrol edilmelidir:
1. `npx tsc --noEmit` çalıştırıldığında sıfır (0) hata vermelidir.
2. GridFS resim yükleme ve `/api/img/[id]` servis rotası test edilmiş olmalıdır.
3. Yeni eklenen UI öğelerinde `rounded-[32px]/[36px]` veya `#161b22` gibi eski kalıntılar olmamalı; `rounded-2xl` ve `#0c1017` / `#070a0f` kullanılmalıdır.
4. Canlı chat işlevinde sayfa sıçraması olmamalıdır.
5. Kullanıcı açıkça talep etmedikçe `git push` yapılmamalı; istendiğinde temiz commit mesajıyla gönderilmelidir.
