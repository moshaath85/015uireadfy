"use client";

import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { MUSEUM_RENDERING_CONFIG } from "../config/museum-rendering.config";

function configureTexture(
  texture: THREE.Texture,
  repeat: readonly [number, number],
  anisotropy: number,
) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

export function useMuseumMaterials() {
  const wallMap = useTexture("/museum-assets/rendering/wall_plaster.jpg");
  const floorMap = useTexture("/museum-assets/rendering/floor_polished_concrete.jpg");
  const ceilingMap = useTexture("/museum-assets/rendering/ceiling_warm_matte.jpg");

  const wallMaterial = useMemo(() => {
    configureTexture(
      wallMap,
      MUSEUM_RENDERING_CONFIG.materials.wall.repeat,
      MUSEUM_RENDERING_CONFIG.materials.wall.anisotropy,
    );
    return new THREE.MeshStandardMaterial({
      map: wallMap,
      color: MUSEUM_RENDERING_CONFIG.materials.wall.color,
      roughness: MUSEUM_RENDERING_CONFIG.materials.wall.roughness,
      metalness: 0,
    });
  }, [wallMap]);

  const floorMaterial = useMemo(() => {
    configureTexture(
      floorMap,
      MUSEUM_RENDERING_CONFIG.materials.floor.repeat,
      MUSEUM_RENDERING_CONFIG.materials.floor.anisotropy,
    );
    return new THREE.MeshPhysicalMaterial({
      map: floorMap,
      color: MUSEUM_RENDERING_CONFIG.materials.floor.color,
      roughness: MUSEUM_RENDERING_CONFIG.materials.floor.roughness,
      metalness: 0,
      clearcoat: MUSEUM_RENDERING_CONFIG.materials.floor.clearcoat,
      clearcoatRoughness:
        MUSEUM_RENDERING_CONFIG.materials.floor.clearcoatRoughness,
    });
  }, [floorMap]);

  const ceilingMaterial = useMemo(() => {
    configureTexture(
      ceilingMap,
      MUSEUM_RENDERING_CONFIG.materials.ceiling.repeat,
      MUSEUM_RENDERING_CONFIG.materials.ceiling.anisotropy,
    );
    return new THREE.MeshStandardMaterial({
      map: ceilingMap,
      color: MUSEUM_RENDERING_CONFIG.materials.ceiling.color,
      roughness: MUSEUM_RENDERING_CONFIG.materials.ceiling.roughness,
      metalness: 0,
    });
  }, [ceilingMap]);

  return { wallMaterial, floorMaterial, ceilingMaterial };
}
