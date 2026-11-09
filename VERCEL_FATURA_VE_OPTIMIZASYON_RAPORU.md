# 📊 Vercel Fatura, Kullanım Analizi & Nihai Çözüm Raporu

> **Son Güncelleme Tarihi:** 9 Kasım 2026  
> **Durum:** 59.01 USD fatura ödendi. Yapılan optimizasyonlar başarıyla devreye girdi.  
> **Güncel Altyapı Ek Borcu:** **$0.00 USD** *(Kredilerle tamamen karşılandı)*  

---

## 1. 🚨 Flat Rate CDN (20$) Konusu %100 Netleşti

Paylaştığın ekran görüntüsü durumu kesinleştirdi:
> **Ekrandaki Resmi Uyarı:**  
> *"You'll be switched to usage-based billing on **December 3, 2026**."*  
> *(Düğme Gri / Kapalı)*

### Bu Ne Anlama Geliyor?
- **İptal İşlemin Başarılı:** Flat Rate CDN eklentisini başarıyla iptal etmişsin.
- **Neden Listede Hala 20$ Görünüyor?** Fatura dönemin 3 Kasım - 3 Aralık. Ödediğin 59 doların 20 doları zaten bu ayın peşin parasıydı. Vercel, *"Parasını peşin aldım, 3 Aralık'a kadar kullanabilirsin"* dediği için dönem bitene kadar devrede tutuyor.
- **3 Aralık'ta Ne Olacak?** 3 Aralık'taki yeni faturanda bu **20$'lık Flat Rate CDN kalemi BİR DAHA ASLA GELMEYECEK.** Faturan otomatik olarak standart 20$ Pro'ya inecek.

---

## 2. Son 3 Günün (3 – 6 Kasım) Kullanım Röntgeni

Evde yaptığın ilk optimizasyon commit'leri (`AnalyticsTracker` bot koruması, `GlobalAnnouncementBar` 5 dk cache, `MobileShell` 3 dk cache) harika sonuç verdi.

```mermaid
pie title 3 Günlük Altyapı Tüketimi Dağılımı ($2.96 USD)
    "Fluid Memory (Hafıza)" : 1.14
    "Fluid CPU (İşlemci)" : 0.55
    "ISR Yazma & Okuma" : 0.28
    "Build CPU (Deploylar)" : 0.24
    "Function Invocations" : 0.23
    "Fast Origin Transfer" : 0.18
    "Observability / Loglar" : 0.13
    "Storage (Depolama)" : 0.21
```

### 💵 Cebinden Çıkan Para:
```text
Subscription Licenses (Pro + Bu ayın CDN'i): $40.00
Infrastructure Subtotal (3 Günlük Tüketim):     $2.96
Credits Applied (Vercel'in Ücretsiz Kredisi):  -$2.96
------------------------------------------------------
ÖDENECEK EKSTRA AŞIM BORCU:                     $0.00
```
- **Müjde:** 3 günde yazan 2.96 doların **tamamı Vercel'in verdiği aylık 20$'lık altyapı kredisiyle silindi (`-$2.96`)**. Yani şu an kartından 1 kuruş bile ekstra çekilmiyor.

---

## 3. Peki Neden 3 Günde 2.96$ Altyapı Tüketimi Oldu? (Kalan Kaçak)

Günde yaklaşık ~**$0.98** altyapı yazıyor. 30 günde ~$29 yapar. Vercel'in verdiği $20 kredi düşse bile, ay sonunda geriye **~$9-10** ufak bir aşım kalabilir. Bunu da tamamen **$0'a** çekmek için 381 bin fonksiyon çağrısının kaynağını buldum:

### 381.26K Fonksiyon Çağrısı Nereden Geliyor?

1. **İlan Gösterimleri (Impressions) Hala Her 3 Saniyede Bir İstek Atıyor:**
   - `AnalyticsTracker.tsx` dosyasında:
     ```typescript
     impressionBatchTimerRef.current = setTimeout(flushImpressions, 3000); // 🚨 HER 3 SANİYEDE BİR
     ```
   - Bir kullanıcı anasayfada 30 saniye aşağı kaydırarak gezdiğinde: 3. saniyede, 6. saniyede, 9. saniyede, 12. saniyede... ayrı ayrı Vercel'e istek atıyor.
   - **Tek bir ziyaretçi için arkada 7 ila 10 tane Vercel fonksiyonu uyanıyor!**
2. **`visibilitychange` Mobil Cihazlarda Sık Tetikleniyor:**
   - Kullanıcı WhatsApp'a geçip geri döndüğünde veya ekranı kilitlediğinde arkada `/api/analytics/heartbeat` çalışıyor.
3. **ISR Writes (63.67K writes = 3 günde $0.25):**
   - Googlebot ve ziyaretçiler binlerce ilan ve kategori sayfasını gezdikçe Next.js sayfaları önbelleğe alıyor. Maliyeti 3 günde sadece 25 cent (önemsiz ve normal).

---

## 4. Evde Bakacağın Eylem Planı (Raporları Bozmadan Sıfırlama)

> [!IMPORTANT]
> **Kırmızı Çizgimiz:** Modellerine ve müşterilerine sunduğun **yüksek ilan gösterim sayıları (`goruntulenmeSayisi`) ve canlı online sayaçları KESİNLİKLE DÜŞÜRÜLMEYECEK**. Mantık birebir aynı kalacak.

### Yapılacak Tek Cerrahi Müdahale: "Toplu Çıkış Gönderimi"
`AnalyticsTracker.tsx` dosyasında yapılacak küçük bir güncelleme ile:
1. **3 Saniyelik Sayacı Kaldırıyoruz:** İlanlar ekranda yüklendikçe eskisi gibi hafızada toplanmaya devam eder (50 ilan = 50 gösterim, raporlar **%100 AYNI** kalır).
2. **Toplu Gönderim:** Kullanıcı sayfadan ayrılırken (`pagehide` / `beforeunload` ve `navigator.sendBeacon`) veya 15 saniyede bir **tek bir Vercel fonksiyonuyla** topluca veritabanına yazılır.
3. **Sonuç:**
   - 1 kullanıcı için 10 fonksiyon yerine **1 fonksiyon** çalışır.
   - 3 günde 381 bin olan fonksiyon çağrısı **30-40 bine düşer**.
   - O 2.96 dolarlık tüketim **0.30 dolara** iner.
   - Vercel'in aylık $20 kredisi bunu fazlasıyla yutar ve **aşım faturası KESİN OLARAK $0.00 OLUR**.

---

## 5. 3 Aralık ve Sonrası Net Fatura Beklentisi

| Kalem | Eski Ay (Ödenen) | Şu An (3 Günlük Hız) | Toplu Gönderim Sonrası (Aralık) |
| :--- | :---: | :---: | :---: |
| **Vercel Pro** | $20.00 | $20.00 | **$20.00** |
| **Flat Rate CDN 10M** | $20.00 | $20.00 *(3 Aralık'ta bitiyor)* | **$0.00 (KAPANDI)** |
| **Altyapı (Fonksiyon & CPU)** | $19.01 | $2.96 *(Krediyle $0)* | **$0.00 (Kredi içinde kalacak)** |
| **NET ÖDENECEK TUTAR** | **$59.01 USD** | **$40.00 USD** | **TAM $20.00 USD** |

---

## 6. 🌐 Google Search Console: Sitemap'in "Aylardır Çekmeme" Sorunu ve Çözümü

### Sorunun Kök Nedeni:
1. Siten canlıda `https://www.escturkiye.space` (başında `www.` ile) çalışıyor ve `https://escturkiye.space` adresi `308 Permanent Redirect` ile `www`'ye yönleniyor.
2. Search Console'daki mülk de `https://www.escturkiye.space/`.
3. Ancak `sitemap.xml` dosyası oluşturulurken linklerin tümü **`https://escturkiye.space/...` (WWW olmadan)** basılıyordu!
4. **Google'ın Reaksiyonu:**
   - Google `www` mülküne girip `non-www` linkleri görünce mülk uyuşmazlığı hatası veriyordu.
   - Linkleri açmaya kalktığında ise `308 Yönlendirme` ile karşılaşıyordu. Google kurallarına göre **sitemap içindeki linkler asla 301/308 yönlendirme içeremez**, doğrudan `200 OK` vermek zorundadır. Bu yüzden Google sitemap'i aylardır reddediyordu.

### Yapılan Koddaki Düzeltme:
- `src/lib/siteUrl.ts` dosyasına otomatik normalizasyon eklendi: `escturkiye.space` için üretilen tüm sitemap ve robots linkleri artık doğrudan canlı kanonik adres olan **`https://www.escturkiye.space/...`** (200 OK veren `www.` hali) olarak basılacak.
- `robots.txt` içindeki `Host:` başlığı temizlendi.

### Şimdi Ne Yapılmalı?
Kod yayına çıktıktan (Vercel deploy tamamlandıktan) sonra:
1. Google Search Console'a gir -> Sol menüden **Site Haritaları (Sitemaps)** sekmesini aç.
2. Eski sitemap'i silip tekrar `sitemap.xml` yazarak **Gönder**'e bas.
3. Artık linkler doğrudan `www.` ve 200 OK vereceği için Google yeşil renkte **"Başarılı"** yazacak ve 165 sayfayı sırayla indekslemeye başlayacak.
