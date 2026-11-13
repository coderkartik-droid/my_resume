const http = require('http');

function checkRoute(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, length: data.length });
      });
    }).on('error', err => reject(err));
  });
}

async function run() {
  const routes = [
    'http://localhost:3000/',
    'http://localhost:3000/admin/login',
    'http://localhost:3000/projects/auraos-spatial-3d-web-desktop',
    'http://localhost:3000/api/theme',
    'http://localhost:3000/api/skills',
    'http://localhost:3000/api/projects',
  ];
  for (const r of routes) {
    try {
      const res = await checkRoute(r);
      console.log(`[PASS] ${r} -> Status ${res.statusCode}, Length: ${res.length}`);
    } catch (e) {
      console.log(`[FAIL] ${r} -> ${e.message}`);
    }
  }
}

run();
