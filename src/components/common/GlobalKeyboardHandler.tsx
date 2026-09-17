'use client';

import { useEffect } from 'react';

/**
 * Global Mobile Virtual Keyboard Handler
 * 
 * Bu bileşen iOS Safari ve Android Chrome üzerinde sanal klavye açıldığında:
 * 1. Visual Viewport API ile klavye yüksekliğini ve açık/kapalı durumunu tespit eder.
 * 2. `html` etiketine `data-keyboard-open="true"` ve `--keyboard-height` CSS değişkenlerini dinamik yazar.
 * 3. Odaklanan `input`, `textarea` veya form elemanını otomatik olarak klavyenin üstünde kalan görünür alanın merkezine (block: 'center') kaydırır.
 * 4. Sabit (fixed) alt barların form ve butonları örtmesini engeller.
 */
export default function GlobalKeyboardHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollTimeout1: NodeJS.Timeout;
    let scrollTimeout2: NodeJS.Timeout;

    // 1. Visual Viewport Resize & Scroll Listener
    const updateViewportMetrics = () => {
      if (!window.visualViewport) return;

      const visualHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = Math.max(0, windowHeight - visualHeight);
      const isKeyboardOpen = keyboardHeight > 140;

      const root = document.documentElement;

      if (isKeyboardOpen) {
        root.dataset.keyboardOpen = 'true';
        root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        root.style.setProperty('--visual-viewport-height', `${visualHeight}px`);
      } else {
        root.dataset.keyboardOpen = 'false';
        root.style.setProperty('--keyboard-height', '0px');
        root.style.setProperty('--visual-viewport-height', '100dvh');
      }
    };

    // 2. Global Input Focus Event Listener
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (!isInput) return;

      // Type checking: button, checkbox, radio gibi kontrollerde kaydırmaya gerek yok
      const inputType = (target as HTMLInputElement).type;
      if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'image'].includes(inputType)) {
        return;
      }

      // Klavyenin açılma animasyonunu (150ms ve 350ms) bekleyip elemanı görünür alanın merkezine it
      clearTimeout(scrollTimeout1);
      clearTimeout(scrollTimeout2);

      scrollTimeout1 = setTimeout(() => {
        if (document.activeElement === target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }, 150);

      scrollTimeout2 = setTimeout(() => {
        if (document.activeElement === target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }, 350);
    };

    const handleFocusOut = () => {
      clearTimeout(scrollTimeout1);
      clearTimeout(scrollTimeout2);

      // Kısa bir gecikmeyle başka bir inputa geçilmediyse viewport'u resetle
      setTimeout(() => {
        const active = document.activeElement;
        const isStillInput =
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT');

        if (!isStillInput && document.documentElement.dataset.keyboardOpen === 'true') {
          document.documentElement.dataset.keyboardOpen = 'false';
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          document.documentElement.style.setProperty('--visual-viewport-height', '100dvh');
        }
      }, 250);
    };

    // Attach listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportMetrics, { passive: true });
      window.visualViewport.addEventListener('scroll', updateViewportMetrics, { passive: true });
      updateViewportMetrics();
    }

    window.addEventListener('focusin', handleFocusIn, { passive: true });
    window.addEventListener('focusout', handleFocusOut, { passive: true });

    return () => {
      clearTimeout(scrollTimeout1);
      clearTimeout(scrollTimeout2);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportMetrics);
        window.visualViewport.removeEventListener('scroll', updateViewportMetrics);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return null;
}
