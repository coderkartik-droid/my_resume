const https = require('https');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function fetchJson(url) {
  const client = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve(body); }
      });
    }).on('error', reject);
  });
}

async function runAudit() {
  console.log('===============================================================');
  console.log('       FULL PRODUCTION (marakata.in) vs LOCAL AUDIT            ');
  console.log('===============================================================');

  // 1. Endpoints audit
  const endpoints = [
    { name: 'Profile', path: '/api/profile' },
    { name: 'Projects', path: '/api/projects' },
    { name: 'Skills', path: '/api/skills' },
    { name: 'Experience', path: '/api/experience' },
    { name: 'Services', path: '/api/services' },
    { name: 'Testimonials', path: '/api/testimonials' },
    { name: 'Certifications', path: '/api/certifications' },
    { name: 'Theme', path: '/api/theme' },
    { name: 'Music', path: '/api/music' },
    { name: 'Visual Config', path: '/api/visual-config' },
  ];

  for (const ep of endpoints) {
    const prodData = await fetchJson('https://marakata.in' + ep.path);
    const localData = await fetchJson('http://localhost:3000' + ep.path);

    const isMatch = JSON.stringify(prodData) === JSON.stringify(localData);
    console.log(`\n--- Endpoint: ${ep.name} (${ep.path}) ---`);
    console.log(`  Data Match: ${isMatch ? 'PERFECT MATCH' : 'DISCREPANCY DETECTED'}`);

    if (!isMatch) {
      if (ep.path === '/api/visual-config') {
        console.log('  [Visual Config Discrepancies]:');
        console.log('    Local hero.name:           ', localData.published?.hero?.name);
        console.log('    Production hero.name:      ', prodData.published?.hero?.name);
        console.log('    Local hero.metric1Value:   ', localData.published?.hero?.metric1Value);
        console.log('    Production hero.metric1Val:', prodData.published?.hero?.metric1Value);
        console.log('    Local about.headline:      ', localData.published?.about?.headline);
        console.log('    Production about.headline: ', prodData.published?.about?.headline);
        console.log('    Local draft exists:        ', !!localData.draft);
        console.log('    Production draft exists:   ', !!prodData.draft);
      } else if (ep.path === '/api/theme') {
        console.log('    Local activeTheme:         ', localData.activeThemeId);
        console.log('    Production activeTheme:    ', prodData.activeThemeId);
      }
    }
  }

  // 2. Homepage SSR/SSG verification
  console.log('\n===============================================================');
  console.log('       HOMEPAGE SSR vs API COMPARISON ON PRODUCTION            ');
  console.log('===============================================================');

  const prodHomeHtml = await new Promise((resolve) => {
    https.get('https://marakata.in', (res) => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve(b));
    });
  });

  const prodVisualConfig = await fetchJson('https://marakata.in/api/visual-config');
  const pubHeroName = prodVisualConfig.published?.hero?.name;
  console.log(`Production DB published hero.name: "${pubHeroName}"`);

  const containsPubHeroName = prodHomeHtml.includes(`name\\":\\"${pubHeroName}\\"`) || prodHomeHtml.includes(`name":"${pubHeroName}"`);
  console.log(`Does production homepage HTML contain latest DB published hero name? ${containsPubHeroName}`);

  // Check what name is actually baked into production homepage HTML
  const heroMatch = prodHomeHtml.match(/"name\\*":\\*"([^"\\]+)\\"/);
  console.log(`Hero name baked into production homepage HTML:`, heroMatch ? heroMatch[1] : 'Not found');

  await prisma.$disconnect();
}

runAudit().catch(console.error);
