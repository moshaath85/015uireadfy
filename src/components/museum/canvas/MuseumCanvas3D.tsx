'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Color, Vector3 } from 'three';
import GalleryHall from '../architecture/GalleryHall';
import MuseumCamera from '../navigation/MuseumCamera';
import { ROUTE_GRAPH, getConnectedNodes, getAdjacentArtwork } from '../config/museum-routes.config';
import { DEFAULT_CAMERA, CAMERA_CONFIG, SCENE_BACKGROUND } from '../config/museum-navigation.config';

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const EXHIBITION_ORDER = ['aw-004', 'aw-128', 'aw-175', 'aw-029'];

export default function MuseumCanvas3D({ artworks }: { artworks: ArtworkData[] }) {
  const [mobile, setMobile] = useState(false);
  const [currentNode, setCurrentNode] = useState('entrance');
  const [targetNode, setTargetNode] = useState<string | null>(null);
  const [focusedArtwork, setFocusedArtwork] = useState<ArtworkData | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => { setMobile(window.innerWidth < 860 || 'ontouchstart' in window); }, []);

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash && ROUTE_GRAPH.nodes[hash]) {
      setCurrentNode(hash);
      setTargetNode(hash);
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('museum-nav-hint')) setHint(false);
  }, []);

  const moveTo = useCallback((nodeId: string) => {
    if (nodeId === 'exit') { window.location.href = '/'; return; }
    const node = ROUTE_GRAPH.nodes[nodeId];
    if (!node) return;
    setTargetNode(nodeId);
    if (typeof window !== 'undefined') window.location.hash = nodeId;
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('museum-nav-hint', '1');
    setHint(false);
    setFocusedArtwork(null);
  }, []);

  const handleArrive = useCallback(() => {
    setTargetNode(null);
    setCurrentNode(targetNode ?? currentNode);
    setHint(false);
  }, [targetNode, currentNode]);

  const connectedMarkers = useMemo(() => getConnectedNodes(currentNode), [currentNode]);

  const focusArtwork = useCallback((artwork: ArtworkData) => {
    setFocusedArtwork(artwork);
    const nodeWithArtwork = Object.values(ROUTE_GRAPH.nodes).find(n => n.artworkId === artwork.id);
    if (nodeWithArtwork) moveTo(nodeWithArtwork.id);
  }, [moveTo]);

  const navArtwork = useCallback((dir: 1 | -1) => {
    if (!focusedArtwork) return;
    const idx = EXHIBITION_ORDER.indexOf(focusedArtwork.id);
    const nextId = EXHIBITION_ORDER[idx + dir];
    const next = artworks.find(a => a.id === nextId);
    if (next) focusArtwork(next);
  }, [focusedArtwork, artworks, focusArtwork]);

  const focusedIdx = focusedArtwork ? EXHIBITION_ORDER.indexOf(focusedArtwork.id) : -1;

  return (
    <div className="museum-3d-surface" style={{ position: 'fixed', inset: 0, background: SCENE_BACKGROUND, zIndex: 10, cursor: dragging ? 'grabbing' : 'grab', touchAction: mobile ? 'none' : 'auto' }}>
      <Canvas
        shadows="soft"
        camera={{ position: DEFAULT_CAMERA.position as [number, number, number], fov: mobile ? CAMERA_CONFIG.mobileFov : CAMERA_CONFIG.desktopFov, near: 0.3, far: 50 }}
        dpr={mobile ? CAMERA_CONFIG.mobileDpr : CAMERA_CONFIG.desktopDpr}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.0 }}
        onCreated={({ scene }) => { scene.background = new Color(SCENE_BACKGROUND); }}
      >
        <Suspense fallback={null}>
          <GalleryHall artworks={artworks} />
          <MuseumCamera targetNodeId={targetNode} onArrive={handleArrive} onDragState={setDragging} />
        </Suspense>
      </Canvas>

      {/* Connected route markers */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none' }}>
        {connectedMarkers.map((node) => (
          <button
            key={node.id}
            onClick={() => moveTo(node.id)}
            className="museum-dest-marker"
            aria-label={node.label}
            style={{ pointerEvents: 'auto' }}
          >
            <span aria-hidden="true" />
            <small>{node.label}</small>
          </button>
        ))}
      </div>

      {/* Artwork focus info + navigation */}
      {focusedArtwork && (
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', gap: '1rem', alignItems: 'flex-end',
        }}>
          <div style={{
            background: 'rgba(0,0,0,.75)', color: '#fff', padding: '.6rem 1rem',
            fontSize: '.7rem', letterSpacing: '.04em', maxWidth: '400px',
          }}>
            <strong>{focusedArtwork.title}</strong> — {focusedArtwork.artist}, {focusedArtwork.year}<br />
            <span style={{ opacity: .6 }}>{focusedArtwork.medium} · {focusedArtwork.dimensions}</span>
          </div>
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button onClick={() => navArtwork(-1)} disabled={focusedIdx <= 0}
              style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', opacity: focusedIdx <= 0 ? .3 : 1, minHeight: 44, minWidth: 44 }}>← Prev</button>
            <button onClick={() => navArtwork(1)} disabled={focusedIdx >= EXHIBITION_ORDER.length - 1}
              style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', opacity: focusedIdx >= EXHIBITION_ORDER.length - 1 ? .3 : 1, minHeight: 44, minWidth: 44 }}>Next →</button>
            <button onClick={() => { setFocusedArtwork(null); moveTo(currentNode); }}
              style={{ border: '1px solid rgba(255,255,255,.3)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', minHeight: 44, minWidth: 44 }}>Back</button>
          </div>
        </div>
      )}

      {/* Mobile nav */}
      {mobile && (
        <div style={{
          position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {connectedMarkers.map((node) => (
            <button key={node.id} onClick={() => moveTo(node.id)} style={{
              padding: '.4rem .7rem', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(0,0,0,.3)',
              color: 'rgba(255,255,255,.5)', fontSize: '.6rem', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '.06em', borderRadius: 0, minHeight: 44, minWidth: 44,
            }}>{node.label}</button>
          ))}
        </div>
      )}

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
