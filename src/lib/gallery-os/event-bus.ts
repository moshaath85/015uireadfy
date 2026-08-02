import type { EventHandler, EventPriority, GalleryOSEvent, Unsubscribe } from './types';

const PRIORITY_ORDER: Record<EventPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

interface Subscription {
  handler: EventHandler;
  priority: EventPriority;
}

export class EventBus {
  private subscribers = new Map<string, Subscription[]>();
  private isDispatching = false;

  publish<T>(name: string, payload: T, priority: EventPriority = 'MEDIUM', source?: string): void {
    const event: GalleryOSEvent<T> = {
      name,
      payload,
      priority,
      timestamp: Date.now(),
      source,
    };

    const subs = this.subscribers.get(name);
    if (!subs || subs.length === 0) return;

    const sorted = [...subs].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );

    for (const sub of sorted) {
      try {
        sub.handler(event);
      } catch (error) {
        if (priority === 'CRITICAL') {
          console.error(`[EventBus] Unhandled error in CRITICAL subscriber for "${name}":`, error);
        }
      }
    }
  }

  subscribe<T>(name: string, handler: EventHandler<T>, priority: EventPriority = 'MEDIUM'): Unsubscribe {
    const subs = this.subscribers.get(name) || [];
    subs.push({ handler: handler as EventHandler, priority });
    this.subscribers.set(name, subs);

    return () => {
      const current = this.subscribers.get(name);
      if (!current) return;
      this.subscribers.set(
        name,
        current.filter((s) => s.handler !== handler),
      );
    };
  }

  subscriberCount(name: string): number {
    return this.subscribers.get(name)?.length ?? 0;
  }

  clear(): void {
    this.subscribers.clear();
  }
}

export const eventBus = new EventBus();
