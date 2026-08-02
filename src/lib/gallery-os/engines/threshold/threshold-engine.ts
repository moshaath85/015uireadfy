import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';
import { accessibilityEngine } from '../accessibility/accessibility-engine';

export type ThresholdVariant = 'room-to-room' | 'room-to-work' | 'work-to-atlas' | 'rapid';

interface ThresholdConfig {
  blackHold: number;
  hairline: boolean;
  reveal: number;
}

const VARIANTS: Record<ThresholdVariant, ThresholdConfig> = {
  'room-to-room': { blackHold: 500, hairline: true, reveal: 1500 },
  'room-to-work': { blackHold: 300, hairline: true, reveal: 1200 },
  'work-to-atlas': { blackHold: 300, hairline: false, reveal: 800 },
  rapid: { blackHold: 0, hairline: false, reveal: 200 },
};

class ThresholdEngine implements Engine {
  name = 'threshold';
  private history: Array<{ space: string; data?: unknown }> = [];

  async init(): Promise<void> {}
  async start(): Promise<void> {
    eventBus.publish('threshold:ready', {}, 'LOW', this.name);
  }
  async stop(): Promise<void> {
    this.history = [];
  }

  transition(
    from: string,
    to: string,
    variant: ThresholdVariant = 'room-to-work',
  ): { duration: number; hairline: boolean } {
    const config = VARIANTS[variant];
    const reducedMotion = accessibilityEngine.getPreferences().reducedMotion;

    if (reducedMotion) {
      eventBus.publish('threshold:complete', { from, to, variant, duration: 0 }, 'HIGH', this.name);
      return { duration: 0, hairline: false };
    }

    const totalDuration = config.blackHold + (config.hairline ? 1000 : 0) + config.reveal;

    this.history.push({ space: from });

    eventBus.publish(
      'threshold:started',
      { from, to, variant, duration: totalDuration },
      'HIGH',
      this.name,
    );

    setTimeout(() => {
      eventBus.publish(
        'threshold:complete',
        { from, to, variant, duration: totalDuration },
        'HIGH',
        this.name,
      );
    }, totalDuration);

    return { duration: totalDuration, hairline: config.hairline };
  }

  goBack(): { space: string; data?: unknown } | null {
    return this.history.pop() ?? null;
  }

  getHistoryLength(): number {
    return this.history.length;
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const thresholdEngine = new ThresholdEngine();
