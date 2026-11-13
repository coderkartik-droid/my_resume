import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import { clamp, createGlowSprite, createRng, hexToRgba } from "./helpers";

/**
 * COSMIC PARTICLES — a premium obsidian backdrop filled with glowing motes
 * suspended at three depths, drifting slowly with a subtle parallax response.
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  driftX: number;
  driftY: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  phase: number;
  sprite: HTMLCanvasElement;
  depth: number;
}

const PALETTE = [
  { color: "#c4b5fd", size: 26 },
  { color: "#7dd3fc", size: 24 },
  { color: "#ffffff", size: 20 },
];

export function createCosmicParticlesScene(env: SceneEnv): Scene {
  const { ctx, width, height, mobile } = env;
  const density = clamp(env.density, 0.5, 2);
  const rng = createRng(0xc05a1c);

  const sprites = PALETTE.map((p) => createGlowSprite(p.size, p.color, 1)).filter(
    (s): s is HTMLCanvasElement => s !== null
  );

  const count = Math.round((mobile ? 70 : 160) * density);

  const particles: Particle[] = [];
  if (sprites.length > 0) {
    for (let i = 0; i < count; i++) {
      const depth = rng();
      particles.push({
        x: rng() * width,
        y: rng() * height,
        size: 6 + depth * 34,
        alpha: 0.16 + rng() * 0.5,
        driftX: (rng() - 0.5) * 6,
        driftY: -3 - rng() * 9,
        wobbleAmp: 6 + rng() * 22,
        wobbleSpeed: 0.12 + rng() * 0.35,
        phase: rng() * Math.PI * 2,
        sprite: sprites[(rng() * sprites.length) | 0],
        depth,
      });
    }
  }

  const base = ctx.createRadialGradient(
    width * 0.42,
    height * 0.34,
    0,
    width * 0.42,
    height * 0.34,
    Math.max(width, height) * 0.95
  );
  base.addColorStop(0, "#0c0b24");
  base.addColorStop(0.5, "#06060f");
  base.addColorStop(1, "#020206");

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.2,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.78
  );
  vignette.addColorStop(0, hexToRgba("#000000", 0));
  vignette.addColorStop(1, hexToRgba("#000000", 0.55));

  return {
    draw(dt, elapsed, pointer) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      const ox = pointer.x * 30;
      const oy = pointer.y * 20;

      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        if (dt > 0) {
          p.x += p.driftX * dt;
          p.y += p.driftY * dt;
          if (p.y < -40) {
            p.y = height + 40;
            p.x = Math.random() * width;
          }
          if (p.x < -40) p.x = width + 40;
          else if (p.x > width + 40) p.x = -40;
        }

        const wobble = Math.sin(elapsed * p.wobbleSpeed + p.phase) * p.wobbleAmp;
        const pulse = 0.68 + 0.32 * Math.sin(elapsed * 0.5 + p.phase);
        const x = p.x + wobble + ox * p.depth;
        const y = p.y + oy * p.depth;
        const size = p.size * pulse;

        ctx.globalAlpha = clamp(p.alpha * pulse, 0, 1);
        ctx.drawImage(p.sprite, x - size / 2, y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    },
  };
}
