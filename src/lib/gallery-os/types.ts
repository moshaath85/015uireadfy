export type EventPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface GalleryOSEvent<T = unknown> {
  readonly name: string;
  readonly payload: T;
  readonly priority: EventPriority;
  readonly timestamp: number;
  readonly source?: string;
}

export type EventHandler<T = unknown> = (event: GalleryOSEvent<T>) => void;

export interface Unsubscribe {
  (): void;
}

export interface Engine {
  readonly name: string;
  init(): Promise<void> | void;
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
  handleEvent?<T>(event: GalleryOSEvent<T>): void;
}

export interface VisitorSessionData {
  id: string;
  createdAt: number;
  lastActiveAt: number;
  visitCount: number;
  preferredLanguage: 'en' | 'ar';
  prefersReducedMotion: boolean;
}

export type EngineStatus = 'unregistered' | 'initialized' | 'running' | 'stopped' | 'error';

export interface EngineEntry {
  engine: Engine;
  status: EngineStatus;
  dependencies: string[];
}
