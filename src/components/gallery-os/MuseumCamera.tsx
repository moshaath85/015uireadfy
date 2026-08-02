'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3, Euler } from 'three';

const EYE = 1.68; const PITCH_MAX = 0.35;

export interface NavDestination {
  id: string; label: string; position: [number, number, number]; lookAt: [number, number, number];
}

export const DESTINATIONS: NavDestination[] = [
  { id: 'overview', label: 'Overview', position: [0, 1.68, 7.5], lookAt: [0, 1.8, -4.5] },
  { id: 'left-wall', label: 'Left wall', position: [-3.5, 1.68, 3], lookAt: [-5, 2.5, 1] },
  { id: 'hero-left', label: 'Main work', position: [-2, 1.68, 4.5], lookAt: [-3.4, 2.8, -5.2] },
  { id: 'hero-right', label: 'Main work', position: [2, 1.68, 4.5], lookAt: [3.6, 2.8, -5.2] },
  { id: 'right-wall', label: 'Right wall', position: [3.5, 1.68, 3], lookAt: [5, 2.5, -1] },
  { id: 'exit', label: 'Exit', position: [0, 1.68, 8.5], lookAt: [0, 1.8, -8] },
];

export default function MuseumCamera({ target, onArrive, onDragState }: {
  target: Vector3 | null; onArrive?: () => void;
  onDragState?: (active: boolean) => void;
}) {
  const camera = useThree((s) => s.camera);
  const startPos = useRef(new Vector3());
  const progress = useRef(1);
  const [touchLook, setTouchLook] = useState<{ x: number; y: number } | null>(null);
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const dragging = useRef(false);
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = 'ontouchstart' in window;
    camera.position.set(0, EYE, 7.5);
    camera.lookAt(0, 1.8, -4.5);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  useEffect(() => {
    if (target) { startPos.current.copy(camera.position); progress.current = 0; }
  }, [target, camera]);

  // Desktop drag-to-look (no pointer lock)
  useEffect(() => {
    const el = document.querySelector('.museum-3d-surface');
    if (!el) return;
    let down = false, lx = 0, ly = 0;
    const d = (e: Event) => { down = true; const pe = e as PointerEvent; lx = pe.clientX; ly = pe.clientY; dragging.current = true; onDragState?.(true); };
    const m = (e: Event) => {
      if (!down) return; const pe = e as PointerEvent;
      const dx = pe.clientX - lx; const dy = pe.clientY - ly;
      lx = pe.clientX; ly = pe.clientY;
      setTouchLook({ x: dx, y: dy });
    };
    const u = () => { down = false; setTouchLook(null); setTimeout(() => { dragging.current = false; onDragState?.(false); }, 100); };
    el.addEventListener('pointerdown', d); el.addEventListener('pointermove', m); el.addEventListener('pointerup', u);
    el.addEventListener('pointerleave', u);
    return () => {
      el.removeEventListener('pointerdown', d); el.removeEventListener('pointermove', m);
      el.removeEventListener('pointerup', u); el.removeEventListener('pointerleave', u);
    };
  }, [onDragState]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);

    // Drag-to-look
    if (touchLook) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= touchLook.x * 0.003;
      euler.current.x -= touchLook.y * 0.003;
      euler.current.x = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    }

    // Click-to-move
    if (target && progress.current < 1) {
      progress.current = Math.min(1, progress.current + d * 2.2);
      const t = 1 - Math.pow(1 - progress.current, 2.5);
      const pos = new Vector3().lerpVectors(startPos.current, target, t);
      pos.y = EYE;
      camera.position.copy(pos);
      camera.lookAt(new Vector3(target.x, EYE - 0.15, target.z - 2));
      if (progress.current >= 1) onArrive?.();
    }
  });

  return null;
}
