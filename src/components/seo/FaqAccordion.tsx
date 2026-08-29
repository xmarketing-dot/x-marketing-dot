'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import type { FaqItem } from '@/lib/seoData';

interface Props {
  title: string;
  items: FaqItem[];
}

export default function FaqAccordion({ title, items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default for readability

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#21262d] pb-4">
        <h3 className="font-black text-sm text-white font-heading flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>{title}</span>
        </h3>
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          Teyitli Rehber
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#0d1117] border border-[#21262d] overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 hover:bg-[#161b22]/70 transition-colors"
              >
                <span className="text-xs font-bold text-white leading-snug font-heading">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-amber-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-3.5 pt-1 text-[11px] sm:text-xs text-[#8b949e] leading-relaxed border-t border-[#21262d]/60 animate-in fade-in duration-200">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
