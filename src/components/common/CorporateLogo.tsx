'use client';

import React, { useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export default function CorporateLogo({ className = 'text-3xl' }: { className?: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isKissing, setIsKissing] = useState(false);

  const symbols = ['💋', '💖', '✨', '❤️', '🔥'];

  const triggerKiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsKissing(true);

    // Spawn 3-5 floating heart/kiss particles
    const newParticles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: -20 - Math.random() * 30,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setIsKissing(false);
    }, 400);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1200);
  };

  return (
    <div 
      className="relative inline-flex items-center justify-center cursor-pointer select-none group"
      onClick={triggerKiss}
      title="Muah! 💋"
    >
      {/* Floating Particles on Kiss */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`,
          }}
          className="absolute pointer-events-none text-sm animate-out fade-out slide-out-to-top-8 duration-1000 z-50 select-none"
        >
          {p.symbol}
        </span>
      ))}

      {/* Animated Kiss Lips */}
      <span
        className={`inline-block transition-all duration-300 transform group-hover:scale-130 active:scale-90 ${
          isKissing ? 'scale-135 -rotate-12' : 'animate-kiss-pulse'
        } ${className}`}
      >
        💋
      </span>

      {/* Global CSS for subtle breathing kiss animation */}
      <style jsx>{`
        @keyframes kissPulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          30% {
            transform: scale(1.15) rotate(-6deg);
          }
          50% {
            transform: scale(0.95) rotate(4deg);
          }
          70% {
            transform: scale(1.1) rotate(-3deg);
          }
        }
        .animate-kiss-pulse {
          animation: kissPulse 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

