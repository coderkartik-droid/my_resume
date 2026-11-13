import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { DEFAULT_ANIMATION_CONFIG } from "@/lib/themes/theme-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";

    let config = await prisma.themeConfig.findFirst();

    if (!config) {
      config = await prisma.themeConfig.create({
        data: {
          id: "active_theme_config",
          activeThemeId: "midnight-dark",
          draftThemeId: null,
          previousThemeId: null,
          customOverrides: null,
          animationSettings: JSON.stringify(DEFAULT_ANIMATION_CONFIG),
        },
      });
    }

    let customOverrides = null;
    if (config.customOverrides) {
      try {
        customOverrides = JSON.parse(config.customOverrides);
      } catch {
        customOverrides = null;
      }
    }

    let animationSettings = DEFAULT_ANIMATION_CONFIG;
    if (config.animationSettings) {
      try {
        animationSettings = JSON.parse(config.animationSettings);
      } catch {
        animationSettings = DEFAULT_ANIMATION_CONFIG;
      }
    }

    const currentEffectiveThemeId = isPreview && config.draftThemeId
      ? config.draftThemeId
      : config.activeThemeId;

    return NextResponse.json({
      activeThemeId: config.activeThemeId,
      draftThemeId: config.draftThemeId,
      previousThemeId: config.previousThemeId,
      effectiveThemeId: currentEffectiveThemeId,
      customOverrides,
      animationSettings,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error("Theme fetch error:", error);
    return NextResponse.json({ error: "Failed to load theme configuration" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    let config = await prisma.themeConfig.findFirst();
    if (!config) {
      config = await prisma.themeConfig.create({
        data: {
          id: "active_theme_config",
          activeThemeId: "midnight-dark",
        },
      });
    }

    switch (action) {
      case "save-draft": {
        const { draftThemeId, customOverrides } = body;
        const updated = await prisma.themeConfig.update({
          where: { id: config.id },
          data: {
            draftThemeId: draftThemeId || config.activeThemeId,
            customOverrides: customOverrides ? JSON.stringify(customOverrides) : null,
          },
        });
        return NextResponse.json({ success: true, message: "Draft saved successfully", config: updated });
      }

      case "publish": {
        const { themeId, customOverrides } = body;
        const targetTheme = themeId || config.draftThemeId || config.activeThemeId;
        const finalOverrides = customOverrides !== undefined ? (customOverrides ? JSON.stringify(customOverrides) : null) : config.customOverrides;
        const updated = await prisma.themeConfig.update({
          where: { id: config.id },
          data: {
            previousThemeId: config.activeThemeId,
            activeThemeId: targetTheme,
            draftThemeId: null,
            customOverrides: finalOverrides,
          },
        });

        // Record in ThemeHistory and AuditLog
        await prisma.themeHistory.create({
          data: {
            themeId: targetTheme,
            customOverrides: finalOverrides,
            appliedBy: session.username,
          },
        }).catch(() => {});

        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "PUBLISH_THEME",
            resource: "ThemeConfig",
            resourceId: targetTheme,
            details: JSON.stringify({ themeId: targetTheme }),
          },
        }).catch(() => {});

        try {
          revalidatePath("/");
          revalidatePath("/api/theme");
        } catch {}

        return NextResponse.json({ success: true, message: `Theme "${targetTheme}" published live!`, config: updated });
      }

      case "rollback": {
        if (!config.previousThemeId) {
          return NextResponse.json({ error: "No previous theme available for rollback" }, { status: 400 });
        }
        const updated = await prisma.themeConfig.update({
          where: { id: config.id },
          data: {
            activeThemeId: config.previousThemeId,
            previousThemeId: config.activeThemeId,
            draftThemeId: null,
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/theme");
        } catch {}

        return NextResponse.json({ success: true, message: `Rolled back to "${updated.activeThemeId}"!`, config: updated });
      }

      case "reset-default": {
        const updated = await prisma.themeConfig.update({
          where: { id: config.id },
          data: {
            previousThemeId: config.activeThemeId,
            activeThemeId: "midnight-dark",
            draftThemeId: null,
            customOverrides: null,
            animationSettings: JSON.stringify(DEFAULT_ANIMATION_CONFIG),
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/theme");
        } catch {}

        return NextResponse.json({ success: true, message: "Theme reset to default (Midnight Dark)", config: updated });
      }

      case "update-animations": {
        const { animationSettings } = body;
        const updated = await prisma.themeConfig.update({
          where: { id: config.id },
          data: {
            animationSettings: animationSettings ? JSON.stringify(animationSettings) : JSON.stringify(DEFAULT_ANIMATION_CONFIG),
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/theme");
        } catch {}

        return NextResponse.json({ success: true, message: "Animation settings updated successfully", config: updated });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Theme update error:", error);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await request.json();
    const { activeThemeId, customOverrides, animationSettings } = body;

    let config = await prisma.themeConfig.findFirst();
    if (!config) {
      config = await prisma.themeConfig.create({
        data: {
          id: "active_theme_config",
          activeThemeId: "midnight-dark",
        },
      });
    }

    // Merge custom overrides with existing
    let mergedOverrides = null;
    if (config.customOverrides || customOverrides) {
      try {
        const existing = config.customOverrides ? JSON.parse(config.customOverrides) : {};
        mergedOverrides = JSON.stringify({ ...existing, ...customOverrides });
      } catch {
        mergedOverrides = customOverrides ? JSON.stringify(customOverrides) : null;
      }
    }

    const updated = await prisma.themeConfig.update({
      where: { id: config.id },
      data: {
        ...(activeThemeId && { activeThemeId }),
        ...(mergedOverrides !== undefined && { customOverrides: mergedOverrides }),
        ...(animationSettings !== undefined && {
          animationSettings: typeof animationSettings === "string" ? animationSettings : JSON.stringify(animationSettings),
        }),
      },
    });

    // Record in ThemeHistory and AuditLog
    await prisma.themeHistory.create({
      data: {
        themeId: activeThemeId || config.activeThemeId,
        customOverrides: mergedOverrides,
        appliedBy: session.username,
      },
    }).catch(() => {});

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_THEME_OVERRIDES",
        resource: "ThemeConfig",
        resourceId: updated.activeThemeId,
        details: JSON.stringify({ activeThemeId: updated.activeThemeId }),
      },
    }).catch(() => {});

    try {
      revalidatePath("/");
      revalidatePath("/api/theme");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Theme and typography configuration saved successfully!",
      config: updated,
    });
  } catch (error) {
    console.error("Theme PUT error:", error);
    return NextResponse.json({ error: "Failed to update theme overrides" }, { status: 500 });
  }
}
