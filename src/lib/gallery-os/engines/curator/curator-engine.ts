import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';

export interface CuratorWork {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  artistId: string;
  artistName: string;
  year: number;
  medium: string;
  dimensions: string;
  description: string;
  availabilityStatus: string;
  imageId: string | null;
  imageUrl: string | null;
  significance: number;
  featured: boolean;
}

class CuratorEngine implements Engine {
  name = 'curator';
  private works: CuratorWork[] = [];
  private roomOfOne: CuratorWork | null = null;

  async init(): Promise<void> {}
  async start(): Promise<void> {
    eventBus.publish('curator:ready', { workCount: this.works.length }, 'LOW', this.name);
  }
  async stop(): Promise<void> {}

  loadWorks(works: CuratorWork[]): void {
    this.works = works;
    this.selectRoomOfOne();
  }

  getTheHundred(): CuratorWork[] {
    const scored = this.works
      .filter((w) => w.imageId !== null)
      .sort((a, b) => {
        const scoreA = a.significance + (a.featured ? 5 : 0);
        const scoreB = b.significance + (b.featured ? 5 : 0);
        return scoreB - scoreA;
      });
    return scored.slice(0, 100);
  }

  getRoomOfOne(): CuratorWork | null {
    return this.roomOfOne;
  }

  getWorkCount(): number {
    return this.works.length;
  }

  private selectRoomOfOne(): void {
    const candidates = this.works.filter((w) => w.imageId !== null && w.significance >= 7);
    if (candidates.length === 0) {
      this.roomOfOne = this.works.find((w) => w.imageId !== null) ?? null;
    } else {
      this.roomOfOne = candidates[Math.floor(Math.random() * candidates.length)];
    }
  }
}

export const curatorEngine = new CuratorEngine();
