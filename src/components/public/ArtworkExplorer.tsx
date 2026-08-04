'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EditorialCard, type EditorialIndexItem } from './EditorialExperience';

export interface ExplorerWork extends EditorialIndexItem {
  /** stable id used for React keys and for the artist facet */
  id: string;
  artistId: string;
  /** normalised medium — the facet value, not the display string */
  mediumKey: string;
  mediumLabel: string;
  /** 0 means the year is not recorded; those works are never matched by a year facet */
  year: number;
  /** everything a visitor might type, pre-lowercased on the server */
  haystack: string;
}

export interface ExplorerFacets {
  artists: Array<{ id: string; label: string; count: number }>;
  mediums: Array<{ key: string; label: string; count: number }>;
  /** year 0 is the "Undated" bucket; its label is translated on the server */
  years: Array<{ year: number; label: string; count: number }>;
}

export interface ExplorerLabels {
  search: string;
  searchPlaceholder: string;
  artist: string;
  medium: string;
  year: string;
  all: string;
  clear: string;
  loadMore: string;
  showing: string;
  works: string;
  emptyTitle: string;
  emptyBody: string;
  filters: string;
}

interface Filters {
  q: string;
  artist: string;
  medium: string;
  year: string;
}

const EMPTY: Filters = { q: '', artist: '', medium: '', year: '' };

/* A batch is a screenful of works, not a page of results: 24 fills a
   two-column desktop grid roughly six rows deep, 14 does the same on one
   column. Read before paint so a phone never lays out 24 cards it is about
   to discard. */
const BATCH_DESKTOP = 24;
const BATCH_MOBILE = 14;

function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    /* Arabic diacritics and the tatweel are typed inconsistently or not at
       all, and none of them distinguish one work from another. */
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .trim();
}

export default function ArtworkExplorer({
  eyebrow,
  title,
  introduction,
  works,
  facets,
  labels,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  works: ExplorerWork[];
  facets: ExplorerFacets;
  labels: ExplorerLabels;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [batch, setBatch] = useState(BATCH_DESKTOP);
  const [visible, setVisible] = useState(BATCH_DESKTOP);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);

  /* Deep links carry filter state, but the server renders the unfiltered
     archive so the markup is cacheable and correct without JavaScript.
     Reading the query before paint reconciles the two without a flash. */
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Filters = {
      q: params.get('q') ?? '',
      artist: params.get('artist') ?? '',
      medium: params.get('medium') ?? '',
      year: params.get('year') ?? '',
    };
    const size = window.matchMedia('(max-width: 760px)').matches ? BATCH_MOBILE : BATCH_DESKTOP;
    setBatch(size);
    setVisible(size);
    if (next.q || next.artist || next.medium || next.year) setFilters(next);
  }, []);

  /* replaceState rather than the router: this page is force-dynamic, so a
     router navigation would round-trip to the server on every keystroke. */
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.artist) params.set('artist', filters.artist);
    if (filters.medium) params.set('medium', filters.medium);
    if (filters.year) params.set('year', filters.year);
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }, [filters]);

  const results = useMemo(() => {
    const needle = normalise(filters.q);
    const terms = needle ? needle.split(/\s+/).filter(Boolean) : [];
    return works.filter((work) => {
      if (filters.artist && work.artistId !== filters.artist) return false;
      if (filters.medium && work.mediumKey !== filters.medium) return false;
      if (filters.year && String(work.year) !== filters.year) return false;
      if (terms.length && !terms.every((term) => work.haystack.includes(term))) return false;
      return true;
    });
  }, [works, filters]);

  const set = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setVisible(batch);
  }, [batch]);

  const clear = useCallback(() => {
    setFilters(EMPTY);
    setVisible(batch);
  }, [batch]);

  const active = filters.q !== '' || filters.artist !== '' || filters.medium !== '' || filters.year !== '';
  const shown = results.slice(0, visible);
  const remaining = results.length - shown.length;

  const loadMore = () => {
    /* Anchor on the last card already on screen so the eye is not thrown to
       the bottom of the document when the next batch lands. */
    const anchor = gridRef.current?.lastElementChild as HTMLElement | undefined;
    const top = anchor?.getBoundingClientRect().top;
    setVisible((current) => current + batch);
    if (anchor && typeof top === 'number') {
      requestAnimationFrame(() => {
        const delta = anchor.getBoundingClientRect().top - top;
        if (delta) window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior });
      });
    }
  };

  return (
    <main className="experience-index experience-index--grid">
      <header className="experience-index__intro">
        <p className="experience-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>

      <section className="archive-filter" aria-label={labels.filters}>
        <div className="archive-filter__controls">
          <div className="archive-filter__field archive-filter__field--search">
            <label htmlFor="archive-q">{labels.search}</label>
            <input
              id="archive-q"
              type="search"
              autoComplete="off"
              value={filters.q}
              placeholder={labels.searchPlaceholder}
              onChange={(event) => set({ q: event.target.value })}
            />
          </div>

          <div className="archive-filter__field">
            <label htmlFor="archive-artist">{labels.artist}</label>
            <select id="archive-artist" value={filters.artist} onChange={(event) => set({ artist: event.target.value })}>
              <option value="">{labels.all}</option>
              {facets.artists.map((artist) => (
                <option value={artist.id} key={artist.id}>{artist.label} ({artist.count})</option>
              ))}
            </select>
          </div>

          {facets.mediums.length > 1 ? (
            <div className="archive-filter__field">
              <label htmlFor="archive-medium">{labels.medium}</label>
              <select id="archive-medium" value={filters.medium} onChange={(event) => set({ medium: event.target.value })}>
                <option value="">{labels.all}</option>
                {facets.mediums.map((medium) => (
                  <option value={medium.key} key={medium.key}>{medium.label} ({medium.count})</option>
                ))}
              </select>
            </div>
          ) : null}

          {facets.years.length > 1 ? (
            <div className="archive-filter__field">
              <label htmlFor="archive-year">{labels.year}</label>
              <select id="archive-year" value={filters.year} onChange={(event) => set({ year: event.target.value })}>
                <option value="">{labels.all}</option>
                {facets.years.map((entry) => (
                  <option value={String(entry.year)} key={entry.year}>{entry.label} ({entry.count})</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="archive-filter__status">
          <p aria-live="polite">
            <span className="archive-filter__count">{results.length}</span> {labels.works}
            {results.length !== works.length ? <span className="archive-filter__of"> / {works.length}</span> : null}
          </p>
          {active ? (
            <button type="button" className="archive-filter__clear" onClick={clear}>{labels.clear}</button>
          ) : null}
        </div>
      </section>

      {shown.length ? (
        <>
          <div className="experience-index__grid" ref={gridRef}>
            {shown.map((work, index) => (
              <EditorialCard item={work} eager={index < 2} key={work.id} />
            ))}
          </div>
          {remaining > 0 ? (
            <div className="archive-more">
              <button type="button" className="archive-more__button" onClick={loadMore}>
                {labels.loadMore} <span aria-hidden="true">↓</span>
              </button>
              <p className="archive-more__note">
                {labels.showing} {shown.length} / {results.length}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="archive-empty">
          <h2>{labels.emptyTitle}</h2>
          <p>{labels.emptyBody}</p>
          <button type="button" className="archive-filter__clear" onClick={clear}>{labels.clear}</button>
        </div>
      )}
    </main>
  );
}
