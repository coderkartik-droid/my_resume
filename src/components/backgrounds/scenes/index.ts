import type { BackgroundThemeId } from "@/types/background";
import type { Scene, SceneEnv } from "../useBackgroundCanvas";
import { createMatrixHackerScene } from "./matrixHacker";
import { createMilkyWayScene } from "./milkyWay";
import { createAuroraBorealisScene } from "./auroraBorealis";
import { createDeepOceanScene } from "./deepOcean";
import { createCosmicParticlesScene } from "./cosmicParticles";
import { createCyberpunkCityScene } from "./cyberpunkCity";

type SceneFactory = (env: SceneEnv) => Scene;

/** Maps every selectable theme id to its canvas scene implementation. */
const SCENE_FACTORIES: Record<BackgroundThemeId, SceneFactory> = {
  "matrix-hacker": createMatrixHackerScene,
  "milky-way": createMilkyWayScene,
  "aurora-borealis": createAuroraBorealisScene,
  "deep-ocean": createDeepOceanScene,
  "cosmic-particles": createCosmicParticlesScene,
  "cyberpunk-city": createCyberpunkCityScene,
};

export function createBackgroundScene(themeId: string): SceneFactory {
  return SCENE_FACTORIES[themeId as BackgroundThemeId] ?? createMatrixHackerScene;
}
