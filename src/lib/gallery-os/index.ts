export { EventBus, eventBus } from './event-bus';
export { engineRegistry } from './engine-registry';
export { visitorSession } from './visitor-session';
export type {
  Engine,
  EngineEntry,
  EngineStatus,
  EventHandler,
  EventPriority,
  GalleryOSEvent,
  Unsubscribe,
  VisitorSessionData,
} from './types';

import { engineRegistry } from './engine-registry';
import { eventBus } from './event-bus';
import { visitorSession } from './visitor-session';

let bootstrapped = false;

export async function bootstrap(): Promise<void> {
  if (bootstrapped) return;

  if (typeof window !== 'undefined') {
    visitorSession.get();
  }

  try {
    await engineRegistry.initAll();
    await engineRegistry.startAll();
    bootstrapped = true;
    eventBus.publish('gallery-os:ready', { timestamp: Date.now() }, 'LOW');
  } catch (error) {
    console.error('[GalleryOS] Bootstrap failed:', error);
    throw error;
  }
}

export async function teardown(): Promise<void> {
  if (!bootstrapped) return;
  await engineRegistry.stopAll();
  engineRegistry.clear();
  bootstrapped = false;
  eventBus.publish('gallery-os:stopped', { timestamp: Date.now() }, 'LOW');
}

export function isBootstrapped(): boolean {
  return bootstrapped;
}
