"use client";

import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { MUSEUM_RENDERING_CONFIG } from "../config/museum-rendering.config";

export function MuseumRendererConfig() {
  const { gl } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = MUSEUM_RENDERING_CONFIG.renderer.exposure;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // For recent Three.js versions.
    if ("useLegacyLights" in gl) {
      gl.useLegacyLights = false;
    }
  }, [gl]);

  return null;
}
