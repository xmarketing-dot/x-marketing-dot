'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { ArrowDown, RefreshCw, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<any> | void;
  isRefreshing?: boolean;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export default function PullToRefresh({
  onRefresh,
  isRefreshing = false,
  children,
  threshold = 65,
  className = '',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isEligibleRef = useRef(false);

  const activeRefreshing = isRefreshing || internalRefreshing;

  // Handle Touch Start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeRefreshing) return;

    // Only allow pull to refresh if user is at the top of page
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 2) {
      startYRef.current = e.touches[0].clientY;
      isEligibleRef.current = true;
    } else {
      isEligibleRef.current = false;
    }
  };

  // Handle Touch Move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEligibleRef.current || startYRef.current === null || activeRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Rubber-band resistance curve
      const distance = Math.min(diff * 0.45, 95);
      setPullDistance(distance);
      setIsPulling(true);

      // Trigger light haptic when crossing threshold
      if (distance >= threshold && pullDistance < threshold) {
        if (typeof window !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Handle Touch End
  const handleTouchEnd = async () => {
    if (!isEligibleRef.current || startYRef.current === null) {
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    if (pullDistance >= threshold && !activeRefreshing) {
      setInternalRefreshing(true);
      setPullDistance(threshold); // Hold at indicator height

      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }

      try {
        await Promise.resolve(onRefresh());
      } catch (err) {
        console.error('Pull to refresh error:', err);
      } finally {
        setTimeout(() => {
          setInternalRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }, 400);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }

    startYRef.current = null;
    isEligibleRef.current = false;
  };

  const progress = Math.min(100, Math.round((pullDistance / threshold) * 100));
  const isReadyToRelease = pullDistance >= threshold;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full ${className}`}
    >
      {/* ── PULL TO REFRESH CIRCULAR INDICATOR (BELOW HEADER) ──────────────── */}
      <div
        className="w-full flex justify-center pointer-events-none transition-all duration-200 overflow-hidden"
        style={{
          height: activeRefreshing ? `${threshold}px` : `${pullDistance}px`,
          opacity: pullDistance > 10 || activeRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#161b22]/95 border border-amber-500/40 shadow-[0_8px_25px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in fade-in zoom-in duration-150">
            {/* Circular Progress Indicator */}
            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 transform -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#30363d"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray={56.5}
                  strokeDashoffset={56.5 - (56.5 * (activeRefreshing ? 100 : progress)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className={activeRefreshing ? 'animate-spin origin-center' : 'transition-all duration-75'}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                {activeRefreshing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  <ArrowDown
                    className={`w-3 h-3 text-amber-400 transition-transform duration-200 ${
                      isReadyToRelease ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Status Label */}
            <span className="text-xs font-heading font-black tracking-tight text-white flex items-center gap-1.5">
              {activeRefreshing ? (
                <>
                  <span className="text-amber-400">Yenileniyor...</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : isReadyToRelease ? (
                <span className="text-emerald-400">Bırak ve Yenile!</span>
              ) : (
                <span className="text-[#8b949e]">Aşağı Çek (%{progress})</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Page Children */}
      {children}
    </div>
  );
}
