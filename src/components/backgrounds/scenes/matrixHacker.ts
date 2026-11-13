import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import { clamp } from "./helpers";

/**
 * MATRIX HACKER — the original site-wide digital rain, now one selectable
 * scene. Columns of falling binary digits on a near-black green void, bright
 * leading glyphs and an optional phosphor glow.
 */

const BACKDROP = "#010603";
const HEAD_COLOR = "#d9ffe6";
const NEAR_HEAD_COLOR = "#7dffb0";
const GLYPH_COLOR = "#22e06b";
const GLOW_COLOR = "#39ff88";

interface RainColumn {
  headY: number;
  /** Vertical speed in pixels per second. */
  speed: number;
  fontSize: number;
  brightness: number;
  glow: boolean;
  chars: string[];
}

export function createMatrixHackerScene(env: SceneEnv): Scene {
  const { ctx, width, height, mobile } = env;
  const density = clamp(env.density, 0.5, 2);

  // Higher density means more columns — the glyph size shrinks proportionally
  // so the rain gets denser without ever overlapping.
  const baseFontSize = mobile ? 13 : 16;
  const fontSize = baseFontSize / Math.sqrt(density);
  const columnWidth = fontSize * 1.15;
  const columnCount = Math.max(1, Math.ceil(width / columnWidth));

  const randChar = () => (Math.random() > 0.5 ? "1" : "0");
  const randSpeed = () => (mobile ? 95 : 120) * (0.55 + Math.random() * 1.7);

  const createColumn = (restart: boolean): RainColumn => {
    const length = Math.round((mobile ? 6 : 8) + Math.random() * (mobile ? 10 : 20));
    const colFont = fontSize * (0.85 + Math.random() * 0.35);
    return {
      // Negative head positions let columns slide in from above the viewport.
      headY: restart
        ? -(length * colFont + Math.random() * height * 0.25)
        : Math.random() * (height + length * colFont) - length * colFont,
      speed: randSpeed(),
      fontSize: colFont,
      brightness: 0.32 + Math.random() * 0.68,
      glow: Math.random() < 0.5,
      chars: Array.from({ length }, randChar),
    };
  };

  const columns: RainColumn[] = Array.from({ length: columnCount }, () =>
    createColumn(false)
  );

  let firstDraw = true;

  const paintBackdrop = () => {
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, width, height);
  };

  const drawColumn = (col: RainColumn, index: number) => {
    const x = index * columnWidth;
    const length = col.chars.length;
    ctx.font = `${col.fontSize}px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

    for (let j = 0; j < length; j++) {
      const y = col.headY - j * col.fontSize;
      if (y < -col.fontSize || y > height + col.fontSize) continue;

      if (j === 0) {
        // Leading digit: brightest, with an optional neon glow.
        ctx.globalAlpha = Math.min(1, 0.55 + col.brightness * 0.45);
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = col.glow ? (mobile ? 7 : 12) : 0;
        ctx.fillStyle = HEAD_COLOR;
      } else {
        ctx.shadowBlur = 0;
        const fade = 1 - j / length;
        ctx.globalAlpha = Math.min(1, col.brightness * fade * 1.05);
        ctx.fillStyle = j === 1 ? NEAR_HEAD_COLOR : GLYPH_COLOR;
      }

      ctx.fillText(col.chars[j], x, y);
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  };

  return {
    draw(dt) {
      if (firstDraw) {
        // Spread the columns evenly across the viewport for both the very first
        // animated frame and the single reduced-motion frame.
        for (const col of columns) {
          col.headY = Math.random() * (height + col.chars.length * col.fontSize);
        }
        firstDraw = false;
      }

      paintBackdrop();

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        if (dt > 0) {
          col.headY += col.speed * dt;

          // Occasional character mutation keeps the rain shimmering.
          if (Math.random() < 0.12) {
            col.chars[(Math.random() * col.chars.length) | 0] = randChar();
          }

          // Recycle the column once its tail has fully left the viewport.
          if (col.headY - col.chars.length * col.fontSize > height) {
            columns[i] = createColumn(true);
            continue;
          }
        }

        drawColumn(col, i);
      }
    },
  };
}
