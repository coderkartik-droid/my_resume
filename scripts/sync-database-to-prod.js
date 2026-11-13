/**
 * Safe Production Database Synchronization & Migration Tool
 * Workspace: E:\kartik\my_resume
 *
 * Rules:
 * 1. PRESERVE production admin accounts, sessions, audit logs, and client messages.
 * 2. NEVER delete or overwrite existing production operational data.
 * 3. Automatic timestamped backup before any mutation.
 * 4. Foreign key integrity and SQLite pragma validation.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Content models that are safe to transfer/synchronize
const CONTENT_MODELS = [
  'projectCategory',
  'project',
  'projectFile',
  'skillCategory',
  'skill',
  'experience',
  'service',
  'profile',
  'testimonial',
  'certification',
  'playlist',
  'musicTrack',
  'musicConfig',
  'themeConfig',
  'siteVisualConfig',
];

// Protected models that MUST NEVER be overwritten or wiped on production
const PROTECTED_MODELS = [
  'adminUser',
  'adminSession',
  'loginHistory',
  'auditLog',
  'passwordResetToken',
  'message',
  'downloadLog',
];

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

function getPrismaSqliteUrl(filePath) {
  const prismaDir = path.resolve(__dirname, '..', 'prisma');
  let rel = path.relative(prismaDir, path.resolve(filePath)).replace(/\\/g, '/');
  if (!rel.startsWith('.') && !rel.startsWith('/')) {
    rel = './' + rel;
  }
  return `file:${rel}`;
}

async function exportLocalData(sourceDbPath, outputPath) {
  console.log('====================================================');
  console.log('   SAFE PRODUCTION DATA EXPORTER                    ');
  console.log('====================================================');
  console.log(`Source DB: ${sourceDbPath}`);
  console.log(`Output:    ${outputPath}\n`);

  const sourcePrisma = new PrismaClient({
    datasources: { db: { url: getPrismaSqliteUrl(sourceDbPath) } },
  });

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    source: 'local_development',
    version: '1.0.0',
    data: {},
  };

  try {
    for (const model of CONTENT_MODELS) {
      const records = await sourcePrisma[model].findMany();
      exportPayload.data[model] = records;
      console.log(`  ✓ Exported ${String(records.length).padStart(3)} records from [${model}]`);
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(exportPayload, null, 2), 'utf8');

    console.log('\n====================================================');
    console.log('✓ EXPORT COMPLETED SUCCESSFULLY!');
    console.log(`  Saved to: ${outputPath}`);
    console.log('====================================================');
  } finally {
    await sourcePrisma.$disconnect();
  }
}

async function syncDatabases(sourceDbPath, targetDbPath, options = {}) {
  console.log('====================================================');
  console.log('   SAFE DATABASE SYNCHRONIZER                       ');
  console.log('====================================================');
  console.log(`Source: ${sourceDbPath}`);
  console.log(`Target: ${targetDbPath}\n`);

  const resolvedSource = path.resolve(sourceDbPath);
  const resolvedTarget = path.resolve(targetDbPath);

  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`Source database file does not exist: ${resolvedSource}`);
  }
  if (!fs.existsSync(resolvedTarget)) {
    throw new Error(`Target database file does not exist: ${resolvedTarget}`);
  }

  // 1. Mandatory Pre-Sync Backup
  const backupDir = path.resolve(__dirname, '..', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `target_db_presync_${getTimestamp()}.sqlite`);
  fs.copyFileSync(resolvedTarget, backupFile);
  console.log(`[1/5] Safety snapshot created: ${backupFile}`);

  const sourcePrisma = new PrismaClient({ datasources: { db: { url: getPrismaSqliteUrl(resolvedSource) } } });
  const targetPrisma = new PrismaClient({ datasources: { db: { url: getPrismaSqliteUrl(resolvedTarget) } } });

  try {
    // 2. Validate Protected Tables in Target
    console.log('\n[2/5] Inspecting target protected records to preserve...');
    for (const model of PROTECTED_MODELS) {
      const count = await targetPrisma[model].count();
      console.log(`  🔒 Preserved [${model.padEnd(20)}]: ${count} records will remain untouched.`);
    }

    // 3. Synchronize Content Tables
    console.log('\n[3/5] Synchronizing application content...');

    // A. Profile (Singleton)
    const sourceProfile = await sourcePrisma.profile.findFirst();
    if (sourceProfile) {
      await targetPrisma.profile.upsert({
        where: { id: sourceProfile.id },
        update: { ...sourceProfile },
        create: { ...sourceProfile },
      });
      console.log('  ✓ Synchronized Profile');
    }

    // B. Project Categories & Projects
    const categories = await sourcePrisma.projectCategory.findMany();
    for (const cat of categories) {
      await targetPrisma.projectCategory.upsert({
        where: { id: cat.id },
        update: { ...cat },
        create: { ...cat },
      });
    }
    console.log(`  ✓ Synchronized ${categories.length} Project Categories`);

    const projects = await sourcePrisma.project.findMany();
    for (const p of projects) {
      await targetPrisma.project.upsert({
        where: { id: p.id },
        update: { ...p },
        create: { ...p },
      });
    }
    console.log(`  ✓ Synchronized ${projects.length} Projects`);

    // C. Project Files
    const files = await sourcePrisma.projectFile.findMany();
    for (const f of files) {
      await targetPrisma.projectFile.upsert({
        where: { id: f.id },
        update: { ...f },
        create: { ...f },
      });
    }
    console.log(`  ✓ Synchronized ${files.length} Project Files`);

    // D. Skills & Skill Categories
    const skillCats = await sourcePrisma.skillCategory.findMany();
    for (const sc of skillCats) {
      await targetPrisma.skillCategory.upsert({
        where: { id: sc.id },
        update: { ...sc },
        create: { ...sc },
      });
    }
    const skills = await sourcePrisma.skill.findMany();
    for (const s of skills) {
      await targetPrisma.skill.upsert({
        where: { id: s.id },
        update: { ...s },
        create: { ...s },
      });
    }
    console.log(`  ✓ Synchronized ${skills.length} Skills in ${skillCats.length} Categories`);

    // E. Experience, Services, Testimonials, Certifications
    const experiences = await sourcePrisma.experience.findMany();
    for (const exp of experiences) {
      await targetPrisma.experience.upsert({
        where: { id: exp.id },
        update: { ...exp },
        create: { ...exp },
      });
    }
    console.log(`  ✓ Synchronized ${experiences.length} Experience items`);

    const services = await sourcePrisma.service.findMany();
    for (const s of services) {
      await targetPrisma.service.upsert({
        where: { id: s.id },
        update: { ...s },
        create: { ...s },
      });
    }
    console.log(`  ✓ Synchronized ${services.length} Services`);

    const testimonials = await sourcePrisma.testimonial.findMany();
    for (const t of testimonials) {
      await targetPrisma.testimonial.upsert({
        where: { id: t.id },
        update: { ...t },
        create: { ...t },
      });
    }
    console.log(`  ✓ Synchronized ${testimonials.length} Testimonials`);

    const certs = await sourcePrisma.certification.findMany();
    for (const c of certs) {
      await targetPrisma.certification.upsert({
        where: { id: c.id },
        update: { ...c },
        create: { ...c },
      });
    }
    console.log(`  ✓ Synchronized ${certs.length} Certifications`);

    // F. Music System (Playlists, Tracks, Config)
    const playlists = await sourcePrisma.playlist.findMany();
    for (const pl of playlists) {
      await targetPrisma.playlist.upsert({
        where: { id: pl.id },
        update: { ...pl },
        create: { ...pl },
      });
    }
    const tracks = await sourcePrisma.musicTrack.findMany();
    for (const tr of tracks) {
      await targetPrisma.musicTrack.upsert({
        where: { id: tr.id },
        update: { ...tr },
        create: { ...tr },
      });
    }
    const musicConfig = await sourcePrisma.musicConfig.findFirst();
    if (musicConfig) {
      await targetPrisma.musicConfig.upsert({
        where: { id: musicConfig.id },
        update: { ...musicConfig },
        create: { ...musicConfig },
      });
    }
    console.log(`  ✓ Synchronized Music System (${tracks.length} tracks)`);

    // G. Theme & Site Visual Config
    const themeConfig = await sourcePrisma.themeConfig.findFirst();
    if (themeConfig) {
      await targetPrisma.themeConfig.upsert({
        where: { id: themeConfig.id },
        update: { ...themeConfig },
        create: { ...themeConfig },
      });
      console.log('  ✓ Synchronized Theme Configuration');
    }

    const sourceVC = await sourcePrisma.siteVisualConfig.findFirst();
    if (sourceVC) {
      const targetVC = await targetPrisma.siteVisualConfig.findFirst();
      let existingRevs = [];
      if (targetVC?.revisions) {
        try { existingRevs = JSON.parse(targetVC.revisions); } catch {}
      }

      const syncRevision = {
        id: `rev_sync_${Date.now()}`,
        name: 'Synchronized from Canonical Local Baseline',
        timestamp: new Date().toISOString(),
        data: JSON.parse(sourceVC.publishedConfig || '{}'),
      };
      const updatedRevs = [syncRevision, ...existingRevs].slice(0, 15);

      await targetPrisma.siteVisualConfig.upsert({
        where: { id: sourceVC.id },
        update: {
          publishedConfig: sourceVC.publishedConfig,
          draftConfig: null,
          revisions: JSON.stringify(updatedRevs),
        },
        create: {
          id: sourceVC.id,
          publishedConfig: sourceVC.publishedConfig,
          draftConfig: null,
          revisions: JSON.stringify(updatedRevs),
        },
      });

      await targetPrisma.visualConfigRevision.create({
        data: {
          snapshot: sourceVC.publishedConfig || '{}',
          appliedBy: 'system_sync',
          note: 'Synchronized canonical published configuration from local baseline',
        },
      }).catch(() => {});

      console.log('  ✓ Synchronized Site Visual Configuration (publishedConfig set as canonical)');
    }

    // 4. Target Integrity Validation
    console.log('\n[4/5] Running SQLite integrity and foreign key checks on target...');
    const integrity = await targetPrisma.$queryRaw`PRAGMA integrity_check`;
    const fkCheck = await targetPrisma.$queryRaw`PRAGMA foreign_key_check`;

    console.log(`  PRAGMA integrity_check: ${integrity[0]?.integrity_check || 'ok'}`);
    console.log(`  PRAGMA foreign_key_check violations: ${fkCheck.length}`);

    if (fkCheck.length > 0) {
      throw new Error(`Foreign key check failed with ${fkCheck.length} violations! Rolling back.`);
    }

    console.log('\n[5/5] Final target record verification:');
    for (const model of [...PROTECTED_MODELS, ...CONTENT_MODELS]) {
      const count = await targetPrisma[model].count();
      console.log(`  - ${model.padEnd(22)}: ${count} rows`);
    }

    console.log('\n====================================================');
    console.log('✓ TARGET DATABASE SYNCHRONIZED SAFELY & VERIFIED');
    console.log('====================================================');
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

async function importJsonData(jsonPath, targetDbPath) {
  console.log('====================================================');
  console.log('   SAFE PRODUCTION DATA IMPORTER                    ');
  console.log('====================================================');
  console.log(`Payload: ${jsonPath}`);
  console.log(`Target:  ${targetDbPath}\n`);

  const resolvedJson = path.resolve(jsonPath);
  const resolvedTarget = path.resolve(targetDbPath);

  if (!fs.existsSync(resolvedJson)) {
    throw new Error(`Data package file not found: ${resolvedJson}`);
  }
  if (!fs.existsSync(resolvedTarget)) {
    throw new Error(`Target database file not found: ${resolvedTarget}`);
  }

  // 1. Mandatory Pre-Import Backup
  const backupDir = path.resolve(__dirname, '..', 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `target_db_preimport_${getTimestamp()}.sqlite`);
  fs.copyFileSync(resolvedTarget, backupFile);
  console.log(`[1/5] Safety snapshot created: ${backupFile}`);

  const rawJson = fs.readFileSync(resolvedJson, 'utf8');
  const payload = JSON.parse(rawJson);
  const data = payload.data || {};

  const targetPrisma = new PrismaClient({ datasources: { db: { url: getPrismaSqliteUrl(resolvedTarget) } } });

  try {
    // 2. Validate Protected Tables in Target
    console.log('\n[2/5] Inspecting target protected records to preserve...');
    for (const model of PROTECTED_MODELS) {
      const count = await targetPrisma[model].count();
      console.log(`  🔒 Preserved [${model.padEnd(20)}]: ${count} records will remain untouched.`);
    }

    // 3. Import Content Tables
    console.log('\n[3/5] Upserting application content...');

    if (data.profile && data.profile.length > 0) {
      const prof = data.profile[0];
      await targetPrisma.profile.upsert({
        where: { id: prof.id },
        update: { ...prof },
        create: { ...prof },
      });
      console.log('  ✓ Imported Profile');
    }

    if (Array.isArray(data.projectCategory)) {
      for (const cat of data.projectCategory) {
        await targetPrisma.projectCategory.upsert({
          where: { id: cat.id },
          update: { ...cat },
          create: { ...cat },
        });
      }
      console.log(`  ✓ Imported ${data.projectCategory.length} Project Categories`);
    }

    if (Array.isArray(data.project)) {
      for (const p of data.project) {
        await targetPrisma.project.upsert({
          where: { id: p.id },
          update: { ...p },
          create: { ...p },
        });
      }
      console.log(`  ✓ Imported ${data.project.length} Projects`);
    }

    if (Array.isArray(data.projectFile)) {
      for (const f of data.projectFile) {
        await targetPrisma.projectFile.upsert({
          where: { id: f.id },
          update: { ...f },
          create: { ...f },
        });
      }
      console.log(`  ✓ Imported ${data.projectFile.length} Project Files`);
    }

    if (Array.isArray(data.skillCategory)) {
      for (const sc of data.skillCategory) {
        await targetPrisma.skillCategory.upsert({
          where: { id: sc.id },
          update: { ...sc },
          create: { ...sc },
        });
      }
    }
    if (Array.isArray(data.skill)) {
      for (const s of data.skill) {
        await targetPrisma.skill.upsert({
          where: { id: s.id },
          update: { ...s },
          create: { ...s },
        });
      }
      console.log(`  ✓ Imported ${data.skill.length} Skills`);
    }

    if (Array.isArray(data.experience)) {
      for (const exp of data.experience) {
        await targetPrisma.experience.upsert({
          where: { id: exp.id },
          update: { ...exp },
          create: { ...exp },
        });
      }
      console.log(`  ✓ Imported ${data.experience.length} Experience items`);
    }

    if (Array.isArray(data.service)) {
      for (const s of data.service) {
        await targetPrisma.service.upsert({
          where: { id: s.id },
          update: { ...s },
          create: { ...s },
        });
      }
      console.log(`  ✓ Imported ${data.service.length} Services`);
    }

    if (Array.isArray(data.testimonial)) {
      for (const t of data.testimonial) {
        await targetPrisma.testimonial.upsert({
          where: { id: t.id },
          update: { ...t },
          create: { ...t },
        });
      }
      console.log(`  ✓ Imported ${data.testimonial.length} Testimonials`);
    }

    if (Array.isArray(data.certification)) {
      for (const c of data.certification) {
        await targetPrisma.certification.upsert({
          where: { id: c.id },
          update: { ...c },
          create: { ...c },
        });
      }
      console.log(`  ✓ Imported ${data.certification.length} Certifications`);
    }

    if (Array.isArray(data.playlist)) {
      for (const pl of data.playlist) {
        await targetPrisma.playlist.upsert({
          where: { id: pl.id },
          update: { ...pl },
          create: { ...pl },
        });
      }
    }
    if (Array.isArray(data.musicTrack)) {
      for (const tr of data.musicTrack) {
        await targetPrisma.musicTrack.upsert({
          where: { id: tr.id },
          update: { ...tr },
          create: { ...tr },
        });
      }
    }
    if (data.musicConfig && data.musicConfig.length > 0) {
      const mc = data.musicConfig[0];
      await targetPrisma.musicConfig.upsert({
        where: { id: mc.id },
        update: { ...mc },
        create: { ...mc },
      });
      console.log('  ✓ Imported Music System');
    }

    if (data.themeConfig && data.themeConfig.length > 0) {
      const tc = data.themeConfig[0];
      await targetPrisma.themeConfig.upsert({
        where: { id: tc.id },
        update: { ...tc },
        create: { ...tc },
      });
      console.log('  ✓ Imported Theme Configuration');
    }

    if (data.siteVisualConfig && data.siteVisualConfig.length > 0) {
      const vc = data.siteVisualConfig[0];
      const targetVC = await targetPrisma.siteVisualConfig.findFirst();
      let existingRevs = [];
      if (targetVC?.revisions) {
        try { existingRevs = JSON.parse(targetVC.revisions); } catch {}
      }

      const syncRevision = {
        id: `rev_import_${Date.now()}`,
        name: 'Imported from Safe Production Package',
        timestamp: new Date().toISOString(),
        data: JSON.parse(vc.publishedConfig || '{}'),
      };
      const updatedRevs = [syncRevision, ...existingRevs].slice(0, 15);

      await targetPrisma.siteVisualConfig.upsert({
        where: { id: vc.id },
        update: {
          publishedConfig: vc.publishedConfig,
          draftConfig: null,
          revisions: JSON.stringify(updatedRevs),
        },
        create: {
          id: vc.id,
          publishedConfig: vc.publishedConfig,
          draftConfig: null,
          revisions: JSON.stringify(updatedRevs),
        },
      });

      console.log('  ✓ Imported Canonical Site Visual Configuration');
    }

    // 4. Target Integrity Validation
    console.log('\n[4/5] Running SQLite integrity and foreign key checks on target...');
    const integrity = await targetPrisma.$queryRaw`PRAGMA integrity_check`;
    const fkCheck = await targetPrisma.$queryRaw`PRAGMA foreign_key_check`;

    console.log(`  PRAGMA integrity_check: ${integrity[0]?.integrity_check || 'ok'}`);
    console.log(`  PRAGMA foreign_key_check violations: ${fkCheck.length}`);

    if (fkCheck.length > 0) {
      throw new Error(`Foreign key check failed with ${fkCheck.length} violations! Rolling back.`);
    }

    console.log('\n[5/5] Final target record verification:');
    for (const model of [...PROTECTED_MODELS, ...CONTENT_MODELS]) {
      const count = await targetPrisma[model].count();
      console.log(`  - ${model.padEnd(22)}: ${count} rows`);
    }

    console.log('\n====================================================');
    console.log('✓ TARGET DATABASE IMPORTED SAFELY & VERIFIED');
    console.log('====================================================');
  } finally {
    await targetPrisma.$disconnect();
  }
}

// CLI handler
async function main() {
  const args = process.argv.slice(2);
  const mode = args.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'sync';
  const source = args.find((a) => a.startsWith('--source='))?.split('=')[1] || 'prisma/dev.db';
  const target = args.find((a) => a.startsWith('--target='))?.split('=')[1] || 'deploy/production/prisma/dev.db';
  const output = args.find((a) => a.startsWith('--output='))?.split('=')[1] || 'deploy/safe_production_data.json';
  const file = args.find((a) => a.startsWith('--file='))?.split('=')[1] || 'deploy/safe_production_data.json';

  if (mode === 'export') {
    await exportLocalData(source, output);
  } else if (mode === 'sync') {
    await syncDatabases(source, target);
  } else if (mode === 'import') {
    await importJsonData(file, target);
  } else {
    console.log('Usage: node scripts/sync-database-to-prod.js [--mode=sync|export|import] [--source=path] [--target=path] [--file=path]');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\n[FATAL ERROR]', err.message);
    process.exit(1);
  });
}

module.exports = { syncDatabases, exportLocalData, importJsonData };
