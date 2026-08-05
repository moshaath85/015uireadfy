'use client';

import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import AutoArtworkFrame from '../artwork/AutoArtworkFrame';
import { ROOM, EYE_LEVEL } from '../config/museum-room.config';
import { useMuseumMaterials } from '../rendering/useMuseumMaterials';
import { MuseumBench } from '../rendering/MuseumBench';
import { MuseumAccessories } from '../rendering/MuseumAccessories';

RectAreaLightUniformsLib.init();

interface ArtworkData {
  id: string; slug: string; title: string; artist: string;
  year: number; medium: string; dimensions: string; imageUrl: string;
  sceneRole: 'hero' | 'secondary';
}

const W = ROOM.width; const H = ROOM.height; const D = ROOM.depth;
const EYE = EYE_LEVEL;

function WallPlane({ size, position, rotation, material }: { size: [number, number]; position: [number, number, number]; rotation: [number, number, number]; material: THREE.Material }) {
  return <mesh position={position} rotation={rotation} receiveShadow><planeGeometry args={size} /><primitive object={material} attach="material" /></mesh>;
}

const HERO_AND_SIDE_WALL_IDS = ['aw-013', 'aw-128', 'aw-175', 'aw-029'];

export default function GalleryHall({ artworks }: { artworks: ArtworkData[] }) {
  const curatedById = new Map(artworks.map((work) => [work.id, work]));
  const curated = HERO_AND_SIDE_WALL_IDS
    .map((id) => curatedById.get(id))
    .filter(Boolean) as ArtworkData[];
  const [heroLeft, heroRight, leftWall, rightWall] = curated;
  /* The remaining works in the exhibition, in the order the page already
     curated them — src/app/museum/page.tsx resolves every entry's real
     image and real dimensions from the database (or the offline catalog if
     the database is unreachable), so there is nothing left to guess here.
     A hand-typed fallback used to live in this spot with the wrong file
     extension on every entry (.png where the real assets are .webp) and
     "Dimensions available on request" hardcoded onto two works that do
     have real dimensions on file — a second, silently stale copy of data
     the page already got right once. */
  const supporting = artworks.filter((work) => !HERO_AND_SIDE_WALL_IDS.includes(work.id));
  const logoTexture = useTexture('/brand/015-logo-white.svg');
  const { wallMaterial, floorMaterial, ceilingMaterial } = useMuseumMaterials();

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 11.5]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>
      <WallPlane size={[16, 4.8]} position={[0, 2.4, -5.75]} rotation={[0, 0, 0]} material={wallMaterial} />
      <WallPlane size={[11.5, 4.8]} position={[-8, 2.4, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMaterial} />
      <WallPlane size={[11.5, 4.8]} position={[8, 2.4, 0]} rotation={[0, -Math.PI / 2, 0]} material={wallMaterial} />
      <WallPlane size={[16, 4.8]} position={[0, 2.4, 5.75]} rotation={[0, Math.PI, 0]} material={wallMaterial} />
      <group position={[0, 0, -D / 2 + 0.13]}>
        {heroLeft && <AutoArtworkFrame imageUrl={heroLeft.imageUrl} position={[0, EYE, 0.06]} title={heroLeft.title} artist={heroLeft.artist} meta={[heroLeft.year, heroLeft.medium, heroLeft.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={heroLeft.dimensions} inventoryNumber="01" hero />}
        {supporting.slice(0, 2).map((work, index) => <group key={`back-support-${work.id}`}><AutoArtworkFrame imageUrl={work.imageUrl} position={[index === 0 ? -3.45 : 3.45, EYE - 0.12, 0.06]} title={work.title} artist={work.artist} meta={[work.year, work.medium, work.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={work.dimensions} inventoryNumber={`0${index + 5}`} /><pointLight position={[index === 0 ? -3.45 : 3.45, 2.7, 1.4]} intensity={2.2} distance={4.5} decay={2} color="#ffe4c9" /><spotLight position={[index === 0 ? -3.45 : 3.45, 3.15, -3.1]} angle={0.42} penumbra={0.92} intensity={2.55} distance={5.5} color="#ffe0bd" castShadow /></group>)}
        <pointLight position={[0, 2.9, 1.5]} intensity={3.2} distance={5} decay={2} color="#ffe4c9" />
        <spotLight position={[0, 3.7, -2.55]} angle={0.38} penumbra={0.9} intensity={4.8} distance={7} color="#ffe0bd" castShadow />
      </group>
      {heroRight && <group position={[-W / 2 + 0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}><AutoArtworkFrame imageUrl={heroRight.imageUrl} position={[0.8, EYE, 0.06]} title={heroRight.title} artist={heroRight.artist} meta={[heroRight.year, heroRight.medium, heroRight.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={heroRight.dimensions} inventoryNumber="02" /><pointLight position={[1.0, 2.75, 1.25]} intensity={2.8} distance={4.5} decay={2} color="#ffe4c9" /><spotLight position={[-7.15, 3.25, 0.8]} rotation={[0, Math.PI / 2, 0]} angle={0.42} penumbra={0.92} intensity={3.15} distance={5.5} color="#ffe0bd" castShadow /></group>}
      {leftWall && <group position={[W / 2 - 0.13, 0, 0]} rotation={[0, -Math.PI / 2, 0]}><AutoArtworkFrame imageUrl={leftWall.imageUrl} position={[-2.35, EYE, 0.06]} title={leftWall.title} artist={leftWall.artist} meta={[leftWall.year, leftWall.medium, leftWall.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={leftWall.dimensions} inventoryNumber="03" /><pointLight position={[-2.35, 2.75, 1.25]} intensity={2.6} distance={4.5} decay={2} color="#ffe4c9" /><spotLight position={[7.15, 3.25, -2.35]} rotation={[0, -Math.PI / 2, 0]} angle={0.42} penumbra={0.92} intensity={3.0} distance={5.5} color="#ffe0bd" castShadow /></group>}
      {rightWall && <group position={[0, 0, D / 2 - 0.25]} rotation={[0, Math.PI, 0]}><AutoArtworkFrame imageUrl={rightWall.imageUrl} position={[5.2, EYE, 0.06]} title={rightWall.title} artist={rightWall.artist} meta={[rightWall.year, rightWall.medium, rightWall.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={rightWall.dimensions} inventoryNumber="04" /><pointLight position={[5.2, 2.75, 1.25]} intensity={2.8} distance={4.5} decay={2} color="#ffe4c9" /><spotLight position={[5.2, 3.25, 3.7]} rotation={[0, Math.PI, 0]} angle={0.42} penumbra={0.92} intensity={2.9} distance={5.5} color="#ffe0bd" castShadow /></group>}
      <group position={[-W / 2 + 0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {supporting.slice(2, 3).map((work) => <group key={work.id}><AutoArtworkFrame imageUrl={work.imageUrl} position={[-1.8, EYE - 0.05, 0.06]} title={work.title} artist={work.artist} meta={[work.year, work.medium, work.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={work.dimensions} inventoryNumber="07" /><spotLight position={[-7.15, 3.1, -1.8]} rotation={[0, Math.PI / 2, 0]} angle={0.42} penumbra={0.92} intensity={2.35} distance={5.5} color="#ffe0bd" castShadow /></group>)}
      </group>
      <group position={[W / 2 - 0.13, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {supporting.slice(3, 4).map((work) => <group key={work.id}><AutoArtworkFrame imageUrl={work.imageUrl} position={[2.5, EYE - 0.05, 0.06]} title={work.title} artist={work.artist} meta={[work.year, work.medium, work.dimensions, 'Collection 015'].filter(Boolean).join(' · ')} physicalDimensions={work.dimensions} inventoryNumber="08" /><spotLight position={[7.15, 3.1, 2.5]} rotation={[0, -Math.PI / 2, 0]} angle={0.42} penumbra={0.92} intensity={2.35} distance={5.5} color="#ffe0bd" castShadow /></group>)}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.8, 0]} receiveShadow><planeGeometry args={[16, 11.5]} /><primitive object={ceilingMaterial} attach="material" /></mesh>
      {/* Recessed perimeter tray: the cove sits inside this architectural shadow box. */}
      <mesh position={[0, H - 0.28, -D / 2 + 0.28]}><boxGeometry args={[W - 0.5, 0.18, 0.18]} /><meshStandardMaterial color="#c9c1b5" roughness={0.88} /></mesh>
      <mesh position={[0, H - 0.28, D / 2 - 0.28]}><boxGeometry args={[W - 0.5, 0.18, 0.18]} /><meshStandardMaterial color="#c9c1b5" roughness={0.88} /></mesh>
      <mesh position={[-W / 2 + 0.28, H - 0.28, 0]}><boxGeometry args={[0.18, 0.18, D - 0.5]} /><meshStandardMaterial color="#c9c1b5" roughness={0.88} /></mesh>
      <mesh position={[W / 2 - 0.28, H - 0.28, 0]}><boxGeometry args={[0.18, 0.18, D - 0.5]} /><meshStandardMaterial color="#c9c1b5" roughness={0.88} /></mesh>
      <mesh position={[-W / 2 + 0.32, H - 0.3, 0]}><boxGeometry args={[0.045, 0.08, D - 0.7]} /><meshStandardMaterial color="#211e1a" emissive="#6e6252" emissiveIntensity={0.34} /></mesh>
      <mesh position={[W / 2 - 0.32, H - 0.3, 0]}><boxGeometry args={[0.045, 0.08, D - 0.7]} /><meshStandardMaterial color="#211e1a" emissive="#6e6252" emissiveIntensity={0.34} /></mesh>
      {/* Restrained plaster reveals, kept shallow so the walls remain continuous. */}
      <group position={[0, 0, D / 2]}>
        <mesh position={[-3.8, H / 2, 0]} receiveShadow><boxGeometry args={[W / 2 - 3.0, H, 0.22]} /><primitive object={wallMaterial} attach="material" /></mesh>
        <mesh position={[3.8, H / 2, 0]} receiveShadow><boxGeometry args={[W / 2 - 3.0, H, 0.22]} /><primitive object={wallMaterial} attach="material" /></mesh>
        <mesh position={[0, H - 0.9, 0]} receiveShadow><boxGeometry args={[3.0, 1.8, 0.22]} /><primitive object={wallMaterial} attach="material" /></mesh>
        <mesh position={[-1.5, 1.8, -0.13]}><boxGeometry args={[0.22, 3.6, 0.28]} /><meshStandardMaterial color="#c7beb1" roughness={0.8} /></mesh>
        <mesh position={[1.5, 1.8, -0.13]}><boxGeometry args={[0.22, 3.6, 0.28]} /><meshStandardMaterial color="#c7beb1" roughness={0.8} /></mesh>
        <mesh position={[0, 3.6, -0.13]}><boxGeometry args={[3.22, 0.22, 0.28]} /><meshStandardMaterial color="#c7beb1" roughness={0.8} /></mesh>
      </group>
      <mesh position={[0, 2.95, D / 2 - 0.16]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.18, 0.42]} />
        <meshBasicMaterial map={logoTexture} transparent opacity={0.78} depthWrite={false} />
      </mesh>


      {/* Gallery furniture: secondary, grounded, and outside the route spine */}
      <MuseumBench />
      <MuseumAccessories />

    </group>
  );
}
