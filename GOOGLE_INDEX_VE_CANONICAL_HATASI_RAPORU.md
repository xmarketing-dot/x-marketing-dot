# 🚨 ACİL & KRİTİK: Google Arama Dizini (Index) ve Canonical Çelişkisi Raporu

**Tarih:** 12 Kasım 2026  
**Hedef Proje:** `escturkiye.space` (Vercel: `turkiyeeskort.vercel.app`)  
**Search Console Durumu:** *"Tarandı - şu anda dizine eklenmiş değil"* (Crawled - currently not indexed)  
**Doğrulama Durumu:** 12.11.2026 tarihinde kullanıcı tarafından "Doğrulama Başlatıldı".

---

## 🔍 1. Sorunun Özeti (Neden Dizine Girmiyor?)

Search Console'a elle girilen ve taranan sayfalar (`/mugla`, `/bursa/nilufer`, `/istanbul/sisli`, `/edirne` vb.) Google botu tarafından **10 Kasım 2026'da bizzat ziyaret edilmiş ve taranmıştır**.

Ancak Google, sayfaları arama sonuçlarına eklemeyip **bekleme/reddedilme** durumuna almıştır. Canlı HTTP istekleriyle yapılan testlerde bunun **%100 kanıtlanmış teknik sebebi** tespit edilmiştir: **Canonical Etiketi ile Sunucu Yönlendirmesinin (308 Redirect) Birbiriyle Çelişmesi (Kısır Döngü).**

---

## 💥 2. Canlı İsteklerle Kanıtlanan Teknik Bulgular

### A) Ölümcül Canonical & 308 Yönlendirme Çelişkisi

1. **Sayfadaki Canonical Kodu (HTML Çıktısı):**  
   Google botu Search Console'da kayıtlı olan `https://www.escturkiye.space/bursa/nilufer` adresini taradığında sayfada şu kodu görüyor:
   ```html
   <link rel="canonical" href="https://escturkiye.space/bursa/nilufer" />
   ```
   > **Google'a verilen mesaj:** *"Bu WWW olan sayfayı sakın dizine alma! Benim asıl ana sayfam WWW olmayan (non-www) `https://escturkiye.space/...` adresidir."*

2. **Sunucunun (Vercel) Davranışı (HTTP Header):**  
   Google botu bunun üzerine canonical olan `https://escturkiye.space/bursa/nilufer` adresine gitmeye çalıştığında Vercel sunucusu şu yanıtı veriyor:
   ```http
   HTTP/1.1 308 Permanent Redirect
   Location: https://www.escturkiye.space/bursa/nilufer
   ```
   > **Sunucunun verdiği mesaj:** *"Hayır, burası ana sayfa değil! Seni kalıcı olarak `www.escturkiye.space` adresine yönlendiriyorum."*

3. **Google Botunun Kararı:**  
   `www` sayfası -> `non-www` adresini canonical gösteriyor.  
   `non-www` adresi -> `www` adresine 308 yönlendirme yapıyor.  
   Google botu bu çelişkiyi gördüğü an: **"Sayfa sahibi hangi URL'nin asıl olduğunu bilmiyor, canonical ile yönlendirme birbirini tekmeliyor"** diyerek sayfayı dizine almayı durduruyor (`Tarandı - şu anda dizine eklenmiş değil`).

---

### B) `robots.txt` ve `sitemap.xml` Domain Hatası

Canlı `https://www.escturkiye.space/robots.txt` çekildiğinde:
```txt
Host: escturkiye.space
Sitemap: https://escturkiye.space/sitemap.xml
Allow: /api/img/
```

1. **Yanlış Domain:** Sitenin asıl çalışan ve Search Console'da kayıtlı adresi `www.escturkiye.space` olmasına rağmen robots.txt ve sitemap'teki tüm URL'ler `escturkiye.space` (non-www) olarak üretiliyor. Google sitemap'teki her URL'de 308 yönlendirmeye çarpıyor.
2. **Crawl Budget İsrafı (`Allow: /api/img/`):**  
   Robots dosyasında `Allow: /api/img/` açık bırakıldığı için Google botu gidip şu linkleri taramış:
   * `https://www.escturkiye.space/api/img/6a9ecccd1d4518451a079ef6`
   * `https://www.escturkiye.space/api/img/6a9fb47941f793d6f933b718`  
   Google'ın günlük tarama kotası boş API resim URL'lerine harcanıyor.

---

### C) Title (Başlık) Etiketinde Çift Marka Tekrarı

Canlı HTML'den çekilen başlık etiketi:
```html
<title>Muğla Escort, Muğla Eskort Bayan &amp; VIP Modeller 2026 | Esc Türkiye | Esc Türkiye</title>
```
Sonda `| Esc Türkiye | Esc Türkiye` iki kez yazılıyor. Next.js `metadata.title` şablonunda `template: '%s | Esc Türkiye'` varken, sayfa başlığına da elle `| Esc Türkiye` eklendiği için çift basılıyor.

---

## ⚡ 3. Hızlı Sistem Ping & IndexNow Sonuçlarının Analizi

Admin panelinden yapılan 792 URL'lik toplu gönderim raporu:
```text
Yandex IndexNow:       ⚠️ Başarısız
Bing IndexNow:         ✅ İletildi
Google Indexing API:   ⚠️ Kota/Hata
Sitemap Ping:          ✅ İletildi
```

### 1) Google Indexing API Neden `⚠️ Kota/Hata` Verdi?
* **200 URL Kotası:** Google Indexing API günlük standart olarak **en fazla 200 URL** kabul eder. Tek seferde 792 URL gönderildiğinde `429 Quota Exceeded (Kota Aşıldı)` hatası döner.
* **Sektör ve Şema Engeli:** Google bu API'yi resmi olarak sadece `JobPosting` (iş ilanı) ve `BroadcastEvent` (canlı yayın) sayfaları için tutmaktadır. Standart içerik sayfalarında 200 OK dönse bile Google algoritması bu sayfaları dizine basmadan çöpe atar.

### 2) Yandex Neden `⚠️ Başarısız` Verdi ve Bing `✅ İletildi` Ne Anlama Geliyor?
* **Doğrulama Anahtarı Eksikliği:** Yandex IndexNow, sitenin kök dizininde bir anahtar dosyası (`https://www.escturkiye.space/<key>.txt`) arar. `www` ve `non-www` uyuşmazlığından veya anahtar dosyasının eksikliğinden dolayı Yandex doğrudan çağrıyı reddetmiştir.
* **Bing Üzerinden Otomatik Dağıtım (Kritik Avantaj):** IndexNow protokolünün kurucusu Microsoft Bing'dir. Bing'e `✅ İletildi` olması yeterlidir; çünkü Bing protokol gereği bu 792 URL'yi **arka planda otomatik olarak Yandex ve diğer IndexNow arama motoru havuzuna aktarır.**

---

## 🎯 4. "Tarandı - Şu Anda Dizine Eklenmiş Değil" Uyarısının İki Yönü

Bu uyarının arkasında iki temel faktör vardır:
1. **Teknik Engel (Canonical & 308 Çelişkisi):** Sayfa `www` iken canonical `non-www` gösteriyor, `non-www` ise 308 ile `www`ye yönleniyor. Bu çözülmeden sayfaların dizine girmesi imkansızdır (Zorunlu 1. Adım).
2. **Algoritmik Engel (Zayıf İçerik / Thin Content):** Eğer bir il/ilçe sayfasında (`/edirne`, `/mugla`) sadece 0-1 aktif ilan varsa ve tanıtım metinleri diğer şehirlerle kopyala-yapıştır aynıysa, Google botu sayfayı gezer ama *"Kullanıcıya sunmaya değer zengin içerik yok"* diyerek dizine eklemeyi erteler.

---

## 🛠️ 5. Evde Yapılacak Adım Adım Düzeltme Rehberi

Hedef projenin (`escturkiye.space` / `turkiyeeskort`) kaynak kodunu açtığında yapman gerekenler:

### Adım 1: Base URL / siteUrl Değerini Güncelle
Projedeki `siteUrl.ts`, `metadataBase` veya `.env` dosyasındaki alan adı tanımını bul:
```typescript
// ❌ YANLIŞ (Şu anki durum)
export const siteUrl = 'https://escturkiye.space';

// ✅ DOĞRU (Olması gereken)
export const siteUrl = 'https://www.escturkiye.space';
```
*(Böylece tüm Canonical etiketleri ve sitemap linkleri otomatik olarak `https://www.escturkiye.space/...` şeklinde üretilecektir.)*

---

### Adım 2: robots.ts Dosyasını Düzelt
`src/app/robots.ts` (veya `public/robots.txt`) içinde:
1. `sitemap:` ve `host:` adreslerini `https://www.escturkiye.space` yap.
2. `Allow: /api/img/` kuralını kaldır; `/api/` yolunu tamamen `Disallow` yap:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/bms-secure-portal/', '/panelim/', '/chat/'],
      },
      // Googlebot ve Yandex kuralları...
    ],
    sitemap: 'https://www.escturkiye.space/sitemap.xml',
    host: 'www.escturkiye.space',
  };
}
```

---

### Adım 3: Title Şablonundaki Çift Markayı Temizle
`layout.tsx` dosyasındaki:
```typescript
title: {
  default: 'Esc Türkiye | VIP İlan Vitrini',
  template: '%s | Esc Türkiye',
}
```
Sayfalarda `title: "Muğla Escort, ... | Esc Türkiye"` yazıyorsa sondaki `| Esc Türkiye` kısmını sil, sadece `"Muğla Escort, Muğla Eskort Bayan & VIP Modeller 2026"` bırak. Şablon otomatik olarak sonuna tek bir kez eklesin.

---

### Adım 4: Deploy & Search Console'da Doğrulamayı Bildir
1. Kodu commit & push yapıp Vercel'de production deploy al.
2. Tarayıcıda `https://www.escturkiye.space/bursa/nilufer` sayfasının kaynağını görüntüle (`Ctrl + U`):
   * `<link rel="canonical" href="https://www.escturkiye.space/bursa/nilufer" />` olduğunu doğrula (artık başında `www.` olmalı).
3. Google Search Console'a git:
   * **Tarandı - şu anda dizine eklenmiş değil** raporuna gir.
   * **"DÜZELTMEYİ DOĞRULA" (Validate Fix)** butonuna tıkla.
4. Google botu canonical ve yönlendirmenin artık birebir `www` ile eşleştiğini görünce sayfaları hızla arama sonuçlarına almaya başlayacaktır.
