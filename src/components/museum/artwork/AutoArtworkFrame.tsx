'use client';

import { Suspense, useEffect, useState } from 'react';
import { CanvasTexture } from 'three';
import { Text } from '@react-three/drei';
import { FRAME_SCALE } from '../config/museum-artworks.config';
import { FRAME } from '../config/museum-frames.config';
import { LABEL } from '../config/museum-labels.config';

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
      const scaleCfg = hero ? FRAME_SCALE.hero : FRAME_SCALE.secondary;
      const physical = physicalDimensions?.match(/([\d.]+)\s*[×xX]\s*([\d.]+)/);
      const physicalW = physical ? Number(physical[1]) / 100 : 0;
      const physicalH = physical ? Number(physical[2]) / 100 : 0;
      if (physicalW > 0 && physicalH > 0) {
        const scale = Math.min(scaleCfg.physicalScale, scaleCfg.physicalMax / Math.max(physicalW, physicalH));
        fw = physicalW * scale; fh = physicalH * scale;
      } else if (ar >= 1) { fw = Math.min(scaleCfg.landscapeMax, (img.naturalWidth / FRAME_SCALE.pixelDivisor) * 1.5); fh = fw / ar; }
      else { fh = Math.min(scaleCfg.portraitMax, (img.naturalHeight / FRAME_SCALE.pixelDivisor) * 1.5); fw = fh * ar; }
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
        <mesh position={[0, 0, FRAME.matZOffset]}>
          <planeGeometry args={[w + mp * 2, h + mp * 2]} />
          <meshStandardMaterial color={FRAME.matColor} roughness={FRAME.matRoughness} />
        </mesh>
      )}
      {tex && (
        <mesh position={[0, 0, FRAME.textureZOffset]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={FRAME.artworkTextureRoughness} />
        </mesh>
      )}
      <mesh position={[0, h / 2 + ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh position={[0, -h / 2 - ft / 2, 0]}><boxGeometry args={[w + ft * 2, ft, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh position={[-w / 2 - ft / 2, 0, 0]}><boxGeometry args={[ft, h, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      <mesh position={[w / 2 + ft / 2, 0, 0]}><boxGeometry args={[ft, h, FRAME.frameDepth]} /><meshStandardMaterial color={FRAME.frameColor} roughness={FRAME.frameRoughness} /></mesh>
      {(title || artist || meta) && (
        <Suspense fallback={null}>
          <group position={[-w / 2, -h / 2 + LABEL.groupYOffset, LABEL.groupZOffset]}>
            {title && <Text anchorX="left" anchorY="top" fontSize={LABEL.title.fontSize} color={LABEL.title.color} maxWidth={Math.max(LABEL.minWidth, w * LABEL.maxWidthFactor)}>{title}</Text>}
            {artist && <Text anchorX="left" anchorY="top" position={[0, LABEL.artist.yOffset, 0]} fontSize={LABEL.artist.fontSize} color={LABEL.artist.color} maxWidth={Math.max(LABEL.minWidth, w * LABEL.maxWidthFactor)}>{artist}</Text>}
            {meta && <Text anchorX="left" anchorY="top" position={[0, LABEL.meta.yOffset, 0]} fontSize={LABEL.meta.fontSize} color={LABEL.meta.color} maxWidth={Math.max(LABEL.minWidth, w * LABEL.maxWidthFactor)}>{meta}</Text>}
          </group>
        </Suspense>
      )}
    </group>
  );
}
