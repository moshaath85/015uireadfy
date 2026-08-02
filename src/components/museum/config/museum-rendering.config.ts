export const MUSEUM_RENDERING_CONFIG = {
  renderer: {
    exposure: 0.95,
    dpr: [1, 1.75] as [number, number],
  },
  environment: {
    intensity: 0.32,
  },
  materials: {
    wall: {
      color: "#d7d1c6",
      roughness: 0.78,
      repeat: [1.15, 1.0] as [number, number],
      anisotropy: 16,
    },
    floor: {
      color: "#4b453d",
      roughness: 0.42,
      clearcoat: 0.07,
      clearcoatRoughness: 0.72,
      repeat: [14, 10] as [number, number],
      anisotropy: 16,
    },
    ceiling: {
      color: "#e8e4da",
      roughness: 0.92,
      repeat: [3, 2] as [number, number],
      anisotropy: 8,
    },
  },
  lights: {
    ambient: 0.10,
    hemisphere: 0.22,
    backWall: {
      intensity: 2.25,
      width: 11.5,
      height: 3.4,
      position: [0, 3.5, 2.8] as [number, number, number],
      target: [0, 2.2, -5.4] as [number, number, number],
    },
    sideWall: {
      intensity: 1.25,
      width: 7.0,
      height: 3.2,
    },
    cove: {
      intensity: 1.45,
      color: "#ffe9c6",
    },
  },
  shadows: {
    contactOpacity: 0.34,
    contactBlur: 2.6,
    contactFar: 6,
    contactResolution: 1024,
  },
} as const;
