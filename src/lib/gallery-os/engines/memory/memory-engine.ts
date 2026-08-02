import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';
import { visitorSession } from '../../visitor-session';

export interface EncounterRecord {
  visitorId: string;
  workId: string;
  timestamp: number;
  duration: number;
  maxDepth: number;
  source: string;
  device: string;
}

class MemoryEngine implements Engine {
  name = 'memory';
  private encounters: EncounterRecord[] = [];
  private storageKey = 'gallery-os-memory';

  async init(): Promise<void> {
    this.loadFromStorage();
    eventBus.subscribe('room:exited', (event) => {
      const { workId, maxDepth } = event.payload as { workId: string; maxDepth: number };
      this.record(workId, maxDepth, 'room');
    }, 'LOW');
  }

  async start(): Promise<void> {
    eventBus.publish('memory:ready', { encounterCount: this.encounters.length }, 'LOW', this.name);
  }

  async stop(): Promise<void> {
    this.saveToStorage();
  }

  record(workId: string, maxDepth: number, source: string): void {
    const session = visitorSession.get();
    this.encounters.push({
      visitorId: session.id,
      workId,
      timestamp: Date.now(),
      duration: 0,
      maxDepth,
      source,
      device: 'desktop',
    });
    this.saveToStorage();
  }

  getEncounters(visitorId?: string): EncounterRecord[] {
    const id = visitorId ?? visitorSession.get().id;
    return this.encounters.filter((e) => e.visitorId === id);
  }

  getMostViewedWorks(limit = 10): Array<{ workId: string; count: number }> {
    const counts = new Map<string, number>();
    for (const e of this.encounters) {
      counts.set(e.workId, (counts.get(e.workId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([workId, count]) => ({ workId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getVisitorEngagementScore(): number {
    const id = visitorSession.get().id;
    const mine = this.encounters.filter((e) => e.visitorId === id);
    if (mine.length === 0) return 0;
    const avgDepth = mine.reduce((sum, e) => sum + e.maxDepth, 0) / mine.length;
    return Math.min(100, Math.round(mine.length * 10 + avgDepth * 20));
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.encounters = JSON.parse(raw) as EncounterRecord[];
    } catch { /* ignore */ }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const simplified = this.encounters.slice(-500);
      localStorage.setItem(this.storageKey, JSON.stringify(simplified));
    } catch { /* ignore */ }
  }
}

export const memoryEngine = new MemoryEngine();
