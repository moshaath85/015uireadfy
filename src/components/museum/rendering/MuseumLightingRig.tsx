"use client";

import * as THREE from "three";
import { ContactShadows, Environment } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { useRef } from "react";
import { MUSEUM_RENDERING_CONFIG } from "../config/museum-rendering.config";

extend({ RectAreaLightHelper });

function LookAtRectLight({
  position,
  target,
  width,
  height,
  intensity,
  color,
}: {
  position: [number, number, number];
  target: [number, number, number];
  width: number;
  height: number;
  intensity: number;
  color: string;
}) {
  const ref = useRef<THREE.RectAreaLight>(null);

  useFrame(() => {
    ref.current?.lookAt(...target);
  });

  return (
    <rectAreaLight
      ref={ref}
      position={position}
      width={width}
      height={height}
      intensity={intensity}
      color={color}
    />
  );
}

export function MuseumLightingRig() {
  const cfg = MUSEUM_RENDERING_CONFIG;

  return (
    <>
      <Environment preset="apartment" environmentIntensity={cfg.environment.intensity} />

      <ambientLight intensity={cfg.lights.ambient} color="#fff4df" />
      <hemisphereLight
        intensity={cfg.lights.hemisphere}
        color="#fff4df"
        groundColor="#2f2a24"
      />

      <LookAtRectLight
        position={cfg.lights.backWall.position}
        target={cfg.lights.backWall.target}
        width={cfg.lights.backWall.width}
        height={cfg.lights.backWall.height}
        intensity={cfg.lights.backWall.intensity}
        color="#fff0d8"
      />

      <LookAtRectLight
        position={[-6.8, 3.2, 0]}
        target={[-7.8, 2.1, 0]}
        width={cfg.lights.sideWall.width}
        height={cfg.lights.sideWall.height}
        intensity={cfg.lights.sideWall.intensity}
        color="#fff0d8"
      />

      <LookAtRectLight
        position={[6.8, 3.2, 0]}
        target={[7.8, 2.1, 0]}
        width={cfg.lights.sideWall.width}
        height={cfg.lights.sideWall.height}
        intensity={cfg.lights.sideWall.intensity}
        color="#fff0d8"
      />

      {/* Hidden cove strips: keep geometry above the visible ceiling edge */}
      <rectAreaLight
        position={[0, 4.60, -5.2]}
        rotation={[-Math.PI / 2.4, 0, 0]}
        width={15}
        height={0.35}
        intensity={cfg.lights.cove.intensity}
        color={cfg.lights.cove.color}
      />
      <rectAreaLight
        position={[-7.5, 4.60, 0]}
        rotation={[-Math.PI / 2.4, Math.PI / 2, 0]}
        width={11}
        height={0.35}
        intensity={cfg.lights.cove.intensity * 0.75}
        color={cfg.lights.cove.color}
      />
      <rectAreaLight
        position={[7.5, 4.60, 0]}
        rotation={[-Math.PI / 2.4, -Math.PI / 2, 0]}
        width={11}
        height={0.35}
        intensity={cfg.lights.cove.intensity * 0.75}
        color={cfg.lights.cove.color}
      />

      <ContactShadows
        position={[0, 0.015, 0]}
        opacity={cfg.shadows.contactOpacity}
        blur={cfg.shadows.contactBlur}
        far={cfg.shadows.contactFar}
        resolution={cfg.shadows.contactResolution}
        scale={22}
        color="#191511"
      />
    </>
  );
}
