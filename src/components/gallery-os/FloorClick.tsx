'use client';

import { useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Plane, Vector2 } from 'three';
import { useCallback, useEffect, useRef } from 'react';

export default function FloorClick({ onNavigate }: { onNavigate: (pos: Vector3) => void }) {
  const camera = useThree((s) => s.camera);
  const raycaster = useRef(new Raycaster());
  const floor = useRef(new Plane(new Vector3(0, 1, 0), 0));

  const handler = useCallback((e: PointerEvent) => {
    const mouse = new Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.current.setFromCamera(mouse, camera);
    const point = new Vector3();
    if (raycaster.current.ray.intersectPlane(floor.current, point)) {
      onNavigate(point.clone());
    }
  }, [camera, onNavigate]);

  useEffect(() => {
    const el = document.querySelector('.museum-3d-surface');
    if (!el) return;
    el.addEventListener('click', handler as any);
    return () => el.removeEventListener('click', handler as any);
  }, [handler]);

  return null;
}
