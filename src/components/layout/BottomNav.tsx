'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, MessageCircle, Search } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Anasayfa', href: '/', icon: Home },
    { label: 'Şehirler', href: '/sehirler', icon: MapPin },
    { label: 'Ara', href: '/ara', icon: Search },
    { label: 'İletişim', href: '/chat', icon: MessageCircle },
  ];

  return (
    <nav className="fixed md:absolute bottom-0 left-0 right-0 z-40 bg-[#0d1117]/95 backdrop-blur-2xl border-t border-[#30363d] px-1 py-1.5 flex items-center justify-between shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-[#484f58] hover:text-[#8b949e]'
            }`}
          >
            <div className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200 ${
              isActive ? 'bg-amber-500/20' : ''
            }`}>
              <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className={`text-[10px] mt-1 font-heading font-extrabold tracking-tight transition-all ${isActive ? 'text-amber-400' : ''}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

