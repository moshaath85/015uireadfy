'use client';

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';

const WAYPOINTS = [
  { id: 'overview', label: 'Overview', position: [0, 0.02, 7] as [number, number, number], lookAt: [0, 1.8, -4.5] as [number, number, number] },
  { id: 'left', label: 'Left work', position: [-3.2, 0.02, 4.5] as [number, number, number], lookAt: [-3.4, 2.8, -5.2] as [number, number, number] },
  { id: 'right', label: 'Right work', position: [3.2, 0.02, 4.5] as [number, number, number], lookAt: [3.6, 2.8, -5.2] as [number, number, number] },
];

export default function MuseumHotspots() {
  const camera = useThree((s) => s.camera);
  const [dest, setDest] = useState<typeof WAYPOINTS[0] | null>(null);
  const start = useRef(new Vector3()); const target = useRef(new Vector3()); const look = useRef(new Vector3()); const progress = useRef(1);

  useFrame((_, dt) => { if (!dest) return; progress.current = Math.min(1, progress.current + dt / 1.25); camera.position.lerpVectors(start.current, target.current, 1 - Math.pow(1 - progress.current, 3)); camera.lookAt(look.current); if (progress.current >= 1) setDest(null); });

  const go = (w: typeof WAYPOINTS[0]) => { start.current.copy(camera.position); target.current.set(...w.position); target.current.y = 1.68; look.current.set(...w.lookAt); progress.current = 0; setDest(w); };

  return (
    <group>{WAYPOINTS.map((w) => <Html key={w.id} position={w.position} center distanceFactor={8}><button type="button" className="museum-hotspot" onClick={() => go(w)} aria-label={w.label}><span aria-hidden="true" /><small>{w.label}</small></button></Html>)}</group>
  );
}
