import type { MuseumDestination, CameraPose } from './museum.types';

export const DESTINATIONS: MuseumDestination[] = [
  { id: 'overview', label: 'Overview', position: [0, 1.68, 7.5], lookAt: [0, 1.8, -4.5] },
  { id: 'left-wall', label: 'Left wall', position: [-3.5, 1.68, 3], lookAt: [-5, 2.5, 1] },
  { id: 'hero-left', label: 'Main work', position: [-2, 1.68, 4.5], lookAt: [-3.4, 2.8, -5.2] },
  { id: 'hero-right', label: 'Main work', position: [2, 1.68, 4.5], lookAt: [3.6, 2.8, -5.2] },
  { id: 'right-wall', label: 'Right wall', position: [3.5, 1.68, 3], lookAt: [5, 2.5, -1] },
  { id: 'exit', label: 'Exit', position: [0, 1.68, 8.5], lookAt: [0, 1.8, -8] },
];

export const DEFAULT_CAMERA: CameraPose = {
  position: [0, 1.68, 7.5],
  fov: 50,
  near: 0.3,
  far: 50,
};

export const CAMERA_CONFIG = {
  eyeHeight: 1.68,
  desktopFov: 52,
  mobileFov: 60,
  desktopDpr: [1, 1.5] as [number, number],
  mobileDpr: [1, 1.2] as [number, number],
  speed: 1.5,
  acceleration: 3.5,
  damping: 4,
  sensitivity: 0.0012,
  pitchMax: 0.28,
  roomBounds: {
    maxX: 7.0,
    maxZFront: 0.5,
    maxZBack: 5.0,
  },
};

export const SCENE_BACKGROUND = '#bbb5a8';
