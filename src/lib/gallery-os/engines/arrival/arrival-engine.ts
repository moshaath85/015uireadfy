import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';
import { visitorSession } from '../../visitor-session';
import { accessibilityEngine } from '../accessibility/accessibility-engine';

export type ArrivalPhase =
  | 'idle'
  | 'black'
  | 'monogram-in'
  | 'hairline'
  | 'monogram-out'
  | 'complete';

class ArrivalEngine implements Engine {
  name = 'arrival';
  private phase: ArrivalPhase = 'idle';
  private isReturning = false;

  async init(): Promise<void> {
    this.isReturning = visitorSession.isReturning();
  }

  async start(): Promise<void> {
    this.beginRitual();
  }

  async stop(): Promise<void> {
    this.phase = 'idle';
  }

  beginRitual(): void {
    this.phase = 'black';
    eventBus.publish(
      'arrival:phase-changed',
      { phase: this.phase, isReturning: this.isReturning },
      'CRITICAL',
      this.name,
    );
  }

  advancePhase(next: ArrivalPhase): void {
    this.phase = next;
    eventBus.publish(
      'arrival:phase-changed',
      { phase: this.phase, isReturning: this.isReturning },
      'CRITICAL',
      this.name,
    );

    if (next === 'complete') {
      const duration = this.isReturning
        ? accessibilityEngine.getAnimationDuration(2500)
        : accessibilityEngine.getAnimationDuration(3800);

      setTimeout(() => {
        eventBus.publish(
          'arrival:complete',
          { isReturning: this.isReturning, totalDuration: duration },
          'HIGH',
          this.name,
        );
      }, duration);
    }
  }

  getPhase(): ArrivalPhase {
    return this.phase;
  }

  isReturnVisitor(): boolean {
    return this.isReturning;
  }

  skip(): void {
    this.phase = 'complete';
    eventBus.publish(
      'arrival:complete',
      { isReturning: this.isReturning, totalDuration: 0, skipped: true },
      'HIGH',
      this.name,
    );
  }
}

export const arrivalEngine = new ArrivalEngine();
