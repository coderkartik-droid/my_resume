import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import {
  clamp,
  createCurtainSprite,
  createGlowSprite,
  createLayer,
  createRng,
  drawOpaqueBackdrop,
  hexToRgba,
} from "./helpers";

/**
 * CYBERPUNK CITY — a dark futuristic skyline silhouetted against neon purple,
 * blue and pink haze, with distant vertical light beams and drifting fog.
 *
 * The skyline itself never changes, so it is rendered once into an offscreen
 * layer (glows, buildings and lit windows all baked together) and blitted.
 */

interface Beam {
  x: number;
  width: number;
  height: number;
  alpha: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  sprite: HTMLCanvasElement;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  wobbleAmp: number;
  phase: number;
  depth: number;
}

const NEON = ["#f472b6", "#38bdf8", "#a855f7", "#e879f9", "#22d3ee"];

export function createCyberpunkCityScene(env: SceneEnv): Scene {
  const { ctx, width, height, dpr, mobile } = env;
  const density = clamp(env.density, 0.5, 2);
  const rng = createRng(0x21c0de);

  const horizon = height * 0.72;

  const city = createLayer(width, height, dpr, 1.4);
  if (city) {
    const c = city.ctx;

    const sky = c.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#07030f");
    sky.addColorStop(0.45, "#150425");
    sky.addColorStop(0.72, "#2b0a3a");
    sky.addColorStop(1, "#0a0316");
    c.fillStyle = sky;
    c.fillRect(0, 0, width, height);

    // Neon haze sitting on the horizon line.
    c.globalCompositeOperation = "lighter";
    const hazeColors = ["#f472b6", "#38bdf8", "#a855f7"];
    for (let i = 0; i < 5; i++) {
      const gx = ((i + 0.5) / 5) * width + (rng() - 0.5) * width * 0.2;
      const gr = width * (0.16 + rng() * 0.2);
      const gradient = c.createRadialGradient(gx, horizon, 0, gx, horizon, gr);
      const color = hazeColors[i % hazeColors.length];
      gradient.addColorStop(0, hexToRgba(color, 0.26));
      gradient.addColorStop(0.5, hexToRgba(color, 0.08));
      gradient.addColorStop(1, hexToRgba(color, 0));
      c.fillStyle = gradient;
      c.fillRect(gx - gr, horizon - gr, gr * 2, gr * 2);
    }
    c.globalCompositeOperation = "source-over";

    // Skyline, drawn back-to-front in two depth rows.
    const rows = [
      {
        base: horizon - height * 0.02,
        minH: height * 0.1,
        maxH: height * 0.3,
        fill: "#0a0418",
        windowAlpha: 0.5,
        minW: 26,
        maxW: 62,
      },
      {
        base: horizon + height * 0.06,
        minH: height * 0.14,
        maxH: height * 0.44,
        fill: "#05020d",
        windowAlpha: 0.85,
        minW: 34,
        maxW: 92,
      },
    ];

    for (const row of rows) {
      let x = -20;
      while (x < width + 20) {
        const w = row.minW + rng() * (row.maxW - row.minW);
        const h = row.minH + rng() * (row.maxH - row.minH);
        const top = row.base - h;

        c.fillStyle = row.fill;
        c.fillRect(x, top, w, h + height * 0.2);

        // Sparse lit windows.
        const cols = Math.max(1, Math.floor(w / 9));
        const rowCount = Math.max(1, Math.floor(h / 13));
        for (let cx = 0; cx < cols; cx++) {
          for (let cy = 0; cy < rowCount; cy++) {
            if (rng() > 0.12) continue;
            c.fillStyle = hexToRgba(
              NEON[(rng() * NEON.length) | 0],
              row.windowAlpha * (0.35 + rng() * 0.65)
            );
            c.fillRect(x + 4 + cx * 9, top + 6 + cy * 13, 3, 4);
          }
        }

        // Occasional rooftop antenna.
        if (rng() < 0.18) {
          c.fillStyle = row.fill;
          const ax = x + w * (0.3 + rng() * 0.4);
          const ah = 12 + rng() * 34;
          c.fillRect(ax, top - ah, 2, ah);
        }

        x += w + 3 + rng() * 12;
      }
    }
  }

  const beamSprites = ["#f472b6", "#38bdf8", "#a855f7"]
    .map((color) => createCurtainSprite(40, 340, color))
    .filter((s): s is HTMLCanvasElement => s !== null);

  const beams: Beam[] = [];
  if (beamSprites.length > 0) {
    const count = mobile ? 4 : 7;
    for (let i = 0; i < count; i++) {
      beams.push({
        x: ((i + 0.5) / count) * width + (rng() - 0.5) * 60,
        width: 40 + rng() * 90,
        height: height * (0.3 + rng() * 0.4),
        alpha: 0.08 + rng() * 0.1,
        swayAmp: 10 + rng() * 26,
        swaySpeed: 0.05 + rng() * 0.1,
        phase: rng() * Math.PI * 2,
        sprite: beamSprites[(rng() * beamSprites.length) | 0],
      });
    }
  }

  const emberSprite = createGlowSprite(20, "#f0abfc", 0.9);
  const emberCount = Math.round((mobile ? 24 : 60) * density);
  const embers: Ember[] = Array.from({ length: emberCount }, () => ({
    x: rng() * width,
    y: horizon - rng() * height * 0.6,
    size: 4 + rng() * 14,
    alpha: 0.1 + rng() * 0.3,
    speed: 5 + rng() * 14,
    wobbleAmp: 6 + rng() * 20,
    phase: rng() * Math.PI * 2,
    depth: 0.2 + rng() * 0.8,
  }));

  const fog = ctx.createLinearGradient(0, horizon - height * 0.18, 0, horizon + height * 0.1);
  fog.addColorStop(0, hexToRgba("#000000", 0));
  fog.addColorStop(0.55, hexToRgba("#7c3fbf", 0.14));
  fog.addColorStop(1, hexToRgba("#000000", 0));

  return {
    draw(dt, elapsed, pointer) {
      drawOpaqueBackdrop(ctx, width, height, city, "#07030f");

      const ox = pointer.x * 24;
      const oy = pointer.y * 12;

      // Vertical neon beams behind the haze.
      ctx.globalCompositeOperation = "lighter";
      for (const beam of beams) {
        const sway = Math.sin(elapsed * beam.swaySpeed + beam.phase) * beam.swayAmp;
        const breathe = 0.6 + 0.4 * Math.sin(elapsed * 0.35 + beam.phase);
        ctx.globalAlpha = clamp(beam.alpha * breathe, 0, 1);
        ctx.drawImage(
          beam.sprite,
          beam.x + sway + ox * 0.5 - beam.width / 2,
          horizon - beam.height,
          beam.width,
          beam.height
        );
      }

      // Floating embers.
      if (emberSprite) {
        for (const e of embers) {
          if (dt > 0) {
            e.y -= e.speed * dt;
            if (e.y < horizon - height * 0.75) {
              e.y = horizon + 10;
              e.x = Math.random() * width;
            }
          }
          const wobble = Math.sin(elapsed * 0.4 + e.phase) * e.wobbleAmp;
          ctx.globalAlpha = clamp(e.alpha * (0.6 + 0.4 * Math.sin(elapsed * 0.6 + e.phase)), 0, 1);
          ctx.drawImage(
            emberSprite,
            e.x + wobble + ox * e.depth - e.size / 2,
            e.y + oy * e.depth - e.size / 2,
            e.size,
            e.size
          );
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Slow atmospheric fog rolling across the skyline.
      const fogShift = Math.sin(elapsed * 0.06) * width * 0.06;
      ctx.save();
      ctx.translate(fogShift, 0);
      ctx.fillStyle = fog;
      ctx.fillRect(-width * 0.1, horizon - height * 0.18, width * 1.2, height * 0.3);
      ctx.restore();

      // Subtle top vignette keeps the foreground text readable.
      const vignette = ctx.createLinearGradient(0, 0, 0, height * 0.35);
      vignette.addColorStop(0, hexToRgba("#000000", 0.45));
      vignette.addColorStop(1, hexToRgba("#000000", 0));
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height * 0.35);
    },
  };
}
