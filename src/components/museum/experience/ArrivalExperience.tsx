'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { visitorSession } from '@/lib/gallery-os/visitor-session';
import { accessibilityEngine } from '@/lib/gallery-os/engines/accessibility/accessibility-engine';

const STORAGE_KEY = 'gallery-os-arrival-seen';
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";

type Phase = 'init' | 'name' | 'line' | 'work' | 'ready' | 'exit';

interface Props {
  workTitle: string;
  workArtist: string;
  workMeta: string;
  workImageUrl: string;
  workImageAlt: string;
  onComplete: () => void;
}

export default function ArrivalExperience({
  workTitle,
  workArtist,
  workMeta,
  workImageUrl,
  workImageAlt,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>('init');
  const [exiting, setExiting] = useState(false);
  const started = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reducedMotion = accessibilityEngine.getPreferences().reducedMotion;

  const complete = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    sessionStorage.setItem(STORAGE_KEY, '1');
    onComplete();
    setExiting(true);
    setPhase('exit');
  }, [onComplete]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const hasVisited = sessionStorage.getItem(STORAGE_KEY) === '1'
      || visitorSession.isReturning();

    if (reducedMotion) {
      complete();
      return;
    }

    if (hasVisited) {
      setPhase('work');
      timerRef.current.push(setTimeout(() => complete(), 500));
      return;
    }

    const add = (fn: () => void, ms: number) => {
      timerRef.current.push(setTimeout(fn, ms));
    };

    add(() => setPhase('name'), 400);
    add(() => setPhase('line'), 900);
    add(() => setPhase('work'), 1400);
    add(() => complete(), 2500);

    return () => timerRef.current.forEach(clearTimeout);
  }, [reducedMotion, complete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        complete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [complete]);

  if (exiting && phase === 'exit') {
    return (
      <div className="g-arrival is-exiting" aria-hidden="true">
        <div className="g-arrival__work is-visible">
          <figure className="g-arrival__plate">
            <img src={workImageUrl} alt={workImageAlt} className="g-arrival__image" />
          </figure>
        </div>
      </div>
    );
  }

  const p = phase as string;

  return (
    <div
      className="g-arrival"
      role="status"
      aria-label={`Gallery 015 — ${workTitle} by ${workArtist}`}
      onClick={complete}
    >
      {p === 'init' && <div className="g-arrival__void" aria-hidden="true" />}

      {p !== 'init' && (
        <p
          className={`g-arrival__monogram${p === 'line' || p === 'work' || p === 'ready' ? ' is-done' : ''}`}
          style={{ fontFamily: SERIF }}
        >
          Gallery 015
        </p>
      )}

      {(p === 'line' || p === 'work' || p === 'ready') && (
        <div className={`g-arrival__hairline${p === 'work' || p === 'ready' ? ' is-done' : ''}`} aria-hidden="true" />
      )}

      {(p === 'work' || p === 'ready') && (
        <div className={`g-arrival__work${p === 'ready' ? ' is-visible' : ''}`}>
          <figure className="g-arrival__plate">
            <img
              src={workImageUrl}
              alt={workImageAlt}
              className="g-arrival__image"
              fetchPriority="high"
              decoding="async"
            />
          </figure>

          <div className={p === 'ready' ? 'g-arrival__meta is-visible' : 'g-arrival__meta'} style={{ fontFamily: SERIF }}>
            <h1 className="g-arrival__title">{workTitle}</h1>
            <p className="g-arrival__artist">{workArtist}</p>
            <p className="g-arrival__spec">{workMeta}</p>
          </div>

          <button
            type="button"
            className="g-arrival__enter"
            onClick={(e) => { e.stopPropagation(); complete(); }}
          >
            Enter the museum
          </button>
        </div>
      )}
    </div>
  );
}
