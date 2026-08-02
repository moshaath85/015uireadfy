'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3, Euler } from 'three';
import { ROUTE_GRAPH } from '../config/museum-routes.config';
import { CAMERA_CONFIG } from '../config/museum-navigation.config';

const { eyeHeight: EYE, pitchMax: PITCH_MAX } = CAMERA_CONFIG;

export default function MuseumCamera({ targetNodeId, onArrive, onDragState }: {
  targetNodeId: string | null;
  onArrive?: () => void;
  onDragState?: (active: boolean) => void;
}) {
  const camera = useThree((s) => s.camera);
  const startPos = useRef(new Vector3());
  const startLook = useRef(new Vector3());
  const progress = useRef(1);
  const [touchLook, setTouchLook] = useState<{ x: number; y: number } | null>(null);
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    const entrance = ROUTE_GRAPH.nodes.entrance;
    camera.position.set(...entrance.position);
    camera.lookAt(...entrance.lookAt);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  useEffect(() => {
    if (targetNodeId) {
      const node = ROUTE_GRAPH.nodes[targetNodeId];
      if (node) {
        startPos.current.copy(camera.position);
        startLook.current.set(...node.lookAt);
        progress.current = 0;
      }
    }
  }, [targetNodeId, camera]);

  // Desktop drag-to-look
  useEffect(() => {
    const el = document.querySelector('.museum-3d-surface');
    if (!el) return;
    let down = false, lx = 0, ly = 0;
    const d = (e: Event) => { down = true; const pe = e as PointerEvent; lx = pe.clientX; ly = pe.clientY; onDragState?.(true); };
    const m = (e: Event) => {
      if (!down) return; const pe = e as PointerEvent;
      const dx = pe.clientX - lx; const dy = pe.clientY - ly;
      lx = pe.clientX; ly = pe.clientY;
      setTouchLook({ x: dx, y: dy });
    };
    const u = () => { down = false; setTouchLook(null); setTimeout(() => onDragState?.(false), 100); };
    el.addEventListener('pointerdown', d); el.addEventListener('pointermove', m);
    el.addEventListener('pointerup', u); el.addEventListener('pointerleave', u);
    return () => {
      el.removeEventListener('pointerdown', d); el.removeEventListener('pointermove', m);
      el.removeEventListener('pointerup', u); el.removeEventListener('pointerleave', u);
    };
  }, [onDragState]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);

    if (touchLook) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= touchLook.x * 0.003;
      euler.current.x -= touchLook.y * 0.003;
      euler.current.x = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    }

    if (targetNodeId && progress.current < 1) {
      const node = ROUTE_GRAPH.nodes[targetNodeId];
      if (!node) return;
      progress.current = Math.min(1, progress.current + d * 1.6);
      const t = 1 - Math.pow(1 - progress.current, 2);
      const targetPos = new Vector3(...node.position);
      targetPos.y = EYE;
      camera.position.lerpVectors(startPos.current, targetPos, t);
      const lookTarget = new Vector3().lerpVectors(startLook.current, new Vector3(...node.lookAt), t);
      camera.lookAt(lookTarget);
      if (progress.current >= 1) {
        startLook.current.set(...node.lookAt);
        onArrive?.();
      }
    }
  });

  return null;
}
