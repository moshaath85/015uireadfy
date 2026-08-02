export interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface WallDefinition {
  id: string;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface MuseumDestination {
  id: string;
  label: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface CameraPose {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

export interface ArtworkPlacement {
  wallId: string;
  position: [number, number, number];
  hero?: boolean;
}

export interface LightDefinition {
  type: 'ambient' | 'hemisphere' | 'accent' | 'cove';
  color: string;
  intensity: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  distance?: number;
  angle?: number;
  skyColor?: string;
  groundColor?: string;
}

export interface MaterialConfig {
  color: string;
  roughness: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export interface FloorConfig {
  baseColor: string;
  material: MaterialConfig;
}

export interface WallConfig {
  color: string;
  roughness: number;
  plasterBase: { r: number; g: number; b: number };
  plasterVariation: number;
  plasterNoiseSize: number;
}

export interface CeilingConfig {
  color: string;
  roughness: number;
}

export interface MuseumSceneConfig {
  room: RoomDimensions;
  eyeLevel: number;
  camera: {
    default: CameraPose;
    eyeHeight: number;
    desktopFov: number;
    mobileFov: number;
    desktopDpr: [number, number];
    mobileDpr: [number, number];
    speed: number;
    acceleration: number;
    damping: number;
    sensitivity: number;
    pitchMax: number;
    roomBounds: { maxX: number; maxZFront: number; maxZBack: number };
  };
  walls: WallConfig;
  floor: FloorConfig;
  ceiling: CeilingConfig;
  destinations: MuseumDestination[];
  defaultBackground: string;
}
