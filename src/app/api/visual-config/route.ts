import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  DEFAULT_SITE_VISUAL_CONFIG,
  DEFAULT_HERO_CONFIG,
  DEFAULT_THREED_CONFIG,
  DEFAULT_SECTIONS_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  SiteVisualConfigData,
  SiteRevision,
} from "@/types/visual-config";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    const isAdmin = !!session;

    const { searchParams } = new URL(request.url);
    // Drafts and previews remain strictly private to authorized admin sessions
    const isPreview = isAdmin && searchParams.get("preview") === "true";

    let row = await prisma.siteVisualConfig.findFirst();

    if (!row) {
      row = await prisma.siteVisualConfig.create({
        data: {
          id: "active_visual_config",
          publishedConfig: JSON.stringify(DEFAULT_SITE_VISUAL_CONFIG),
          draftConfig: null,
          revisions: JSON.stringify([
            {
              id: "rev_initial",
              name: "Initial World-Class Baseline",
              timestamp: new Date().toISOString(),
              data: DEFAULT_SITE_VISUAL_CONFIG,
            },
          ]),
        },
      });
    }

    let published: SiteVisualConfigData = DEFAULT_SITE_VISUAL_CONFIG;
    if (row.publishedConfig) {
      try {
        published = { ...DEFAULT_SITE_VISUAL_CONFIG, ...JSON.parse(row.publishedConfig) };
      } catch {
        published = DEFAULT_SITE_VISUAL_CONFIG;
      }
    }

    let draft: SiteVisualConfigData | null = null;
    if (row.draftConfig) {
      try {
        draft = { ...DEFAULT_SITE_VISUAL_CONFIG, ...JSON.parse(row.draftConfig) };
      } catch {
        draft = null;
      }
    }

    let revisions: SiteRevision[] = [];
    if (row.revisions) {
      try {
        revisions = JSON.parse(row.revisions);
      } catch {
        revisions = [];
      }
    }

    const effective = isPreview && draft ? draft : published;

    return NextResponse.json({
      published,
      draft: isAdmin ? draft : null,
      effective: isAdmin ? effective : published,
      revisions: isAdmin ? revisions : [],
      updatedAt: row.updatedAt,
    });
  } catch (error) {
    console.error("Visual config GET error:", error);
    return NextResponse.json(
      { error: "Failed to load visual configuration" },
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

    const body = await request.json();
    const { action } = body;

    let row = await prisma.siteVisualConfig.findFirst();
    if (!row) {
      row = await prisma.siteVisualConfig.create({
        data: {
          id: "active_visual_config",
          publishedConfig: JSON.stringify(DEFAULT_SITE_VISUAL_CONFIG),
        },
      });
    }

    let currentRevisions: SiteRevision[] = [];
    if (row.revisions) {
      try {
        currentRevisions = JSON.parse(row.revisions);
      } catch {
        currentRevisions = [];
      }
    }

    switch (action) {
      case "save-draft": {
        const { draftData } = body;
        const updated = await prisma.siteVisualConfig.update({
          where: { id: row.id },
          data: {
            draftConfig: JSON.stringify(draftData),
          },
        });
        return NextResponse.json({
          success: true,
          message: "Visual draft saved successfully. Changes are ready for live preview.",
          data: updated,
        });
      }

      case "publish": {
        const { configData, versionName } = body;
        let targetData: SiteVisualConfigData;
        if (configData) {
          targetData = configData;
        } else if (row.draftConfig) {
          targetData = JSON.parse(row.draftConfig);
        } else {
          targetData = row.publishedConfig
            ? JSON.parse(row.publishedConfig)
            : DEFAULT_SITE_VISUAL_CONFIG;
        }

        const newRevision: SiteRevision = {
          id: `rev_${Date.now()}`,
          name: versionName || `Release v${(currentRevisions.length + 1).toString().padStart(2, "0")}`,
          timestamp: new Date().toISOString(),
          data: targetData,
        };

        const updatedRevisions = [newRevision, ...currentRevisions].slice(0, 15);

        const updated = await prisma.siteVisualConfig.update({
          where: { id: row.id },
          data: {
            publishedConfig: JSON.stringify(targetData),
            draftConfig: null,
            revisions: JSON.stringify(updatedRevisions),
          },
        });

        // Record in VisualConfigRevision model and AuditLog
        await prisma.visualConfigRevision.create({
          data: {
            snapshot: JSON.stringify(targetData),
            appliedBy: session.username,
            note: `Published via visual editor by ${session.username}`,
          },
        }).catch(() => {});

        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: "PUBLISH_VISUAL_CONFIG",
            resource: "SiteVisualConfig",
            resourceId: row.id,
            details: JSON.stringify({ revisionId: newRevision.id }),
          },
        }).catch(() => {});

        try {
          revalidatePath("/");
          revalidatePath("/api/visual-config");
        } catch {}

        return NextResponse.json({
          success: true,
          message: "All homepage changes have been successfully published live!",
          data: updated,
          revision: newRevision,
        });
      }

      case "rollback": {
        const { revisionId } = body;
        const target = currentRevisions.find((r) => r.id === revisionId);
        if (!target) {
          return NextResponse.json(
            { error: "Target revision snapshot was not found" },
            { status: 404 }
          );
        }

        const rollbackRevision: SiteRevision = {
          id: `rev_${Date.now()}`,
          name: `Restored: ${target.name}`,
          timestamp: new Date().toISOString(),
          data: target.data,
        };

        const updatedRevisions = [rollbackRevision, ...currentRevisions].slice(0, 15);

        const updated = await prisma.siteVisualConfig.update({
          where: { id: row.id },
          data: {
            publishedConfig: JSON.stringify(target.data),
            draftConfig: null,
            revisions: JSON.stringify(updatedRevisions),
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/visual-config");
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Successfully restored revision "${target.name}"!`,
          data: updated,
        });
      }

      case "reset-section": {
        const { sectionKey } = body;
        let publishedData: SiteVisualConfigData = DEFAULT_SITE_VISUAL_CONFIG;
        if (row.publishedConfig) {
          try {
            publishedData = JSON.parse(row.publishedConfig);
          } catch {
            publishedData = DEFAULT_SITE_VISUAL_CONFIG;
          }
        }

        if (sectionKey === "hero") publishedData.hero = DEFAULT_HERO_CONFIG;
        if (sectionKey === "threeD") publishedData.threeD = DEFAULT_THREED_CONFIG;
        if (sectionKey === "sections") publishedData.sections = DEFAULT_SECTIONS_CONFIG;
        if (sectionKey === "about") publishedData.about = DEFAULT_ABOUT_CONFIG;
        if (sectionKey === "contact") publishedData.contact = DEFAULT_CONTACT_CONFIG;
        if (sectionKey === "footer") publishedData.footer = DEFAULT_FOOTER_CONFIG;

        const updated = await prisma.siteVisualConfig.update({
          where: { id: row.id },
          data: {
            publishedConfig: JSON.stringify(publishedData),
            draftConfig: null,
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/visual-config");
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Section "${sectionKey}" has been reset to defaults`,
          data: updated,
        });
      }

      case "reset-all": {
        const resetRevision: SiteRevision = {
          id: `rev_${Date.now()}`,
          name: "Factory System Reset",
          timestamp: new Date().toISOString(),
          data: DEFAULT_SITE_VISUAL_CONFIG,
        };

        const updatedRevisions = [resetRevision, ...currentRevisions].slice(0, 15);

        const updated = await prisma.siteVisualConfig.update({
          where: { id: row.id },
          data: {
            publishedConfig: JSON.stringify(DEFAULT_SITE_VISUAL_CONFIG),
            draftConfig: null,
            revisions: JSON.stringify(updatedRevisions),
          },
        });

        try {
          revalidatePath("/");
          revalidatePath("/api/visual-config");
        } catch {}

        return NextResponse.json({
          success: true,
          message: "Entire website visual design reset to baseline defaults",
          data: updated,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Visual config POST error:", error);
    return NextResponse.json(
      { error: "Internal server error saving visual configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { section, data: sectionData, publishNow } = body;

    if (!section || !sectionData) {
      return NextResponse.json(
        { error: "Section and data are required" },
        { status: 400 }
      );
    }

    let row = await prisma.siteVisualConfig.findFirst();
    if (!row) {
      row = await prisma.siteVisualConfig.create({
        data: {
          id: "active_visual_config",
          publishedConfig: JSON.stringify(DEFAULT_SITE_VISUAL_CONFIG),
          draftConfig: null,
          revisions: JSON.stringify([]),
        },
      });
    }

    let activeConfig: SiteVisualConfigData = DEFAULT_SITE_VISUAL_CONFIG;
    const baseSource = publishNow
      ? (row.publishedConfig || row.draftConfig)
      : (row.draftConfig || row.publishedConfig);

    if (baseSource) {
      try {
        activeConfig = { ...DEFAULT_SITE_VISUAL_CONFIG, ...JSON.parse(baseSource) };
      } catch {
        activeConfig = DEFAULT_SITE_VISUAL_CONFIG;
      }
    }

    // Merge updated section
    const targetConfig = { ...activeConfig, [section]: sectionData };

    let currentRevisions: SiteRevision[] = [];
    if (row.revisions) {
      try {
        currentRevisions = JSON.parse(row.revisions);
      } catch {
        currentRevisions = [];
      }
    }

    if (publishNow) {
      const newRevision: SiteRevision = {
        id: `rev_${Date.now()}`,
        name: `Section '${section}' updated and published`,
        timestamp: new Date().toISOString(),
        data: targetConfig,
      };

      const updatedRevisions = [newRevision, ...currentRevisions].slice(0, 15);

      const updated = await prisma.siteVisualConfig.update({
        where: { id: row.id },
        data: {
          publishedConfig: JSON.stringify(targetConfig),
          draftConfig: null,
          revisions: JSON.stringify(updatedRevisions),
        },
      });

      // Record in VisualConfigRevision model and AuditLog
      await prisma.visualConfigRevision.create({
        data: {
          snapshot: JSON.stringify(targetConfig),
          appliedBy: session.username,
          note: `Published section '${section}' by ${session.username}`,
        },
      }).catch(() => {});

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_VISUAL_SECTION",
          resource: "SiteVisualConfig",
          resourceId: section,
          details: JSON.stringify({ section, published: true }),
        },
      }).catch(() => {});

      try {
        revalidatePath("/");
        revalidatePath("/api/visual-config");
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Section "${section}" published successfully`,
        data: updated,
      });
    } else {
      const updated = await prisma.siteVisualConfig.update({
        where: { id: row.id },
        data: {
          draftConfig: JSON.stringify(targetConfig),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Section "${section}" saved as draft`,
        data: updated,
      });
    }
  } catch (error) {
    console.error("Visual config PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update visual configuration section" },
      { status: 500 }
    );
  }
}
