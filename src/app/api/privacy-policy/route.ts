import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  sanitizeRichText,
  validateRichText,
  richTextToPlainText,
} from "@/lib/sanitize";

const POLICY_ID = "privacy_policy_document";

interface PolicyRevision {
  id: string;
  title: string;
  content: string;
  version: number;
  savedBy: string | null;
  timestamp: string;
}

function parseRevisions(raw: string | null): PolicyRevision[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PolicyRevision[]) : [];
  } catch {
    return [];
  }
}

async function ensurePolicyDocument() {
  let doc = await prisma.privacyPolicy.findFirst();
  if (!doc) {
    doc = await prisma.privacyPolicy.create({
      data: {
        id: POLICY_ID,
        title: "Privacy Policy",
        isPublished: false,
        version: 1,
      },
    });
  }
  return doc;
}

/**
 * GET — public callers only ever receive the PUBLISHED content.
 * Authenticated admins additionally receive the draft, revisions and metadata.
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    const isAdmin = !!session;

    if (!isAdmin) {
      const doc = await prisma.privacyPolicy.findFirst();
      if (!doc || !doc.isPublished || !doc.publishedContent) {
        return NextResponse.json({
          title: doc?.title || "Privacy Policy",
          summary: doc?.summary || null,
          isPublished: false,
          hasPublishedContent: false,
          content: "",
          publishedAt: doc?.publishedAt || null,
          version: doc?.version ?? 0,
        });
      }
      return NextResponse.json({
        title: doc.title,
        summary: doc.summary,
        isPublished: true,
        hasPublishedContent: true,
        content: sanitizeRichText(doc.publishedContent),
        publishedAt: doc.publishedAt,
        version: doc.version,
      });
    }

    const doc = await ensurePolicyDocument();
    const revisions = parseRevisions(doc.revisions);

    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      isPublished: doc.isPublished,
      hasPublishedContent: !!doc.publishedContent,
      version: doc.version,
      publishedContent: doc.publishedContent ? sanitizeRichText(doc.publishedContent) : "",
      draftContent: doc.draftContent ? sanitizeRichText(doc.draftContent) : "",
      // Effective working copy for the editor
      content: doc.draftContent
        ? sanitizeRichText(doc.draftContent)
        : doc.publishedContent
          ? sanitizeRichText(doc.publishedContent)
          : "",
      hasDraft: !!doc.draftContent,
      lastEditedBy: doc.lastEditedBy,
      publishedAt: doc.publishedAt,
      updatedAt: doc.updatedAt,
      revisions,
    });
  } catch (error) {
    console.error("Privacy policy GET error:", error);
    return NextResponse.json({ error: "Failed to load privacy policy" }, { status: 500 });
  }
}

/**
 * POST — admin actions: save-draft | publish | rollback | discard-draft
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await request.json();
    const action = body?.action as string | undefined;
    const doc = await ensurePolicyDocument();

    switch (action) {
      case "save-draft": {
        const validation = validateRichText(body.content);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const sanitized = sanitizeRichText(body.content);
        const updated = await prisma.privacyPolicy.update({
          where: { id: doc.id },
          data: {
            title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : doc.title,
            summary:
              typeof body.summary === "string" ? body.summary.trim().slice(0, 300) : doc.summary,
            draftContent: sanitized,
            lastEditedBy: session.username,
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "SAVE_DRAFT",
              resource: "PrivacyPolicy",
              resourceId: updated.id,
              details: JSON.stringify({ characters: richTextToPlainText(sanitized).length }),
            },
          })
          .catch(() => {});

        return NextResponse.json({
          success: true,
          message: "Draft saved. The published policy is untouched until you publish.",
          updatedAt: updated.updatedAt,
          hasDraft: true,
        });
      }

      case "publish": {
        const sourceContent =
          typeof body.content === "string" && body.content.trim()
            ? body.content
            : doc.draftContent || doc.publishedContent || "";

        const validation = validateRichText(sourceContent);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const sanitized = sanitizeRichText(sourceContent);
        const revisions = parseRevisions(doc.revisions);

        // Preserve the previous published content as a restorable revision
        const nextRevisions = doc.publishedContent
          ? [
              {
                id: `rev_${Date.now()}`,
                title: doc.title,
                content: doc.publishedContent,
                version: doc.version,
                savedBy: doc.lastEditedBy,
                timestamp: new Date().toISOString(),
              },
              ...revisions,
            ].slice(0, 10)
          : revisions;

        const updated = await prisma.privacyPolicy.update({
          where: { id: doc.id },
          data: {
            title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : doc.title,
            summary:
              typeof body.summary === "string" ? body.summary.trim().slice(0, 300) : doc.summary,
            publishedContent: sanitized,
            draftContent: null,
            isPublished: true,
            version: doc.version + 1,
            revisions: JSON.stringify(nextRevisions),
            lastEditedBy: session.username,
            publishedAt: new Date(),
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "PUBLISH",
              resource: "PrivacyPolicy",
              resourceId: updated.id,
              details: JSON.stringify({ version: updated.version }),
            },
          })
          .catch(() => {});

        try {
          revalidatePath("/privacy-policy");
          revalidatePath("/api/privacy-policy");
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Privacy Policy published live (v${updated.version}).`,
          version: updated.version,
          publishedAt: updated.publishedAt,
          hasDraft: false,
        });
      }

      case "discard-draft": {
        const updated = await prisma.privacyPolicy.update({
          where: { id: doc.id },
          data: { draftContent: null },
        });

        return NextResponse.json({
          success: true,
          message: "Draft discarded. Editor restored to the currently published content.",
          content: updated.publishedContent ? sanitizeRichText(updated.publishedContent) : "",
          hasDraft: false,
        });
      }

      case "rollback": {
        const revisions = parseRevisions(doc.revisions);
        const target = revisions.find((r) => r.id === body.revisionId);
        if (!target) {
          return NextResponse.json({ error: "Revision not found." }, { status: 404 });
        }

        const remaining = revisions.filter((r) => r.id !== target.id);
        const nextRevisions = doc.publishedContent
          ? [
              {
                id: `rev_${Date.now()}`,
                title: doc.title,
                content: doc.publishedContent,
                version: doc.version,
                savedBy: doc.lastEditedBy,
                timestamp: new Date().toISOString(),
              },
              ...remaining,
            ].slice(0, 10)
          : remaining;

        const updated = await prisma.privacyPolicy.update({
          where: { id: doc.id },
          data: {
            title: target.title || doc.title,
            publishedContent: sanitizeRichText(target.content),
            draftContent: null,
            isPublished: true,
            version: doc.version + 1,
            revisions: JSON.stringify(nextRevisions),
            lastEditedBy: session.username,
            publishedAt: new Date(),
          },
        });

        await prisma.auditLog
          .create({
            data: {
              userId: session.userId,
              action: "ROLLBACK",
              resource: "PrivacyPolicy",
              resourceId: updated.id,
              details: JSON.stringify({ restoredVersion: target.version }),
            },
          })
          .catch(() => {});

        try {
          revalidatePath("/privacy-policy");
          revalidatePath("/api/privacy-policy");
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Restored version v${target.version} and published it live.`,
          content: sanitizeRichText(updated.publishedContent || ""),
          version: updated.version,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Privacy policy POST error:", error);
    return NextResponse.json({ error: "Failed to update privacy policy" }, { status: 500 });
  }
}
