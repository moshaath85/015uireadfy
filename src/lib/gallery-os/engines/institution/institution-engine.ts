import type { Engine } from '../../types';
import { eventBus } from '../../event-bus';

export interface InstitutionConfig {
  name: { en: string; ar: string };
  monogram: { light: string; dark: string };
  foundedYear: number;
  location: {
    city: { en: string; ar: string };
    country: { en: string; ar: string };
    timezone: string;
  };
  mission: { en: string; ar: string };
  visual: {
    paper: string;
    ink: string;
    ink60: string;
    ink40: string;
    hairline: string;
    hairlineStrong: string;
    surfaceDark: string;
    surfaceDarkText: string;
    accent: string;
    serifDisplay: string;
    sansBody: string;
    sansArabic: string;
  };
  ritual: {
    arrivalDuration: number;
    returnArrivalDuration: number;
    thresholdDuration: number;
    hairlineEnabled: boolean;
  };
  features: Record<string, boolean>;
}

const DEFAULT_CONFIG: InstitutionConfig = {
  name: { en: 'Gallery 015', ar: 'غاليري ٠١٥' },
  monogram: {
    light: '/brand/015-logo-black.svg',
    dark: '/brand/015-logo-white.svg',
  },
  foundedYear: 2020,
  location: {
    city: { en: 'Riyadh', ar: 'الرياض' },
    country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    timezone: 'Asia/Riyadh',
  },
  mission: {
    en: 'A contemporary art platform shaped by artists, collectors, and place.',
    ar: 'منصة فنية معاصرة يصوغها الفنانون وجامعو المقتنيات والمكان.',
  },
  visual: {
    paper: '#FAFAF7',
    ink: '#12110F',
    ink60: 'rgba(18,17,15,0.60)',
    ink40: 'rgba(18,17,15,0.40)',
    hairline: 'rgba(18,17,15,0.13)',
    hairlineStrong: 'rgba(18,17,15,0.28)',
    surfaceDark: '#161513',
    surfaceDarkText: '#BEB6A6',
    accent: '#C8412A',
    serifDisplay: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif",
    sansBody: "'IBM Plex Sans', system-ui, sans-serif",
    sansArabic: "'IBM Plex Sans Arabic', system-ui, sans-serif",
  },
  ritual: {
    arrivalDuration: 3800,
    returnArrivalDuration: 2500,
    thresholdDuration: 3000,
    hairlineEnabled: true,
  },
  features: {
    collectorEngine: true,
    scholarEngine: true,
    publishingEngine: true,
    silenceEngine: false,
    gardenEngine: false,
    diaryEngine: false,
  },
};

class InstitutionEngine implements Engine {
  name = 'institution';
  private config: InstitutionConfig = { ...DEFAULT_CONFIG };
  private initialized = false;

  async init(): Promise<void> {
    this.initialized = true;
  }

  async start(): Promise<void> {
    eventBus.publish('institution:ready', this.config, 'LOW', this.name);
  }

  async stop(): Promise<void> {}

  getConfig(): Readonly<InstitutionConfig> {
    return this.config;
  }

  updateConfig(partial: Partial<InstitutionConfig>): void {
    this.config = { ...this.config, ...partial };
    eventBus.publish('institution:config-changed', this.config, 'HIGH', this.name);
  }

  isFeatureEnabled(feature: string): boolean {
    return this.config.features[feature] ?? false;
  }
}

export const institutionEngine = new InstitutionEngine();
