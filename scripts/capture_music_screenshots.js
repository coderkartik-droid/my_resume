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

async function main() {
  const token = await generateToken();
  const screenDir = path.join(process.cwd(), 'public', 'screenshots');
  const artDir = 'C:\\Users\\GIGABYTE i9\\.gemini\\antigravity\\brain\\0ab619bb-d62d-4e78-bcce-9d4dfc5e50ac\\screenshots';
  if (!fs.existsSync(screenDir)) fs.mkdirSync(screenDir, { recursive: true });
  if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,960',
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch('http://127.0.0.1:9224/json/list');
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
    console.log('Auth cookie set.');

    // 1. Admin Music Manager
    console.log('Navigating to http://localhost:3000/admin/music...');
    await send('Page.navigate', { url: 'http://localhost:3000/admin/music' });
    await sleep(3500);

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot1?.result?.data) {
      const buf = Buffer.from(shot1.result.data, 'base64');
      fs.writeFileSync(path.join(screenDir, 'admin_music_manager.png'), buf);
      fs.writeFileSync(path.join(artDir, 'admin_music_manager.png'), buf);
      console.log('✔ Captured & saved admin_music_manager.png');
    }

    // 2. Admin Music Settings Tab
    console.log('Clicking System & Playback Settings tab...');
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const settingsBtn = btns.find(b => b.textContent.includes('System & Playback Settings'));
        if (settingsBtn) settingsBtn.click();
      `,
    });
    await sleep(1500);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot2?.result?.data) {
      const buf = Buffer.from(shot2.result.data, 'base64');
      fs.writeFileSync(path.join(screenDir, 'admin_music_settings.png'), buf);
      fs.writeFileSync(path.join(artDir, 'admin_music_settings.png'), buf);
      console.log('✔ Captured & saved admin_music_settings.png');
    }

    // 3. Homepage Topbar
    console.log('Navigating to http://localhost:3000/...');
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(4000);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot3?.result?.data) {
      const buf = Buffer.from(shot3.result.data, 'base64');
      fs.writeFileSync(path.join(screenDir, 'homepage_music_topbar.png'), buf);
      fs.writeFileSync(path.join(artDir, 'homepage_music_topbar.png'), buf);
      console.log('✔ Captured & saved homepage_music_topbar.png');
    }

    // 4. Expand Music Player
    console.log('Clicking to expand music player...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[aria-label="Expand Music Player"]');
        if (btn) btn.click();
      `,
    });
    await sleep(1500);

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    if (shot4?.result?.data) {
      const buf = Buffer.from(shot4.result.data, 'base64');
      fs.writeFileSync(path.join(screenDir, 'homepage_music_expanded.png'), buf);
      fs.writeFileSync(path.join(artDir, 'homepage_music_expanded.png'), buf);
      console.log('✔ Captured & saved homepage_music_expanded.png');
    }

    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    chromeProcess.kill();
    await prisma.$disconnect();
  }
}

main();
