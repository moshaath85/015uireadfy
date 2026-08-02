/**
 * 015 Gallery — Design System Types
 * Type-safe references for all design tokens defined in design-tokens.css
 */

export interface DesignTokens {
  /* ---- Typography ---- */
  fontFamily: {
    sans: string;
    sansArabic: string;
    serif: string;
  };
  typeScale: {
    display1: string;
    display2: string;
    heading1: string;
    heading2: string;
    heading3: string;
    body: string;
    bodyLarge: string;
    caption: string;
    label: string;
    labelSmall: string;
  };
  leading: {
    display: number;
    heading: number;
    body: number;
    label: number;
    arabic: number;
  };
  tracking: {
    display: string;
    heading: string;
    body: string;
    label: string;
  };
  weight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
  };
  measure: {
    body: string;
    intro: string;
    label: string;
  };

  /* ---- Color ---- */
  color: {
    paper: string;
    ink: string;
    ink60: string;
    ink40: string;
    hairline: string;
    hairlineStrong: string;
    surfaceDark: string;
    surfaceDarkText: string;
    accent: string;
  };

  /* ---- Spatial ---- */
  space: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  layout: {
    pageGutter: string;
    contentMax: number;
    headerHeight: number;
  };

  /* ---- Motion ---- */
  motion: {
    fast: string;
    base: string;
    slow: string;
    ease: string;
  };

  /* ---- Breakpoints ---- */
  breakpoint: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/** Visual variants for experience components */
export type ExperienceVariant =
  | 'default'
  | 'artwork'
  | 'artist'
  | 'exhibition'
  | 'collection'
  | 'project'
  | 'journal'
  | 'publication'
  | 'service';

/** Image plate presentation modes */
export type ImagePlateVariant =
  | 'hero'       // full-bleed hero
  | 'detail'     // artwork detail with museum shadow
  | 'grid'       // index grid thumbnail
  | 'related'    // related content thumbnail
  | 'portrait'   // artist portrait
  | 'cover';     // exhibition/publication cover

/** Section layout modes */
export type SectionLayout =
  | 'full-bleed'
  | 'asymmetric'
  | 'grid-3'
  | 'grid-4'
  | 'list';

/** Navigation item structure */
export interface NavItem {
  label: string;
  href: string;
  /** Children for dropdown — only on desktop */
  children?: Omit<NavItem, 'children'>[];
  /** Current page match pattern */
  activePattern?: string;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Contact form fields */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Language direction */
export type LocaleDirection = 'ltr' | 'rtl';
export type Locale = 'en' | 'ar';

/** Device context for responsive decisions */
export type DeviceContext =
  | 'mobile-sm'   // < 460px
  | 'mobile'      // 460px - 759px
  | 'tablet'      // 760px - 1179px
  | 'desktop'     // 1180px - 1439px
  | 'desktop-xl'; // >= 1440px
