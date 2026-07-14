'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface HomeHeroSlide {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  href: string;
  cta: string;
}

interface HomeHeroProps {
  slides: HomeHeroSlide[];
}

export default function HomeHero({ slides }: HomeHeroProps) {
  const safeSlides = useMemo(() => slides.filter((slide) => slide.src), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (paused || safeSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % safeSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, safeSlides.length]);

  useEffect(() => {
    if (activeIndex >= safeSlides.length) setActiveIndex(0);
  }, [activeIndex, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  const activeSlide = safeSlides[activeIndex];

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + safeSlides.length) % safeSlides.length);
  };

  return (
    <section
      className="home-hero"
      aria-roledescription="carousel"
      aria-label="Gallery 015 highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') move(-1);
        if (event.key === 'ArrowRight') move(1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        touchStart.current = null;
        if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
      }}
      tabIndex={0}
    >
      <div className="home-hero__copy" aria-live="polite">
        <p className="home-hero__eyebrow">{activeSlide.eyebrow}</p>
        <h1>{activeSlide.title}</h1>
        <span className="home-hero__rule" aria-hidden="true" />
        <p className="home-hero__description">{activeSlide.description}</p>
        {activeSlide.meta ? <p className="home-hero__meta">{activeSlide.meta}</p> : null}
        <Link className="home-hero__cta" href={activeSlide.href}>
          {activeSlide.cta}<span aria-hidden="true">↗</span>
        </Link>
        {safeSlides.length > 1 ? (
          <div className="home-hero__counter" aria-label={`Slide ${activeIndex + 1} of ${safeSlides.length}`}>
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            <i aria-hidden="true" />
            <span>{String(safeSlides.length).padStart(2, '0')}</span>
          </div>
        ) : null}
      </div>

      <div className="home-hero__visual">
        {safeSlides.map((slide, index) => (
          <figure className={`home-hero__slide${index === activeIndex ? ' is-active' : ''}`} key={slide.src} aria-hidden={index !== activeIndex}>
            <img src={slide.src} alt={index === activeIndex ? slide.alt : ''} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          </figure>
        ))}
        <div className="home-hero__veil" aria-hidden="true" />
        {safeSlides.length > 1 ? (
          <div className="home-hero__dots" aria-label="Choose a highlight">
            {safeSlides.map((slide, index) => (
              <button
                type="button"
                key={`${slide.src}-dot`}
                className={index === activeIndex ? 'is-active' : undefined}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
