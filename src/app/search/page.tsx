"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageProvider";

interface SearchResultItem {
  type: string;
  href: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  meta: string;
  metaAr: string;
  image: string | null;
}

const TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  artist: { en: "Artist", ar: "فنان" },
  artwork: { en: "Artwork", ar: "عمل فني" },
  collection: { en: "Collection", ar: "مجموعة" },
  exhibition: { en: "Exhibition", ar: "معرض" },
  project: { en: "Project", ar: "مشروع" },
  news: { en: "Journal", ar: "مقال" },
  publication: { en: "Publication", ar: "إصدار" },
  service: { en: "Service", ar: "خدمة" },
};

const S = {
  title: { ar: "بحث", en: "Search" },
  placeholder: { ar: "ابحث عن فنانين، أعمال، معارض…", en: "Search artists, artworks, exhibitions…" },
  noQuery: { ar: "ابدأ الكتابة للبحث في الموقع.", en: "Start typing to search the site." },
  noResults: { ar: "لا توجد نتائج مطابقة.", en: "No results match your query." },
  resultsFor: { ar: "نتائج عن", en: "Results for" },
  error: { ar: "حدث خطأ أثناء البحث.", en: "Something went wrong while searching." },
  searching: { ar: "جارٍ البحث…", en: "Searching…" },
  pressEnter: { ar: "اضغط Enter للبحث", en: "Press Enter to search" },
  clearSearch: { ar: "مسح البحث", en: "Clear search" },
  close: { ar: "إغلاق", en: "Close" },
  emptyPrompt: { ar: "جرّب البحث عن اسم فنان، معرض، أو مجموعة.", en: "Try searching for an artist, exhibition, or collection." },
};

export default function SearchPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const s = (k: keyof typeof S) => (ar ? S[k].ar : S[k].en);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (announcerRef.current) announcerRef.current.textContent = msg;
  }, []);

  const fetchResults = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setTotal(0);
        setSearched(false);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setTotal(data.total ?? 0);
        setSearched(true);
        setFocusedIndex(-1);
        announce(`${data.total} ${ar ? "نتيجة" : "result"}${data.total !== 1 ? "s" : ""}`);
      } catch {
        setError(true);
        setResults([]);
        announce(s("error"));
      } finally {
        setLoading(false);
      }
    },
    [lang, ar, s, announce],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length >= 2 && searched) {
      const timer = setTimeout(() => fetchResults(query), 300);
      return () => clearTimeout(timer);
    }
  }, [query, fetchResults, searched]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setSearched(false);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          return next;
        });
      } else if (e.key === "Enter" && !searched) {
        e.preventDefault();
        fetchResults(query);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setQuery("");
        setResults([]);
        setSearched(false);
        inputRef.current?.focus();
      }
    },
    [results.length, searched, fetchResults, query],
  );

  useEffect(() => {
    if (focusedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll("a");
      (items[focusedIndex] as HTMLElement)?.focus();
    }
  }, [focusedIndex]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setTotal(0);
    setSearched(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }, []);

  return (
    <main className="experience-index experience-index--search" role="search">
      <div ref={announcerRef} className="sr-only" role="status" aria-live="polite" />

      <header className="experience-index__intro">
        <p className="experience-kicker">{ar ? "غاليري ٠١٥" : "Gallery 015"}</p>
        <h1>{s("title")}</h1>
        <div className="g-search-input-wrap">
          <input
            ref={inputRef}
            type="search"
            className="g-search-input"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={s("placeholder")}
            aria-label={s("title")}
            autoComplete="off"
            maxLength={200}
          />
          {query && (
            <button type="button" className="g-search-clear" onClick={clearSearch} aria-label={s("clearSearch")}>
              ×
            </button>
          )}
        </div>
      </header>

      {loading && (
        <p className="g-search-status" aria-busy="true">
          {s("searching")}
        </p>
      )}

      {error && (
        <p className="g-search-status g-search-status--error" role="alert">
          {s("error")}
        </p>
      )}

      {!loading && !error && searched && query.length >= 2 && results.length === 0 && (
        <div className="g-search-empty">
          <p className="experience-empty">{s("noResults")}</p>
          <p className="g-search-empty-hint">{s("emptyPrompt")}</p>
        </div>
      )}

      {!loading && !error && !searched && (
        <p className="g-search-status">{s("noQuery")}</p>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="g-search-count" role="status" aria-live="polite">
            {total} {s("resultsFor")} &ldquo;{query}&rdquo;
          </p>
          <ul ref={resultsRef} className="g-search-results" role="listbox" aria-label={s("title")}>
            {results.map((item, index) => (
              <li key={`${item.type}-${item.href}`} role="option" aria-selected={index === focusedIndex}>
                <Link
                  href={item.href}
                  className={`g-search-result-item${index === focusedIndex ? " g-search-result-item--focused" : ""}`}
                >
                  <span className="g-search-result-type">
                    {ar ? (TYPE_LABELS[item.type]?.ar ?? item.type) : (TYPE_LABELS[item.type]?.en ?? item.type)}
                  </span>
                  <strong className="g-search-result-title">
                    {ar && item.titleAr ? item.titleAr : item.title}
                  </strong>
                  {(ar ? item.metaAr || item.meta : item.meta || item.metaAr) && (
                    <span className="g-search-result-meta">{ar ? item.metaAr || item.meta : item.meta || item.metaAr}</span>
                  )}
                  {(ar ? item.descriptionAr || item.description : item.description || item.descriptionAr) && (
                    <span className="g-search-result-desc">
                      {ar ? item.descriptionAr || item.description : item.description || item.descriptionAr}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <style jsx>{`
        .g-search-input-wrap { position: relative; margin-top: 1.5rem; }
        .g-search-input { width: 100%; padding: 1rem 3rem 1rem 1.25rem; font-size: 1.125rem; border: 1px solid var(--g-hair); background: var(--g-paper); color: var(--g-ink); border-radius: 0; appearance: none; }
        .g-search-input:focus { outline: 2px solid var(--g-ink); outline-offset: 2px; }
        .g-search-clear { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--g-ink); padding: 0.25rem; line-height: 1; }
        .g-search-status { font-size: 1rem; padding: 2rem 0; color: var(--g-ink); opacity: 0.7; }
        .g-search-status--error { color: #b91c1c; opacity: 1; }
        .g-search-count { font-size: 0.875rem; margin: 1.5rem 0 1rem; color: var(--g-ink); opacity: 0.6; }
        .g-search-results { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
        .g-search-result-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 1.25rem 1rem; border-bottom: 1px solid var(--g-hair); text-decoration: none; color: var(--g-ink); transition: background 0.15s; }
        .g-search-result-item:hover, .g-search-result-item--focused { background: var(--g-hair); }
        .g-search-result-type { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; }
        .g-search-result-title { font-size: 1.125rem; }
        .g-search-result-meta { font-size: 0.875rem; opacity: 0.6; }
        .g-search-result-desc { font-size: 0.9375rem; opacity: 0.75; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .g-search-empty { text-align: center; padding: 3rem 1rem; }
        .g-search-empty-hint { font-size: 0.9375rem; opacity: 0.6; margin-top: 0.5rem; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
        .experience-index { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .experience-index__intro { margin-bottom: 2rem; }
        [dir="rtl"] .g-search-input { padding: 1rem 1.25rem 1rem 3rem; }
        [dir="rtl"] .g-search-clear { right: auto; left: 0.75rem; }
        @media (max-width: 640px) {
          .experience-index { padding: 1.5rem 1rem 3rem; }
        }
      `}</style>
    </main>
  );
}
