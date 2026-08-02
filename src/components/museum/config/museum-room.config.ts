import type { RoomDimensions, WallConfig, FloorConfig, CeilingConfig, LightDefinition } from './museum.types';

export const ROOM: RoomDimensions = {
  width: 15,
  height: 4.8,
  depth: 11,
};

export const EYE_LEVEL = 1.52;

export const WALL: WallConfig = {
  color: '#d0c8bb',
  roughness: 0.86,
  plasterBase: { r: 0.80, g: 0.78, b: 0.74 },
  plasterVariation: 0.018,
  plasterNoiseSize: 64,
};

export const FLOOR: FloorConfig = {
  baseColor: '#33271e',
  material: {
    color: '#33271e',
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.58,
    emissive: '#28231d',
    emissiveIntensity: 0.14,
  },
};

export const CEILING: CeilingConfig = {
  color: '#e8e3d9',
  roughness: 0.96,
};

export const LIGHTS: LightDefinition[] = [
  { type: 'hemisphere', color: '#fff9ef', intensity: 0.9, skyColor: '#fff9ef', groundColor: '#5a5143' },
  { type: 'ambient', color: '#faf6ed', intensity: 0.45 },
  {
    type: 'cove', intensity: 1.5, color: '#fff7e9',
    position: [0, ROOM.height - 0.18, -ROOM.depth / 2 + 0.18],
    rotation: [0, 0, 0], width: ROOM.width - 1, height: 0.5,
  },
  {
    type: 'cove', intensity: 1.2, color: '#fff7e9',
    position: [-ROOM.width / 2 + 0.18, ROOM.height - 0.18, 0],
    rotation: [0, -Math.PI / 2, 0], width: ROOM.depth - 1, height: 0.5,
  },
  {
    type: 'cove', intensity: 1.2, color: '#fff7e9',
    position: [ROOM.width / 2 - 0.18, ROOM.height - 0.18, 0],
    rotation: [0, Math.PI / 2, 0], width: ROOM.depth - 1, height: 0.5,
  },
  {
    type: 'accent', intensity: 2.2, color: '#fff7e9',
    position: [-3.4, EYE_LEVEL + 0.7, -ROOM.depth / 2 + 0.65],
    rotation: [0, 0, 0], width: 2.65, height: 1.45,
  },
  {
    type: 'accent', intensity: 2.2, color: '#fff7e9',
    position: [3.6, EYE_LEVEL + 0.7, -ROOM.depth / 2 + 0.65],
    rotation: [0, 0, 0], width: 2.65, height: 1.45,
  },
  {
    type: 'accent', intensity: 2.0, color: '#fff7e9',
    position: [-ROOM.width / 2 + 0.65, EYE_LEVEL + 0.7, 0.5],
    rotation: [0, -Math.PI / 2, 0], width: 2.25, height: 1.45,
  },
  {
    type: 'accent', intensity: 2.0, color: '#fff7e9',
    position: [ROOM.width / 2 - 0.65, EYE_LEVEL + 0.7, -2.2],
    rotation: [0, Math.PI / 2, 0], width: 2.25, height: 1.45,
  },
];
