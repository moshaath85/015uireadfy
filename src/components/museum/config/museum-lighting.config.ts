export const AMBIENT = {
  hemisphere: { sky: '#fff9ef', ground: '#5a5143', intensity: 0.9 },
  ambient: { color: '#faf6ed', intensity: 0.45 },
};

export const COVE = {
  color: '#fff7e9',
  height: 0.5,
  lights: [
    { position: [0, 0, 0], rotation: [0, 0, 0], width: 0, intensity: 1.5 },
    { position: [0, 0, 0], rotation: [0, -Math.PI / 2, 0], width: 0, intensity: 1.2 },
    { position: [0, 0, 0], rotation: [0, Math.PI / 2, 0], width: 0, intensity: 1.2 },
  ] as const,
};

export const ARTWORK_ACCENT = {
  color: '#fff7e9',
  height: 1.45,
  lights: [
    { position: [-3.4, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: 2.65, intensity: 2.2 },
    { position: [3.6, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: 2.65, intensity: 2.2 },
    { position: [0, 0, 0.5] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], width: 2.25, intensity: 2.0 },
    { position: [0, 0, -2.2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], width: 2.25, intensity: 2.0 },
  ] as const,
};
