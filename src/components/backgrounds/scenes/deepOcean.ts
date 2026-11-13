import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import {
  clamp,
  createCurtainSprite,
  createGlowSprite,
  createRng,
  drawOpaqueBackdrop,
  createLayer,
  hexToRgba,
} from "./helpers";

/**
 * DEEP OCEAN — a dark underwater atmosphere with deep blue gradients, slow
 * shafts of filtered sunlight and gently drifting plankton particles.
 */

interface Shaft {
  x: number;
  width: number;
  height: number;
  skew: number;
  alpha: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
}

interface Plankton {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  phase: number;
  depth: number;
}

export function createDeepOceanScene(env: SceneEnv): Scene {
  const { ctx, width, height, dpr, mobile } = env;
  const density = clamp(env.density, 0.5, 2);
  const rng = createRng(0x0cea11);

  const water = createLayer(width, height, dpr, 1.25);
  if (water) {
    const c = water.ctx;
    const gradient = c.createLinearGradient(0, 0, width * 0.2, height);
    gradient.addColorStop(0, "#0a3a5c");
    gradient.addColorStop(0.35, "#062438");
    gradient.addColorStop(0.7, "#031324");
    gradient.addColorStop(1, "#01070f");
    c.fillStyle = gradient;
    c.fillRect(0, 0, width, height);

    // Sunlight bleeding in from the surface.
    const surface = c.createRadialGradient(
      width * 0.5,
      -height * 0.15,
      0,
      width * 0.5,
      -height * 0.15,
      Math.max(width, height) * 0.75
    );
    surface.addColorStop(0, hexToRgba("#7fd4ff", 0.22));
    surface.addColorStop(0.5, hexToRgba("#2f8fc4", 0.08));
    surface.addColorStop(1, hexToRgba("#02101c", 0));
    c.fillStyle = surface;
    c.fillRect(0, 0, width, height);
  }

  const shaftSprite = createCurtainSprite(64, 420, "#9fe4ff");
  const shafts: Shaft[] = [];
  if (shaftSprite) {
    const count = mobile ? 5 : 8;
    for (let i = 0; i < count; i++) {
      shafts.push({
        x: ((i + 0.5) / count) * width + (rng() - 0.5) * (width / count),
        width: 70 + rng() * 130,
        height: height * (0.72 + rng() * 0.4),
        skew: (rng() - 0.5) * 0.5,
        alpha: 0.07 + rng() * 0.08,
        swayAmp: 14 + rng() * 34,
        swaySpeed: 0.06 + rng() * 0.12,
        phase: rng() * Math.PI * 2,
      });
    }
  }

  const planktonSprite = createGlowSprite(24, "#7fe9ff", 0.85);
  const planktonCount = Math.round((mobile ? 60 : 130) * density);
  const plankton: Plankton[] = Array.from({ length: planktonCount }, () => ({
    x: rng() * width,
    y: rng() * height,
    size: 3 + rng() * 14,
    speed: 6 + rng() * 16,
    alpha: 0.12 + rng() * 0.35,
    wobbleAmp: 8 + rng() * 26,
    wobbleSpeed: 0.15 + rng() * 0.4,
    phase: rng() * Math.PI * 2,
    depth: 0.25 + rng() * 0.75,
  }));

  const vignette = ctx.createLinearGradient(0, height * 0.5, 0, height);
  vignette.addColorStop(0, hexToRgba("#000000", 0));
  vignette.addColorStop(1, hexToRgba("#00060c", 0.8));

  return {
    draw(dt, elapsed, pointer) {
      drawOpaqueBackdrop(ctx, width, height, water, "#031324");

      const ox = pointer.x * 18;
      const oy = pointer.y * 10;

      // Filtered light shafts.
      if (shaftSprite) {
        ctx.globalCompositeOperation = "lighter";
        for (const shaft of shafts) {
          const sway = Math.sin(elapsed * shaft.swaySpeed + shaft.phase) * shaft.swayAmp;
          const breathe = 0.55 + 0.45 * Math.sin(elapsed * 0.28 + shaft.phase);
          ctx.save();
          ctx.translate(shaft.x + sway + ox * 0.4, -30);
          ctx.transform(1, 0, shaft.skew, 1, 0, 0);
          ctx.globalAlpha = clamp(shaft.alpha * breathe, 0, 1);
          ctx.drawImage(shaftSprite, -shaft.width / 2, 0, shaft.width, shaft.height);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      // Drifting plankton.
      if (planktonSprite) {
        ctx.globalCompositeOperation = "lighter";
        for (const p of plankton) {
          if (dt > 0) {
            p.y -= p.speed * dt;
            if (p.y < -24) {
              p.y = height + 24;
              p.x = Math.random() * width;
            }
          }
          const wobble = Math.sin(elapsed * p.wobbleSpeed + p.phase) * p.wobbleAmp;
          const x = p.x + wobble + ox * p.depth;
          const y = p.y + oy * p.depth;
          ctx.globalAlpha = clamp(p.alpha, 0, 1);
          ctx.drawImage(planktonSprite, x - p.size / 2, y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.fillStyle = vignette;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);
    },
  };
}
