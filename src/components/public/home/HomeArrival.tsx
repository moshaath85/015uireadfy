'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* Pre-home cinematic arrival, per the original Gallery 015 benchmark.
   Image-only, calm cross-fade of real CMS-selected works, minimal identity,
   one ENTER control. Shown once per session; respects reduced motion. */
const STORAGE_KEY = 'gallery015-arrival-seen';
const INTERVAL = 5200;

interface ArrivalWork {
  src: string;
  alt: string;
}

interface HomeArrivalProps {
  works: ArrivalWork[];
  enterLabel?: string;
  onEnter: () => void;
}

export function HomeArrival({ works, enterLabel = 'Enter', onEnter }: HomeArrivalProps) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (works.length < 2 || exiting) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % works.length), INTERVAL);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [works.length, exiting]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const enter = useCallback(() => {
    setExiting(true);
    if (timer.current) clearInterval(timer.current);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setTimeout(onEnter, 500);
  }, [onEnter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  const current = works.length ? works[index % works.length] : null;

  return (
    <div className={`g-home-arrival${exiting ? ' is-exiting' : ''}`} role="status" aria-label="Gallery 015">
      {works.map((w, i) => (
        <figure
          key={w.src}
          className={`g-home-arrival__slide${i === index ? ' is-on' : ''}`}
          aria-hidden={i !== index}
        >
          <img src={w.src} alt={w.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
        </figure>
      ))}

      <div className={`g-home-arrival__identity${ready ? ' is-ready' : ''}`}>
        <p className="g-home-arrival__monogram">Gallery 015</p>
        <div className="g-home-arrival__hairline" aria-hidden="true" />
        <button type="button" className="g-home-arrival__enter" onClick={enter}>
          {enterLabel}
        </button>
      </div>
    </div>
  );
}
