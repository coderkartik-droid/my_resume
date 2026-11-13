import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import { clamp, createCurtainSprite, createRng, hexToRgba } from "./helpers";

/**
 * AURORA BOREALIS — soft ribbons of northern light drifting slowly across a
 * deep polar sky. Each ribbon is a curtain of pre-rendered light shafts, so the
 * per-frame cost stays at a few hundred cheap blits.
 */

interface Ribbon {
  sprite: HTMLCanvasElement;
  rays: number;
  rayWidth: number;
  height: number;
  topY: number;
  topAmp: number;
  topFreq: number;
  waveAmp: number;
  waveFreq: number;
  speed: number;
  driftAmp: number;
  driftSpeed: number;
  phase: number;
  alpha: number;
}

interface SkyStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
  twinkle: number;
}

const RIBBON_COLORS = ["#4ade80", "#22d3ee", "#60a5fa", "#8b5cf6", "#34d399"];

export function createAuroraBorealisScene(env: SceneEnv): Scene {
  const { ctx, width, height, mobile } = env;
  const density = clamp(env.density, 0.5, 2);
  const rng = createRng(0xa47012);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#02040e");
  sky.addColorStop(0.45, "#051426");
  sky.addColorStop(0.8, "#04101f");
  sky.addColorStop(1, "#01030a");

  const horizon = ctx.createLinearGradient(0, height * 0.55, 0, height);
  horizon.addColorStop(0, hexToRgba("#000000", 0));
  horizon.addColorStop(1, hexToRgba("#000208", 0.85));

  const ribbonCount = 5;
  const ribbons: Ribbon[] = [];
  for (let i = 0; i < ribbonCount; i++) {
    const color = RIBBON_COLORS[i % RIBBON_COLORS.length];
    const sprite = createCurtainSprite(48, 320, color);
    if (!sprite) continue;
    ribbons.push({
      sprite,
      rays: Math.round((mobile ? 26 : 46) * Math.min(density, 1.5)),
      rayWidth: 44 + rng() * 46,
      height: height * (0.42 + rng() * 0.34),
      topY: height * (0.04 + rng() * 0.22),
      topAmp: 22 + rng() * 46,
      topFreq: 1.4 + rng() * 2.2,
      waveAmp: 18 + rng() * 34,
      waveFreq: 1.1 + rng() * 2.4,
      speed: 0.1 + rng() * 0.18,
      driftAmp: 26 + rng() * 48,
      driftSpeed: 0.05 + rng() * 0.1,
      phase: rng() * Math.PI * 2,
      alpha: 0.34 + rng() * 0.3,
    });
  }

  const starCount = Math.round((mobile ? 70 : 150) * Math.min(density, 1.5));
  const stars: SkyStar[] = Array.from({ length: starCount }, () => ({
    x: rng() * width,
    y: rng() * height * 0.7,
    size: 0.8 + rng() * 1.3,
    alpha: 0.25 + rng() * 0.55,
    phase: rng() * Math.PI * 2,
    twinkle: 0.4 + rng() * 1.3,
  }));

  return {
    draw(_dt, elapsed) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Faint stars above the aurora.
      for (const star of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(elapsed * star.twinkle + star.phase);
        ctx.globalAlpha = clamp(star.alpha * twinkle, 0, 1);
        ctx.fillStyle = "#e6f0ff";
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      ctx.globalCompositeOperation = "lighter";

      for (const ribbon of ribbons) {
        const drift =
          Math.sin(elapsed * ribbon.driftSpeed + ribbon.phase) * ribbon.driftAmp;

        for (let i = 0; i <= ribbon.rays; i++) {
          const t = i / ribbon.rays;
          const x =
            t * width +
            drift +
            Math.sin(t * ribbon.waveFreq + elapsed * ribbon.speed + ribbon.phase) *
              ribbon.waveAmp;
          const topY =
            ribbon.topY +
            Math.sin(t * ribbon.topFreq + elapsed * ribbon.speed * 0.8 + ribbon.phase) *
              ribbon.topAmp;
          const h =
            ribbon.height *
            (0.72 + 0.28 * Math.sin(t * 4.4 + elapsed * 0.35 + ribbon.phase));
          const shimmer =
            0.5 + 0.5 * Math.sin(t * 9.5 + elapsed * 0.6 + ribbon.phase * 2.1);

          ctx.globalAlpha = clamp(ribbon.alpha * (0.4 + 0.6 * shimmer), 0, 1);
          ctx.drawImage(
            ribbon.sprite,
            x - ribbon.rayWidth / 2,
            topY,
            ribbon.rayWidth,
            h
          );
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = horizon;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);
    },
  };
}
