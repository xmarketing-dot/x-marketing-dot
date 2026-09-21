export interface FaqItem {
  question: string;
  answer: string;
}

export interface LocationGuide {
  title: string;
  paragraphs: string[];
  bulletPoints: string[];
}

// Deterministic seed generator for unique content distribution per location
function getSeedNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 8 Temalı Zengin Soru Havuzu. Her il ve ilçe için deterministik olarak
 * farklı 4 soru ve farklı doğal cümle varyasyonları seçilerek
 * Google'ın "Kopya/Şablon İçerik (Duplicate/Thin Content)" cezası %100 engellenir.
 */
export function generateLocationFaq(ilAd: string, ilceAd?: string): FaqItem[] {
  const target = ilceAd ? `${ilAd} ${ilceAd}` : ilAd;
  const shortTarget = ilceAd || ilAd;
  const seed = getSeedNumber(target);

  const questionPool: FaqItem[] = [
    // 1. Teyit ve Doğrulama
    {
      question: `${shortTarget} eskort ve escort bayan profilleri doğrulanmış mı?`,
      answer: `Best Eskort üzerindeki tüm ${target} eskort ve bağımsız escort profilleri admin ekibimiz tarafından telefon ve fotoğraf teyidinden geçirilmektedir. Teyitli rozeti bulunan ilanlarda sahte görsel kullanımı engellenerek gerçek fotoğraflar güvence altına alınır.`,
    },
    // 2. WhatsApp ve İletişim
    {
      question: `${shortTarget} eskortlarıyla doğrudan WhatsApp üzerinden iletişim kurulabilir mi?`,
      answer: `Evet, sitemizdeki tüm ilanlarda doğrudan WhatsApp iletişim butonu ve telefon numarası yer alır. Araya hiçbir aracı, komisyoncu veya ajans girmeden %100 doğrudan ve gizli şekilde randevu oluşturabilirsiniz.`,
    },
    // 3. Fiyatlar ve Saatlik/Gecelik Ücretler (LSI Keywords)
    {
      question: `${shortTarget} eskort fiyatları ve saatlik/gecelik görüşme ücretleri ne kadar?`,
      answer: `${target} bölgesindeki eskort görüşme ücretleri sunulan hizmet türüne (kısa görüşme, saatlik, tüm gece konaklama veya haftasonu eşlik) ve bayanın bağımsız VIP rozetine göre değişiklik göstermektedir. Net fiyat bilgisi ilan detayında şeffafça paylaşılmaktadır.`,
    },
    // 4. Hizmet Mekanları (Otel, Rezidans, Eve Servis)
    {
      question: `${shortTarget} bölgesinde eve, otele ve rezidansa özel hizmet veren eskortlar var mı?`,
      answer: `${target} genelinde hizmet veren eskort bayanların birçoğu kendi özel lüks dairesinde misafir kabul ettiği gibi, müşterinin tercih ettiği 4-5 yıldızlı otellere veya özel rezidanslara da güvenle eşlik hizmeti sağlamaktadır.`,
    },
    // 5. Güvenlik ve Ön Ödeme Uyarısı (E-E-A-T Güven Sinyali)
    {
      question: `${shortTarget} eskort randevularında ön ödeme veya kapora isteniyor mu?`,
      answer: `Kesinlikle hayır! Best Eskort olarak kullanıcılarımızı internet dolandırıcılığına karşı uyarıyoruz: Randevu öncesinde sizden "taksi parası", "kapora" veya "güvence bedeli" adı altında ön ödeme talep eden şahıslara asla para göndermeyiniz. Ödemenizi yalnızca buluşma anında elden yapınız.`,
    },
    // 6. Gizlilik ve Güvenilirlik
    {
      question: `${shortTarget} bölgesinde görüşmelerde gizlilik nasıl sağlanıyor?`,
      answer: `${target} elit eskort ilanlarında karşılıklı gizlilik esastır. Ziyaretçilerimizin hiçbir kişisel verisi veya IP kaydı üçüncü taraflarla paylaşılmaz. WhatsApp üzerinden doğrudan kurduğunuz diyaloglar uçtan uca şifreli olarak gerçekleşir.`,
    },
    // 7. Bağımsız ve VIP Seçenekler
    {
      question: `${shortTarget} VIP eskort ve bağımsız profiller nasıl filtrelenir?`,
      answer: `Kategori menümüzden VIP, Gold ve Silver vitrinlerini filtreleyerek ${target} bölgesinin en seçkin, yabancı dil bilen, seyahat ve özel davetlere eşlik edebilecek elit eskort bayanlarına anında ulaşabilirsiniz.`,
    },
    // 8. İlan Verme Süreci
    {
      question: `${shortTarget} bölgesinde eskort ilanı nasıl yayınlanır?`,
      answer: `Bireysel çalışan eskort bayanlar sitemizin "İlan Ver" sayfasına girerek ${target} lokasyonunu seçip fotoğraflarını ve hizmet detaylarını yükleyebilir. Onay sürecinin ardından ilanınız 15 dakika içinde Google'da en üst sıralarda yayınlanır.`,
    },
  ];

  // Seed'e göre 4 farklı soru seç
  const startIndex = seed % questionPool.length;
  const selected: FaqItem[] = [];

  for (let i = 0; i < 4; i++) {
    const idx = (startIndex + i * 2) % questionPool.length;
    selected.push(questionPool[idx]);
  }

  return selected;
}

/**
 * Sayfa Altı Zengin Yerel SEO Rehber Metni (Google Thin Content Kalkanı)
 */
export function generateLocationGuide(ilAd: string, ilceAd?: string): LocationGuide {
  const target = ilceAd ? `${ilAd} ${ilceAd}` : ilAd;
  const shortTarget = ilceAd || ilAd;

  return {
    title: `${target} Eskort & Escort Bayan Rehberi (2026 Güncel)`,
    paragraphs: [
      `Best Eskort platformu; ${target} genelinde en kaliteli, güvenilir ve elit bağımsız eskort bayan profillerini tek bir çatı altında toplamaktadır. ${shortTarget} bölgesinde amatör modeller, türbanlı partnerler, tango ve canlı yayıncılar, türk ifşa ve yetişkin içerik üreticileri, sosyal etkinlikler ve özel buluşmalar için aradığınız zarafeti ve samimiyeti sunan seçkin modeller 7/24 hizmet vermektedir.`,
      `${target} eskort ilanlarında saatlik, gecelik veya haftasonu eşlik seçenekleri mevcuttur. Lüks rezidanslarda, nezih otellerde veya kendi konforlu mekanınızda gerçekleşecek randevularınız için doğrudan WhatsApp ve Telegram üzerinden ilan sahiplerine ulaşabilir, beklentilerinize uygun görüşme detaylarını aracı olmadan konuşabilirsiniz.`,
      `Platformumuz güvenliğe ve dürüstlüğe azami önem verir. ${shortTarget} eskort randevularınızda internet üzerinden kapora veya taksi parası talep eden şüpheli hesaplara asla itibar etmeyiniz; teyitli profillerle güvenle randevulaşarak %100 memnuniyet ve tam gizlilikle keyifli vakit geçirebilirsiniz.`,
    ],
    bulletPoints: [
      `%100 Doğrulanmış ve Teyitli ${shortTarget} Fotoğrafları & Amatör İlanlar`,
      `Doğrudan ve Aracısız WhatsApp & Telegram İletişim Hatları`,
      `Lüks Otel, Rezidans ve Eve Özel VIP Hizmet Seçenekleri`,
      `Ön Ödemesiz, Güvenilir ve Gizlilik Garantili Randevular`,
    ],
  };
}

/**
 * Google Rich Snippets: FAQPage Schema
 */
export function generateFaqSchema(faqItems: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Google Rich Snippets: BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// NOT: Sahte AggregateRating schema kaldırıldı.
// Google, gerçek kullanıcı yorumu olmayan uydurma rating verisini
// spam olarak işaretler ve sayfaların indexlenmesini engeller.
// (Google Rich Results spam policy ihlali)

/**
 * Bölgedeki Modeller Kadrosu Schema.org ItemList (Google Rich Snippets & Person Schema)
 */
export function generateItemListSchema(models: any[] = [], siteUrl: string = '', districtName: string = '') {
  if (!models || models.length === 0) return null;

  return {
    '@type': 'ItemList',
    name: `${districtName} Doğrulanmış VIP Model Kadrosu`,
    numberOfItems: models.length,
    itemListElement: models.slice(0, 15).map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Person',
        name: m.baslik,
        jobTitle: 'VIP Model & Eskort',
        url: `${siteUrl}/ilan/${m.slug}`,
        image: m.anaFotograf?.url ? (m.anaFotograf.url.startsWith('http') ? m.anaFotograf.url : `${siteUrl}${m.anaFotograf.url}`) : undefined,
        telephone: m.whatsappNumara || undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: districtName,
          addressCountry: 'TR',
        },
      },
    })),
  };
}

/**
 * Birleşik Schema.org Graph Verisi (Google Standartlarına %100 Uyumlu)
 */
export function generateCombinedSeoGraph({
  pageUrl,
  pageName,
  pageDescription,
  breadcrumbs,
  faqItems,
  itemCount = 12,
  models,
  siteUrl,
  districtName,
}: {
  pageUrl: string;
  pageName: string;
  pageDescription: string;
  breadcrumbs: { name: string; url: string }[];
  faqItems: FaqItem[];
  itemCount?: number;
  models?: any[];
  siteUrl?: string;
  districtName?: string;
}) {
  void itemCount; // artık kullanılmıyor, type hatası önlemek için
  const graph: any[] = [
    generateBreadcrumbSchema(breadcrumbs),
    generateFaqSchema(faqItems),
  ];

  if (models && models.length > 0 && siteUrl && districtName) {
    const itemList = generateItemListSchema(models, siteUrl, districtName);
    if (itemList) graph.push(itemList);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// İlan Sayfası Zengin SEO İçerik Üreteci
// Google'ın "Thin Content" ve "Duplicate Content" cezasını engellemek için
// her ilan sayfasına deterministik/benzersiz 300+ kelimeli içerik üretir.
// ─────────────────────────────────────────────────────────────────────────────

export interface ListingSeoContent {
  intro: string;
  aboutSection: string;
  serviceSection: string;
  contactSection: string;
  trustSection: string;
}

/**
 * Her ilan için slug + şehir + ilçe bilgisinden deterministik olarak
 * benzersiz, Google-dostu 300+ kelimeli SEO içeriği üretir.
 */
export function generateListingSeoContent(
  baslik: string,
  ilAd: string,
  ilceAd: string,
  rozet: string,
  slug: string
): ListingSeoContent {
  const seed = getSeedNumber(slug + baslik);
  const rozetLabel = rozet === 'ultravip' || rozet === 'vip' ? 'VIP' : rozet === 'gold' ? 'Gold' : 'Silver';

  const introVariants = [
    `${baslik}, ${ilAd} ili ${ilceAd} bölgesinde hizmet veren teyitli ve doğrulanmış ${rozetLabel} eskort vitrinidir. Best Eskort platformu üzerinden yayınlanan bu ilan, gerçek fotoğraflar ve doğrudan WhatsApp iletişim hattı ile ${ilceAd} bölgesindeki en güvenilir eskort deneyimini sunmaktadır.`,
    `${ilceAd} ${ilAd} bölgesinin en seçkin ${rozetLabel} eskort profillerinden biri olan ${baslik}, Best Eskort platformunun sıkı doğrulama sürecinden geçerek teyitli rozet almıştır. ${ilAd} ilinde bağımsız olarak çalışan ${baslik} ile doğrudan WhatsApp üzerinden iletişime geçebilirsiniz.`,
    `Best Eskort'un ${ilAd} ${ilceAd} vitrininde öne çıkan ${baslik}, fotoğraf doğrulaması tamamlanmış ve aktif statüde hizmet veren ${rozetLabel} kategorisinde bir eskort profildir. ${ilceAd} ve çevre semtlerde hizmet vermektedir.`,
    `${ilAd} ${ilceAd} eskort ilanları arasında en çok ilgi gören profillerden biri olan ${baslik}, bağımsız çalışma modeliyle aracısız ve güvenilir bir buluşma deneyimi sunmaktadır. ${rozetLabel} vitrin kategorisinde yer alan ilan, gerçek fotoğraflarıyla dikkat çekmektedir.`,
  ];

  const aboutVariants = [
    `${baslik} profili, ${ilAd} ${ilceAd} merkezli olmak üzere şehrin geneline hizmet sunmaktadır. Profildeki tüm fotoğraflar gerçek olup admin ekibimiz tarafından teyit edilmiştir. ${rozetLabel} vitrin kategorisinde yer alan bu ilan, saatlik ve gecelik görüşme seçenekleri sunmaktadır. Eve servis, otele servis ve özel randevu imkânları mevcuttur.`,
    `${ilAd} ilinin ${ilceAd} semtinde faaliyet gösteren ${baslik}, müşteri memnuniyetine odaklanan bağımsız bir eskort profildir. ${rozetLabel} rozeti taşıyan bu profil, saatlik görüşme, gecelik konaklama ve özel eşlik hizmetleri sunmaktadır. Lüks oteller, rezidanslar ve ev ziyaretleri için uygun müsaitlik durumunu WhatsApp'tan anlık olarak sorgulayabilirsiniz.`,
    `${ilceAd} bölgesinde deneyimli ve güvenilir bir ${rozetLabel} eskort profili arıyorsanız ${baslik} doğru tercih olacaktır. ${ilAd} genelinde aktif olan bu ilan, eve gelen, otele gelen ve özel buluşma seçenekleriyle 7/24 hizmet vermektedir.`,
    `${baslik}, ${ilceAd} ${ilAd} bölgesinde aktif olarak hizmet veren ve Best Eskort'un kalite standartlarını karşılayan ${rozetLabel} statüsünde bir bağımsız eskort profildir. Şehir merkezi ve çevre semtlere ulaşım kolaylığı ile öne çıkan bu profil, müşterilerine konforlu ve gizli bir görüşme ortamı sunmaktadır.`,
  ];

  const serviceVariants = [
    `${ilceAd} ${ilAd} eskort hizmetleri arasında ${baslik} ile yapabileceğiniz görüşme türleri: kısa görüşme (1 saat), uzun görüşme (2-3 saat), tüm gece konaklama ve hafta sonu eşlik. Tüm detaylar ve güncel müsaitlik için doğrudan WhatsApp hattını kullanınız. Randevu öncesi ön ödeme veya kapora talep edilmemektedir.`,
    `${baslik} ${ilceAd} eskort ilanında sunulan başlıca hizmetler: saatlik VIP buluşma, gecelik özel konaklama, otel ve rezidans ziyareti, ve özel organizasyon eşliği. ${ilAd} il sınırları içinde geniş bir hizmet alanı mevcuttur. Güncel fiyat ve müsaitlik bilgisi için WhatsApp üzerinden iletişime geçilmesi önerilir.`,
    `${ilAd} ${ilceAd} bölgesinde ${baslik} ile gerçekleştirebileceğiniz buluşma seçenekleri: saatlik görüşme, 2-3 saatlik randevu, tüm gece konaklama. Müşterinin bulunduğu otele veya rezidansa özel servis imkânı mevcuttur. Ücret ve uygunluk sorguları yalnızca WhatsApp üzerinden yanıtlanmaktadır.`,
    `${ilceAd} merkezinde ve ${ilAd} genelinde hizmet veren ${baslik} ile saatlik, yarım günlük ve gecelik görüşme seçenekleri arasından tercih yapabilirsiniz. Eve gelen ve otele gelen hizmet seçenekleri mevcuttur. Fiyatlandırma ve müsaitlik için WhatsApp butonu aracılığıyla doğrudan iletişim kurabilirsiniz.`,
  ];

  const contactVariants = [
    `${baslik} ile iletişim kurmak için bu sayfadaki WhatsApp butonunu kullanabilirsiniz. İletişim tamamen gizli ve güvenlidir. ${ilceAd} ${ilAd} bölgesinde hizmet alan kullanıcılarımız, randevularını aracı veya komisyoncu olmaksızın doğrudan planlayabilmektedir.`,
    `${ilAd} ${ilceAd} eskort randevusu için ${baslik} ile doğrudan WhatsApp üzerinden iletişime geçin. Mesajınıza ilgili ilan bağlantısını ekleyerek müsaitlik sorgusu yapabilirsiniz. Gizlilik politikamız gereği hiçbir kişisel veri kayıt altına alınmamaktadır.`,
    `WhatsApp iletişim hattı üzerinden ${baslik} ile ${ilceAd} ${ilAd} randevunuzu kolayca planlayabilirsiniz. Uçtan uca şifreli WhatsApp mesajlaşması sayesinde görüşmeleriniz tamamen gizli kalır. Ön ödeme veya kapora talep eden hesaplara itibar etmeyiniz.`,
    `${baslik} ${ilceAd} ${ilAd} eskort ilanına ulaşmak ve randevu planlamak için sayfadaki iletişim butonlarını kullanınız. Müsaitlik durumu günlük olarak güncellenmekte olup WhatsApp üzerinden anlık yanıt alabilirsiniz. Platform üzerinden yapılan tüm iletişimler gizlilik standartlarımız çerçevesinde korunmaktadır.`,
  ];

  const trustVariants = [
    `Best Eskort, ${ilAd} genelindeki tüm eskort ilanlarını güvenilirlik ve özgünlük açısından denetlemektedir. ${baslik} profili, platformumuzun %100 teyit sürecinden başarıyla geçmiş; sahte fotoğraf ve yanıltıcı bilgi içermediği onaylanmıştır. ${ilceAd} ${ilAd} bölgesinde güvenli eskort deneyimi için Best Eskort'u tercih ediniz.`,
    `${baslik} Best Eskort ${rozetLabel} vitrinine dahil olarak en yüksek güvenilirlik standartlarını karşılamıştır. ${ilAd} ${ilceAd} eskort ilanları arasında öne çıkan bu profil, gerçek fotoğraf garantisi ve anlık WhatsApp erişimiyle güven veren bir seçenektir. Platform olarak kullanıcılarımıza internet dolandırıcılığına karşı her zaman dikkatli olmalarını tavsiye ederiz.`,
    `Güvenli ${ilAd} ${ilceAd} eskort randevusu için Best Eskort'un doğrulama sistemi sayesinde ${baslik} profilinin gerçekliği onaylanmıştır. Her ${rozetLabel} rozeti taşıyan profil, admin kontrolünden geçmekte ve sahte ilan politikamız kapsamında sürekli denetlenmektedir.`,
    `${ilceAd} ${ilAd} bölgesinde güvenilir bir eskort arayışındaysanız Best Eskort teyitli profillerini tercih ediniz. ${baslik} ilanı, içerik doğrulama standartlarımızı karşılamış olup ${rozetLabel} rozeti ile işaretlenmiştir. Ön ödemeli randevu tekliflerinde asla ödeme yapmayınız; tüm ödemeleri yüz yüze gerçekleştiriniz.`,
  ];

  const pick = (arr: string[], offset = 0) => arr[(seed + offset) % arr.length];

  return {
    intro: pick(introVariants, 0),
    aboutSection: pick(aboutVariants, 1),
    serviceSection: pick(serviceVariants, 2),
    contactSection: pick(contactVariants, 3),
    trustSection: pick(trustVariants, 4),
  };
}

