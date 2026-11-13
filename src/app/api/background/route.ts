import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  BACKGROUND_CONFIG_ID,
  serializeBackgroundConfig,
  serializeThemeSettingsMap,
} from "@/lib/backgrounds/config";
import {
  BackgroundSettings,
  BackgroundThemeSettingsMap,
  DEFAULT_BACKGROUND_SETTINGS,
  DEFAULT_BACKGROUND_THEME_ID,
  isBackgroundThemeId,
  normalizeBackgroundSettings,
} from "@/types/background";

// The background configuration is read on every public request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadConfig() {
  const row = await prisma.backgroundThemeConfig.findFirst();
  return serializeBackgroundConfig(row);
}

async function ensureConfig() {
  const existing = await prisma.backgroundThemeConfig.findFirst();
  if (existing) return existing;
  return prisma.backgroundThemeConfig.create({
    data: {
      id: BACKGROUND_CONFIG_ID,
      activeThemeId: DEFAULT_BACKGROUND_THEME_ID,
      animationEnabled: DEFAULT_BACKGROUND_SETTINGS.animationEnabled,
      animationSpeed: DEFAULT_BACKGROUND_SETTINGS.speed,
      brightness: DEFAULT_BACKGROUND_SETTINGS.brightness,
      particleDensity: DEFAULT_BACKGROUND_SETTINGS.particleDensity,
      parallaxEnabled: DEFAULT_BACKGROUND_SETTINGS.parallaxEnabled,
      themeSettings: "{}",
    },
  });
}

function revalidateBackground() {
  try {
    revalidatePath("/");
    revalidatePath("/api/background");
  } catch {}
}

/**
 * Public read endpoint. Only the presentation-layer background configuration
 * is exposed — no credentials, no interior admin state.
 */
export async function GET() {
  try {
    const { state, themeSettings } = await loadConfig();
    return NextResponse.json({ ...state, themeSettings });
  } catch (error) {
    console.error("Background config fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load background configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body || typeof body.action !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const config = await ensureConfig();
    const { state, themeSettings } = serializeBackgroundConfig(config);

    const readSettings = (fallback: BackgroundSettings): BackgroundSettings =>
      body.settings === undefined
        ? fallback
        : normalizeBackgroundSettings(body.settings);

    switch (body.action) {
      case "apply": {
        if (!isBackgroundThemeId(body.themeId)) {
          return NextResponse.json({ error: "Invalid theme id" }, { status: 400 });
        }
        const targetThemeId = body.themeId;
        const settings = readSettings(state.settings);

        const mergedThemeSettings: BackgroundThemeSettingsMap = {
          ...themeSettings,
          [targetThemeId]: settings,
        };

        const updated = await prisma.backgroundThemeConfig.update({
          where: { id: config.id },
          data: {
            previousThemeId: state.activeThemeId,
            activeThemeId: targetThemeId,
            animationEnabled: settings.animationEnabled,
            animationSpeed: settings.speed,
            brightness: settings.brightness,
            particleDensity: settings.particleDensity,
            parallaxEnabled: settings.parallaxEnabled,
            themeSettings: serializeThemeSettingsMap(mergedThemeSettings),
            lastAppliedBy: session.username,
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "APPLY_BACKGROUND_THEME",
              resource: "BackgroundThemeConfig",
              resourceId: targetThemeId,
              details: JSON.stringify({ themeId: targetThemeId, settings }),
            },
          })
          .catch(() => {});

        revalidateBackground();

        const serialized = serializeBackgroundConfig(updated);
        return NextResponse.json({
          success: true,
          message: "Background theme applied to the public website",
          ...serialized.state,
          themeSettings: serialized.themeSettings,
        });
      }

      case "update-settings": {
        const settings = readSettings(state.settings);
        const mergedThemeSettings: BackgroundThemeSettingsMap = {
          ...themeSettings,
          [state.activeThemeId]: settings,
        };

        const updated = await prisma.backgroundThemeConfig.update({
          where: { id: config.id },
          data: {
            animationEnabled: settings.animationEnabled,
            animationSpeed: settings.speed,
            brightness: settings.brightness,
            particleDensity: settings.particleDensity,
            parallaxEnabled: settings.parallaxEnabled,
            themeSettings: serializeThemeSettingsMap(mergedThemeSettings),
            lastAppliedBy: session.username,
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "UPDATE_BACKGROUND_SETTINGS",
              resource: "BackgroundThemeConfig",
              resourceId: state.activeThemeId,
              details: JSON.stringify({ settings }),
            },
          })
          .catch(() => {});

        revalidateBackground();

        const serialized = serializeBackgroundConfig(updated);
        return NextResponse.json({
          success: true,
          message: "Background settings saved",
          ...serialized.state,
          themeSettings: serialized.themeSettings,
        });
      }

      case "rollback": {
        if (!state.previousThemeId) {
          return NextResponse.json(
            { error: "No previous background theme available for rollback" },
            { status: 400 }
          );
        }

        const updated = await prisma.backgroundThemeConfig.update({
          where: { id: config.id },
          data: {
            activeThemeId: state.previousThemeId,
            previousThemeId: state.activeThemeId,
            lastAppliedBy: session.username,
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "ROLLBACK_BACKGROUND_THEME",
              resource: "BackgroundThemeConfig",
              resourceId: state.previousThemeId,
              details: JSON.stringify({ themeId: state.previousThemeId }),
            },
          })
          .catch(() => {});

        revalidateBackground();

        const serialized = serializeBackgroundConfig(updated);
        return NextResponse.json({
          success: true,
          message: "Reverted to the previous background theme",
          ...serialized.state,
          themeSettings: serialized.themeSettings,
        });
      }

      case "reset-default": {
        // Drop the saved override for the default theme so a reset truly
        // restores the out-of-the-box look when it is selected again.
        const remainingThemeSettings: BackgroundThemeSettingsMap = { ...themeSettings };
        delete remainingThemeSettings[DEFAULT_BACKGROUND_THEME_ID];

        const updated = await prisma.backgroundThemeConfig.update({
          where: { id: config.id },
          data: {
            previousThemeId: state.activeThemeId,
            activeThemeId: DEFAULT_BACKGROUND_THEME_ID,
            animationEnabled: DEFAULT_BACKGROUND_SETTINGS.animationEnabled,
            animationSpeed: DEFAULT_BACKGROUND_SETTINGS.speed,
            brightness: DEFAULT_BACKGROUND_SETTINGS.brightness,
            particleDensity: DEFAULT_BACKGROUND_SETTINGS.particleDensity,
            parallaxEnabled: DEFAULT_BACKGROUND_SETTINGS.parallaxEnabled,
            themeSettings: serializeThemeSettingsMap(remainingThemeSettings),
            lastAppliedBy: session.username,
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "RESET_BACKGROUND_THEME",
              resource: "BackgroundThemeConfig",
              resourceId: DEFAULT_BACKGROUND_THEME_ID,
              details: JSON.stringify({ themeId: DEFAULT_BACKGROUND_THEME_ID }),
            },
          })
          .catch(() => {});

        revalidateBackground();

        const serialized = serializeBackgroundConfig(updated);
        return NextResponse.json({
          success: true,
          message: "Background reset to the default Matrix Hacker theme",
          ...serialized.state,
          themeSettings: serialized.themeSettings,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Background config update error:", error);
    return NextResponse.json(
      { error: "Failed to update background configuration" },
      { status: 500 }
    );
  }
}
