"use client";

import { useEffect, useRef } from "react";
import { BackgroundSettings, BACKGROUND_SPEED_MULTIPLIER } from "@/types/background";

export interface PointerState {
  /** Smoothed pointer offset, normalised to -1 .. 1 around the layer centre. */
  x: number;
  y: number;
}

export interface SceneEnv {
  ctx: CanvasRenderingContext2D;
  /** Layer size in CSS pixels. */
  width: number;
  height: number;
  dpr: number;
  /** True on small viewports — scenes may reduce element counts. */
  mobile: boolean;
  /** Element-count multiplier derived from the Particle Density setting. */
  density: number;
}

export interface Scene {
  /**
   * Paint one full frame.
   * @param dt      Elapsed time in seconds, already scaled by the speed setting.
   * @param elapsed Scaled time since the animation started, in seconds.
   * @param pointer Smoothed pointer offset (-1..1); zeroed when parallax is off.
   */
  draw(dt: number, elapsed: number, pointer: PointerState): void;
}

const ZERO_POINTER: PointerState = { x: 0, y: 0 };
const FPS_DESKTOP = 30;
const FPS_MOBILE = 24;

/**
 * Shared canvas engine for every background scene.
 *
 * Handles device-pixel-ratio sizing, container resizing, frame pacing, pointer
 * tracking, tab-visibility pausing and the `prefers-reduced-motion` fallback so
 * individual scenes only have to describe what they paint.
 */
export function useBackgroundCanvas(
  createScene: (env: SceneEnv) => Scene,
  settings: BackgroundSettings,
  /** Changing this rebuilds the scene (e.g. when the active theme changes). */
  sceneKey = "default"
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const createRef = useRef(createScene);
  createRef.current = createScene;

  const rebuildRef = useRef<() => void>(() => {});
  const densityRef = useRef(settings.particleDensity);
  const sceneKeyRef = useRef(sceneKey);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    let width = 1;
    let height = 1;
    let fps = FPS_DESKTOP;
    let scene: Scene | null = null;

    let rafId = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let staticPainted = false;
    let resizeTimer = 0;

    const pointerTarget: PointerState = { x: 0, y: 0 };
    const pointer: PointerState = { x: 0, y: 0 };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const mobile = width < 768;
      fps = mobile ? FPS_MOBILE : FPS_DESKTOP;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = "top";

      return { dpr, mobile };
    };

    const build = () => {
      const { dpr, mobile } = measure();
      scene = createRef.current({
        ctx,
        width,
        height,
        dpr,
        mobile,
        density: settingsRef.current.particleDensity,
      });
      staticPainted = false;
      lastFrame = performance.now();
      elapsed = 0;
    };

    const loop = (timestamp: number) => {
      rafId = requestAnimationFrame(loop);

      // Requirement: never burn CPU while the tab is in the background.
      if (document.hidden) {
        lastFrame = timestamp;
        return;
      }

      const current = settingsRef.current;
      const still = reducedMotion || !current.animationEnabled;

      if (still) {
        if (!staticPainted) {
          staticPainted = true;
          scene?.draw(0, 0, ZERO_POINTER);
        }
        lastFrame = timestamp;
        return;
      }

      staticPainted = false;

      const frameInterval = 1000 / fps;
      const delta = timestamp - lastFrame;
      if (delta < frameInterval) return;
      lastFrame = timestamp;

      // Clamp so a long pause never produces a visible jump.
      const dt = Math.min(delta, 120) / 1000;
      const multiplier = BACKGROUND_SPEED_MULTIPLIER[current.speed] ?? 1;
      const scaled = dt * multiplier;
      elapsed += scaled;

      const smoothing = Math.min(1, dt * 3.5);
      pointer.x += (pointerTarget.x - pointer.x) * smoothing;
      pointer.y += (pointerTarget.y - pointer.y) * smoothing;

      scene?.draw(scaled, elapsed, current.parallaxEnabled ? pointer : ZERO_POINTER);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointerTarget.x = Math.max(-1, Math.min(1, nx));
      pointerTarget.y = Math.max(-1, Math.min(1, ny));
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reducedMotion || !settingsRef.current.animationEnabled) {
          scene?.draw(0, 0, ZERO_POINTER);
          staticPainted = true;
        }
      }, 150);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        scene?.draw(0, 0, ZERO_POINTER);
        staticPainted = true;
      }
    };

    rebuildRef.current = () => {
      build();
      if (reducedMotion || !settingsRef.current.animationEnabled) {
        scene?.draw(0, 0, ZERO_POINTER);
        staticPainted = true;
      }
    };

    build();

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    motionQuery.addEventListener("change", handleMotionChange);

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      motionQuery.removeEventListener("change", handleMotionChange);
      window.clearTimeout(resizeTimer);
      rebuildRef.current = () => {};
    };
  }, []);

  // Rebuild the scene when the theme or the element count changes.
  useEffect(() => {
    if (
      sceneKeyRef.current === sceneKey &&
      densityRef.current === settings.particleDensity
    ) {
      return;
    }
    sceneKeyRef.current = sceneKey;
    densityRef.current = settings.particleDensity;
    const timer = window.setTimeout(() => rebuildRef.current(), 120);
    return () => window.clearTimeout(timer);
  }, [sceneKey, settings.particleDensity]);

  return { containerRef, canvasRef };
}
