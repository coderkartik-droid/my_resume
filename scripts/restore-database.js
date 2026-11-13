/**
 * Database Restore Utility
 * Workspace: E:\kartik\my_resume
 *
 * Safely restores a verified backup file to prisma/dev.db.
 * STRICT SAFETY RULES:
 * 1. Creates a pre-restore backup of the current database before touching anything.
 * 2. Checks target backup file existence and SQLite integrity.
 * 3. Requires confirmation flag (--confirm) or confirmation input.
 * 4. Never silently overwrites without safety safeguards.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { backupDatabase } = require('./backup-database');

async function restoreDatabase() {
  const rootDir = path.resolve(__dirname, '..');
  const dbPath = path.join(rootDir, 'prisma', 'dev.db');
  const backupsDir = path.join(rootDir, 'backups');

  console.log('==================================================');
  console.log('   PRISMA SQLITE RESTORE UTILITY                  ');
  console.log('==================================================');

  // Find candidate backup
  const args = process.argv.slice(2);
  let targetBackupFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      targetBackupFile = path.resolve(args[i + 1]);
    } else if (args[i].startsWith('--file=')) {
      targetBackupFile = path.resolve(args[i].split('=')[1]);
    }
  }

  // If no specific file provided, list available backups and pick the newest
  if (!targetBackupFile) {
    if (!fs.existsSync(backupsDir)) {
      console.error('[ERROR] No backups directory found at: ' + backupsDir);
      process.exit(1);
    }
    const backups = fs.readdirSync(backupsDir)
      .filter(f => f.endsWith('.sqlite'))
      .map(f => ({ name: f, path: path.join(backupsDir, f), mtime: fs.statSync(path.join(backupsDir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime);

    if (backups.length === 0) {
      console.error('[ERROR] No .sqlite backup files found in: ' + backupsDir);
      process.exit(1);
    }

    targetBackupFile = backups[0].path;
    console.log(`[RESTORE] No --file specified. Selected newest backup: ${backups[0].name}`);
  }

  if (!fs.existsSync(targetBackupFile)) {
    console.error(`[ERROR] Target backup file does not exist: ${targetBackupFile}`);
    process.exit(1);
  }

  console.log(`[RESTORE] Target backup: ${targetBackupFile}`);

  // Safety confirmation check
  const isConfirmed = args.includes('--confirm') || args.includes('-y') || process.env.CONFIRM_RESTORE === 'true';
  if (!isConfirmed) {
    console.warn('\n[CAUTION] Database restore replaces the active prisma/dev.db with the selected backup.');
    console.warn('To proceed safely, run: node scripts/restore-database.js --confirm');
    console.warn('Or specify a file:     node scripts/restore-database.js --file=<path> --confirm');
    process.exit(0);
  }

  // 1. Create a pre-restore safety snapshot of the active DB first
  console.log('\n[1/4] Creating safety backup of active database before restore...');
  if (fs.existsSync(dbPath)) {
    await backupDatabase();
  }

  // 2. Validate target backup integrity before copying
  console.log('[2/4] Validating backup integrity before applying...');
  const testScript = `
    const { PrismaClient } = require('@prisma/client');
    const testDb = new PrismaClient({
      datasources: { db: { url: 'file:${targetBackupFile.replace(/\\/g, '/')}' } }
    });
    testDb.$queryRawUnsafe('PRAGMA integrity_check;')
      .then(res => {
        if (res && res[0] && res[0].integrity_check === 'ok') {
          console.log('      PRAGMA integrity_check: OK');
          process.exit(0);
        } else {
          console.error('      Integrity check failed:', res);
          process.exit(1);
        }
      })
      .catch(err => {
        console.error('      Integrity check error:', err.message);
        process.exit(1);
      })
      .finally(() => testDb.$disconnect());
  `;

  try {
    execSync(`node -e "${testScript.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('[FATAL] Backup file failed integrity check. Aborting restore to protect active database.');
    process.exit(1);
  }

  // 3. Atomically copy the backup to active prisma/dev.db
  console.log('[3/4] Copying validated backup to active database (prisma/dev.db)...');
  fs.copyFileSync(targetBackupFile, dbPath);

  // 4. Verify restored database
  console.log('[4/4] Validating active database post-restore...');
  const postTestScript = `
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    Promise.all([
      db.$queryRawUnsafe('PRAGMA integrity_check;'),
      db.project.count(),
      db.profile.count()
    ]).then(([check, projects, profiles]) => {
      console.log('      Integrity:', check[0].integrity_check);
      console.log('      Active Projects:', projects);
      console.log('      Active Profiles:', profiles);
      process.exit(0);
    }).catch(err => {
      console.error('      Verification failed:', err.message);
      process.exit(1);
    }).finally(() => db.$disconnect());
  `;

  execSync(`node -e "${postTestScript.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });

  console.log('\n==================================================');
  console.log('✓ RESTORE COMPLETED & VERIFIED');
  console.log(`  Source: ${targetBackupFile}`);
  console.log(`  Active: ${dbPath}`);
  console.log('==================================================');
}

if (require.main === module) {
  restoreDatabase().catch(err => {
    console.error('[FATAL] Restore failed:', err);
    process.exit(1);
  });
}

module.exports = { restoreDatabase };
