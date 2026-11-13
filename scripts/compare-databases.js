const { PrismaClient } = require('@prisma/client');

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'file:E:/kartik/my_resume/prisma/dev.db' } }
});

const deployPrisma = new PrismaClient({
  datasources: { db: { url: 'file:E:/kartik/my_resume/deploy/production/prisma/dev.db' } }
});

async function compare() {
  const models = [
    'adminUser', 'adminSession', 'loginHistory', 'auditLog', 'passwordResetToken',
    'projectCategory', 'project', 'projectFile', 'downloadLog',
    'skillCategory', 'skill', 'experience', 'service', 'message',
    'profile', 'testimonial', 'certification',
    'themeConfig', 'themeHistory', 'siteVisualConfig', 'visualConfigRevision',
    'playlist', 'musicTrack', 'musicConfig', 'mediaAsset'
  ];

  console.log('--- TABLE RECORD COUNT COMPARISON ---');
  for (const m of models) {
    try {
      const localCount = await localPrisma[m].count();
      const deployCount = await deployPrisma[m].count();
      const match = localCount === deployCount ? 'MATCH' : 'DIFF';
      console.log(`[${match}] ${m.padEnd(22)} Local: ${localCount} | Staged Deploy: ${deployCount}`);
    } catch (e) {
      console.log(`[ERR ] ${m.padEnd(22)} ${e.message}`);
    }
  }

  const localVC = await localPrisma.siteVisualConfig.findFirst();
  const deployVC = await deployPrisma.siteVisualConfig.findFirst();
  console.log('\n--- siteVisualConfig comparison ---');
  console.log('Local publishedConfig length:', localVC?.publishedConfig?.length);
  console.log('Deploy publishedConfig length:', deployVC?.publishedConfig?.length);
  console.log('Are publishedConfigs identical?', localVC?.publishedConfig === deployVC?.publishedConfig);
  if (localVC?.publishedConfig !== deployVC?.publishedConfig) {
    const lP = JSON.parse(localVC.publishedConfig);
    const dP = JSON.parse(deployVC.publishedConfig);
    console.log('Local hero name:', lP.hero?.name);
    console.log('Deploy hero name:', dP.hero?.name);
    console.log('Local hero metric1:', lP.hero?.metric1Value);
    console.log('Deploy hero metric1:', dP.hero?.metric1Value);
  }

  await localPrisma.$disconnect();
  await deployPrisma.$disconnect();
}

compare().catch(console.error);
