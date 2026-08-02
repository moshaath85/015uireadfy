'use client';

import { Suspense, useEffect, useState } from 'react';
import { CanvasTexture } from 'three';
import { Text } from '@react-three/drei';

const MAT_COLOR = '#fafaf4';
const FRAME_COLOR = '#2a2724';
const MAX_W = 3.6;
const MAX_H = 3.0;
const MIN = 0.3;

function detectBorder(img: HTMLImageElement): boolean {
  const c = document.createElement('canvas');
  c.width = 200; c.height = 200;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 200, 200);
  // Sample 5px border — if dominantly light (>200 brightness), artwork likely has a built-in border
  const edge = ctx.getImageData(0, 0, 200, 5);
  let bright = 0;
  for (let i = 0; i < edge.data.length; i += 4) {
    if (edge.data[i] + edge.data[i + 1] + edge.data[i + 2] > 600) bright++;
  }
  return bright > edge.data.length / 12;
}

interface Props {
  imageUrl: string;
  position: [number, number, number];
  title?: string;
  artist?: string;
  meta?: string;
  physicalDimensions?: string;
  hero?: boolean;
}

export default function AutoArtworkFrame({ imageUrl, position, title, artist, meta, physicalDimensions, hero = false }: Props) {
  const [tex, setTex] = useState<CanvasTexture | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [hasBorder, setHasBorder] = useState(false);

  useEffect(() => {
    let ok = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!ok) return;
      const ar = img.naturalWidth / img.naturalHeight;
      let fw: number, fh: number;
      const physical = physicalDimensions?.match(/([\d.]+)\s*[×xX]\s*([\d.]+)/);
      const physicalW = physical ? Number(physical[1]) / 100 : 0;
      const physicalH = physical ? Number(physical[2]) / 100 : 0;
      if (physicalW > 0 && physicalH > 0) {
        const scale = Math.min(hero ? 1.8 : 1.4, (hero ? 4.2 : 3.4) / Math.max(physicalW, physicalH));
        fw = physicalW * scale; fh = physicalH * scale;
      } else if (ar >= 1) { fw = Math.min(hero ? 4.2 : 3.8, (img.naturalWidth / 390) * 1.5); fh = fw / ar; }
      else { fh = Math.min(hero ? 3.6 : 3.2, (img.naturalHeight / 390) * 1.5); fw = fh * ar; }
      fw = Math.max(MIN, Math.min(MAX_W, fw));
      fh = Math.max(MIN, Math.min(MAX_H, fh));
      const c = document.createElement('canvas');
      c.width = 1024; c.height = Math.round(1024 / ar);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      const t = new CanvasTexture(c); t.colorSpace = 'srgb';
      setTex(t); setDims({ w: fw, h: fh });
      setHasBorder(detectBorder(img));
    };
    img.src = imageUrl;
    return () => { ok = false; };
  }, [imageUrl, physicalDimensions, hero]);

  if (!dims) {
    return (
      <mesh position={position}>
        <planeGeometry args={[0.5, 0.65]} />
        <meshStandardMaterial color="#3a3730" roughness={0.5} />
      </mesh>
    );
  }

  const { w, h } = dims;
  const ft = hasBorder ? 0.008 : 0.018;
  const mp = 0;

  return (
    <group position={position}>
      {!hasBorder && (
        <mesh position={[0, 0, -0.025]}>
          <planeGeometry args={[w + mp * 2, h + mp * 2]} />
          <meshStandardMaterial color={MAT_COLOR} roughness={0.45} />
        </mesh>
      )}
      {tex && (
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.35} />
        </mesh>
      )}
      <mesh position={[0, h / 2 + ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, 0.04]} /><meshStandardMaterial color={FRAME_COLOR} roughness={0.4} /></mesh>
      <mesh position={[0, -h / 2 - ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, 0.04]} /><meshStandardMaterial color={FRAME_COLOR} roughness={0.4} /></mesh>
      <mesh position={[-w / 2 - ft / 2, 0, 0]}><boxGeometry args={[ft, h, 0.04]} /><meshStandardMaterial color={FRAME_COLOR} roughness={0.4} /></mesh>
      <mesh position={[w / 2 + ft / 2, 0, 0]}><boxGeometry args={[ft, h, 0.04]} /><meshStandardMaterial color={FRAME_COLOR} roughness={0.4} /></mesh>
      {(title || artist || meta) && (
        <Suspense fallback={null}>
          <group position={[-w / 2, -h / 2 - 0.16, 0.02]}>
            {title && <Text anchorX="left" anchorY="top" fontSize={0.09} color="#302d28" maxWidth={Math.max(1.2, w * 0.8)}>{title}</Text>}
            {artist && <Text anchorX="left" anchorY="top" position={[0, -0.13, 0]} fontSize={0.07} color="#575149" maxWidth={Math.max(1.2, w * 0.8)}>{artist}</Text>}
            {meta && <Text anchorX="left" anchorY="top" position={[0, -0.24, 0]} fontSize={0.052} color="#70695f" maxWidth={Math.max(1.2, w * 0.8)}>{meta}</Text>}
          </group>
        </Suspense>
      )}
    </group>
  );
}
