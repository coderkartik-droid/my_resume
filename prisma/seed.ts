import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("   PRISMA SAFE IDEMPOTENT SEED SCRIPT             ");
  console.log("==================================================");

  // 1. Admin User - Non-destructive check
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@Secure2026";
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    await prisma.adminUser.create({
      data: {
        username: "admin",
        password: hashedPassword,
        mustChangePassword: true,
        role: "SUPERADMIN",
      },
    });
    console.log("[SEED] Created initial default administrator (admin).");
  } else {
    console.log(`[SEED] Active administrator(s) found (${adminCount}). Preserving existing credentials.`);
  }

  // 2. Profile - Non-destructive check
  const profile = await prisma.profile.findUnique({
    where: { id: "profile_default" },
  });
  if (!profile) {
    await prisma.profile.create({
      data: {
        id: "profile_default",
        name: "Kartik Khajuria",
        tagline: "Creative Developer | Full-Stack Software Engineer",
        bio: "Crafting high-impact interactive 3D web experiences, modern user interfaces, and scalable full-stack applications.",
        email: "kartikkhajuria643@gmail.com",
        phone: "+91 7518850297",
        location: "Mathura, Uttar Pradesh, India",
        websiteTitle: "Kartik Khajuria — Creative Developer & 3D Interactive Portfolio",
        footerText: "Designed & developed with precision, WebGL shaders & Next.js architecture.",
      },
    });
    console.log("[SEED] Initialized default profile.");
  } else {
    console.log(`[SEED] Profile for '${profile.name}' already exists. Preserving.`);
  }

  // 3. Project Categories - Idempotent upsert
  const defaultProjectCategories = [
    { name: "3D & Interactive Web", slug: "3d-interactive-web", description: "Spatial computing, WebGL, Three.js and high-fidelity interactive experiences", order: 1 },
    { name: "Full-Stack Web Applications", slug: "full-stack-web", description: "End-to-end full-stack architectures, dashboards, and enterprise platforms", order: 2 },
    { name: "Cloud & Distributed Systems", slug: "cloud-systems", description: "Scalable telemetry engines, real-time messaging, and microservices", order: 3 },
    { name: "AI & Neural Systems", slug: "ai-systems", description: "Machine learning interfaces, contextual LLM agents, and vector search", order: 4 },
    { name: "Mobile & Cross-Platform", slug: "mobile-cross-platform", description: "Native and hybrid cross-platform client applications", order: 5 },
  ];

  for (const cat of defaultProjectCategories) {
    await prisma.projectCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, order: cat.order },
      create: cat,
    });
  }
  console.log(`[SEED] Project categories verified (${defaultProjectCategories.length} categories).`);

  // 4. Skill Categories - Idempotent upsert
  const defaultSkillCategories = [
    { name: "Frontend Development", slug: "frontend", description: "Client-side rendering, reactive state, and modern CSS", order: 1 },
    { name: "3D & Creative Web", slug: "3d-creative", description: "Three.js, WebGL shaders, Canvas, and Framer Motion", order: 2 },
    { name: "Backend Development", slug: "backend", description: "Server architectures, RESTful APIs, and GraphQL", order: 3 },
    { name: "Programming Languages", slug: "programming-languages", description: "Core systems and application programming languages", order: 4 },
    { name: "Databases & Storage", slug: "databases", description: "Relational, document, and key-value distributed databases", order: 5 },
    { name: "DevOps & Cloud", slug: "devops-cloud", description: "Containers, CI/CD pipelines, orchestration, and infrastructure", order: 6 },
    { name: "Tools & Technologies", slug: "tools-technologies", description: "Version control, design tools, and productivity suites", order: 7 },
  ];

  for (const cat of defaultSkillCategories) {
    await prisma.skillCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, order: cat.order },
      create: cat,
    });
  }
  console.log(`[SEED] Skill categories verified (${defaultSkillCategories.length} categories).`);

  // 5. Playlists - Idempotent upsert
  await prisma.playlist.upsert({
    where: { name: "Default" },
    update: {},
    create: {
      name: "Default",
      description: "Atmospheric ambient background tracks for portfolio immersion",
      order: 1,
    },
  });
  console.log("[SEED] Default audio playlist verified.");

  // 6. Connect existing Project records to ProjectCategory if categoryId is null
  const projects = await prisma.project.findMany();
  for (const p of projects) {
    if (!p.categoryId) {
      let matchedCategory = await prisma.projectCategory.findFirst({
        where: { name: { contains: p.category } }
      });
      if (!matchedCategory) {
        matchedCategory = await prisma.projectCategory.findFirst({
          where: { slug: "3d-interactive-web" }
        });
      }
      if (matchedCategory) {
        await prisma.project.update({
          where: { id: p.id },
          data: { categoryId: matchedCategory.id },
        });
      }
    }
  }
  console.log(`[SEED] Verified foreign keys for ${projects.length} existing projects.`);

  // 7. Connect existing Skill records to SkillCategory if categoryId is null
  const skills = await prisma.skill.findMany();
  for (const s of skills) {
    if (!s.categoryId) {
      let matchedCategory = await prisma.skillCategory.findFirst({
        where: {
          name: { contains: s.category.split(" ")[0] }
        }
      });
      if (!matchedCategory) {
        matchedCategory = await prisma.skillCategory.findFirst({
          where: { slug: "tools-technologies" }
        });
      }
      if (matchedCategory) {
        await prisma.skill.update({
          where: { id: s.id },
          data: { categoryId: matchedCategory.id },
        });
      }
    }
  }
  console.log(`[SEED] Verified foreign keys for ${skills.length} existing skills.`);

  // 8. ThemeConfig - Non-destructive
  const themeConfig = await prisma.themeConfig.findUnique({
    where: { id: "active_theme_config" },
  });
  if (!themeConfig) {
    await prisma.themeConfig.create({
      data: {
        id: "active_theme_config",
        activeThemeId: "midnight-dark",
      },
    });
    console.log("[SEED] Initialized default ThemeConfig.");
  }

  // 9. SiteVisualConfig - Non-destructive
  const visualConfig = await prisma.siteVisualConfig.findUnique({
    where: { id: "active_visual_config" },
  });
  if (!visualConfig) {
    await prisma.siteVisualConfig.create({
      data: {
        id: "active_visual_config",
      },
    });
    console.log("[SEED] Initialized default SiteVisualConfig.");
  }

  // 10. MusicConfig - Non-destructive
  const musicConfig = await prisma.musicConfig.findUnique({
    where: { id: "active_music_config" },
  });
  if (!musicConfig) {
    await prisma.musicConfig.create({
      data: {
        id: "active_music_config",
        enabled: true,
        showTopbarToggle: true,
        defaultVolume: 0.35,
      },
    });
    console.log("[SEED] Initialized default MusicConfig.");
  }

  console.log("==================================================");
  console.log("✓ SEED COMPLETED SUCCESSFULLY (Idempotent & Safe)");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("[FATAL] Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
