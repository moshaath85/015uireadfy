import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { mediaRepository } from '@/lib/repositories/media';

export interface PublicMetaItem {
  label: string;
  value?: ReactNode;
}

export interface PublicCardImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface PublicBreadcrumbItem {
  label: string;
  href?: string;
}

export interface PublicRelatedItem {
  title: string;
  href: string;
  meta?: ReactNode;
}

interface PageContainerProps {
  children: ReactNode;
}

interface PublicHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: PublicCardImage | null;
  images?: PublicCardImage[];
}

interface PublicHeroSliderProps extends PublicHeroProps {
  fallbackImages?: PublicCardImage[];
}

interface PublicResponsiveMediaProps {
  image: PublicCardImage;
  caption?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

interface PublicGridProps {
  children: ReactNode;
}

interface PublicCardProps {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  href?: string;
  image?: PublicCardImage | null;
  variant?: string;
}

interface PublicDetailSectionProps {
  title?: string;
  children: ReactNode;
}

interface PublicMetadataSectionProps {
  items: PublicMetaItem[];
}

interface PublicGallerySectionProps {
  title?: string;
  images: PublicCardImage[];
}

interface PublicCTASectionProps {
  title: string;
  description?: string;
  href: string;
  label: string;
}

interface PublicRichContentSectionProps {
  title?: string;
  body?: string;
}

interface PublicBreadcrumbsProps {
  items: PublicBreadcrumbItem[];
}

interface PublicRelatedSectionProps {
  title?: string;
  items: PublicRelatedItem[];
}

const defaultHeroImages: PublicCardImage[] = [
  {
    src: '/images/aw-001-main.jpg',
    alt: 'Gallery 015 featured desert-toned artwork',
    width: 2400,
    height: 3200,
  },
  {
    src: '/images/aw-002-front.jpg',
    alt: 'Gallery 015 featured urban artwork',
    width: 3000,
    height: 3000,
  },
  {
    src: '/images/artists/layla-al-hassan-profile.jpg',
    alt: 'Gallery 015 artist portrait in warm studio light',
    width: 1600,
    height: 2000,
  },
  {
    src: '/images/artists/omar-farouk-profile.jpg',
    alt: 'Gallery 015 artist portrait in neutral studio light',
    width: 1600,
    height: 2000,
  },
];

function getNaturalAspectRatio(image: PublicCardImage): CSSProperties | undefined {
  if (!image.width || !image.height || image.width <= 0 || image.height <= 0) {
    return undefined;
  }

  return { aspectRatio: `${image.width} / ${image.height}` };
}

function uniqueImages(images: PublicCardImage[]): PublicCardImage[] {
  const seen = new Set<string>();

  return images.filter((image) => {
    if (!image.src || seen.has(image.src)) {
      return false;
    }

    seen.add(image.src);
    return true;
  });
}

function getHeroImages(
  image?: PublicCardImage | null,
  images: PublicCardImage[] = [],
  fallbackImages: PublicCardImage[] = [],
): PublicCardImage[] {
  const resolvedImages = uniqueImages([...(image ? [image] : []), ...images, ...fallbackImages]);

  if (resolvedImages.length > 0) {
    return resolvedImages;
  }

  return defaultHeroImages;
}

function getStablePageScore(title: string, image: PublicCardImage, index: number): number {
  const value = `${title.toLowerCase()}|${image.src}|${image.alt}|${index}`;
  let score = 0;

  for (let charIndex = 0; charIndex < value.length; charIndex += 1) {
    score = (score * 31 + value.charCodeAt(charIndex)) % 1000003;
  }

  return score;
}

function getPageFallbackImages(title: string, fallbackImages: PublicCardImage[]): PublicCardImage[] {
  const uniqueFallbackImages = uniqueImages(fallbackImages);
  const slideCount = Math.min(4, uniqueFallbackImages.length);

  if (slideCount === 0) {
    return [];
  }

  return uniqueFallbackImages
    .map((fallbackImage, index) => ({
      fallbackImage,
      score: getStablePageScore(title, fallbackImage, index),
    }))
    .sort((first, second) => first.score - second.score)
    .slice(0, slideCount)
    .map(({ fallbackImage }) => fallbackImage);
}

function toHeroId(title: string): string {
  return `public-hero-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'gallery'}`;
}

function PublicHeroSlider({ title, image, images = [], fallbackImages = [] }: PublicHeroSliderProps) {
  const heroImages = getHeroImages(image, images, fallbackImages);
  const heroId = toHeroId(title);
  const hasMultipleSlides = heroImages.length > 1;
  const script = hasMultipleSlides
    ? `
(() => {
  const hero = document.getElementById(${JSON.stringify(heroId)});
  if (!hero || hero.dataset.sliderReady === "true") return;
  hero.dataset.sliderReady = "true";
  const slides = Array.from(hero.querySelectorAll("[data-public-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-public-hero-dot]"));
  let index = 0;
  let startX = null;
  let timer = null;

  const setSlide = (nextIndex, userInitiated = false) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      const image = slide.querySelector("img");
      if (image && active && image.dataset.src) {
        image.src = image.dataset.src;
        image.removeAttribute("data-src");
      }
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
    if (userInitiated) restart();
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => setSlide(index + 1), 6200);
  };

  const restart = () => {
    stop();
    start();
  };

  dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => setSlide(dotIndex, true)));
  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSlide(index - 1, true);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSlide(index + 1, true);
    }
  });
  hero.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
  });
  hero.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    if (Math.abs(distance) < 48) return;
    setSlide(index + (distance < 0 ? 1 : -1), true);
  });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", start);
  setSlide(0);
  start();
})();
`
    : '';

  return (
    <section
      className="section-title public-hero public-hero--slider"
      id={heroId}
      aria-label={`${title} hero slider`}
      tabIndex={0}
    >
      <div className="public-hero__slides" aria-live="polite">
        {heroImages.map((heroImage, index) => (
          <figure
            className={`public-hero__slide${index === 0 ? ' is-active' : ''}`}
            data-public-hero-slide=""
            aria-hidden={index === 0 ? 'false' : 'true'}
            key={`${heroImage.src}-${heroImage.alt}`}
          >
            <img
              src={index === 0 ? heroImage.src : undefined}
              data-src={index === 0 ? undefined : heroImage.src}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <div className="public-hero__shade" aria-hidden="true" />
      <div className="public-hero__brand" aria-hidden="true">
        <img className="public-hero__brand-logo public-hero__brand-logo--light" src="/brand/015-logo-white.svg" alt="" />
        <img className="public-hero__brand-logo public-hero__brand-logo--dark" src="/brand/015-logo-black.svg" alt="" />
      </div>
      {hasMultipleSlides ? (
        <div className="public-hero__controls" aria-label={`${title} hero controls`}>
          <div className="public-hero__dots" aria-label="Hero image pagination">
            {heroImages.map((heroImage, index) => (
              <button
                type="button"
                data-public-hero-dot=""
                aria-label={`Show hero image ${index + 1}: ${heroImage.alt}`}
                aria-current={index === 0 ? 'true' : 'false'}
                className={index === 0 ? 'is-active' : undefined}
                key={`${heroImage.src}-dot`}
              />
            ))}
          </div>
        </div>
      ) : null}
      {script ? <script dangerouslySetInnerHTML={{ __html: script }} /> : null}
    </section>
  );
}

export default function PageContainer({ children }: PageContainerProps) {
  return <div className="page-container">{children}</div>;
}

export function PublicResponsiveMedia({
  image,
  caption,
  className,
  loading = 'lazy',
}: PublicResponsiveMediaProps) {
  const mediaClassName = className ? `public-responsive-media ${className}` : 'public-responsive-media';
  const mediaStyle = getNaturalAspectRatio(image);

  return (
    <figure className={mediaClassName} style={mediaStyle}>
      <img
        className="public-responsive-media__image"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={loading}
        decoding="async"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export async function PublicHero(props: PublicHeroProps) {
  const heroMedia = await mediaRepository.getPublicHeroMedia();
  const fallbackImages = heroMedia.map((media) => ({
    src: media.url,
    alt: media.alt_en,
    width: media.width,
    height: media.height,
  }));

  return <PublicHeroSlider {...props} fallbackImages={getPageFallbackImages(props.title, fallbackImages)} />;
}

export function PublicBreadcrumbs({ items }: PublicBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="public-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1 || !item.href;

          return (
            <li key={`${item.label}-${index}`} aria-current={isCurrent ? 'page' : undefined}>
              {item.href && !isCurrent ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PublicGrid({ children }: PublicGridProps) {
  return <div className="card-grid public-grid">{children}</div>;
}

export function PublicCard({ title, subtitle, meta, href, image, variant = 'default' }: PublicCardProps) {
  const content = (
    <>
      {image ? <PublicResponsiveMedia image={image} className="public-card__image" /> : <div className="public-card__image">[No image]</div>}
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
      {meta ? <p className="public-card__meta">{meta}</p> : null}
    </>
  );

  const className = `public-card ${variant}-card`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}

export function PublicDetailSection({ title, children }: PublicDetailSectionProps) {
  return (
    <section className="public-detail-section">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export function PublicMetadataSection({ items }: PublicMetadataSectionProps) {
  const visibleItems = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <dl className="public-metadata-section">
      {visibleItems.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PublicGallerySection({ title = 'Gallery', images }: PublicGallerySectionProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="public-gallery-section">
      <h3>{title}</h3>
      <div className="card-grid">
        {images.map((image) => (
          <PublicResponsiveMedia
            key={`${image.src}-${image.alt}`}
            image={image}
            caption={image.alt}
            className="public-gallery-section__item"
          />
        ))}
      </div>
    </section>
  );
}

export function PublicCTASection({ title, description, href, label }: PublicCTASectionProps) {
  return (
    <section className="public-cta-section">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <Link href={href}>{label}</Link>
    </section>
  );
}

export function PublicRichContentSection({ title, body }: PublicRichContentSectionProps) {
  if (!body) {
    return null;
  }

  return (
    <section className="public-rich-content-section">
      {title ? <h3>{title}</h3> : null}
      <p>{body}</p>
    </section>
  );
}

export function PublicRelatedSection({ title = 'Related', items }: PublicRelatedSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="public-related-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.title}</Link>
            {item.meta ? <span>{item.meta}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}