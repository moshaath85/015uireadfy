'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Arms the viewport reveal.
 *
 * The markup ships `data-reveal` (or `data-reveal-group`) with no value, and
 * the stylesheet only styles the `pending` and `in` states — so with no
 * JavaScript, a failed hydration, or reduced motion, every block is simply
 * visible. Nothing here can hide content.
 *
 * Only blocks that begin **entirely below the fold** are armed, so the first
 * screen is never animated and never delayed: the hero and the work on it are
 * painted at full opacity by the server and left alone.
 */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ATTRIBUTES = ['data-reveal', 'data-reveal-group'] as const;
    const settle = (element: Element) => {
      ATTRIBUTES.forEach((attribute) => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, 'in');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          settle(entry.target);
          observer.unobserve(entry.target);
        });
      },
      /* A block announces itself once its top edge is properly into the
         viewport, not the instant its first pixel clears the fold. */
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    /* Only ever touches blocks still carrying the empty attribute, so this is
       safe to run as many times as the page changes shape. */
    const arm = () => {
      const armed: Element[] = [];
      document.querySelectorAll('[data-reveal=""], [data-reveal-group=""]').forEach((element) => {
        const { top } = element.getBoundingClientRect();
        /* Anything already on screen stays exactly as the server drew it. */
        if (top < window.innerHeight) return;
        ATTRIBUTES.forEach((attribute) => {
          if (element.hasAttribute(attribute)) element.setAttribute(attribute, 'pending');
        });
        armed.push(element);
      });
      armed.forEach((element) => observer.observe(element));
    };

    /* Images stream in after hydration and move everything below them, and a
       route's real content replaces its loading skeleton after this component
       has already mounted. Arming on the next frame measures a settled page;
       watching for further mutations catches the content that arrives late,
       and the filtered results on /artworks. */
    let frame = requestAnimationFrame(arm);
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(arm);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    /* The 8% inset means a block that comes to rest inside the last sliver of
       the viewport never crosses the line. On this site the footer always
       follows, so it does not happen — but a page that ended on a revealed
       block would strand it at 97% and 8px short, and content must never be
       left in the pending state. At the end of the document, everything
       still waiting is simply settled. */
    const settleAtEnd = () => {
      const end = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (!end) return;
      document.querySelectorAll('[data-reveal="pending"], [data-reveal-group="pending"]').forEach((element) => {
        settle(element);
        observer.unobserve(element);
      });
    };
    window.addEventListener('scroll', settleAtEnd, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', settleAtEnd);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
