const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cfg = await prisma.siteVisualConfig.findFirst();
  if (cfg && cfg.publishedConfig) {
    const data = JSON.parse(cfg.publishedConfig);
    if (data.contact) {
      data.contact.telemetryLatency = '< 24 Hours Response';
      data.contact.encryptionLabel = 'Direct Reach';
      data.contact.badgeText = 'DIRECT INQUIRIES • GET IN TOUCH';
    }
    if (data.about) {
      data.about.pillar1Desc = 'Custom Three.js pipelines, procedural shaders, and GPU-optimized rendering designed for fluid, responsive interactions across all viewports.';
      data.about.pillar4Desc = 'Disciplined engineering with clean architecture, strict type safety, responsive fluid typography, and reliable cross-platform accessibility.';
    }
    if (data.hero) {
      data.hero.badgeText = 'AVAILABLE FOR HIGH-IMPACT INITIATIVES';
      data.hero.primaryCtaText = 'EXPLORE CASE STUDIES';
      data.hero.secondaryCtaText = 'DOWNLOAD RESUME';
      data.hero.metric1Label = 'Years Exp.';
      data.hero.metric2Label = 'Projects Built';
      data.hero.metric3Label = 'Commitment';
    }
    await prisma.siteVisualConfig.update({
      where: { id: cfg.id },
      data: {
        publishedConfig: JSON.stringify(data),
        draftConfig: JSON.stringify(data),
      },
    });
    console.log('Successfully cleansed publishedConfig and draftConfig in SQLite DB!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
