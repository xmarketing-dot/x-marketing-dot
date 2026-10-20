'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Copy, Check, ShieldCheck, ArrowRight, Wallet, Maximize2, X } from 'lucide-react';

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
      <div className={`rounded-2xl bg-[#0c1017] border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col gap-4 text-left max-w-full overflow-hidden ${className}`}>
        
        {/* ── ÜST BAŞLIK & AĞ ROZETİ ──────────────── */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Wallet className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-white tracking-tight truncate">
                Kripto Ödeme &amp; Cüzdan
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                BEP-20 Ağı ile Otomatik Hızlı Teyit
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/25 uppercase tracking-wider shrink-0">
            {CRYPTO_CONFIG.network}
          </span>
        </div>

        {/* ── QR KOD VE CÜZDAN ALANI ──────────────── */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-[#070a0f] p-3.5 sm:p-4 rounded-xl border border-slate-800 max-w-full overflow-hidden">
          
          {/* QR Kod Görseli */}
          <div className="flex flex-col items-center justify-center gap-2 shrink-0">
            <div 
              onClick={() => setShowQrModal(true)}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-white p-2 border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer group hover:opacity-95 transition-opacity"
              title="Tam Ekran Açmak İçin Dokunun"
            >
              <Image
                src={CRYPTO_CONFIG.qrImage}
                alt="BNB Smart Chain BEP20 QR Kod"
                fill
                className="object-contain p-1"
                unoptimized
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <span className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Büyüt</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Tam Ekran QR</span>
            </button>
          </div>

          {/* Cüzdan Adresi & Kopyalama Alanı */}
          <div className="flex flex-col gap-2 flex-1 w-full min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
              BEP-20 Cüzdan Adresi:
            </span>

            <div
              onClick={handleCopyAddress}
              className="group relative p-3 rounded-xl bg-[#0c1017] border border-slate-800 hover:border-emerald-500/40 cursor-pointer active:scale-[0.99] transition-all flex flex-col gap-2 max-w-full overflow-hidden"
              title="Adresi Kopyalamak İçin Dokunun"
            >
              <span className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold break-all select-all leading-relaxed">
                {CRYPTO_CONFIG.address}
              </span>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                  {copied ? '✅ Panoya Kopyalandı' : 'Dokun ve Kopyala'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAddress();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TALİMATLAR & ONAY BİLGİSİ ──────────────── */}
        <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-1.5 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 stroke-[2]" />
            <span>Ödeme Sonrası Anında Onay:</span>
          </div>
          <p className="text-slate-400 text-xs leading-normal">
            Ödemenizi gönderdikten sonra <strong className="text-slate-200 font-mono font-medium">TXID (İşlem Kodu)</strong> veya ekran görüntüsünü <strong>Canlı Destek</strong> üzerinden iletiniz. İlanınız 5 dakika içinde onaylanır.
          </p>
        </div>

        {/* ── CANLI DESTEĞE BİLDİR BUTONU ──────────────── */}
        {onChatClick && (
          <button
            type="button"
            onClick={onChatClick}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ödemeyi Yaptım / Canlı Desteğe Bildir</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

      </div>

      {/* ── TAM EKRAN QR MODAL ──────────────── */}
      {showQrModal && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[999999] w-screen h-[100dvh] bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-[#0c1017] border-b border-slate-800 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm text-white font-mono">
                  BNB SMART CHAIN (BEP-20)
                </span>
                <span className="text-[11px] text-slate-400">
                  Resmi Kripto Cüzdan QR Ekranı
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gövde */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-md mx-auto w-full gap-4 text-center my-auto">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-white p-3 border border-slate-700 shadow-2xl flex items-center justify-center">
              <Image
                src={CRYPTO_CONFIG.qrImage}
                alt="QR Kod"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Kameranız veya Kripto Cüzdanınız ile QR Kodu Tarayın
            </span>

            <div
              onClick={handleCopyAddress}
              className="w-full p-3.5 rounded-xl bg-[#0c1017] border border-slate-800 cursor-pointer active:scale-[0.99] transition-all flex flex-col gap-1.5"
            >
              <span className="text-[10px] text-slate-500 font-mono uppercase text-left">
                BEP-20 Cüzdan Adresi:
              </span>
              <span className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold break-all select-all">
                {CRYPTO_CONFIG.address}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 text-left">
                {copied ? '✅ Panoya Kopyalandı' : 'Dokun ve Kopyala'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                onClick={handleCopyAddress}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2]" />}
                <span>{copied ? 'Kopyalandı' : 'Adresi Kopyala'}</span>
              </button>

              {onChatClick && (
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    onChatClick();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Canlı Desteğe Bildir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-3 bg-[#0c1017] border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Best Eskort Güvenli Kripto Ödeme Altyapısı</span>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}
