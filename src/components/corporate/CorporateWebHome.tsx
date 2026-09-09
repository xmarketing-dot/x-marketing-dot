'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Smartphone,
  Layers,
  Code2,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
  BarChart3,
  Server,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  MessageSquare,
  Users,
  Compass,
  Rocket,
  Check
} from 'lucide-react';

export default function CorporateWebHome() {
  const [activeTab, setActiveTab] = useState<'all' | 'seo' | 'mobile' | 'cloud'>('all');

  const services = [
    {
      id: 'seo',
      category: 'seo',
      title: 'SEO & GEO Arama Motoru Optimizasyonu',
      description: 'Yapay zeka destekli anahtar kelime kümeleme, teknik SEO, yerel harita optimizasyonu (GEO) ve backlink ağı yönetimi ile organik trafikte liderlik.',
      icon: Search,
      tag: 'Organik Büyüme',
      metrics: '+450% Görünürlük',
      accent: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'mobile',
      category: 'mobile',
      title: 'Yüksek Performanslı Web & Mobil Uygulamalar',
      description: 'React, Next.js, Node.js ve mikroservis mimarileri ile sıfır gecikmeli, ultra-hızlı, mobil öncelikli (PWA) kurumsal dijital platformlar.',
      icon: Smartphone,
      tag: 'Full-Stack Çözümler',
      metrics: '0.4s Açılış Hızı',
      accent: 'from-violet-600 to-purple-600',
    },
    {
      id: 'growth',
      category: 'seo',
      title: 'Büyüme & Dönüşüm Odaklı Dijital Pazarlama',
      description: 'Gelişmiş analitik hunileri, A/B dönüşüm testleri ve hedef kitleye özel çok kanallı pazarlama stratejileri ile satış optimizasyonu.',
      icon: TrendingUp,
      tag: 'ROI Odaklı',
      metrics: '%38 Ortalama CR',
      accent: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'cloud',
      category: 'cloud',
      title: 'Bulut Altyapı, Dağıtık Ağlar & Edge Sunucular',
      description: 'Global CDN, Edge Worker altyapıları, SSL güvenlik protokolleri, DDOS koruması ve yüksek erişilebilirlikli veri mimarisi.',
      icon: Server,
      tag: 'Enterprise Altyapı',
      metrics: '%99.99 Uptime',
      accent: 'from-amber-600 to-orange-600',
    },
    {
      id: 'geo',
      category: 'seo',
      title: 'Çoklu Domain & Bölgesel Gateway Yönetimi',
      description: '81 il ve ilçelere özel dinamik domain yönlendirmeleri, yerel arama otoritesi ve lokasyon tabanlı akıllı içerik dağıtımı.',
      icon: Globe,
      tag: 'Bölgesel Ağ',
      metrics: '81 İl Kapsama',
      accent: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'ai',
      category: 'mobile',
      title: 'Veri Analitiği & Özel Yapay Zeka Botları',
      description: 'Kullanıcı davranışlarını gerçek zamanlı analiz eden özel makine öğrenimi modelleri, akıllı otomasyonlar ve canlı akış panelleri.',
      icon: Cpu,
      tag: 'Akıllı Otomasyon',
      metrics: 'Gerçek Zamanlı',
      accent: 'from-rose-600 to-pink-600',
    },
  ];

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.category === activeTab);

  const stats = [
    { value: '81 İl', label: 'Bölgesel Dijital Kapsama', desc: 'Tüm Türkiye geneli aktif gateway ağı' },
    { value: '1.2M+', label: 'Aylık Organik Ziyaretçi', desc: 'Google ve Yandex arama motorlarından' },
    { value: '99.9%', label: 'Kesintisiz Çalışma Süresi', desc: 'Global Edge Cloud altyapısı' },
    { value: '<50ms', label: 'Veri Yanıt Süresi', desc: 'Ultra düşük gecikmeli mimari' },
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── 1. KURUMSAL DESKTOP STICKY NAVBAR (LIGHT MODE) ──────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Sol: Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl text-slate-900 font-heading tracking-tight group-hover:text-blue-600 transition-colors">
                X-Marketing Tech
              </span>
              <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Kurumsal Yazılım, SEO &amp; Dijital Büyüme Ajansı
              </span>
            </div>
          </Link>

          {/* Orta: Menü Linkleri */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#hizmetler" className="hover:text-blue-600 transition-colors">Hizmetlerimiz</a>
            <a href="#teknolojiler" className="hover:text-blue-600 transition-colors">Teknoloji Yığını</a>
            <a href="#metrikler" className="hover:text-blue-600 transition-colors">Performans &amp; Ağ</a>
            <a href="#surec" className="hover:text-blue-600 transition-colors">Geliştirme Süreci</a>
            <a href="#iletisim" className="hover:text-blue-600 transition-colors">İletişim</a>
          </nav>

          {/* Sağ: CTA Butonları */}
          <div className="flex items-center gap-3.5">
            <a
              href="#iletisim"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Ücretsiz Teklif Alın</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>

        </div>
      </header>

      {/* ── 2. HERO SECTION: KURUMSAL BAŞLIK, SLOGAN & GÖRSEL ──────────────── */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Sol Kolon: Başlık & Değer Önerisi */}
          <div className="flex-1 flex flex-col gap-6 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Yeni Nesil Kurumsal Dijital Çözümler</span>
            </div>

            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-950 font-heading leading-[1.12] tracking-tight">
              Ölçeklenebilir Yazılım, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Lider SEO &amp; Mobil
              </span> <br />
              Uygulama Mimarisi
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Türkiye genelinde 81 ilde yerel ve global arama motorlarında organik hakimiyet kuran, ultra-yüksek hızlı web/mobil yazılımlar ve veri odaklı büyüme stratejileri geliştiriyoruz.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#hizmetler"
                className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <span>Hizmetleri Keşfedin</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="#iletisim"
                className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm tracking-wide border border-slate-300 shadow-sm active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Projenizi Başlatın</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Modern React / Next.js Mimarisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Teknik &amp; GEO SEO Stratejisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kurumsal SLA &amp; 7/24 Destek</span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Modern Dashboard Preview Mockup */}
          <div className="flex-1 w-full max-w-xl z-10">
            <div className="relative rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-2xl shadow-slate-300/50">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-400 font-medium">x-marketing-analytics.io</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                  Canlı Sistem
                </span>
              </div>

              {/* Metric Cards inside Mockup */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aylık Organik Hit</span>
                  <span className="text-2xl font-black text-slate-900 font-heading mt-1">1,248,500</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +34.8% Bu Ay
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sayfa Yanıt Hızı</span>
                  <span className="text-2xl font-black text-blue-600 font-heading mt-1">0.38s</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1">Core Web Vitals %99</span>
                </div>
              </div>

              {/* Live Activity Stream */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex flex-col gap-2.5 text-left">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Gerçek Zamanlı SEO Dağıtım Ağı
                  </span>
                  <span className="font-mono text-[10px]">81 İl Aktif</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">İstanbul / Kadıköy Bölgesi Gateway</span>
                  <span className="text-emerald-400 font-mono font-bold">#1 Google TR</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Ankara / Çankaya Bölgesi Gateway</span>
                  <span className="text-emerald-400 font-mono font-bold">#1 Yandex TR</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">İzmir / Alsancak Bölgesi Gateway</span>
                  <span className="text-emerald-400 font-mono font-bold">#1 Google TR</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── 3. RAKAMLARLA PERFORMANS & ETKİ ALANI (STATS) ──────────────── */}
      <section id="metrikler" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((st, idx) => (
              <div key={idx} className="flex flex-col text-left p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-heading tracking-tight">
                  {st.value}
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 font-heading">
                  {st.label}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {st.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. UZMANLIK ALANLARI & HİZMETLER (SERVICES) ──────────────── */}
      <section id="hizmetler" className="py-24 bg-slate-50 border-b border-slate-200 text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-heading">
                Kurumsal Hizmet Portföyümüz
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-heading">
                Uçtan Uca Dijital Mühendislik &amp; Organik Büyüme
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Yalnızca kod yazmıyor; işletmenizin dijital ekosistemini, arama motorlarındaki yerini ve kullanıcı dönüşüm hunilerini en üst düzeye taşıyoruz.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
              {[
                { id: 'all', label: 'Tüm Hizmetler' },
                { id: 'seo', label: 'SEO & GEO' },
                { id: 'mobile', label: 'Web & Mobil' },
                { id: 'cloud', label: 'Bulut & Sunucu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between gap-6 group text-left"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.accent} text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                        {srv.metrics}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-slate-950 font-heading group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {srv.tag}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 5. TEKNOLOJİ YIĞINI & MİMARİ STANDARTLARI ──────────────── */}
      <section id="teknolojiler" className="py-24 bg-white border-b border-slate-200 text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-16">
          
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-heading">
              Gelişmiş Teknoloji Altyapımız
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-heading">
              En Son Nesil Yazılım Mimarisi
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Yüksek trafik, sıfır kesinti ve en yüksek güvenlik standartlarını karşılayan modern kurumsal teknoloji bileşenleri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Modern Frontend &amp; PWA</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Next.js 15, React 19, TypeScript ve Tailwind CSS ile hazırlanan reaktif, ultra-hızlı ve SEO dostu kullanıcı arayüzleri.
              </p>
              <ul className="flex flex-col gap-2 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Server-Side Rendering (SSR &amp; ISR)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Otomatik WebP / AVIF Görsel Optimizasyonu
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> 100/100 Google Lighthouse Skoru
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Güçlü Backend &amp; Mikroservisler</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Node.js, Express, MongoDB Atlas kümeleme, Redis önbellekleme ve SSE (Server-Sent Events) canlı akış protokolleri.
              </p>
              <ul className="flex flex-col gap-2 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> 0ms Gecikmeli Canlı Veri Akışı
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Dağıtık Veritabanı Kümeleme (Replica Sets)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Kriptografik Uçtan Uca Güvenlik
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Akıllı SEO &amp; Çoklu Domain Ağı</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tümleşik Vercel Edge sunucuları ile 81 il ve ilçe bazlı dinamik domain çözümleme, otomatik sitemap ve robots.txt entegrasyonu.
              </p>
              <ul className="flex flex-col gap-2 pt-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Dinamik Hostname &amp; Bölge Yönlendirme
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Otomatik Schema.org &amp; JSON-LD Yapılandırması
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Çift SERP Tracker (Google &amp; Yandex)
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. ÇALIŞMA SÜRECİ (HOW WE WORK) ──────────────── */}
      <section id="surec" className="py-24 bg-slate-50 border-b border-slate-200 text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-16">
          
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest font-heading">
              Geliştirme &amp; Başarı Adımları
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-heading">
              Fikirden Organik Liderliğe 4 Adım
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Strateji & Pazar Analizi',
                desc: 'Rakip analizi, hedef anahtar kelimeler, arama hacimleri ve bölgesel hedefleme haritası çıkarılır.',
              },
              {
                step: '02',
                title: 'Mimari & Tasarım',
                desc: 'Ultra-hızlı, temiz kodlu, mobil uyumlu ve dönüşüm odaklı UI/UX arayüzleri kurgulanır.',
              },
              {
                step: '03',
                title: 'Geliştirme & Entegrasyon',
                desc: 'Next.js ve modern API altyapıları ile tam güvenli, yüksek performanslı sistem inşa edilir.',
              },
              {
                step: '04',
                title: 'SEO Dağıtımı & Canlı Takip',
                desc: 'Domain ağı devreye alınır, Google & Yandex botlarına sunulur ve gerçek zamanlı takip edilir.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 relative">
                <span className="font-mono text-3xl font-black text-blue-600/30">
                  {item.step}
                </span>
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. İLETİŞİM & TEKLİF ALMA ALANI (CONTACT CTA) ──────────────── */}
      <section id="iletisim" className="py-24 bg-white text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="p-10 lg:p-16 rounded-[36px] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <div className="flex flex-col gap-6 max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold w-fit">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Kurumsal İletişim &amp; İş Birliği</span>
              </div>

              <h2 className="font-extrabold text-3xl sm:text-5xl font-heading leading-tight tracking-tight">
                Projenizi Bir Üst Seviyeye Taşımaya Hazır mısınız?
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                Yazılım geliştirme, SEO danışmanlığı, çoklu domain ağ kurulumu ve özel dijital çözümler için uzman mühendis ekibimizle hemen iletişime geçin.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#iletisim"
                  className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Projenizi Başlatın</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>24 Saat İçinde Detaylı Teklif &amp; Analiz Raporu</span>
                </div>
              </div>
            </div>

            {/* Sağ Kolon: İletişim Form Kartı */}
            <div className="w-full lg:w-96 p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col gap-4 text-slate-900 z-10">
              <span className="font-extrabold text-lg text-white font-heading">
                Hızlı İletişim Formu
              </span>

              <form onSubmit={(e) => { e.preventDefault(); alert('Talebiniz başarıyla alındı. Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.'); }} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  placeholder="Adınız Soyadınız / Firma"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-900"
                />
                <input
                  type="email"
                  required
                  placeholder="E-posta Adresiniz"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-900"
                />
                <select className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-700">
                  <option value="seo">SEO &amp; GEO Arama Optimizasyonu</option>
                  <option value="software">Web &amp; Mobil Yazılım Geliştirme</option>
                  <option value="domain">Çoklu Domain &amp; Ağ Kurulumu</option>
                  <option value="other">Diğer Kurumsal Hizmetler</option>
                </select>
                <textarea
                  rows={3}
                  required
                  placeholder="Projeniz hakkında kısa bilgi..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-900 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all mt-1"
                >
                  Talebi Gönder
                </button>
              </form>
            </div>

            {/* Glow */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

        </div>
      </section>

      {/* ── 8. KURUMSAL FOOTER (LIGHT/DARK HARMONIOUS) ──────────────── */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm font-heading">
              X-Marketing Dijital Mühendislik, SEO &amp; Yazılım Teknolojileri A.Ş.
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <a href="#hizmetler" className="hover:text-white transition-colors">Hizmetler</a>
            <a href="#teknolojiler" className="hover:text-white transition-colors">Teknolojiler</a>
            <a href="#metrikler" className="hover:text-white transition-colors">Ağ Durumu</a>
            <a href="#iletisim" className="hover:text-white transition-colors">İletişim &amp; Teklif</a>
          </div>

          <span className="text-slate-500">
            © 2026 X-Marketing Tech. Tüm Hakları Saklıdır.
          </span>
        </div>
      </footer>

    </div>
  );
}
