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
  const [layout, setLayout] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const gridRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);

  /* The archive renders as independent vertical lanes (no shared grid row, so
     no blank space) on desktop (3 lanes) and tablet (2 lanes), and as one
     natural ordered stack on mobile (read order 1,2,3,4,5,6). */
  useEffect(() => {
    const resolve = () => {
      const w = window.innerWidth;
      if (w < 768) setLayout('mobile');
      else if (w < 1200) setLayout('tablet');
      else setLayout('desktop');
    };
    resolve();
    window.addEventListener('resize', resolve);
    return () => window.removeEventListener('resize', resolve);
  }, []);

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

  /* The lane width the estimator targets. Re-measured on resize (the lanes
     container width) so the estimate tracks the real rendered lane width at
     every breakpoint instead of a hard-coded guess. */
  const [laneW, setLaneW] = useState(400);
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || layout === 'mobile') return;
    const lane = el.querySelector('.experience-index__lane');
    if (!lane) return;
    const update = () => setLaneW(Math.round(lane.getBoundingClientRect().width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(lane);
    return () => ro.disconnect();
  }, [layout]);

  /* Deterministic height-aware lane balancing. Each artwork (in original order)
     is assigned to the currently shortest lane, so no shared grid row and no
     modulo imbalance: a tall work lands in the lane that is lowest so far, and
     the three columns end at similar heights without giant accidental voids.

     The estimated card height models every block of the card: the image rendered
     from its real width/height ratio at the lane's inner width, plus the plate
     padding/border, the kicker, the title (wrapped to line count at the lane
     width), the meta, the description (wrapped), the View link, and the fixed
     inter-card gap. Assignment is deterministic and never reorders items inside
     a lane. Mobile renders the flat ordered list instead. */
  const lanes = useMemo(() => {
    if (layout === 'mobile') return [];
    const laneCount = layout === 'desktop' ? 3 : 2;
    const laneHeights = Array(laneCount).fill(0);
    const out: ExplorerWork[][] = Array.from({ length: laneCount }, () => []);

    /* Real CSS frame constants (calibrated against the rendered plate at 1440
       and 1024): plate padding 1.2vw (capped 20px), 1px border each side, the
       figure→copy gap 1.2vw (capped 1.1rem), the copy row gap 0.35rem, the
       copy top padding 0.25rem, and line heights for each block. The image is
       width 100% of the plate interior and capped at 78vh. */
    const PLATE_BORDER = 2;
    const IMG_MAX_H = Math.round(0.78 * (typeof window !== 'undefined' ? window.innerHeight : 900));
    const COPY_GAP = 5.6; // 0.35rem
    const COPY_PT = 4;    // 0.25rem
    const TITLE_LH = 37;  // h2 line height
    const SMALL_LH = 20;  // kicker / meta / view nominal line
    const DESC_LH = 24;   // description line height
    const charsPerLine = (laneWidth: number) => Math.max(6, Math.floor(laneWidth / 13));
    const descPerLine = (laneWidth: number) => Math.max(10, Math.floor(laneWidth / 8));
    const linesOf = (text: string | undefined, perLine: number) => {
      if (!text) return 0;
      return Math.max(1, Math.ceil(text.length / perLine));
    };

    const estHeight = (work: ExplorerWork, laneWidth: number) => {
      const PLATE_PAD = Math.min(20, Math.max(10, Math.round(laneWidth * 0.018)));
      const CARD_GAP = Math.round(laneWidth * 0.2); // ~6vw inter-card gap in a lane
      const FIG_GAP = Math.min(17.6, Math.max(14.4, laneWidth * 0.04)); // figure→copy
      const w = work.image?.width || 3;
      const h = work.image?.height || 4;
      const inner = Math.max(1, laneWidth - PLATE_PAD * 2 - PLATE_BORDER);
      const imgH = Math.min(inner * (h / w), IMG_MAX_H);
      const figureH = imgH + PLATE_PAD * 2 + PLATE_BORDER;
      const kicker = work.kicker ? SMALL_LH : 0;
      const title = linesOf(work.title, charsPerLine(laneWidth)) * TITLE_LH;
      const meta = work.meta ? SMALL_LH : 0;
      const desc = linesOf(work.description, descPerLine(laneWidth)) * DESC_LH;
      const view = SMALL_LH;
      const rows = [kicker, title, meta, desc, view].filter((v) => v > 0).length;
      const copy = COPY_PT + kicker + title + meta + desc + view + (rows > 0 ? (rows - 1) * COPY_GAP : 0);
      return figureH + FIG_GAP + copy + CARD_GAP;
    };

    const laneWidth = laneW || (layout === 'desktop' ? 400 : 470);
    shown.forEach((work) => {
      let target = 0;
      for (let i = 1; i < laneCount; i++) if (laneHeights[i] < laneHeights[target]) target = i;
      out[target].push(work);
      laneHeights[target] += estHeight(work, laneWidth);
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, layout, laneW]);

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
          {/* Desktop/tablet: independent vertical lanes. Mobile: one ordered
              stack. Rendering one or the other (not both) keeps the DOM clean. */}
          {layout === 'mobile' ? (
            <div className="experience-index__grid" ref={gridRef}>
              {shown.map((work, index) => (
                <EditorialCard item={work} eager={index < 2} key={work.id} />
              ))}
            </div>
          ) : (
            <div className="experience-index__lanes" ref={gridRef} data-lanes={layout}>
              {lanes.map((lane, laneIndex) => (
                <div className="experience-index__lane" key={laneIndex}>
                  {lane.map((work, i) => (
                    <EditorialCard item={work} eager={laneIndex === 0 && i < 1} key={work.id} />
                  ))}
                </div>
              ))}
            </div>
          )}
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
