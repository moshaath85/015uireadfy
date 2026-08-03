import sharp from "sharp";

export interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  frequency: number; // 0-1 proportion in image
  name: string; // human-readable name
}

export interface ColorReport {
  dominantColors: PaletteColor[]; // top 5
  palette: PaletteColor[]; // up to 10
  brightness: number; // 0-1 avg luminance
  contrast: number; // 0-1 RMS contrast
  colorTemperature: "warm" | "neutral" | "cool";
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function colorName(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (l < 15) return "near black";
  if (l > 92) return "near white";
  if (s < 15) return l < 45 ? "dark gray" : l > 65 ? "light gray" : "gray";
  if (h < 20 || h > 340) return l < 45 ? "deep red" : "warm red";
  if (h < 45) return s > 60 ? "orange" : "warm beige";
  if (h < 70) return l < 50 ? "olive" : "warm gold";
  if (h < 160) return s > 40 ? "green" : "sage";
  if (h < 200) return s > 40 ? "teal" : "cool gray";
  if (h < 260) return s > 40 ? "blue" : "cool steel";
  if (h < 290) return s > 40 ? "purple" : "lavender";
  if (h < 340) return s > 40 ? "magenta" : "dusty rose";
  return "earth tone";
}

export async function extractColors(buffer: Buffer): Promise<ColorReport> {
  const maxDim = 200;
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 600;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);

  const { data } = await sharp(buffer).resize(dw, dh).raw().toBuffer({ resolveWithObject: true });
  const pixels = dw * dh;

  // Color quantization: bucket pixels into 32x32x32 color space
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalLum = 0;
  const luminances: number[] = [];

  for (let i = 0; i < pixels; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    const entry = buckets.get(key);
    if (entry) entry.count++;
    else buckets.set(key, { r: qr, g: qg, b: qb, count: 1 });

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLum += lum;
    luminances.push(lum);
  }

  const avgLum = totalLum / pixels;
  const brightness = avgLum / 255;

  // RMS contrast
  const contrast = Math.sqrt(luminances.reduce((s, l) => s + (l - avgLum) ** 2, 0) / pixels) / 255;

  // Sort by frequency
  const allColors = Array.from(buckets.values()).sort((a, b) => b.count - a.count);

  const palette: PaletteColor[] = allColors.slice(0, 10).map(c => ({
    hex: rgbToHex(c.r, c.g, c.b),
    rgb: [c.r, c.g, c.b],
    hsl: rgbToHsl(c.r, c.g, c.b),
    frequency: c.count / pixels,
    name: colorName(c.r, c.g, c.b),
  }));

  const dominantColors = palette.slice(0, 5);

  // Color temperature from dominant colors
  const warmScore = dominantColors.reduce((s, c) => {
    const [h] = c.hsl;
    return s + (h < 60 || h > 300 ? c.frequency : 0);
  }, 0);
  const coolScore = dominantColors.reduce((s, c) => {
    const [h] = c.hsl;
    return s + (h > 160 && h < 280 ? c.frequency : 0);
  }, 0);
  const colorTemperature: "warm" | "neutral" | "cool" =
    warmScore > coolScore * 1.4 ? "warm" : coolScore > warmScore * 1.4 ? "cool" : "neutral";

  return { dominantColors, palette, brightness, contrast, colorTemperature };
}
