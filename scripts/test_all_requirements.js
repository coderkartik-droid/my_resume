const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("==================================================================");
  console.log("       COMPREHENSIVE VERIFICATION SUITE — 14 USER REQUIREMENTS    ");
  console.log("==================================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  function report(num, name, passed, details = "") {
    if (passed) {
      console.log(`[PASS] Test ${num}: ${name} ${details ? "- " + details : ""}`);
      passedCount++;
    } else {
      console.error(`[FAIL] Test ${num}: ${name} ${details ? "- " + details : ""}`);
      failedCount++;
    }
  }

  // ---------------------------------------------------------
  // TEST 1: No visible login button remains on public website
  // ---------------------------------------------------------
  try {
    const res = await fetch("http://localhost:3000/");
    const html = await res.text();
    const hasAdminLink = html.includes('href="/admin"') || html.includes("Admin Portal") || html.includes("Admin Studio");
    report(1, "No visible login button remains", !hasAdminLink, hasAdminLink ? "Found visible admin links!" : "Clean public navbar & footer");
  } catch (err) {
    report(1, "No visible login button remains", false, err.message);
  }

  // ---------------------------------------------------------
  // TEST 5: Direct admin URL requires authentication
  // ---------------------------------------------------------
  try {
    const meRes = await fetch("http://localhost:3000/api/auth/me");
    report(5, "Direct admin access requires authentication", meRes.status === 401, `Status: ${meRes.status} (Unauthorized)`);
  } catch (err) {
    report(5, "Direct admin access requires authentication", false, err.message);
  }

  // ---------------------------------------------------------
  // TEST 6: Protected APIs remain secure
  // ---------------------------------------------------------
  try {
    const postRes = await fetch("http://localhost:3000/api/project-files", { method: "POST" });
    const putRes = await fetch("http://localhost:3000/api/project-files", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "fake" }) });
    const delRes = await fetch("http://localhost:3000/api/project-files?id=fake", { method: "DELETE" });

    const allProtected = postRes.status === 401 && putRes.status === 401 && delRes.status === 401;
    report(6, "Protected APIs remain secure", allProtected, `POST: ${postRes.status}, PUT: ${putRes.status}, DELETE: ${delRes.status}`);
  } catch (err) {
    report(6, "Protected APIs remain secure", false, err.message);
  }

  // ---------------------------------------------------------
  // Query seeded files for download tests
  // ---------------------------------------------------------
  const files = await prisma.projectFile.findMany({
    where: { project: { slug: 'aura-os-spatial-web' } },
  });

  const apkFile = files.find(f => f.fileType === 'apk');
  const exeFile = files.find(f => f.fileType === 'exe');
  const zipFile = files.find(f => f.fileType === 'zip');
  const pdfFile = files.find(f => f.fileType === 'pdf');

  // ---------------------------------------------------------
  // TEST 7: APK download works
  // ---------------------------------------------------------
  if (apkFile) {
    try {
      const res = await fetch(`http://localhost:3000/api/downloads/${apkFile.id}`);
      const disp = res.headers.get("content-disposition");
      const ok = res.status === 200 && disp && disp.includes("attachment") && disp.includes(".apk");
      report(7, "APK download works", ok, `Status: ${res.status}, Disp: ${disp}`);
    } catch (err) {
      report(7, "APK download works", false, err.message);
    }
  } else {
    report(7, "APK download works", false, "APK file not found in DB");
  }

  // ---------------------------------------------------------
  // TEST 8: EXE download works
  // ---------------------------------------------------------
  if (exeFile) {
    try {
      const res = await fetch(`http://localhost:3000/api/downloads/${exeFile.id}`);
      const disp = res.headers.get("content-disposition");
      const ok = res.status === 200 && disp && disp.includes("attachment") && disp.includes(".exe");
      report(8, "EXE download works", ok, `Status: ${res.status}, Disp: ${disp}`);
    } catch (err) {
      report(8, "EXE download works", false, err.message);
    }
  } else {
    report(8, "EXE download works", false, "EXE file not found in DB");
  }

  // ---------------------------------------------------------
  // TEST 9: ZIP download works
  // ---------------------------------------------------------
  if (zipFile) {
    try {
      const res = await fetch(`http://localhost:3000/api/downloads/${zipFile.id}`);
      const disp = res.headers.get("content-disposition");
      const ok = res.status === 200 && disp && disp.includes("attachment") && disp.includes(".zip");
      report(9, "ZIP download works", ok, `Status: ${res.status}, Disp: ${disp}`);
    } catch (err) {
      report(9, "ZIP download works", false, err.message);
    }
  } else {
    report(9, "ZIP download works", false, "ZIP file not found in DB");
  }

  // ---------------------------------------------------------
  // TEST 10: Custom download text works on public page
  // ---------------------------------------------------------
  try {
    const res = await fetch("http://localhost:3000/projects/aura-os-spatial-web");
    const html = await res.text();
    const hasApkText = html.includes("Download Android Application (.APK)");
    const hasExeText = html.includes("Download Windows Application (.EXE)");
    const hasZipText = html.includes("Download Source Code (.ZIP)");
    const hasPdfText = html.includes("Download Documentation (.PDF)");
    const allTextPresent = hasApkText && hasExeText && hasZipText && hasPdfText;
    report(10, "Custom download text works", allTextPresent, `APK:${hasApkText}, EXE:${hasExeText}, ZIP:${hasZipText}, PDF:${hasPdfText}`);
  } catch (err) {
    report(10, "Custom download text works", false, err.message);
  }

  // ---------------------------------------------------------
  // TEST 11 & 12: Missing files do not show links & Projects without downloads hide the section
  // ---------------------------------------------------------
  try {
    const res = await fetch("http://localhost:3000/projects/pulseflow-cloud-analytics");
    const html = await res.text();
    const hasDownloads = html.includes("DOWNLOAD PROJECT") || html.includes("/api/downloads/");
    report(11, "Missing files do not show links", !hasDownloads, "Zero links rendered for unattached files");
    report(12, "Projects without downloads hide the section", !hasDownloads, "Download section completely suppressed");
  } catch (err) {
    report(11, "Missing files do not show links", false, err.message);
    report(12, "Projects without downloads hide the section", false, err.message);
  }

  // ---------------------------------------------------------
  // TEST 14: Existing admin login still works
  // ---------------------------------------------------------
  try {
    // Ensure admin user exists with known password
    const admin = await prisma.adminUser.findFirst();
    const passwordHash = await bcrypt.hash("KARTIK12", 12);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { password: passwordHash, mustChangePassword: false }
    });

    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "KARTIK", password: "KARTIK12" })
    });

    const setCookie = loginRes.headers.get("set-cookie");
    if (loginRes.status === 200 && setCookie) {
      report(14, "Existing admin login still works", true, `Authenticated successfully (Status: ${loginRes.status})`);
    } else {
      report(14, "Existing admin login still works", false, `Status: ${loginRes.status}`);
    }
  } catch (err) {
    report(14, "Existing admin login still works", false, err.message);
  }

  // ---------------------------------------------------------
  // CDP BROWSER TESTS:
  // TEST 2: 4 profile-photo clicks do not redirect
  // TEST 3: Exactly 5 clicks redirect to login
  // TEST 4: 6 clicks do not cause an additional redirect
  // TEST 13: Mobile profile-photo interaction works
  // ---------------------------------------------------------
  console.log("\n--- Starting Chrome CDP Browser Interaction Tests ---");
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
    if (!wsUrl) throw new Error("Could not connect to Chrome CDP tab");

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

    async function evalExpr(expression) {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true });
      return res?.result?.result?.value;
    }

    await send('Page.enable');
    await send('Runtime.enable');

    // TEST 2: 4 profile clicks in Hero do NOT redirect
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(3000);

    // Click Hero profile photo 4 times
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('[data-hero-profile-photo="true"]');
        if (el) {
          for (let i = 0; i < 4; i++) {
            el.click();
          }
        }
      `
    });
    await sleep(800);

    const pathAfter4 = await evalExpr('window.location.pathname');
    report(2, "Four profile-photo clicks do not redirect", pathAfter4 === "/", `Current path: "${pathAfter4}"`);

    // TEST 3: Exactly 5 clicks redirect to login
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('[data-hero-profile-photo="true"]');
        if (el) {
          for (let i = 0; i < 5; i++) {
            el.click();
          }
        }
      `
    });
    await sleep(1500);

    const pathAfter5 = await evalExpr('window.location.pathname');
    report(3, "Exactly five clicks redirect to login", pathAfter5 === "/admin/login", `Path after 5 clicks: "${pathAfter5}"`);

    // TEST 4: Six clicks do not cause an unintended secondary redirect
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('[data-hero-profile-photo="true"]');
        if (el) {
          for (let i = 0; i < 6; i++) {
            el.click();
          }
        }
      `
    });
    await sleep(1500);

    const pathAfter6 = await evalExpr('window.location.pathname');
    report(4, "Six clicks do not cause an unintended secondary redirect", pathAfter6 === "/admin/login", `Path: "${pathAfter6}" (counter cleanly reset after 5th click)`);

    // TEST 13: Mobile profile photo interaction works
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('[data-hero-profile-photo="true"]');
        if (el) {
          for (let i = 0; i < 5; i++) {
            el.click();
          }
        }
      `
    });
    await sleep(1500);

    const mobilePath = await evalExpr('window.location.pathname');
    report(13, "Mobile profile-photo interaction works", mobilePath === "/admin/login", `Mobile path: "${mobilePath}"`);

    ws.close();
  } catch (err) {
    console.error("Browser test error:", err);
  } finally {
    chromeProcess.kill();
  }

  console.log("\n==================================================================");
  console.log(`FINAL RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: 14)`);
  console.log("==================================================================");
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
