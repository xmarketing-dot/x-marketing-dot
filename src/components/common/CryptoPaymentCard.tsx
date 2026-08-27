'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Copy, Check, ShieldCheck, ArrowRight, Wallet, QrCode, Maximize2, X } from 'lucide-react';

interface CryptoPaymentCardProps {
  onChatClick?: () => void;
  className?: string;
}

export const CRYPTO_CONFIG = {
  network: 'BNB SMART CHAIN (BEP-20)',
  address: '0xb7259aef66c9cd16e5a5d879baf0107bea03f527',
  qrImage: '/walletadress.png',
};

export default function CryptoPaymentCard({ onChatClick, className = '' }: CryptoPaymentCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CRYPTO_CONFIG.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className={`rounded-[32px] bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border-2 border-amber-500/70 p-5 sm:p-7 shadow-2xl flex flex-col gap-6 text-left ${className}`}>
        
        {/* ── ÜST BAŞLIK & AĞ ROZETİ ──────────────── */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-white font-heading tracking-tight">
                Kripto Ödeme &amp; Cüzdan
              </span>
              <span className="text-xs text-amber-400 font-bold">
                BEP-20 Ağı ile Anında Otomatik Teyit
              </span>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-xs sm:text-sm border border-amber-500/40 uppercase tracking-wider shadow-sm">
            {CRYPTO_CONFIG.network}
          </span>
        </div>

        {/* ── QR KOD VE CÜZDAN ALANI ──────────────── */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-[#0d1117] p-5 sm:p-6 rounded-3xl border border-[#30363d] shadow-inner">
          
          {/* QR Kod Görseli (Tıklanınca Tam Ekran Açılır) */}
          <div className="flex flex-col items-center justify-center gap-2.5 shrink-0">
            <div 
              onClick={() => setShowQrModal(true)}
              className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden bg-white p-2.5 border-2 border-amber-400 shadow-2xl flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
              title="Tam Ekran Açmak İçin Dokunun"
            >
              <Image
                src={CRYPTO_CONFIG.qrImage}
                alt="BNB Smart Chain BEP20 QR Kod"
                fill
                className="object-contain p-1"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                <span className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-4 h-4 stroke-[3]" />
                  <span>Tam Ekran Aç</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="text-xs text-amber-400 font-black font-heading flex items-center gap-1.5 hover:underline py-1"
            >
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
              <span>🔍 Tam Ekran Aç &amp; Tara</span>
            </button>
          </div>

          {/* Cüzdan Adresi & Kopyalama Alanı */}
          <div className="flex flex-col gap-3 flex-1 w-full">
            <span className="text-xs text-[#8b949e] font-black uppercase tracking-wider font-heading">
              BEP-20 Cüzdan Adresi (Dokun &amp; Kopyala):
            </span>

            <div
              onClick={handleCopyAddress}
              className="group relative p-4 sm:p-5 rounded-2xl bg-[#161b22] border-2 border-dashed border-amber-500/60 hover:border-amber-400 cursor-pointer active:scale-[0.98] transition-all flex flex-col gap-3 shadow-md"
              title="Adresi Kopyalamak İçin Dokunun"
            >
              <span className="font-mono text-sm sm:text-base md:text-lg text-amber-300 font-bold break-all select-all leading-relaxed">
                {CRYPTO_CONFIG.address}
              </span>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs sm:text-sm text-[#8b949e] group-hover:text-amber-400 font-bold font-heading">
                  {copied ? '✅ Panoya Kopyalandı!' : '👆 Kopyalamak için buraya dokunun'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAddress();
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm font-heading transition-all shrink-0 flex items-center gap-2 ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 stroke-[2.5]" />
                      <span>Adresi Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TALİMATLAR & ONAY BİLGİSİ ──────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#21262d] border border-[#30363d] flex flex-col gap-2 text-xs sm:text-sm text-[#c9d1d9] leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-heading font-black text-sm">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>Ödeme Sonrası Anında Onay:</span>
          </div>
          <p className="font-medium text-sm leading-relaxed text-white">
            Ödemenizi gönderdikten sonra <strong className="text-amber-400 font-bold">TXID (İşlem Kodu)</strong> veya işlem ekran görüntüsünü <strong>Canlı Destek</strong> üzerinden iletiniz. İlanınız <strong>5 dakika içinde onaylanacaktır.</strong>
          </p>
        </div>

        {/* ── CANLI DESTEĞE BİLDİR BUTONU ──────────────── */}
        {onChatClick && (
          <button
            type="button"
            onClick={onChatClick}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm font-heading uppercase tracking-wider shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Ödemeyi Yaptım / Canlı Desteğe Bildir</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════
          REACT PORTAL İLE DOĞRUDAN BODY'YE BAĞLANAN GERÇEK %100 TAM EKRAN MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {showQrModal && mounted && createPortal(
        <div 
          className="fixed inset-0 !top-0 !left-0 !right-0 !bottom-0 z-[999999] w-screen h-[100dvh] bg-[#0d1117] flex flex-col justify-between overflow-y-auto selection:bg-amber-500 animate-in fade-in duration-150"
        >
          {/* 1. ÜST HEADER */}
          <div className="shrink-0 px-4 py-4 sm:px-8 sm:py-5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between shadow-2xl sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Wallet className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-base sm:text-xl text-white font-heading">
                  BNB SMART CHAIN (BEP-20)
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  Resmi Kripto Ödeme Ekranı
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="p-3 rounded-2xl bg-[#21262d] border border-[#363b42] text-[#8b949e] hover:text-white hover:bg-rose-600 transition-colors shadow-lg shrink-0"
              title="Kapat"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 2. GÖVDE: DEV QR KOD & CÜZDAN DETAYLARI */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-xl mx-auto w-full gap-6 text-center my-auto">
            
            {/* Dev QR Kod Kutusu */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden bg-white p-4 border-4 border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.4)] flex items-center justify-center">
              <Image
                src={CRYPTO_CONFIG.qrImage}
                alt="Dev QR Kod"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>

            <span className="text-sm sm:text-base text-amber-300 font-bold font-heading">
              📷 Kameranız veya Kripto Cüzdanınız ile QR Kodu Tarayın
            </span>

            {/* Büyük Cüzdan Adresi & Kopyalama Kutusu */}
            <div
              onClick={handleCopyAddress}
              className="w-full p-4 sm:p-5 rounded-3xl bg-[#161b22] border-2 border-dashed border-amber-400/80 cursor-pointer active:scale-[0.98] transition-all flex flex-col gap-2 shadow-2xl"
            >
              <span className="text-xs text-[#8b949e] font-black uppercase font-heading text-left">
                BEP-20 Cüzdan Adresi:
              </span>
              <span className="font-mono text-sm sm:text-base md:text-lg text-amber-300 font-black break-all select-all">
                {CRYPTO_CONFIG.address}
              </span>
              <span className="text-xs text-[#8b949e] font-bold mt-1 text-left flex items-center gap-1">
                <span>{copied ? '✅ Panoya Kopyalandı!' : '👆 Kopyalamak için adrese dokunun'}</span>
              </span>
            </div>

            {/* Büyük Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 w-full font-heading">
              <button
                onClick={handleCopyAddress}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 scale-105 shadow-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Cüzdan Adresi Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 stroke-[2.5]" />
                    <span>Adresi Kopyala</span>
                  </>
                )}
              </button>

              {onChatClick && (
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    onChatClick();
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-black text-sm sm:text-base border border-[#363b42] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Canlı Desteğe Bildir ➔</span>
                </button>
              )}
            </div>

          </div>

          {/* 3. ALT FOOTER */}
          <div className="shrink-0 p-4 bg-[#161b22] border-t border-[#30363d] text-center text-xs text-[#8b949e] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Best Eskort Güvenli Kripto Ödeme Altyapısı</span>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}

