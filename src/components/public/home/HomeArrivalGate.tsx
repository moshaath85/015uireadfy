'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { HomeArrival } from './HomeArrival';

const STORAGE_KEY = 'gallery015-arrival-seen';

/* Wraps the homepage: shows the pre-home arrival once per session, then
   renders the real homepage underneath. Works receive the real CMS-selected
   hero media. */
export function HomeArrivalGate({ works, enterLabel, children }: {
  works: { src: string; alt: string }[];
  enterLabel?: string;
  children: ReactNode;
}) {
  const [showArrival, setShowArrival] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShowArrival(!seen && !reduced && works.length > 0);
    setReady(true);
  }, [works.length]);

  if (!ready) return null;

  if (showArrival) {
    return (
      <HomeArrival
        works={works}
        enterLabel={enterLabel}
        onEnter={() => setShowArrival(false)}
      />
    );
  }

  return <>{children}</>;
}
