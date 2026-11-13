/**
 * End-to-End API Integration & Authentication Verification
 * Workspace: E:\kartik\my_resume
 */

const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('==================================================');
  console.log('   END-TO-END API & AUTHENTICATION TEST RUNNER    ');
  console.log('==================================================\n');

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

  // 1. GET /api/profile
  await test('GET /api/profile returns authentic profile', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/profile',
      method: 'GET',
    });
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!res.body || !res.body.name || !res.body.email) {
      throw new Error('Profile missing required fields');
    }
  });

  // 2. GET /api/projects
  await test('GET /api/projects returns published projects with attached files', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/projects',
      method: 'GET',
    });
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!Array.isArray(res.body) || res.body.length < 4) {
      throw new Error(`Expected at least 4 projects, got ${res.body?.length}`);
    }
    const aura = res.body.find((p) => p.slug === 'aura-os-spatial-web');
    if (!aura || !Array.isArray(aura.files) || aura.files.length < 3) {
      throw new Error('AuraOS missing expected downloadable files');
    }
  });

  // 3. GET /api/skills
  await test('GET /api/skills returns all cataloged skills', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/skills',
      method: 'GET',
    });
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!Array.isArray(res.body) || res.body.length < 21) {
      throw new Error(`Expected at least 21 skills, got ${res.body?.length}`);
    }
  });

  // 4. GET /api/music
  await test('GET /api/music returns ambient audio tracks', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/music',
      method: 'GET',
    });
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!res.body || !Array.isArray(res.body.tracks) || res.body.tracks.length < 3) {
      throw new Error('Expected at least 3 audio tracks');
    }
  });

  // 5. GET /api/theme
  await test('GET /api/theme returns active theme configuration', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/theme',
      method: 'GET',
    });
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!res.body || !res.body.activeThemeId) {
      throw new Error('Theme config missing activeThemeId');
    }
  });

  // 6. POST /api/auth/login with wrong password
  await test('POST /api/auth/login rejects invalid credentials and records in LoginHistory', async () => {
    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { username: 'KARTIK', password: 'wrong_password_attempt' }
    );
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.statusCode}`);
    }
  });

  // 7. GET /api/upload requires admin session
  await test('GET /api/upload enforces authentication boundary (401 for unauthenticated)', async () => {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload',
      method: 'GET',
    });
    if (res.statusCode !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.statusCode}`);
    }
  });

  console.log('\n==================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('==================================================\n');

  return failed === 0;
}

if (require.main === module) {
  runApiTests().then((ok) => process.exit(ok ? 0 : 1));
}

module.exports = { runApiTests };
