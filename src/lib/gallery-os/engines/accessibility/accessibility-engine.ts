import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number;
}

class AccessibilityEngine implements Engine {
  name = 'accessibility';
  private preferences: AccessibilityPreferences = {
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
  };
  private mediaQueryLists: MediaQueryList[] = [];

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.preferences.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    this.preferences.highContrast = window.matchMedia(
      '(prefers-contrast: more)',
    ).matches;

    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMql.addEventListener('change', (e) => {
      this.preferences.reducedMotion = e.matches;
      eventBus.publish('accessibility:preferences-changed', this.preferences, 'HIGH', this.name);
    });
    this.mediaQueryLists.push(motionMql);

    const contrastMql = window.matchMedia('(prefers-contrast: more)');
    contrastMql.addEventListener('change', (e) => {
      this.preferences.highContrast = e.matches;
      eventBus.publish('accessibility:preferences-changed', this.preferences, 'HIGH', this.name);
    });
    this.mediaQueryLists.push(contrastMql);
  }

  async start(): Promise<void> {
    eventBus.publish('accessibility:ready', this.preferences, 'LOW', this.name);
  }

  async stop(): Promise<void> {
    for (const mql of this.mediaQueryLists) {
      mql.removeEventListener('change', () => {});
    }
    this.mediaQueryLists = [];
  }

  getPreferences(): Readonly<AccessibilityPreferences> {
    return this.preferences;
  }

  setFontSize(px: number): void {
    this.preferences.fontSize = Math.max(12, Math.min(24, px));
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${this.preferences.fontSize}px`;
    }
    eventBus.publish('accessibility:preferences-changed', this.preferences, 'HIGH', this.name);
  }

  getAnimationDuration(baseMs: number): number {
    return this.preferences.reducedMotion ? 0 : baseMs;
  }
}

export const accessibilityEngine = new AccessibilityEngine();
