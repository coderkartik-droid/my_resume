/**
 * Secure Admin Password Reset & Account Management Utility
 * Workspace: E:\kartik\my_resume
 *
 * Requirements:
 * - Secure administrator creation / password reset using bcryptjs.
 * - Enforces minimum 10-character password complexity.
 * - Never prints password hashes or sensitive tokens to console/logs.
 * - Logs administrative event in AuditLog.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function resetAdmin() {
  console.log('==================================================');
  console.log('   PRISMA SECURE ADMIN MANAGEMENT UTILITY        ');
  console.log('==================================================');

  const args = process.argv.slice(2);
  let username = process.env.ADMIN_USERNAME || null;
  let password = process.env.ADMIN_PASSWORD || null;
  let role = process.env.ADMIN_ROLE || 'SUPERADMIN';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) username = args[i + 1];
    else if (args[i].startsWith('--username=')) username = args[i].split('=')[1];
    else if (args[i] === '--password' && args[i + 1]) password = args[i + 1];
    else if (args[i].startsWith('--password=')) password = args[i].split('=')[1];
    else if (args[i] === '--role' && args[i + 1]) role = args[i + 1];
    else if (args[i].startsWith('--role=')) role = args[i].split('=')[1];
  }

  // If no username provided, look up the existing primary admin
  if (!username) {
    const existingAdmin = await prisma.adminUser.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    if (existingAdmin) {
      username = existingAdmin.username;
      console.log(`[ADMIN] Defaulting to primary existing administrator: '${username}'`);
    } else {
      username = 'admin';
      console.log(`[ADMIN] No administrators found. Using default username: 'admin'`);
    }
  }

  let generatedPassword = false;
  if (!password) {
    // Generate secure random alphanumeric password
    password = 'Admin!' + crypto.randomBytes(6).toString('hex') + '#2026';
    generatedPassword = true;
  }

  if (password.length < 10) {
    console.error('[ERROR] Password must be at least 10 characters long.');
    process.exit(1);
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const admin = await prisma.adminUser.upsert({
    where: { username: username },
    update: {
      password: hashedPassword,
      role: role,
      mustChangePassword: generatedPassword ? true : false,
      updatedAt: new Date()
    },
    create: {
      username: username,
      password: hashedPassword,
      role: role,
      mustChangePassword: true
    }
  });

  // Record action in AuditLog
  try {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'PASSWORD_RESET',
        resource: 'AdminUser',
        resourceId: admin.id,
        details: JSON.stringify({
          username: admin.username,
          role: admin.role,
          mustChangePassword: admin.mustChangePassword,
          resetMethod: 'CLI_RESET_UTILITY'
        }),
        ip: '127.0.0.1'
      }
    });
  } catch (err) {
    // Audit log failure shouldn't block admin reset
  }

  console.log('\n[SUCCESS] Administrator account updated securely.');
  console.log(`  Account ID:             ${admin.id}`);
  console.log(`  Username:               ${admin.username}`);
  console.log(`  Assigned Role:          ${admin.role}`);
  console.log(`  Must Change Password:   ${admin.mustChangePassword}`);

  if (generatedPassword) {
    console.log('\n--------------------------------------------------');
    console.log(`  TEMPORARY GENERATED PASSWORD: ${password}`);
    console.log('  (Please record this immediately. It is not saved in plaintext)');
    console.log('--------------------------------------------------');
  } else {
    console.log('\n[INFO] User-supplied password applied. Plaintext is not displayed for security.');
  }

  console.log('\n==================================================');
}

if (require.main === module) {
  resetAdmin()
    .catch(err => {
      console.error('[FATAL] Admin reset error:', err.message);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { resetAdmin };
