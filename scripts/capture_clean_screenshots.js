const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');

const SECRET_KEY = process.env.JWT_SECRET || "world_class_3d_portfolio_jwt_secret_key_2026_super_secure";
const key = new TextEncoder().encode(SECRET_KEY);

const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  const admin = await prisma.adminUser.findFirst();
  const token = await new SignJWT({
    userId: admin.id,
    username: admin.username,
    mustChangePassword: false,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

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
    '--window-size=1440,900',
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No tab WebSocket URL');

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

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    await send('Network.setCookie', {
      name: 'portfolio_admin_token',
      value: token,
      url: 'http://localhost:3000',
      path: '/',
      httpOnly: true,
      secure: false,
    });

    async function takeScreenshot(name) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res?.result?.data) {
        const buf = Buffer.from(res.result.data, 'base64');
        fs.writeFileSync(path.join(localDir, name), buf);
        fs.writeFileSync(path.join(artDir, name), buf);
        console.log(`Saved screenshot: ${name}`);
      }
    }

    // 1. Clean Navbar on Desktop Homepage (No Admin Link)
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(3000);
    await takeScreenshot('navbar_no_login_clean.png');

    // 2. Clean Footer on Desktop Homepage (No Admin Link)
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })' });
    await sleep(1000);
    await takeScreenshot('footer_no_login_clean.png');

    // 3. Clean Text Download Links on AuraOS Project Page
    await send('Page.navigate', { url: 'http://localhost:3000/projects/aura-os-spatial-web' });
    await sleep(3000);
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 800, behavior: "instant" })' });
    await sleep(1000);
    await takeScreenshot('project_clean_text_downloads.png');

    // 4. Project Without Downloads (PulseFlow - completely suppressed)
    await send('Page.navigate', { url: 'http://localhost:3000/projects/pulseflow-cloud-analytics' });
    await sleep(3000);
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 800, behavior: "instant" })' });
    await sleep(1000);
    await takeScreenshot('project_no_downloads_clean.png');

    // 5. Admin Project Files Manager
    await send('Page.navigate', { url: 'http://localhost:3000/admin/project-files' });
    await sleep(3000);
    await takeScreenshot('admin_downloads_config_updated.png');

    ws.close();
  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    chromeProcess.kill();
    await prisma.$disconnect();
    console.log("All clean screenshots captured successfully!");
  }
}

capture().catch(console.error);
