'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Color, Vector3 } from 'three';
import GalleryHall from './GalleryHall';
import MuseumCamera, { DESTINATIONS } from './MuseumCamera';
import FloorClick from './FloorClick';

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

export default function MuseumCanvas3D({ artworks }: { artworks: ArtworkData[] }) {
  const [mobile, setMobile] = useState(false);
  const [target, setTarget] = useState<Vector3 | null>(null);
  const [focused, setFocused] = useState<ArtworkData | null>(null);
  const [hint, setHint] = useState(true);
  const [dragging, setDragging] = useState(false);

  useEffect(() => { setMobile(window.innerWidth < 860 || 'ontouchstart' in window); }, []);

  // First-time guidance
  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return;
    const seen = sessionStorage.getItem('museum-nav-hint');
    if (seen) setHint(false);
  }, []);

  const navigate = useCallback((pos: Vector3) => {
    setTarget(pos);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('museum-nav-hint', '1');
  }, []);

  const goTo = useCallback((destId: string) => {
    const d = DESTINATIONS.find((x) => x.id === destId);
    if (d) navigate(new Vector3(...d.position));
    if (destId === 'exit') window.location.href = '/';
  }, [navigate]);

  const handleComplete = useCallback(() => {
    setTarget(null);
    setHint(false);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('museum-nav-hint', '1');
  }, []);

  return (
    <div className="museum-3d-surface" style={{ position: 'fixed', inset: 0, background: '#bbb5a8', zIndex: 10, cursor: dragging ? 'grabbing' : 'grab', touchAction: mobile ? 'none' : 'auto' }}>
      <Canvas
        shadows="soft"
        camera={{ position: [0, 1.68, 7.5], fov: mobile ? 60 : 52, near: 0.3, far: 50 }}
        dpr={[1, mobile ? 1.2 : 1.5]}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.0 }}
        onCreated={({ scene }) => { scene.background = new Color('#bbb5a8'); }}
      >
        <Suspense fallback={null}>
          <GalleryHall artworks={artworks} />
          <FloorClick onNavigate={navigate} />
          <MuseumCamera target={target} onArrive={handleComplete} onDragState={setDragging} />
        </Suspense>
      </Canvas>

      {/* Destination markers — HTML overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none' }}>
        {DESTINATIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => goTo(d.id)}
            className="museum-dest-marker"
            aria-label={d.label}
            style={{ pointerEvents: 'auto' }}
          >
            <span aria-hidden="true" />
            <small>{d.label}</small>
          </button>
        ))}
      </div>

      {/* Artwork focus info */}
      {focused && (
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', gap: '1rem', alignItems: 'center',
        }}>
          <div style={{
            background: 'rgba(0,0,0,.7)', color: '#fff', padding: '.6rem 1rem',
            fontSize: '.7rem', letterSpacing: '.06em', maxWidth: '500px',
          }}>
            <strong>{focused.title}</strong> — {focused.artist}, {focused.year}<br />
            <span style={{ opacity: .6 }}>{focused.medium} · {focused.dimensions}</span>
          </div>
          <button onClick={() => setFocused(null)} style={{
            border: '1px solid rgba(255,255,255,.3)', background: 'rgba(0,0,0,.5)',
            color: '#fff', padding: '.5rem .8rem', fontSize: '.65rem', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '.08em',
          }}>Back</button>
        </div>
      )}

      {/* Mobile nav */}
      {mobile && (
        <div style={{
          position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {DESTINATIONS.slice(0, 5).map((d) => (
            <button key={d.id} onClick={() => goTo(d.id)} style={{
              padding: '.4rem .7rem', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(0,0,0,.3)',
              color: 'rgba(255,255,255,.5)', fontSize: '.6rem', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '.06em', borderRadius: 0, minHeight: 44, minWidth: 44,
            }}>{d.label}</button>
          ))}
        </div>
      )}

      {/* Hint */}
      {hint && !mobile && (
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          color: 'rgba(255,255,255,.4)', fontSize: '.65rem', letterSpacing: '.1em',
          textTransform: 'uppercase', pointerEvents: 'none',
        }}>
          Choose a point to move
        </div>
      )}

      <a href="/" style={{
        position: 'absolute', bottom: '.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
        color: 'rgba(255,255,255,.2)', fontSize: '.5rem', letterSpacing: '.12em',
        textTransform: 'uppercase', textDecoration: 'none',
      }}>Exit Museum</a>
    </div>
  );
}
