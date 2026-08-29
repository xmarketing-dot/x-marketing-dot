export interface FaqItem {
  question: string;
  answer: string;
}

export function generateLocationFaq(ilAd: string, ilceAd?: string): FaqItem[] {
  const target = ilceAd ? `${ilAd} ${ilceAd}` : ilAd;
  const shortTarget = ilceAd || ilAd;

  return [
    {
      question: `${shortTarget} eskort ve escort bayan ilanları güncel ve teyitli mi?`,
      answer: `Evet, Best Eskort platformunda listelenen tüm ${target} eskort ve bağımsız escort profilleri düzenli olarak kontrol edilmektedir. Teyitli rozetine sahip profillerde fotoğraf ve telefon doğrulaması yapılmıştır.`,
    },
    {
      question: `${shortTarget} eskort profilleriyle nasıl iletişime geçebilirim?`,
      answer: `İlan detay sayfasında yer alan doğrudan WhatsApp butonuna tıklayarak veya ilan sahibinin yayınladığı telefon numarası üzerinden aracı olmadan, komisyonsuz ve %100 gizlilikle doğrudan irtibat kurabilirsiniz.`,
    },
    {
      question: `${shortTarget} bölgesinde eve ve otele hizmet veren eskortlar var mı?`,
      answer: `${target} bölgesindeki bağımsız eskort profilleri hem kendi özel mekanlarında hem de talep doğrultusunda eve, otele ve rezidansa özel hizmet seçenekleri sunmaktadır. Hizmet detayları ilan açıklamalarında açıkça belirtilmiştir.`,
    },
    {
      question: `${shortTarget} bölgesinde yeni eskort ilanı nasıl verilir?`,
      answer: `Sitemizin "İlan Ver" bölümünden sadece birkaç dakika içinde ${target} bölgesine yönelik VIP, Gold veya Silver paket seçimi yaparak ilanınızı oluşturabilir, WhatsApp onayının ardından hemen yayınlatabilirsiniz.`,
    },
  ];
}

export function generateFaqSchema(faqItems: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
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

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
