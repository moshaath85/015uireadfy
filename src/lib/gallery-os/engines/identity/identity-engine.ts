import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';
import { visitorSession } from '../../visitor-session';

type Locale = 'en' | 'ar';

class IdentityEngine implements Engine {
  name = 'identity';
  private currentLanguage: Locale = 'en';
  private initialized = false;

  async init(): Promise<void> {
    const session = visitorSession.get();
    this.currentLanguage = session.preferredLanguage;
    this.initialized = true;
  }

  async start(): Promise<void> {
    this.applyLanguage();
    eventBus.publish('identity:ready', { language: this.currentLanguage }, 'LOW', this.name);
  }

  async stop(): Promise<void> {}

  getLanguage(): Locale {
    return this.currentLanguage;
  }

  switchLanguage(language: Locale): void {
    if (language === this.currentLanguage) return;
    const previous = this.currentLanguage;
    this.currentLanguage = language;
    visitorSession.setLanguage(language);
    this.applyLanguage();
    eventBus.publish(
      'identity:language-switched',
      { from: previous, to: language },
      'HIGH',
      this.name,
    );
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  private applyLanguage(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.getDirection();
  }
}

export const identityEngine = new IdentityEngine();
