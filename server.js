/**
 * Production Server Entrypoint for HostingRaja Node.js Hosting
 * Workspace: E:\kartik\my_resume
 *
 * Compatible with:
 * - cPanel / CloudLinux "Setup Node.js App" (Phusion Passenger)
 * - PM2 Process Manager
 * - Direct Node.js execution (node server.js)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env / .env.production if present
const envFiles = ['.env.production', '.env'];
for (const envFile of envFiles) {
  const fullPath = path.join(__dirname, envFile);
  if (fs.existsSync(fullPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            let val = match[2] || '';
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            process.env[match[1]] = val.trim();
          }
        }
      }
    } catch {}
  }
}

// Ensure required persistent storage directories exist on server
const persistentDirs = [
  path.join(__dirname, 'storage', 'project-files'),
  path.join(__dirname, 'storage', 'music'),
  path.join(__dirname, 'public', 'uploads'),
  path.join(__dirname, 'backups'),
];

for (const dir of persistentDirs) {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      console.warn(`[WARN] Could not ensure directory ${dir}:`, err.message);
    }
  }
}

// Ensure .next/server/preview-props.json is valid JSON if present
try {
  const previewPropsPath = path.join(__dirname, '.next', 'server', 'preview-props.json');
  const prerenderPath = path.join(__dirname, '.next', 'prerender-manifest.json');
  if (fs.existsSync(previewPropsPath) && fs.existsSync(prerenderPath)) {
    const content = fs.readFileSync(previewPropsPath, 'utf8').trim();
    if (!content.startsWith('{')) {
      const pm = JSON.parse(fs.readFileSync(prerenderPath, 'utf8'));
      if (pm.preview) {
        fs.writeFileSync(previewPropsPath, JSON.stringify(pm.preview, null, 2));
      }
    }
  }
} catch {}

// 2. Resolve environment, port and host
const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOST || '0.0.0.0';

console.log('====================================================');
console.log('   STARTING NEXT.JS PRODUCTION SERVER               ');
console.log(`   Host:     ${hostname}`);
console.log(`   Port:     ${port}`);
console.log(`   Mode:     ${dev ? 'development' : 'production'}`);
console.log(`   Node:     ${process.version}`);
console.log('====================================================');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Unhandled request error:', req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    server.once('error', (err) => {
      console.error('[FATAL] Server listen error:', err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`✓ Application is ready and serving requests on http://${hostname}:${port}`);
    });

    // Graceful termination handling
    const shutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('Closed all active connections. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('[FATAL] Failed to initialize Next.js application:', err);
    process.exit(1);
  });
