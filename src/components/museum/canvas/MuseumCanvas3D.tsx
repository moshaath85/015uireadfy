'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Color, PMREMGenerator, SRGBColorSpace, ACESFilmicToneMapping, PCFSoftShadowMap } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import GalleryHall from '../architecture/GalleryHall';
import { MuseumRendererConfig } from '../rendering/MuseumRendererConfig';
import { MuseumLightingRig } from '../rendering/MuseumLightingRig';
import { MUSEUM_RENDERING_CONFIG } from '../config/museum-rendering.config';
import MuseumCamera from '../navigation/MuseumCamera';
import { ROUTE_GRAPH, getConnectedNodes } from '../config/museum-routes.config';
import { DEFAULT_CAMERA, CAMERA_CONFIG, SCENE_BACKGROUND } from '../config/museum-navigation.config';

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const EXHIBITION_ORDER = ['aw-013', 'aw-128', 'aw-175', 'aw-029'];

export default function MuseumCanvas3D({ artworks }: { artworks: ArtworkData[] }) {
  const [mobile, setMobile] = useState(false);
  const [currentNode, setCurrentNode] = useState('entrance');
  const [targetNode, setTargetNode] = useState<string | null>(null);
  const [focusedArtwork, setFocusedArtwork] = useState<ArtworkData | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => { setMobile(window.innerWidth < 860 || 'ontouchstart' in window); }, []);

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash && ROUTE_GRAPH.nodes[hash]) {
      setCurrentNode(hash);
      setTargetNode(hash);
    } else if (hash && !ROUTE_GRAPH.nodes[hash]) {
      window.history.replaceState(null, '', '/museum');
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('museum-nav-hint')) setHint(false);
  }, []);

  const moveTo = useCallback((nodeId: string) => {
    if (nodeId === 'exit') { window.location.href = '/'; return; }
    if (!ROUTE_GRAPH.nodes[nodeId]) return;
    setTargetNode(nodeId);
    window.location.hash = nodeId;
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
    <>
    <div className="museum-3d-surface" style={{ position: 'fixed', inset: 0, background: SCENE_BACKGROUND, zIndex: 10, cursor: dragging ? 'grabbing' : 'grab', touchAction: mobile ? 'none' : 'auto' }}>
      <Canvas
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ position: DEFAULT_CAMERA.position as [number, number, number], fov: mobile ? CAMERA_CONFIG.mobileFov : CAMERA_CONFIG.desktopFov, near: 0.3, far: 50 }}
        dpr={MUSEUM_RENDERING_CONFIG.renderer.dpr}
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        onCreated={({ gl, scene }) => {
          scene.background = new Color(SCENE_BACKGROUND);
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.95;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
          (gl as typeof gl & { physicallyCorrectLights?: boolean }).physicallyCorrectLights = true;
          const pmrem = new PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          pmrem.dispose();
        }}
      >
        <Suspense fallback={null}>
          <MuseumRendererConfig />
          <MuseumLightingRig />
          <GalleryHall artworks={artworks} />
          <MuseumCamera targetNodeId={targetNode} onArrive={handleArrive} onDragState={setDragging} />
        </Suspense>
      </Canvas>
    </div>

    {/* Overlay UI outside canvas */}
    <div style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', padding: '0 1rem' }}>
      {connectedMarkers.map((node) => (
        <button key={node.id} onClick={() => moveTo(node.id)} className="museum-dest-marker" aria-label={node.label}>
          <span aria-hidden="true" /><small>{node.label}</small>
        </button>
      ))}
    </div>

    {focusedArtwork && (
      <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ background: 'rgba(0,0,0,.75)', color: '#fff', padding: '.6rem 1rem', fontSize: '.7rem', letterSpacing: '.04em', maxWidth: '400px' }}>
          <strong>{focusedArtwork.title}</strong> — {focusedArtwork.artist}, {focusedArtwork.year}<br />
          <span style={{ opacity: .6 }}>{focusedArtwork.medium} · {focusedArtwork.dimensions}</span>
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          <button onClick={() => navArtwork(-1)} disabled={focusedIdx <= 0} style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', opacity: focusedIdx <= 0 ? .3 : 1, minHeight: 44, minWidth: 44 }}>← Prev</button>
          <button onClick={() => navArtwork(1)} disabled={focusedIdx >= EXHIBITION_ORDER.length - 1} style={{ border: '1px solid rgba(255,255,255,.25)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', opacity: focusedIdx >= EXHIBITION_ORDER.length - 1 ? .3 : 1, minHeight: 44, minWidth: 44 }}>Next →</button>
          <button onClick={() => { setFocusedArtwork(null); moveTo(currentNode); }} style={{ border: '1px solid rgba(255,255,255,.3)', background: 'rgba(0,0,0,.5)', color: '#fff', padding: '.5rem .8rem', fontSize: '.6rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em', minHeight: 44, minWidth: 44 }}>Back</button>
        </div>
      </div>
    )}

    {hint && !mobile && (
      <div style={{ position: 'fixed', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30, color: 'rgba(255,255,255,.4)', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', pointerEvents: 'none' }}>
        Choose a point to move
      </div>
    )}

    <a href="/" style={{ position: 'fixed', top: '.8rem', right: '1rem', zIndex: 30, color: 'rgba(255,255,255,.25)', fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', padding: '.4rem' }}>Exit</a>
    </>
  );
}
