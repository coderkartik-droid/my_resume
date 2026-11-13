import { prisma } from "@/lib/prisma";
import { getPublicShellData } from "@/lib/public-shell";
import PublicChrome from "@/components/public/PublicChrome";
import PageHeader from "@/components/public/PageHeader";
import ContactSection from "@/components/ui/ContactSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findFirst();
  const name = profile?.name || "Kartik Khajuria";
  return {
    title: `Contact ${name} | Start a Conversation`,
    description:
      profile?.bio ||
      `Get in touch with ${name} for collaborations, commissions and opportunities.`,
  };
}

export default async function ContactPage() {
  const {
    profile,
    visualConfig,
    themeId,
    overrides,
    animations,
    footerConfig,
    backgroundConfig,
  } = await getPublicShellData();

  return (
    <PublicChrome
      profile={profile}
      initialThemeId={themeId}
      initialOverrides={overrides}
      initialAnimations={animations}
      footerConfig={footerConfig}
      backgroundConfig={backgroundConfig}
    >
      <PageHeader eyebrow="Contact" title="Get In Touch" />
      <ContactSection profile={profile} config={visualConfig.contact} />
    </PublicChrome>
  );
}
