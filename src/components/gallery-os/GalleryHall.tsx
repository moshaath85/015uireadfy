'use client';

import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import AutoArtworkFrame from './AutoArtworkFrame';

RectAreaLightUniformsLib.init();

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const W = 15; const H = 4.8; const D = 11;
const EYE = 2.86;

function genPlaster(): CanvasTexture {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(64, 64);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 0.985 + Math.random() * 0.03;
    img.data[i] = 0.80 * 255 * n; img.data[i + 1] = 0.78 * 255 * n;
    img.data[i + 2] = 0.74 * 255 * n; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const enlarged = document.createElement('canvas'); enlarged.width = 512; enlarged.height = 512;
  const ectx = enlarged.getContext('2d')!;
  ectx.imageSmoothingEnabled = true;
  ectx.filter = 'blur(2px)';
  ectx.drawImage(c, 0, 0, 512, 512);
  const t = new CanvasTexture(enlarged); t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(2, 2); t.colorSpace = SRGBColorSpace;
  return t;
}

function genFloor(): CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#4b463d'; ctx.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c); t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(4, 4); t.colorSpace = SRGBColorSpace;
  return t;
}

function WallPanel({ args, pos, rot, tex }: { args: [number, number]; pos: [number, number, number]; rot: [number, number, number]; tex: CanvasTexture }) {
  return <mesh position={pos} rotation={rot} receiveShadow><planeGeometry args={args} /><meshStandardMaterial map={tex} roughness={0.7} color="#d2cec6" /></mesh>;
}

function AccentLight({ position, rotation, width, height, intensity }: { position: [number, number, number]; rotation: [number, number, number]; width: number; height: number; intensity: number }) {
  return <rectAreaLight position={position} rotation={rotation} width={width} height={height} intensity={intensity} color="#fff7e9" />;
}

export default function GalleryHall({ artworks }: { artworks: ArtworkData[] }) {
  const wallTex = useMemo(() => genPlaster(), []);
  const floorTex = useMemo(() => genFloor(), []);
  const all = artworks.slice(0, 4);
  const back = all.slice(0, 2);
  const left = all.slice(2, 3);
  const right = all.slice(3, 4);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[W + 2, D + 8]} />
        <meshPhysicalMaterial map={floorTex} roughness={0.42} metalness={0} clearcoat={0.12} clearcoatRoughness={0.58} color="#4b463d" emissive="#34302b" emissiveIntensity={0.58} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W + 2, D + 2]} />
        <meshStandardMaterial color="#e8e3d9" roughness={0.96} />
      </mesh>
      <WallPanel args={[W, H]} pos={[0, H / 2, -D / 2]} rot={[0, 0, 0]} tex={wallTex} />
      <WallPanel args={[D, H]} pos={[-W / 2, H / 2, 0]} rot={[0, Math.PI / 2, 0]} tex={wallTex} />
      <WallPanel args={[D, H]} pos={[W / 2, H / 2, 0]} rot={[0, -Math.PI / 2, 0]} tex={wallTex} />

      {back.length > 0 && (
        <group position={[0, 0, -D / 2]}>
          {back.map((w, i) => (
            <AutoArtworkFrame key={w.id} imageUrl={w.imageUrl}
              position={[i === 0 ? -3.4 : 3.6, EYE, 0.06]} title={w.title} artist={w.artist}
              meta={[w.year, w.medium, w.dimensions].filter(Boolean).join(' · ')}
              physicalDimensions={w.dimensions} hero />
          ))}
        </group>
      )}
      {left.length > 0 && (
        <group position={[-W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <AutoArtworkFrame imageUrl={left[0].imageUrl} position={[0.5, EYE, 0.06]} title={left[0].title} artist={left[0].artist} meta={[left[0].year, left[0].medium, left[0].dimensions].filter(Boolean).join(' · ')} physicalDimensions={left[0].dimensions} />
        </group>
      )}
      {right.length > 0 && (
        <group position={[W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <AutoArtworkFrame imageUrl={right[0].imageUrl} position={[-2.2, EYE, 0.06]} title={right[0].title} artist={right[0].artist} meta={[right[0].year, right[0].medium, right[0].dimensions].filter(Boolean).join(' · ')} physicalDimensions={right[0].dimensions} />
        </group>
      )}

      <hemisphereLight args={["#fff9ef", "#5a5143", 0.9]} />
      <ambientLight intensity={0.45} color="#faf6ed" />

      <AccentLight position={[0, H - 0.18, -D / 2 + 0.18]} rotation={[0, 0, 0]} width={W - 1} height={0.5} intensity={1.5} />
      <AccentLight position={[-W / 2 + 0.18, H - 0.18, 0]} rotation={[0, -Math.PI / 2, 0]} width={D - 1} height={0.5} intensity={1.2} />
      <AccentLight position={[W / 2 - 0.18, H - 0.18, 0]} rotation={[0, Math.PI / 2, 0]} width={D - 1} height={0.5} intensity={1.2} />

      <AccentLight position={[-3.4, EYE + 0.7, -D / 2 + 0.65]} rotation={[0, 0, 0]} width={2.65} height={1.45} intensity={2.2} />
      <AccentLight position={[3.6, EYE + 0.7, -D / 2 + 0.65]} rotation={[0, 0, 0]} width={2.65} height={1.45} intensity={2.2} />
      {left.length > 0 && <AccentLight position={[-W / 2 + 0.65, EYE + 0.7, 0.5]} rotation={[0, -Math.PI / 2, 0]} width={2.25} height={1.45} intensity={2.0} />}
      {right.length > 0 && <AccentLight position={[W / 2 - 0.65, EYE + 0.7, -2.2]} rotation={[0, Math.PI / 2, 0]} width={2.25} height={1.45} intensity={2.0} />}
    </group>
  );
}
