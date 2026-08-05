'use client';

import { Suspense, useEffect, useState } from 'react';
import { CanvasTexture } from 'three';
import { Text } from '@react-three/drei';
import { FRAME_SCALE } from '../config/museum-artworks.config';
import { FRAME } from '../config/museum-frames.config';

const { min: MIN, max: MAX_W, maxHeight: MAX_H } = FRAME_SCALE;

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
  inventoryNumber?: string;
}

function MuseumPlaque({ title, artist, meta, inventoryNumber, width }: { title?: string; artist?: string; meta?: string; inventoryNumber: string; width: number }) {
  const details = meta?.split(' · ') ?? [];
  return <group position={[width / 2 + 0.30, 0, 0.005]}>
    <mesh castShadow receiveShadow><boxGeometry args={[0.18, 0.09, 0.002]} /><meshStandardMaterial color="#f3f0e9" roughness={0.78} /></mesh>
    <group position={[-0.08, 0.037, 0.002]}>
      <Text anchorX="left" anchorY="top" fontSize={0.010} color="#24221f" maxWidth={0.16}>{title ?? ''}</Text>
      <Text anchorX="left" anchorY="top" position={[0, -0.016, 0]} fontSize={0.0085} color="#37332e" maxWidth={0.16}>{artist ?? ''}</Text>
      <Text anchorX="left" anchorY="top" position={[0, -0.030, 0]} fontSize={0.0072} color="#5d5750" maxWidth={0.16}>{details.filter(Boolean).join(' · ')}</Text>
    </group>
    <Text anchorX="right" anchorY="bottom" position={[0.078, -0.037, 0.002]} fontSize={0.006} color="#77716a">{inventoryNumber}</Text>
  </group>;
}

export default function AutoArtworkFrame({ imageUrl, position, title, artist, meta, physicalDimensions, hero = false, inventoryNumber = '00' }: Props) {
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
        // 1 recorded metre = 1 model metre. No per-work or per-tier inflation.
        fw = physicalW; fh = physicalH;
      } else if (ar >= 1) { fw = FRAME_SCALE.unrecordedLongEdge; fh = fw / ar; }
      else { fh = FRAME_SCALE.unrecordedLongEdge; fw = fh * ar; }
      fw = Math.max(MIN, Math.min(MAX_W, fw));
      fh = Math.max(MIN, Math.min(MAX_H, fh));
      const border = detectBorder(img);
      const photographedArtwork = imageUrl.includes('mohammed-siam-01');
      const ajamLetterArtwork = imageUrl.includes('mohammed-al-ajam-02');
      const crop = photographedArtwork
        ? { x: 0.19, y: 0.18, w: 0.62, h: 0.62 }
        : ajamLetterArtwork
          ? { x: 0.04, y: 0.18, w: 0.92, h: 0.78 }
          : { x: border ? 0.045 : 0, y: border ? 0.045 : 0, w: border ? 0.91 : 1, h: border ? 0.91 : 1 };
      const c = document.createElement('canvas');
      const cropAspect = (img.naturalWidth * crop.w) / (img.naturalHeight * crop.h);
      c.width = 1024; c.height = Math.round(1024 / cropAspect);
      c.getContext('2d')!.drawImage(img, img.naturalWidth * crop.x, img.naturalHeight * crop.y, img.naturalWidth * crop.w, img.naturalHeight * crop.h, 0, 0, c.width, c.height);
      const t = new CanvasTexture(c); t.colorSpace = 'srgb';
      setTex(t); setDims({ w: fw, h: fh });
      setHasBorder(border);
    };
    img.src = imageUrl;
    return () => { ok = false; };
  }, [imageUrl, physicalDimensions, hero]);

  if (!dims) {
    return (
      <mesh position={position}>
        <planeGeometry args={[FRAME.fallback.width, FRAME.fallback.height]} />
        <meshStandardMaterial color={FRAME.fallback.color} roughness={FRAME.fallback.roughness} />
      </mesh>
    );
  }

  const { w, h } = dims;
  const ft = hasBorder ? FRAME.thickness.withBorder : FRAME.thickness.withoutBorder;
  const mp = FRAME.matWidth;

  return (
    <group position={position}>
      {!hasBorder && mp > 0 && (
        <mesh castShadow position={[0, 0, FRAME.matZOffset]}>
          <planeGeometry args={[w + mp * 2, h + mp * 2]} />
          <meshStandardMaterial color={FRAME.matColor} roughness={FRAME.matRoughness} />
        </mesh>
      )}
      {tex && (
        <mesh castShadow position={[0, 0, FRAME.textureZOffset]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={FRAME.artworkTextureRoughness} />
        </mesh>
      )}
      <mesh castShadow position={[0, h / 2 + ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh castShadow position={[0, -h / 2 - ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh castShadow position={[-w / 2 - ft / 2, 0, 0]}><boxGeometry args={[ft, h, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh castShadow position={[w / 2 + ft / 2, 0, 0]}><boxGeometry args={[ft, h, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <Suspense fallback={null}><MuseumPlaque title={title} artist={artist} meta={meta} inventoryNumber={inventoryNumber} width={w} /></Suspense>
    </group>
  );
}
