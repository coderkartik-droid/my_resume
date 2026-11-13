const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const SECRET_KEY = process.env.JWT_SECRET || "world_class_3d_portfolio_jwt_secret_key_2026_super_secure";
const key = new TextEncoder().encode(SECRET_KEY);

const prisma = new PrismaClient();

async function generateToken() {
  const admin = await prisma.adminUser.findFirst();
  if (!admin) throw new Error("No admin user found in database");

  if (admin.mustChangePassword) {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { mustChangePassword: false },
    });
    console.log("Updated admin user mustChangePassword to false.");
  }

  console.log(`Using Admin: ${admin.username} (ID: ${admin.id})`);

  return await new SignJWT({
    userId: admin.id,
    username: admin.username,
    mustChangePassword: false,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  const token = await generateToken();
  console.log('Generated Admin JWT Token.');

  const localDir = path.join(process.cwd(), 'public', 'screenshots');
  const artDir = 'C:\\Users\\GIGABYTE i9\\.gemini\\antigravity\\brain\\4be56965-88d5-49aa-ad71-86ba6cec8a86\\screenshots';

  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
  if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,960',
  ]);

  console.log('Launched Chrome with CDP on port 9222...');
  await sleep(2500);

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Connected to Chrome CDP:', versionData.Browser);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No tab WebSocket URL found');

    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise((res) => (ws.onopen = res));

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Network.enable');
    await send('Page.enable');
    await send('Runtime.enable');

    // Set auth cookie
    await send('Network.setCookie', {
      name: 'portfolio_admin_token',
      value: token,
      url: 'http://localhost:3000',
      path: '/',
      httpOnly: true,
      secure: false,
    });
    console.log('Auth cookie portfolio_admin_token set successfully.');

    // 1. Capture Project Detail Scrolled to Downloads Grid
    console.log('Navigating to AuraOS project page for downloads grid capture...');
    await send('Page.navigate', { url: 'http://localhost:3000/projects/aura-os-spatial-web' });
    await sleep(3000);
    // Scroll down so that Project Downloads is in view
    await send('Runtime.evaluate', {
      expression: 'window.scrollTo({ top: 850, behavior: "instant" })',
    });
    await sleep(1000);
    const projDownRes = await send('Page.captureScreenshot', { format: 'png' });
    if (projDownRes?.result?.data) {
      const buf = Buffer.from(projDownRes.result.data, 'base64');
      fs.writeFileSync(path.join(localDir, 'project_downloads_grid.png'), buf);
      fs.writeFileSync(path.join(artDir, 'project_downloads_grid.png'), buf);
      console.log('Saved screenshot: project_downloads_grid.png');
    }

    // 2. Admin Modules
    const targets = [
      { name: 'admin_project_files_manager.png', path: '/admin/project-files' },
      { name: 'admin_content_hub.png', path: '/admin/content' },
      { name: 'admin_about_manager.png', path: '/admin/about' },
      { name: 'admin_projects_manager.png', path: '/admin/projects' },
      { name: 'admin_seo_settings.png', path: '/admin/seo' },
      { name: 'admin_typography_settings.png', path: '/admin/typography' },
    ];

    for (const t of targets) {
      console.log(`Navigating to ${t.path}...`);
      await send('Page.navigate', { url: `http://localhost:3000${t.path}` });
      await sleep(3500); // Wait for React hydration and data fetch

      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.result?.data) {
        const buf = Buffer.from(res.result.data, 'base64');
        const localPath = path.join(localDir, t.name);
        fs.writeFileSync(localPath, buf);
        fs.writeFileSync(path.join(artDir, t.name), buf);
        console.log(`Saved screenshot: ${t.name}`);
      } else {
        console.error(`Failed to capture ${t.name}`, res);
      }
    }

    ws.close();
  } catch (err) {
    console.error('Error during CDP capture:', err);
  } finally {
    chromeProcess.kill();
    await prisma.$disconnect();
    console.log('Terminated Chrome CDP process.');
  }
}

capture().catch(console.error);
