/**
 * Database Check & Health Diagnostic Utility
 * Workspace: E:\kartik\my_resume
 *
 * Runs comprehensive SQLite and Prisma diagnostics:
 * 1. Database file accessibility and size
 * 2. SQLite PRAGMA integrity_check
 * 3. SQLite PRAGMA foreign_key_check
 * 4. Prisma client connectivity
 * 5. Table presence verification across all 26 application models
 * 6. Record counts and essential data integrity validation
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EXPECTED_MODELS = [
  // Admin & Auth
  'AdminUser',
  'AdminSession',
  'LoginHistory',
  'AuditLog',
  'PasswordResetToken',
  // Portfolio
  'Profile',
  'Project',
  'ProjectCategory',
  'ProjectFile',
  'DownloadLog',
  'Skill',
  'SkillCategory',
  'Experience',
  'Service',
  'Certification',
  'Testimonial',
  'Message',
  // Website Config
  'ThemeConfig',
  'ThemeHistory',
  'SiteVisualConfig',
  'VisualConfigRevision',
  // Music
  'MusicTrack',
  'MusicConfig',
  'Playlist',
  // Media
  'MediaAsset'
];

async function checkDatabase() {
  console.log('==================================================');
  console.log('   PRISMA & SQLITE DATABASE HEALTH DIAGNOSTIC     ');
  console.log('==================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const dbPath = path.join(rootDir, 'prisma', 'dev.db');

  let passedAll = true;

  // 1. File Check
  console.log('[1/6] Database File System Check:');
  if (!fs.existsSync(dbPath)) {
    console.error('  [FAIL] Database file not found at: ' + dbPath);
    return false;
  }
  const stats = fs.statSync(dbPath);
  console.log(`  [OK] Location: ${dbPath}`);
  console.log(`  [OK] Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  [OK] Last Modified: ${stats.mtime.toISOString()}\n`);

  // 2. Connectivity Check
  console.log('[2/6] Prisma Client Connectivity:');
  try {
    await prisma.$connect();
    console.log('  [OK] Successfully connected to SQLite via Prisma Client.\n');
  } catch (err) {
    console.error('  [FAIL] Prisma connection error:', err.message);
    return false;
  }

  // 3. SQLite PRAGMA Integrity Check
  console.log('[3/6] SQLite Low-Level Integrity Check:');
  try {
    const integrity = await prisma.$queryRawUnsafe('PRAGMA integrity_check;');
    if (integrity && integrity[0] && integrity[0].integrity_check === 'ok') {
      console.log('  [OK] PRAGMA integrity_check returned: "ok"\n');
    } else {
      console.error('  [FAIL] PRAGMA integrity_check failed:', integrity);
      passedAll = false;
    }
  } catch (err) {
    console.error('  [FAIL] PRAGMA integrity_check execution error:', err.message);
    passedAll = false;
  }

  // 4. Foreign Key Constraints Check
  console.log('[4/6] SQLite Foreign Key Constraints Check:');
  try {
    const fkErrors = await prisma.$queryRawUnsafe('PRAGMA foreign_key_check;');
    if (Array.isArray(fkErrors) && fkErrors.length === 0) {
      console.log('  [OK] PRAGMA foreign_key_check passed (0 orphaned foreign keys).\n');
    } else {
      console.warn('  [WARN] Foreign key discrepancies detected:', fkErrors);
    }
  } catch (err) {
    console.error('  [FAIL] Foreign key check error:', err.message);
  }

  // 5. Model & Table Verification
  console.log('[5/6] Verifying Models & Tables in SQLite Master:');
  const tables = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations';"
  );
  const existingTableNames = new Set(tables.map(t => t.name));

  let missingTables = 0;
  for (const model of EXPECTED_MODELS) {
    if (existingTableNames.has(model)) {
      const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${model}";`);
      const count = Number(countRes[0].count);
      console.log(`  [OK] Table [${model.padEnd(20)}]: Present (${count} rows)`);
    } else {
      console.error(`  [FAIL] Missing Table: [${model}]`);
      missingTables++;
      passedAll = false;
    }
  }
  console.log(`\n  Verified: ${EXPECTED_MODELS.length - missingTables} / ${EXPECTED_MODELS.length} tables present.\n`);

  // 6. Essential Data Records Verification
  console.log('[6/6] Verifying Critical Application Records:');
  try {
    const admin = await prisma.adminUser.findFirst({
      select: { id: true, username: true, role: true, mustChangePassword: true }
    });
    console.log(`  Admin User:   ${admin ? `OK (${admin.username}, role: ${admin.role})` : 'MISSING'}`);

    const profile = await prisma.profile.findFirst({
      select: { name: true, email: true, websiteTitle: true }
    });
    console.log(`  Profile:      ${profile ? `OK (${profile.name} <${profile.email}>)` : 'MISSING'}`);

    const projectCount = await prisma.project.count();
    const filesCount = await prisma.projectFile.count();
    console.log(`  Projects:     ${projectCount} live projects (${filesCount} downloadable files attached)`);

    const skillCount = await prisma.skill.count();
    console.log(`  Skills:       ${skillCount} skills cataloged`);

    const trackCount = await prisma.musicTrack.count();
    console.log(`  Music Tracks: ${trackCount} ambient tracks active`);

    const migrationCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM "_prisma_migrations";');
    console.log(`  Migrations:   ${Number(migrationCount[0].count)} applied baseline migrations in history`);

  } catch (err) {
    console.error('  [FAIL] Data verification error:', err.message);
    passedAll = false;
  }

  console.log('\n==================================================');
  if (passedAll) {
    console.log('✓ ALL DATABASE HEALTH CHECKS PASSED SUCCESSFULLY');
  } else {
    console.error('✗ ONE OR MORE DATABASE HEALTH CHECKS FAILED');
  }
  console.log('==================================================');

  return passedAll;
}

if (require.main === module) {
  checkDatabase()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(err => {
      console.error('[FATAL] Health check error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { checkDatabase };
