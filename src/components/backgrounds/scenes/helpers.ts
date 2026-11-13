/**
 * Shared building blocks for the Background Theme Studio scenes.
 *
 * Everything here is intentionally dependency-free and canvas-2D only: the
 * priority is a premium look with a low per-frame cost, so expensive artwork
 * (nebulae, skylines, glows) is pre-rendered once into an offscreen layer and
 * simply blitted afterwards.
 */

/** Small deterministic PRNG so procedural artwork stays stable across rebuilds. */
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface Layer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/**
 * Offscreen render target for static artwork. The device-pixel-ratio is capped
 * so a large soft layer can never balloon into a huge allocation.
 */
export function createLayer(
  width: number,
  height: number,
  dpr: number,
  maxScale = 1.5
): Layer | null {
  const canvas = document.createElement("canvas");
  const scale = Math.min(dpr, maxScale);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);
  return { canvas, ctx, width, height };
}

/** Pre-rendered soft radial glow — reused for every light-emitting particle. */
export function createGlowSprite(
  size: number,
  color: string,
  intensity = 1
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, hexToRgba(color, clamp(intensity, 0, 1)));
  gradient.addColorStop(0.3, hexToRgba(color, clamp(intensity, 0, 1) * 0.42));
  gradient.addColorStop(0.65, hexToRgba(color, clamp(intensity, 0, 1) * 0.12));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/**
 * Vertical "curtain" sprite: bright near the top and softly fading at the
 * bottom and on both sides. Used for aurora ribbons and city light beams.
 */
export function createCurtainSprite(
  width: number,
  height: number,
  color: string
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, hexToRgba(color, 0));
  vertical.addColorStop(0.08, hexToRgba(color, 0.9));
  vertical.addColorStop(0.42, hexToRgba(color, 0.34));
  vertical.addColorStop(1, hexToRgba(color, 0));

  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);

  const horizontal = ctx.createLinearGradient(0, 0, width, 0);
  horizontal.addColorStop(0, "rgba(0,0,0,0)");
  horizontal.addColorStop(0.5, "rgba(0,0,0,1)");
  horizontal.addColorStop(1, "rgba(0,0,0,0)");

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  return canvas;
}

export function drawOpaqueBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: Layer | null,
  fallback: string
): void {
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
  if (layer) {
    ctx.drawImage(layer.canvas, 0, 0, width, height);
    return;
  }
  ctx.fillStyle = fallback;
  ctx.fillRect(0, 0, width, height);
}
