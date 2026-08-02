'use client';

import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import AutoArtworkFrame from '../artwork/AutoArtworkFrame';
import { ROOM, EYE_LEVEL } from '../config/museum-room.config';
import { BACK_WALL_PLACEMENTS, LEFT_WALL_PLACEMENTS, RIGHT_WALL_PLACEMENTS } from '../config/museum-artworks.config';

RectAreaLightUniformsLib.init();

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const W = ROOM.width; const H = ROOM.height; const D = ROOM.depth;
const EYE = EYE_LEVEL;
const WT = 0.22; // wall thickness — architectural
const SG = 0.012; // shadow gap

// Materials
const WALL_COLOR = '#d5d0c6';
const WALL_ROUGH = 0.72;
const FLOOR_COLOR = '#2f2c27';
const FLOOR_ROUGH = 0.4;
const CEILING_COLOR = '#e8e3d9';
const COVE_WIDTH = 0.55;

function WallBox({ width, height, position, rotation }: {
  width: number; height: number; position: [number, number, number]; rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={[width, height, WT]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={WALL_ROUGH} />
    </mesh>
  );
}

function genPlasterTex(): CanvasTexture {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 0.985 + Math.random() * 0.02;
    img.data[i] = 0.78 * 255 * n; img.data[i + 1] = 0.76 * 255 * n;
    img.data[i + 2] = 0.72 * 255 * n; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const big = document.createElement('canvas'); big.width = 1024; big.height = 1024;
  const bctx = big.getContext('2d')!; bctx.imageSmoothingEnabled = true;
  bctx.drawImage(c, 0, 0, 1024, 1024);
  const t = new CanvasTexture(big); t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(3, 3); t.colorSpace = SRGBColorSpace;
  return t;
}

function genFloorTex(): CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#3a3630'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 256; const y = Math.random() * 256;
    const s = Math.random() * 0.015;
    ctx.fillStyle = `rgba(${180+Math.random()*40},${170+Math.random()*30},${155+Math.random()*25},${s})`;
    ctx.beginPath(); ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2); ctx.fill();
  }
  const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(10, 20); t.colorSpace = SRGBColorSpace;
  return t;
}

function AccentLight({ position, rotation, width, height, intensity }: {
  position: [number, number, number]; rotation: [number, number, number]; width: number; height: number; intensity: number;
}) {
  return <rectAreaLight position={position} rotation={rotation} width={width} height={height} intensity={intensity} color="#fff7e9" />;
}

export default function GalleryHall({ artworks }: { artworks: ArtworkData[] }) {
  const wallTex = useMemo(() => genPlasterTex(), []);
  const floorTex = useMemo(() => genFloorTex(), []);
  const all = artworks.slice(0, 4);
  const back = all.slice(0, 2);
  const left = all.slice(2, 3);
  const right = all.slice(3, 4);

  const hw = W / 2; const hd = D / 2;
  const wy = H / 2;

  return (
    <group>
      {/* Floor — recessed for shadow gap */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SG, 0]} receiveShadow>
        <planeGeometry args={[W - SG * 2, D + 8]} />
        <meshStandardMaterial map={floorTex} roughness={FLOOR_ROUGH} metalness={0.02} color={FLOOR_COLOR} />
      </mesh>

      {/* Shadow gap — dark strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[W + 0.2, D + 8.2]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>

      {/* Ceiling slab */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H - 0.15, 0]}>
        <planeGeometry args={[W + 1, D + 1]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.92} />
      </mesh>

      {/* Back wall — two segments with door opening */}
      <WallBox width={3.5} height={H} position={[-3.25, wy, -hd]} />
      <WallBox width={3.5} height={H} position={[3.25, wy, -hd]} />
      {/* Door header */}
      <WallBox width={2.6} height={0.25} position={[0, H - 0.5, -hd]} />

      {/* Left wall */}
      <WallBox width={D} height={H} position={[-hw - WT / 2, wy, 0]} rotation={[0, Math.PI / 2, 0]} />
      {/* Right wall */}
      <WallBox width={D} height={H} position={[hw + WT / 2, wy, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Artworks */}
      {back.length > 0 && (
        <group position={[0, 0, -hd + WT / 2]}>
          {back.map((w, i) => {
            const p = BACK_WALL_PLACEMENTS[i] ?? BACK_WALL_PLACEMENTS[0];
            return (
              <AutoArtworkFrame key={w.id} imageUrl={w.imageUrl}
                position={[p.position[0], EYE, p.position[2]]} title={w.title} artist={w.artist}
                meta={[w.year, w.medium, w.dimensions].filter(Boolean).join(' · ')}
                physicalDimensions={w.dimensions} hero={p.hero} />
            );
          })}
        </group>
      )}
      {left.length > 0 && (
        <group position={[-hw - WT / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <AutoArtworkFrame imageUrl={left[0].imageUrl}
            position={[LEFT_WALL_PLACEMENTS[0].position[0], EYE, LEFT_WALL_PLACEMENTS[0].position[2]]}
            title={left[0].title} artist={left[0].artist}
            meta={[left[0].year, left[0].medium, left[0].dimensions].filter(Boolean).join(' · ')}
            physicalDimensions={left[0].dimensions} />
        </group>
      )}
      {right.length > 0 && (
        <group position={[hw + WT / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <AutoArtworkFrame imageUrl={right[0].imageUrl}
            position={[RIGHT_WALL_PLACEMENTS[0].position[0], EYE, RIGHT_WALL_PLACEMENTS[0].position[2]]}
            title={right[0].title} artist={right[0].artist}
            meta={[right[0].year, right[0].medium, right[0].dimensions].filter(Boolean).join(' · ')}
            physicalDimensions={right[0].dimensions} />
        </group>
      )}

      {/* Lighting */}
      <hemisphereLight args={["#fff9ef", "#555045", 0.85]} />
      <ambientLight intensity={0.42} color="#faf6ed" />

      {/* Cove — hidden in ceiling recess, washing walls */}
      <AccentLight position={[0, H - 0.08, -hd + 0.1]} rotation={[-0.3, 0, 0]} width={W - 2} height={COVE_WIDTH * 0.7} intensity={1.6} />
      <AccentLight position={[-hw + 0.1, H - 0.08, 0]} rotation={[-0.3, -Math.PI / 2, 0]} width={D - 2} height={COVE_WIDTH * 0.7} intensity={1.3} />
      <AccentLight position={[hw - 0.1, H - 0.08, 0]} rotation={[-0.3, Math.PI / 2, 0]} width={D - 2} height={COVE_WIDTH * 0.7} intensity={1.3} />

      {/* Artwork accent */}
      <AccentLight position={[-BACK_WALL_PLACEMENTS[0].position[0], EYE + 0.7, -hd + WT / 2 + 0.6]} rotation={[0, 0, 0]} width={2.65} height={1.5} intensity={2.0} />
      <AccentLight position={[BACK_WALL_PLACEMENTS[1].position[0], EYE + 0.7, -hd + WT / 2 + 0.6]} rotation={[0, 0, 0]} width={2.65} height={1.5} intensity={2.0} />
      {left.length > 0 && <AccentLight position={[-hw - WT / 2 + 0.6, EYE + 0.7, 0.5]} rotation={[0, -Math.PI / 2, 0]} width={2.25} height={1.5} intensity={1.8} />}
      {right.length > 0 && <AccentLight position={[hw + WT / 2 - 0.6, EYE + 0.7, -2.2]} rotation={[0, Math.PI / 2, 0]} width={2.25} height={1.5} intensity={1.8} />}

      {/* Doorway continuation — all geometry behind back wall (z < -hd - WT/2 = -5.61) */}
      {/* Floor through doorway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SG, -5.8]}>
        <planeGeometry args={[2.2, 2.5]} />
        <meshStandardMaterial roughness={FLOOR_ROUGH} metalness={0.02} color={FLOOR_COLOR} />
      </mesh>
      {/* Distant wall */}
      <mesh position={[0, wy - 0.4, -8.0]}>
        <planeGeometry args={[3.0, H - 1.0]} />
        <meshStandardMaterial color="#d8d3c8" roughness={0.82} />
      </mesh>
      {/* Soft light in beyond space */}
      <pointLight position={[0, H - 0.5, -7.0]} intensity={6} distance={5} decay={1.5} color="#fff8ec" />
    </group>
  );
}
