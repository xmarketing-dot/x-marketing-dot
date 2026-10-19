# Best Eskort — Web & Admin Portal Platformu

> **Son Güncelleme:** 19 Ekim 2026  
> **Sürüm:** `v2.4.0 (Senior Cyber Luxury & Floating Live Mesh)`  
> **Teknik Mimari & Kurallar Belgesi:** Detaylı geliştirici ve yapay zeka ajan kuralları için [`agent.md`](./agent.md) dosyasını inceleyin.

---

## 📌 Proje Özeti

Best Eskort; Türkiye genelinde 81 il ve tüm ilçelerde eskort ve model ilanlarını yayınlayan, yüksek hızlı arama motoru optimizasyonu (SEO), gerçek zamanlı canlı müşteri sohbeti ve ileri düzey kurumsal yönetim paneline sahip modern bir web platformudur.

---

## 🛠️ Teknoloji Yığını

* **Framework:** Next.js 15 (App Router, Server Components & React 19)
* **Veritabanı:** MongoDB Atlas + Mongoose
* **Medya Depolama:** MongoDB GridFS (`uploads` bucket) + Sharp (WebP dönüşümü ve filigran)
* **Canlı İletişim:** Server-Sent Events (SSE), EventEmitter ve optimize edilmiş polling
* **Stil & Arayüz:** Tailwind CSS (Obsidian & Emerald Cyber Luxury Tasarım Sistemi)
* **İkonlar:** Lucide React
* **Yönetici Güvenliği:** Edge Middleware + SHA-256 korumalı `bms_admin_auth` çerezi

---

## 🚀 Başlangıç ve Çalıştırma

Projeyi yerel ortamda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

### Tip Kontrolü
Değişikliklerin TypeScript doğruluğunu sınamak için:

```bash
npx tsc --noEmit
```

---

## 🔒 Güvenli Yönetici Portalı (`/bms-secure-portal`)

Yönetim paneli; canlı trafik takibi, Facebook tarzı sağ alttan açılan yüzen canlı sohbet (`AdminFloatingChat`), ilan moderasyonu, kullanıcı hesap yönetimi, SEO backlink ağı ve push bildirim araçlarını barındırır.

Tasarım standartları, altın kurallar ve mimari kararlar için [`agent.md`](./agent.md) belgesine başvurun.
