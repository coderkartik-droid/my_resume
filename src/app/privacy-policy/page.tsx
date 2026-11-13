import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import { sanitizeRichText, richTextToPlainText } from "@/lib/sanitize";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";

// Always server-render so freshly published policy content is served immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublishedPolicy() {
  const doc = await prisma.privacyPolicy.findFirst();
  if (!doc || !doc.isPublished || !doc.publishedContent) {
    return null;
  }
  return {
    title: doc.title,
    summary: doc.summary,
    version: doc.version,
    publishedAt: doc.publishedAt,
    content: sanitizeRichText(doc.publishedContent),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const [profile, policy] = await Promise.all([
    prisma.profile.findFirst(),
    getPublishedPolicy(),
  ]);
  const name = profile?.name || "Kartik Khajuria";
  const description = policy
    ? policy.summary || richTextToPlainText(policy.content).slice(0, 160)
    : `Privacy Policy for the personal portfolio of ${name}.`;

  return {
    title: `Privacy Policy | ${name}`,
    description,
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const [
    { profile, themeId, overrides, animations, footerConfig, backgroundConfig },
    policy,
  ] = await Promise.all([getPublicShellData(), getPublishedPolicy()]);

  const publishedLabel = policy?.publishedAt
    ? new Date(policy.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PublicChrome
      profile={profile}
      initialThemeId={themeId}
      initialOverrides={overrides}
      initialAnimations={animations}
      footerConfig={footerConfig}
      backgroundConfig={backgroundConfig}
    >
      <PageHeader
        eyebrow="Legal"
        title={policy?.title || "Privacy Policy"}
        subtitle={
          policy?.summary ||
          "How your information is collected, used and protected on this website."
        }
      />

      <section className="relative py-12">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10 relative z-10">
          {(policy?.version || publishedLabel) && (
            <div className="flex flex-wrap items-center gap-3 mb-8 text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400">
              {publishedLabel && <span>Last updated {publishedLabel}</span>}
              {policy?.version ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>Version {policy.version}</span>
                </>
              ) : null}
            </div>
          )}

          {policy ? (
            <article className="theme-card p-7 sm:p-10">
              <div
                className="policy-content"
                dangerouslySetInnerHTML={{ __html: policy.content }}
              />
            </article>
          ) : (
            <div className="theme-card p-8 sm:p-12 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10">
                <span className="text-lg" aria-hidden="true">
                  §
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-white">
                Privacy Policy Coming Soon
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                A privacy policy has not been published yet. Please check back shortly.
                In the meantime, reach out directly using the contact page for any
                questions about your data.
              </p>
            </div>
          )}
        </div>
      </section>
    </PublicChrome>
  );
}
