'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface HeroSlide {
  id: string;
  slug: string;
  title: string;
  artist: string;
  spec: string;
  src: string;
  alt: string;
}

/** Chrome labels are passed in already translated — this component is client-side
    and has no access to the server language cookie. */
export interface HeroLabels {
  selectedWork: string;
  viewThisWork: string;
  navigation: string;
  show: string;
}

const INTERVAL = 6500;

export default function HeroRotator({ slides, labels }: { slides: HeroSlide[]; labels: HeroLabels }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides.length, paused]);

  if (!slides.length) return null;
  const current = slides[index];

  return (
    <section
      className="hp-hero"
      aria-label={labels.selectedWork}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hp-hero__type">
        <p className="hp-label">{labels.selectedWork}</p>

        {/* the caption cross-fades in step with the work */}
        <div className="hp-hero__cap" key={current.id}>
          <h1>{current.title}</h1>
          <div className="hp-hero__meta">
            <p className="hp-who">{current.artist}</p>
            {current.spec ? <p className="hp-spec">{current.spec}</p> : null}
          </div>
        </div>

        <Link className="hp-link" href={`/artworks/${current.slug}`}>
          {labels.viewThisWork} <span aria-hidden="true">↗</span>
        </Link>

        {slides.length > 1 ? (
          <div className="hp-hero__nav" role="group" aria-label={labels.navigation}>
            <span className="hp-hero__count">
              {String(index + 1).padStart(2, '0')} <i /> {String(slides.length).padStart(2, '0')}
            </span>
            <div className="hp-hero__dots">
              {slides.map((slide, i) => (
                <button
                  type="button"
                  key={slide.id}
                  className={i === index ? 'is-on' : undefined}
                  aria-label={`${labels.show} ${slide.title}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="hp-hero__art">
        {slides.map((slide, i) => (
          <Link
            className={`hp-slide${i === index ? ' is-on' : ''}`}
            href={`/artworks/${slide.slug}`}
            key={slide.id}
            aria-hidden={i !== index}
            tabIndex={i === index ? undefined : -1}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              /* every slide loads up front — a hidden lazy image would flash
                 blank the moment it rotates in */
              loading="eager"
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
