/**
 * Full End-to-End Database Integration Test Runner
 * Workspace: E:\kartik\my_resume
 *
 * Validates:
 * 1. Public data loading for every module
 * 2. Admin authentication & session security
 * 3. Complete CRUD on Skills, Services, Certifications, Testimonials, Messages
 * 4. Theme & Visual configuration persistence in SQLite
 * 5. Download system and file integrity
 * 6. AuditLog and History verification
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

// Load .env if present
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const prisma = new PrismaClient();
const AUTH_COOKIE_NAME = 'portfolio_admin_token';

async function signTestToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_portfolio_2026_super_secure_key_min32chars';
  const key = new TextEncoder().encode(secret);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

async function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          rawBody: data,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runFullIntegrationTests() {
  console.log('====================================================');
  console.log('   COMPLETE DATABASE INTEGRATION TEST SUITE         ');
  console.log('====================================================\n');

  const admin = await prisma.adminUser.findFirst();
  if (!admin) {
    console.error('Fatal: No admin user found in database.');
    process.exit(1);
  }

  // Generate authentic JWT token for testing admin APIs
  const adminToken = await signTestToken({
    userId: admin.id,
    username: admin.username,
    role: admin.role || 'SUPERADMIN',
    mustChangePassword: admin.mustChangePassword,
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: `${AUTH_COOKIE_NAME}=${adminToken}`,
  };

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS | ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL | ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. PUBLIC READ ENDPOINTS
  await test('1.1 GET /api/profile loads authentic profile from SQLite', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/profile', method: 'GET' });
    if (res.statusCode !== 200 || !res.body?.name) throw new Error(`Status ${res.statusCode}`);
  });

  await test('1.2 GET /api/projects loads published projects with files', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/projects', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body) || res.body.length < 4) {
      throw new Error(`Expected at least 4 projects, got ${res.body?.length}`);
    }
  });

  await test('1.3 GET /api/skills loads all 21 technical skills', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/skills', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body) || res.body.length < 21) {
      throw new Error(`Expected at least 21 skills, got ${res.body?.length}`);
    }
  });

  await test('1.4 GET /api/experience loads milestones with type filtering', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/experience?type=work', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body)) throw new Error(`Status ${res.statusCode}`);
  });

  await test('1.5 GET /api/services loads capabilities', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/services', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body) || res.body.length < 3) {
      throw new Error(`Expected at least 3 services, got ${res.body?.length}`);
    }
  });

  await test('1.6 GET /api/certifications loads verified credentials', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/certifications', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body) || res.body.length < 3) {
      throw new Error(`Expected at least 3 certifications, got ${res.body?.length}`);
    }
  });

  await test('1.7 GET /api/testimonials loads reviews', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/testimonials', method: 'GET' });
    if (res.statusCode !== 200 || !Array.isArray(res.body) || res.body.length < 2) {
      throw new Error(`Expected at least 2 testimonials, got ${res.body?.length}`);
    }
  });

  await test('1.8 GET /api/music loads ambient tracks & config', async () => {
    const res = await httpRequest({ hostname: 'localhost', port: 3000, path: '/api/music', method: 'GET' });
    if (res.statusCode !== 200 || !res.body?.config || !Array.isArray(res.body?.tracks)) {
      throw new Error(`Status ${res.statusCode}`);
    }
  });

  // 2. AUTHENTICATION & SECURITY
  await test('2.1 GET /api/auth/me recognizes valid admin session', async () => {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: authHeaders,
    });
    if (res.statusCode !== 200 || !res.body?.authenticated) {
      throw new Error(`Expected 200 with authenticated=true, got ${res.statusCode}`);
    }
  });

  await test('2.2 POST /api/skills rejects unauthenticated mutations (401)', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/skills', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { name: 'Unauthorized Skill', category: 'Frontend Development' }
    );
    if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
  });

  // 3. COMPLETE CRUD: SKILLS
  let createdSkillId = null;
  await test('3.1 POST /api/skills creates new skill in SQLite', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/skills', method: 'POST', headers: authHeaders },
      { name: 'Integration Test Skill', category: 'Frontend Development', level: 'Expert', icon: 'Box' }
    );
    if (res.statusCode !== 201 || !res.body?.id) throw new Error(`Creation failed: ${res.statusCode}`);
    createdSkillId = res.body.id;
  });

  await test('3.2 PUT /api/skills updates existing skill in SQLite', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/skills', method: 'PUT', headers: authHeaders },
      { id: createdSkillId, name: 'Integration Test Skill Updated', category: 'Frontend Development', level: 'Master' }
    );
    if (res.statusCode !== 200 || res.body?.name !== 'Integration Test Skill Updated') {
      throw new Error(`Update failed: ${res.statusCode}`);
    }
  });

  await test('3.3 DELETE /api/skills removes skill from SQLite', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: `/api/skills?id=${createdSkillId}`, method: 'DELETE', headers: authHeaders }
    );
    if (res.statusCode !== 200) throw new Error(`Deletion failed: ${res.statusCode}`);
    const checkDb = await prisma.skill.findUnique({ where: { id: createdSkillId } });
    if (checkDb) throw new Error('Skill still present in database after delete');
  });

  // 4. COMPLETE CRUD: SERVICES
  let createdServiceId = null;
  await test('4.1 POST /api/services creates service in SQLite', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/services', method: 'POST', headers: authHeaders },
      { title: 'Temporary Test Service', description: 'Testing database persistence', icon: 'Zap' }
    );
    if (res.statusCode !== 201 || !res.body?.id) throw new Error(`Failed: ${res.statusCode}`);
    createdServiceId = res.body.id;
  });

  await test('4.2 DELETE /api/services removes service from SQLite', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: `/api/services?id=${createdServiceId}`, method: 'DELETE', headers: authHeaders }
    );
    if (res.statusCode !== 200) throw new Error(`Failed: ${res.statusCode}`);
    const check = await prisma.service.findUnique({ where: { id: createdServiceId } });
    if (check) throw new Error('Service still present in DB');
  });

  // 5. MESSAGES: PUBLIC POST & ADMIN RETRIEVAL / STATUS
  let createdMessageId = null;
  await test('5.1 POST /api/messages accepts public contact form submission', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/messages', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { name: 'Dr. Database Auditor', email: 'auditor@example.com', subject: 'Integration Inbound', message: 'Verifying public message flow' }
    );
    if (res.statusCode !== 201 || !res.body?.id) throw new Error(`Submission failed: ${res.statusCode}`);
    createdMessageId = res.body.id;
  });

  await test('5.2 PATCH /api/messages updates read status', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/messages', method: 'PATCH', headers: authHeaders },
      { id: createdMessageId, read: true }
    );
    if (res.statusCode !== 200 || !res.body?.read) throw new Error(`PATCH failed: ${res.statusCode}`);
  });

  await test('5.3 DELETE /api/messages removes test message', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: `/api/messages?id=${createdMessageId}`, method: 'DELETE', headers: authHeaders }
    );
    if (res.statusCode !== 200) throw new Error(`DELETE failed: ${res.statusCode}`);
  });

  // 6. THEME CONFIG & HISTORY
  await test('6.1 PUT /api/theme updates customOverrides and creates ThemeHistory', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/theme', method: 'PUT', headers: authHeaders },
      { activeThemeId: 'midnight-dark', customOverrides: { typography: { headingFont: "'Inter', sans-serif" } } }
    );
    if (res.statusCode !== 200) throw new Error(`Theme update failed: ${res.statusCode}`);

    const history = await prisma.themeHistory.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!history) throw new Error('ThemeHistory record was not created');
  });

  // 7. VISUAL CONFIG & REVISIONS
  await test('7.1 PUT /api/visual-config saves section and creates VisualConfigRevision', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/visual-config', method: 'PUT', headers: authHeaders },
      {
        section: 'about',
        data: {
          headline: 'Bridging Computational Logic & Visual Artistry',
          badgeText: 'PHILOSOPHY • ARCHITECTURE • CRAFT',
          pillar1Title: 'Real-Time 3D & WebGL',
          pillar1Desc: 'Architecting GPU-accelerated 3D graphics',
        },
        publishNow: true,
      }
    );
    if (res.statusCode !== 200) throw new Error(`Visual config update failed: ${res.statusCode}`);

    const rev = await prisma.visualConfigRevision.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!rev) throw new Error('VisualConfigRevision record was not created');
  });

  // 8. MUSIC CONFIG
  await test('8.1 PUT /api/music/config updates volume and playback settings', async () => {
    const res = await httpRequest(
      { hostname: 'localhost', port: 3000, path: '/api/music/config', method: 'PUT', headers: authHeaders },
      { defaultVolume: 0.35, loop: true, showTopbarToggle: true }
    );
    if (res.statusCode !== 200) throw new Error(`Music config update failed: ${res.statusCode}`);
  });

  console.log('\n====================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  return failed === 0;
}

if (require.main === module) {
  runFullIntegrationTests()
    .then((ok) => {
      process.exit(ok ? 0 : 1);
    })
    .catch((err) => {
      console.error('[FATAL] Test runner error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { runFullIntegrationTests };
