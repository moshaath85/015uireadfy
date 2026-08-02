import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';

type ConnectionTier = 'fast' | 'medium' | 'slow' | 'offline';
type DeviceTier = 'high' | 'standard' | 'low';

class PerformanceEngine implements Engine {
  name = 'performance';
  private connection: ConnectionTier = 'fast';
  private device: DeviceTier = 'high';
  private metrics: { lcp: number; cls: number; inp: number } = { lcp: 0, cls: 0, inp: 0 };

  async init(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    this.detectConnection();
    this.detectDevice();
    this.observeMetrics();
  }

  async start(): Promise<void> {
    eventBus.publish('performance:ready', {
      connection: this.connection,
      device: this.device,
    }, 'LOW', this.name);
  }

  async stop(): Promise<void> {}

  selectImageResolution(
    thumbnail: string,
    display: string,
    zoom: string,
  ): string {
    if (this.connection === 'slow' || this.device === 'low') return thumbnail;
    return display;
  }

  getConnectionTier(): ConnectionTier {
    return this.connection;
  }

  getDeviceTier(): DeviceTier {
    return this.device;
  }

  getMetrics(): Readonly<{ lcp: number; cls: number; inp: number }> {
    return this.metrics;
  }

  private detectConnection(): void {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number };
    };
    const conn = nav.connection;
    if (!conn) return;

    if (!navigator.onLine) {
      this.connection = 'offline';
      return;
    }
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      this.connection = 'slow';
    } else if (conn.effectiveType === '3g') {
      this.connection = 'medium';
    } else {
      this.connection = 'fast';
    }
  }

  private detectDevice(): void {
    if (typeof navigator === 'undefined') return;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency ?? 4;

    if (memory !== undefined) {
      if (memory <= 2 || cores <= 2) { this.device = 'low'; return; }
      if (memory <= 4 || cores <= 4) { this.device = 'standard'; return; }
    }
    this.device = 'high';
  }

  private observeMetrics(): void {
    if (typeof window === 'undefined') return;
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.metrics.lcp = lcpEntry.startTime;
          eventBus.publish('performance:lcp', { lcp: this.metrics.lcp }, 'LOW', this.name);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const ls = entry as unknown as { hadRecentInput?: boolean; value: number };
          if (!ls.hadRecentInput) {
            this.metrics.cls += ls.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  }
}

export const performanceEngine = new PerformanceEngine();
