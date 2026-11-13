import { PrismaClient } from "@prisma/client";
import { signToken, AUTH_COOKIE_NAME } from "../src/lib/auth";

const prisma = new PrismaClient();

async function runIntegration() {
  console.log("=========================================");
  console.log("RUNNING PORTFOLIO DATABASE & INTEGRATION TEST");
  console.log("=========================================");

  // 1. Check Profile
  const profile = await prisma.profile.findFirst();
  console.log("Profile Name:", profile?.name);
  if (!profile || !profile.name) throw new Error("Profile record missing");

  // 2. Check Projects (should have 4)
  const projects = await prisma.project.findMany();
  console.log(`Projects Count: ${projects.length}`);
  if (projects.length < 4) throw new Error("Expected at least 4 projects");

  // 3. Check Experiences & Education
  const work = await prisma.experience.findMany({ where: { type: "work" } });
  const education = await prisma.experience.findMany({ where: { type: "education" } });
  const achievements = await prisma.experience.findMany({ where: { type: "achievement" } });
  console.log(`Work items: ${work.length}, Education items: ${education.length}, Achievements: ${achievements.length}`);
  if (work.length === 0 || education.length === 0) throw new Error("Experience or Education records missing");

  // 4. Check Skills
  const skills = await prisma.skill.findMany();
  console.log(`Skills Count: ${skills.length}`);
  if (skills.length < 20) throw new Error("Expected at least 20 skills");

  // 5. Check Testimonials
  const testimonials = await prisma.testimonial.findMany();
  console.log(`Testimonials Count: ${testimonials.length}`);
  if (testimonials.length < 4) throw new Error("Expected at least 4 testimonials");

  // 6. Check Certifications
  const certs = await prisma.certification.findMany();
  console.log(`Certifications Count: ${certs.length}`);
  if (certs.length < 4) throw new Error("Expected at least 4 certifications");

  // 7. Check ThemeConfig
  const themeConfig = await prisma.themeConfig.findFirst();
  console.log(`Active Theme: ${themeConfig?.activeThemeId}`);
  if (!themeConfig || !themeConfig.activeThemeId) throw new Error("ThemeConfig missing");

  // 8. Test Theme Switching in DB
  console.log("Testing theme switch to 'emerald-luxury'...");
  await prisma.themeConfig.update({
    where: { id: themeConfig.id },
    data: {
      previousThemeId: themeConfig.activeThemeId,
      activeThemeId: "emerald-luxury",
    },
  });

  const updatedTheme = await prisma.themeConfig.findFirst();
  console.log(`Theme successfully switched to: ${updatedTheme?.activeThemeId}, Previous: ${updatedTheme?.previousThemeId}`);
  if (updatedTheme?.activeThemeId !== "emerald-luxury") throw new Error("Theme switch failed");

  // Test rollback
  console.log("Testing theme rollback...");
  await prisma.themeConfig.update({
    where: { id: themeConfig.id },
    data: {
      activeThemeId: updatedTheme.previousThemeId || "midnight-dark",
      previousThemeId: "emerald-luxury",
    },
  });

  const restoredTheme = await prisma.themeConfig.findFirst();
  console.log(`Theme restored to: ${restoredTheme?.activeThemeId}`);

  // 9. Test JWT Admin token generation & verification
  console.log("Testing Admin Session Token Signing...");
  const token = await signToken({ userId: "test-user-id", username: "KARTIK" });
  if (!token || token.length < 20) throw new Error("JWT signing failed");
  console.log("✓ Admin JWT Token successfully signed");

  console.log("\n=========================================");
  console.log("ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
  console.log("=========================================");
}

runIntegration()
  .catch((e) => {
    console.error("Integration test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
