import type { ArtworkPlacement } from './museum.types';

export const BACK_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'back', position: [-3.8, 0, 0.06], hero: true },
  { wallId: 'back', position: [4.0, 0, 0.06], hero: true },
];

export const LEFT_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'left', position: [1.0, 0, 0.06] },
];

export const RIGHT_WALL_PLACEMENTS: ArtworkPlacement[] = [
  { wallId: 'right', position: [-1.5, 0, 0.06] },
];

export const FRAME_SCALE = {
  pixelDivisor: 390,
  hero: {
    physicalScale: 2.2,
    physicalMax: 4.2,
    landscapeMax: 4.2,
    portraitMax: 3.6,
  },
  secondary: {
    physicalScale: 2.15,
    physicalMax: 3.0,
    landscapeMax: 3.0,
    portraitMax: 2.8,
  },
  min: 0.3,
  max: 3.6,
  maxHeight: 3.0,
};
