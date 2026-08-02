export const FRAME = {
  matColor: '#fafaf4',
  matRoughness: 0.45,
  matZOffset: -0.025,
  frameColor: '#2a2724',
  frameRoughness: 0.4,
  frameDepth: 0.04,
  artworkTextureRoughness: 0.35,
  textureZOffset: -0.012,
  thickness: {
    withBorder: 0.008,
    withoutBorder: 0.024,
  },
  matWidth: 0,
  fallback: {
    width: 0.5,
    height: 0.65,
    color: '#3a3730',
    roughness: 0.5,
  },
};

export const BORDER_DETECTION = {
  sampleSize: 200,
  borderWidth: 5,
  brightnessThreshold: 600,
  ratioThreshold: 1 / 12,
};
