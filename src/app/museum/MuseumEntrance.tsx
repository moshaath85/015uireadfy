'use client';

/* A quiet, instant entry screen for the 3D museum. It renders the moment the
   page opens — before the ~1.4MB three.js bundle arrives — so the visitor sees
   an institutional title rather than a blank "Preparing…" state while the
   scene initialises. It stays until the canvas signals it is ready. */
export function MuseumEntrance({ onEnter }: { onEnter?: () => void }) {
  return (
    <div
      className="museum-entrance"
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '.68rem',
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.42)',
          margin: 0,
        }}
      >
        Gallery 015
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
          lineHeight: 0.95,
          letterSpacing: '-.05em',
          margin: 0,
          maxWidth: '14ch',
        }}
      >
        The Museum
      </h1>
      <button
        type="button"
        onClick={onEnter}
        style={{
          marginTop: '1rem',
          minHeight: '44px',
          padding: '10px 24px',
          border: '1px solid rgba(255,255,255,.5)',
          background: 'transparent',
          color: 'rgba(255,255,255,.85)',
          font: 'inherit',
          fontSize: '.72rem',
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'background .2s ease, color .2s ease',
        }}
      >
        Enter the museum
      </button>
    </div>
  );
}
