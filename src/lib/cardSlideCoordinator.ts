/**
 * Global Card Slide Coordinator
 * 
 * Amaç: Ekranda görünen onlarca kartın aynı anda animasyon yapıp
 * mobil cihazlarda GPU/CPU'yu kilitlemesini önler.
 * 
 * Çalışma Mantığı:
 * - Yalnızca ekranda (viewport'ta) olan kartlar koordinatöre kaydolur.
 * - Koordinatör her 2.2 saniyede bir, görünen kartlar arasından SIRAYLA SADECE 1 KARTI tetikler.
 * - Kullanıcı parmağıyla scroll yaparken tüm geçişler dondurulur (60 FPS kilit).
 */

type SlideTrigger = () => void;

class CardSlideCoordinator {
  private visibleCards = new Map<string, SlideTrigger>();
  private activeKeys: string[] = [];
  private currentIndex = 0;
  private intervalId: any = null;
  private isScrolling = false;
  private scrollTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'scroll',
        () => {
          this.isScrolling = true;
          if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
          this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
          }, 150);
        },
        { passive: true }
      );
    }
  }

  public register(id: string, trigger: SlideTrigger) {
    this.visibleCards.set(id, trigger);
    this.activeKeys = Array.from(this.visibleCards.keys());
    this.ensureTicker();
  }

  public unregister(id: string) {
    this.visibleCards.delete(id);
    this.activeKeys = Array.from(this.visibleCards.keys());
    if (this.activeKeys.length === 0) {
      this.stopTicker();
    }
  }

  private ensureTicker() {
    if (this.intervalId || typeof window === 'undefined') return;

    this.intervalId = setInterval(() => {
      if (this.isScrolling || this.activeKeys.length === 0) return;

      this.currentIndex = (this.currentIndex + 1) % this.activeKeys.length;
      const targetId = this.activeKeys[this.currentIndex];
      const trigger = this.visibleCards.get(targetId);

      if (trigger) {
        trigger();
      }
    }, 2200); // 2.2 saniyede bir sıradaki tek karta yumuşak geçiş
  }

  private stopTicker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const cardSlideCoordinator = new CardSlideCoordinator();
