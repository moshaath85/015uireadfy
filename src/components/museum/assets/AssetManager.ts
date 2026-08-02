export type MuseumAssetCategory =
  | 'benches'
  | 'sculptures'
  | 'pedestals'
  | 'reception'
  | 'information'
  | 'signage'
  | 'plants'
  | 'lighting'
  | 'architectural'
  | 'safety';

export interface MuseumAssetDefinition {
  id: string;
  category: MuseumAssetCategory;
  glbPath?: string;
  texturePaths?: string[];
  scale: [number, number, number];
  rotation: [number, number, number];
  defaultPlacement: {
    room: 'entrance' | 'gallery-hall' | 'large-hall' | 'future';
    anchor: 'floor' | 'wall' | 'ceiling' | 'display';
    clearanceMeters: number;
  };
}

const floorTextures = [
  '/museum-assets/floor_stone/floor_albedo.png',
  '/museum-assets/floor_stone/floor_ao.png',
  '/museum-assets/floor_stone/floor_height.png',
  '/museum-assets/floor_stone/floor_normal.png',
  '/museum-assets/floor_stone/floor_roughness.png',
];
const wallTextures = [
  '/museum-assets/wall_plaster/wall_albedo.png',
  '/museum-assets/wall_plaster/wall_ao.png',
  '/museum-assets/wall_plaster/wall_height.png',
  '/museum-assets/wall_plaster/wall_normal.png',
  '/museum-assets/wall_plaster/wall_roughness.png',
];

const floorDefaults = { room: 'gallery-hall' as const, anchor: 'floor' as const, clearanceMeters: 1.2 };
const displayDefaults = { room: 'gallery-hall' as const, anchor: 'display' as const, clearanceMeters: 1.8 };

/** Registry only. Assets are instantiated by room compositions, never en masse. */
export const MUSEUM_ASSETS: readonly MuseumAssetDefinition[] = [
  { id: 'bench.rendering', category: 'benches', glbPath: '/museum-assets/models/gallery015_bench.glb', scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: floorDefaults },
  { id: 'bench.lego', category: 'benches', glbPath: '/museum-assets/lego/furniture/gallery015_bench.glb', scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: floorDefaults },
  { id: 'bench.simple', category: 'benches', glbPath: '/museum-assets/simple/models/gallery015_bench.glb', scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: floorDefaults },
  { id: 'sculpture.abstract', category: 'sculptures', glbPath: '/museum-assets/accessories/gallery015_abstract_sculpture.glb', scale: [1, 1, 1], rotation: [0, 0.3, 0], defaultPlacement: displayDefaults },
  { id: 'pedestal.gallery015', category: 'pedestals', glbPath: '/museum-assets/accessories/gallery015_pedestal.glb', scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: floorDefaults },
  { id: 'information.catalog-console', category: 'information', glbPath: '/museum-assets/accessories/gallery015_catalog_console.glb', scale: [1, 1, 1], rotation: [0, Math.PI / 2, 0], defaultPlacement: { room: 'entrance', anchor: 'floor', clearanceMeters: 1.5 } },
  { id: 'information.brochure-stand', category: 'information', glbPath: '/museum-assets/accessories/gallery015_brochure_stand.glb', scale: [1, 1, 1], rotation: [0, Math.PI / 2, 0], defaultPlacement: { room: 'entrance', anchor: 'floor', clearanceMeters: 1.2 } },
  { id: 'architectural.floor-stone-pbr', category: 'architectural', texturePaths: floorTextures, scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: floorDefaults },
  { id: 'architectural.wall-plaster-pbr', category: 'architectural', texturePaths: wallTextures, scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: { room: 'gallery-hall', anchor: 'wall', clearanceMeters: 0 } },
  { id: 'architectural.rendering-materials', category: 'architectural', texturePaths: ['/museum-assets/rendering/floor_polished_concrete.jpg', '/museum-assets/rendering/wall_plaster.jpg', '/museum-assets/rendering/ceiling_warm_matte.jpg'], scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: { room: 'gallery-hall', anchor: 'wall', clearanceMeters: 0 } },
  { id: 'lighting.ceiling-cove', category: 'lighting', texturePaths: ['/museum-assets/lego/surfaces/ceiling_cove_track.jpg', '/museum-assets/simple/textures/cove-glow.jpg'], scale: [1, 1, 1], rotation: [0, 0, 0], defaultPlacement: { room: 'gallery-hall', anchor: 'ceiling', clearanceMeters: 0 } },
];

export function getMuseumAsset(id: string) {
  return MUSEUM_ASSETS.find((asset) => asset.id === id);
}

export function getMuseumAssetsByCategory(category: MuseumAssetCategory) {
  return MUSEUM_ASSETS.filter((asset) => asset.category === category);
}
