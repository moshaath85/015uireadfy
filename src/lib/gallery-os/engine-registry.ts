import type { Engine, EngineEntry } from './types';
import { eventBus } from './event-bus';

class EngineRegistry {
  private engines = new Map<string, EngineEntry>();

  register(engine: Engine, dependencies: string[] = []): void {
    if (this.engines.has(engine.name)) {
      throw new Error(`Engine "${engine.name}" is already registered.`);
    }

    for (const dep of dependencies) {
      if (!this.engines.has(dep)) {
        throw new Error(
          `Engine "${engine.name}" depends on "${dep}" which is not registered.`,
        );
      }
    }

    this.engines.set(engine.name, {
      engine,
      status: 'unregistered',
      dependencies,
    });
  }

  async initAll(): Promise<void> {
    const sorted = this.topologicalSort();
    for (const name of sorted) {
      const entry = this.engines.get(name);
      if (!entry) continue;
      try {
        await entry.engine.init();
        entry.status = 'initialized';
      } catch (error) {
        entry.status = 'error';
        console.error(`[EngineRegistry] Failed to init engine "${name}":`, error);
        throw error;
      }
    }
  }

  async startAll(): Promise<void> {
    for (const [name, entry] of Array.from(this.engines)) {
      if (entry.status !== 'initialized') continue;
      try {
        await entry.engine.start();
        entry.status = 'running';
      } catch (error) {
        entry.status = 'error';
        console.error(`[EngineRegistry] Failed to start engine "${name}":`, error);
        throw error;
      }
    }
  }

  async stopAll(): Promise<void> {
    const sorted = this.topologicalSort().reverse();
    for (const name of sorted) {
      const entry = this.engines.get(name);
      if (!entry || entry.status !== 'running') continue;
      try {
        await entry.engine.stop();
        entry.status = 'stopped';
      } catch (error) {
        console.error(`[EngineRegistry] Failed to stop engine "${name}":`, error);
      }
    }
  }

  get(name: string): Engine | undefined {
    return this.engines.get(name)?.engine;
  }

  getStatus(name: string): string {
    return this.engines.get(name)?.status ?? 'unregistered';
  }

  getAll(): ReadonlyMap<string, EngineEntry> {
    return this.engines;
  }

  clear(): void {
    this.engines.clear();
    eventBus.clear();
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const sorted: string[] = [];
    const visiting = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving engine "${name}".`);
      }
      visiting.add(name);
      const entry = this.engines.get(name);
      if (entry) {
        for (const dep of entry.dependencies) {
          visit(dep);
        }
      }
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    for (const name of Array.from(this.engines.keys())) {
      visit(name);
    }

    return sorted;
  }
}

export const engineRegistry = new EngineRegistry();
