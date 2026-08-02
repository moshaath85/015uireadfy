'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getMuseumAsset } from '../assets/AssetManager';

type AccessoryProps = {
  url: string;
  position: [number, number, number];
  rotationY?: number;
};

function Accessory({ url, position, rotationY = 0 }: AccessoryProps) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -bounds.min.y, -center.z);
    return root;
  }, [scene]);

  useEffect(() => {
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [model]);

  return <group position={position} rotation={[0, rotationY, 0]}><primitive object={model} /></group>;
}

export function MuseumAccessories() {
  return <group />;
}

useGLTF.preload('/museum-assets/accessories/gallery015_pedestal.glb');
useGLTF.preload('/museum-assets/accessories/gallery015_abstract_sculpture.glb');
useGLTF.preload('/museum-assets/accessories/gallery015_brochure_stand.glb');
