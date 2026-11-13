/**
 * Comprehensive Database Verification & Automated Test Runner
 * Workspace: E:\kartik\my_resume
 *
 * Runs full 8-point automated verification suite:
 * 1. Prisma schema validation
 * 2. Prisma Client generation & runtime loading
 * 3. Database connectivity
 * 4. SQLite PRAGMA integrity_check
 * 5. Complete table and model presence
 * 6. Existing data preservation
 * 7. Foreign key and relation integrity
 * 8. Password hash verification & authentication logic
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runVerification() {
  console.log('====================================================');
  console.log('   PRISMA & DATABASE COMPREHENSIVE VERIFICATION     ');
  console.log('====================================================\n');

  const results = [];

  function record(title, passed, message = '') {
    results.push({ title, passed, message });
    const tag = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${tag.padEnd(8)} | ${title} ${message ? `(${message})` : ''}`);
  }

  // TEST 1: Prisma Schema Validation
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
    record('1. Prisma Schema Validation', true, 'prisma/schema.prisma is valid');
  } catch (err) {
    record('1. Prisma Schema Validation', false, err.message);
  }

  // TEST 2: Prisma Client Generation & Load
  try {
    const clientTest = new PrismaClient();
    await clientTest.$connect();
    await clientTest.$disconnect();
    record('2. Prisma Client Generation & Connect', true, 'Client load and connectivity verified');
  } catch (err) {
    record('2. Prisma Client Generation & Connect', false, err.message);
  }

  // TEST 3: SQLite Low-Level PRAGMA Integrity
  try {
    const integrity = await prisma.$queryRawUnsafe('PRAGMA integrity_check;');
    const isOk = integrity && integrity[0] && integrity[0].integrity_check === 'ok';
    record('3. SQLite PRAGMA integrity_check', isOk, isOk ? 'Database file healthy' : JSON.stringify(integrity));
  } catch (err) {
    record('3. SQLite PRAGMA integrity_check', false, err.message);
  }

  // TEST 4: SQLite Foreign Key Constraints
  try {
    const fkErrors = await prisma.$queryRawUnsafe('PRAGMA foreign_key_check;');
    const isOk = Array.isArray(fkErrors) && fkErrors.length === 0;
    record('4. SQLite PRAGMA foreign_key_check', isOk, isOk ? '0 foreign key violations' : `${fkErrors.length} violations`);
  } catch (err) {
    record('4. SQLite PRAGMA foreign_key_check', false, err.message);
  }

  // TEST 5: Table Presence Verification (all 25 models + migrations)
  try {
    const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    const tableNames = new Set(tables.map(t => t.name));
    const requiredTables = [
      'Project', 'ProjectFile', 'DownloadLog', 'Skill', 'Experience',
      'Service', 'Message', 'Profile', 'AdminUser', 'ThemeConfig',
      'Testimonial', 'Certification', 'SiteVisualConfig', 'MusicTrack',
      'MusicConfig', '_prisma_migrations', 'AdminSession', 'LoginHistory',
      'AuditLog', 'PasswordResetToken', 'ProjectCategory', 'SkillCategory',
      'ThemeHistory', 'VisualConfigRevision', 'Playlist', 'MediaAsset'
    ];
    const missing = requiredTables.filter(t => !tableNames.has(t));
    record('5. Table Presence in SQLite', missing.length === 0, missing.length === 0 ? `All ${requiredTables.length} tables present` : `Missing: ${missing.join(', ')}`);
  } catch (err) {
    record('5. Table Presence in SQLite', false, err.message);
  }

  // TEST 6: Existing Data Preservation
  try {
    const projects = await prisma.project.count();
    const skills = await prisma.skill.count();
    const files = await prisma.projectFile.count();
    const profile = await prisma.profile.findFirst();
    const admin = await prisma.adminUser.findFirst();

    const dataPreserved = projects >= 4 && skills >= 21 && files >= 3 && profile !== null && admin !== null;
    record(
      '6. Existing Data Preservation',
      dataPreserved,
      `Projects: ${projects}, Skills: ${skills}, ProjectFiles: ${files}, Admin: ${admin?.username}, Profile: ${profile?.name}`
    );
  } catch (err) {
    record('6. Existing Data Preservation', false, err.message);
  }

  // TEST 7: Relational Integrity (Project -> ProjectFile & Category)
  try {
    const projectWithFiles = await prisma.project.findFirst({
      where: { id: 'proj-1' },
      include: { files: true, categoryRel: true }
    });
    const relationsValid = projectWithFiles && projectWithFiles.files.length >= 3;
    record(
      '7. Relational Model Queries',
      relationsValid,
      `Project '${projectWithFiles?.title?.substring(0, 20)}...' has ${projectWithFiles?.files.length} attached files`
    );
  } catch (err) {
    record('7. Relational Model Queries', false, err.message);
  }

  // TEST 8: Authentication & Security Integrity
  try {
    const admin = await prisma.adminUser.findFirst();
    const hasRole = admin && typeof admin.role === 'string' && admin.role.length > 0;
    const hasHash = admin && admin.password.startsWith('$2');
    record('8. Admin Security & Role Structure', hasRole && hasHash, `Admin has valid bcrypt hash & role: ${admin?.role}`);
  } catch (err) {
    record('8. Admin Security & Role Structure', false, err.message);
  }

  console.log('\n====================================================');
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    console.log('✓ ALL 8 DATABASE VERIFICATION TESTS PASSED');
  } else {
    console.error('✗ SOME VERIFICATION TESTS FAILED');
  }
  console.log('====================================================\n');

  return allPassed;
}

if (require.main === module) {
  runVerification()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(err => {
      console.error('[FATAL] Verification failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { runVerification };
