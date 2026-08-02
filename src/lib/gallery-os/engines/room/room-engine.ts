import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';

export interface RoomWork {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  artist: { name: string; slug: string };
  year: number;
  medium: string;
  dimensions: string;
  description: string;
  availabilityStatus: string;
  image: { url: string; alt: string; width: number; height: number } | null;
}

class RoomEngine implements Engine {
  name = 'room';
  private currentWork: RoomWork | null = null;
  private depth = 1;

  async init(): Promise<void> {}
  async start(): Promise<void> {
    eventBus.publish('room:ready', {}, 'LOW', this.name);
  }
  async stop(): Promise<void> {
    this.currentWork = null;
    this.depth = 1;
  }

  enter(work: RoomWork): void {
    this.currentWork = work;
    this.depth = 1;
    eventBus.publish(
      'room:entered',
      { workId: work.id, depth: this.depth },
      'HIGH',
      this.name,
    );
  }

  setDepth(level: number): void {
    if (level === this.depth) return;
    const previous = this.depth;
    this.depth = Math.max(1, Math.min(3, level));
    eventBus.publish(
      'room:depth-changed',
      { workId: this.currentWork?.id, from: previous, to: this.depth },
      'MEDIUM',
      this.name,
    );
  }

  exit(): void {
    if (this.currentWork) {
      eventBus.publish(
        'room:exited',
        { workId: this.currentWork.id, maxDepth: this.depth },
        'MEDIUM',
        this.name,
      );
    }
    this.currentWork = null;
    this.depth = 1;
  }

  getCurrentWork(): RoomWork | null {
    return this.currentWork;
  }

  getDepth(): number {
    return this.depth;
  }
}

export const roomEngine = new RoomEngine();
