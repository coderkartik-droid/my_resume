import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import {
  clamp,
  createGlowSprite,
  createLayer,
  createRng,
  drawOpaqueBackdrop,
  hexToRgba,
} from "./helpers";

/**
 * MILKY WAY GALAXY — a realistic deep-space night sky: navy-black gradients,
 * a soft galactic band with layered nebulae, thousands of faint stars and a
 * handful of brighter ones, all drifting with a very subtle parallax depth.
 */

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
  twinkle: number;
  /** 0 = far / little movement, 1 = near / most movement. */
  depth: number;
  color: string;
}

const STAR_COLORS = ["#ffffff", "#dbe6ff", "#c4d4ff", "#ffe9d6", "#e8ddff"];
const BAND_ANGLE = -0.62;

export function createMilkyWayScene(env: SceneEnv): Scene {
  const { ctx, width, height, dpr, mobile } = env;
  const density = clamp(env.density, 0.5, 2);
  const rng = createRng(0x5eed11);

  const sky = createLayer(width, height, dpr, 1.25);
  if (sky) {
    const c = sky.ctx;

    // Deep space gradient — navy at the top fading into near-black.
    const base = c.createLinearGradient(0, 0, width * 0.4, height);
    base.addColorStop(0, "#01030c");
    base.addColorStop(0.42, "#050b22");
    base.addColorStop(0.75, "#03061a");
    base.addColorStop(1, "#01020a");
    c.fillStyle = base;
    c.fillRect(0, 0, width, height);

    // Galactic band — soft diagonal glow through the middle of the frame.
    c.save();
    c.translate(width * 0.52, height * 0.5);
    c.rotate(BAND_ANGLE);
    const bandHeight = height * 0.46;
    const band = c.createLinearGradient(0, -bandHeight / 2, 0, bandHeight / 2);
    band.addColorStop(0, hexToRgba("#0a1030", 0));
    band.addColorStop(0.3, hexToRgba("#5f6fc4", 0.1));
    band.addColorStop(0.5, hexToRgba("#c9d6ff", 0.17));
    band.addColorStop(0.7, hexToRgba("#8b7fd0", 0.1));
    band.addColorStop(1, hexToRgba("#0a1030", 0));
    c.fillStyle = band;
    c.fillRect(-width * 1.2, -bandHeight / 2, width * 2.4, bandHeight);

    // Nebula clouds — a few large, very soft radial washes.
    c.globalCompositeOperation = "lighter";
    const nebulaColors = ["#4f6ad8", "#9b6fd8", "#3f8fb8", "#6f5ac8"];
    for (let i = 0; i < 7; i++) {
      const nx = (rng() - 0.15) * width * 1.1;
      const ny = (rng() - 0.5) * height * 0.42;
      const nr = (0.18 + rng() * 0.28) * Math.max(width, height);
      const color = nebulaColors[i % nebulaColors.length];
      const gradient = c.createRadialGradient(nx, ny, 0, nx, ny, nr);
      gradient.addColorStop(0, hexToRgba(color, 0.14));
      gradient.addColorStop(0.55, hexToRgba(color, 0.05));
      gradient.addColorStop(1, hexToRgba(color, 0));
      c.fillStyle = gradient;
      c.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    }

    // Interstellar dust — the "thousands of stars" texture baked into the band.
    const dust = Math.round((mobile ? 900 : 2400) * Math.min(density, 1.6));
    for (let i = 0; i < dust; i++) {
      const spread = (rng() - 0.5) * width * 1.7;
      const offset = (rng() - 0.5) * bandHeight * 0.62;
      const size = rng() < 0.85 ? 1 : 1.6;
      c.globalAlpha = 0.12 + rng() * 0.42;
      c.fillStyle = rng() < 0.6 ? "#dfe8ff" : "#ffffff";
      c.fillRect(spread, offset, size, size);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.restore();
  }

  // Live twinkling stars, split across three parallax depths.
  const starCount = Math.round((mobile ? 130 : 340) * density);
  const stars: Star[] = Array.from({ length: starCount }, () => {
    const depth = rng();
    return {
      x: rng() * width,
      y: rng() * height,
      size: 0.9 + depth * 1.5,
      alpha: 0.35 + rng() * 0.65,
      phase: rng() * Math.PI * 2,
      twinkle: 0.5 + rng() * 1.6,
      depth,
      color: STAR_COLORS[(rng() * STAR_COLORS.length) | 0],
    };
  });

  const brightCount = mobile ? 5 : 10;
  const brights = Array.from({ length: brightCount }, () => ({
    x: rng() * width,
    y: rng() * height,
    size: 10 + rng() * 22,
    alpha: 0.25 + rng() * 0.35,
    phase: rng() * Math.PI * 2,
    depth: 0.3 + rng() * 0.7,
  }));
  const brightSprite = createGlowSprite(64, "#cfe0ff", 0.9);

  return {
    draw(_dt, elapsed, pointer) {
      drawOpaqueBackdrop(ctx, width, height, sky, "#01030c");

      const ox = pointer.x * 22;
      const oy = pointer.y * 14;

      ctx.globalCompositeOperation = "lighter";

      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(elapsed * star.twinkle + star.phase);
        ctx.globalAlpha = clamp(star.alpha * twinkle, 0, 1);
        ctx.fillStyle = star.color;
        ctx.fillRect(
          star.x + ox * star.depth,
          star.y + oy * star.depth,
          star.size,
          star.size
        );
      }

      if (brightSprite) {
        for (const star of brights) {
          const twinkle = 0.6 + 0.4 * Math.sin(elapsed * 0.7 + star.phase);
          ctx.globalAlpha = clamp(star.alpha * twinkle, 0, 1);
          const s = star.size * (0.92 + twinkle * 0.08);
          ctx.drawImage(
            brightSprite,
            star.x + ox * star.depth - s / 2,
            star.y + oy * star.depth - s / 2,
            s,
            s
          );
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}
