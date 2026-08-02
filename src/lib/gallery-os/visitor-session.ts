import type { VisitorSessionData } from './types';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function detectLanguage(): 'en' | 'ar' {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || '';
  if (lang.startsWith('ar')) return 'ar';
  return 'en';
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const STORAGE_KEY = 'gallery-os-session';

function loadSession(): VisitorSessionData | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorSessionData;
  } catch {
    return null;
  }
}

function saveSession(session: VisitorSessionData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage may be full or unavailable in private browsing
  }
}

class VisitorSession {
  private session: VisitorSessionData | null = null;

  get(): VisitorSessionData {
    if (!this.session) {
      const existing = loadSession();
      if (existing) {
        this.session = {
          ...existing,
          lastActiveAt: Date.now(),
          visitCount: existing.visitCount + 1,
        };
      } else {
        this.session = {
          id: generateId(),
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          visitCount: 1,
          preferredLanguage: detectLanguage(),
          prefersReducedMotion: detectReducedMotion(),
        };
      }
      saveSession(this.session);
    }
    return this.session;
  }

  setLanguage(language: 'en' | 'ar'): void {
    const session = this.get();
    session.preferredLanguage = language;
    saveSession(session);
  }

  touch(): void {
    const session = this.get();
    session.lastActiveAt = Date.now();
    saveSession(session);
  }

  isReturning(): boolean {
    return this.get().visitCount > 1;
  }

  daysSinceLastVisit(): number | null {
    const existing = loadSession();
    if (!existing || existing.visitCount <= 1) return null;
    return (Date.now() - existing.lastActiveAt) / (1000 * 60 * 60 * 24);
  }

  clear(): void {
    this.session = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const visitorSession = new VisitorSession();
