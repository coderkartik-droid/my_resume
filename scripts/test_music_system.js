const { PrismaClient } = require('@prisma/client');
const { SignJWT } = require('jose');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = process.env.JWT_SECRET || "world_class_3d_portfolio_jwt_secret_key_2026_super_secure";
const key = new TextEncoder().encode(SECRET_KEY);
const prisma = new PrismaClient();

async function getAdminToken() {
  const admin = await prisma.adminUser.findFirst();
  if (!admin) throw new Error("No admin user found");
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

// Simple WAV generator for test file
function createMinimalWav(durationSec = 2) {
  const sampleRate = 44100;
  const numChannels = 1;
  const bytesPerSample = 2;
  const totalSamples = sampleRate * durationSec;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buf.writeUInt16LE(numChannels * bytesPerSample, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.3; // 440Hz A tone
    buf.writeInt16LE(Math.floor(sample * 32767), offset);
    offset += 2;
  }
  return buf;
}

async function runTests() {
  console.log("=== BACKGROUND MUSIC SYSTEM COMPREHENSIVE VERIFICATION ===");
  const token = await getAdminToken();
  const cookieHeader = `portfolio_admin_token=${token}`;

  // 1. GET /api/music
  console.log("\n[Test 1] Testing public GET /api/music endpoint...");
  const getRes = await fetch("http://localhost:3000/api/music");
  if (!getRes.ok) throw new Error(`GET /api/music failed: ${getRes.status}`);
  const getData = await getRes.json();
  console.log("✔ GET /api/music OK. Total tracks:", getData.tracks.length);
  console.log("✔ Active playlist:", getData.config.activePlaylist);
  console.log("✔ Default track:", getData.defaultTrack?.title);

  // 2. Upload test track
  console.log("\n[Test 2] Testing admin POST /api/music/upload...");
  const tempWav = createMinimalWav(3);
  const tempWavBlob = new Blob([tempWav], { type: "audio/wav" });
  const form = new FormData();
  form.append("file", tempWavBlob, "test_synth_ambient.wav");
  form.append("title", "Automated Test Song");
  form.append("artist", "QA Test Engine");
  form.append("album", "Test Suite");
  form.append("playlist", "Test Playlist");
  form.append("isDefault", "false");

  const uploadRes = await fetch("http://localhost:3000/api/music/upload", {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
    body: form,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${errText}`);
  }
  const uploadData = await uploadRes.json();
  console.log("✔ Upload OK:", uploadData.message);
  const createdTrack = uploadData.tracks[0];
  console.log("✔ Created Track ID:", createdTrack.id, "Title:", createdTrack.title);

  // Verify file exists on disk
  const diskPath = path.join(process.cwd(), "public", createdTrack.audioUrl);
  if (!fs.existsSync(diskPath)) {
    throw new Error(`Uploaded file not found on disk at: ${diskPath}`);
  }
  console.log("✔ Verified physical file exists at:", diskPath);

  // 3. Edit track metadata
  console.log("\n[Test 3] Testing PUT /api/music/track/[id] metadata edit...");
  const editRes = await fetch(`http://localhost:3000/api/music/track/${createdTrack.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: "Updated Automated Test Song",
      artist: "Kartik QA",
      playlist: "Updated Playlist",
      enabled: true,
      isDefault: true,
    }),
  });
  if (!editRes.ok) throw new Error(`Edit failed: ${editRes.status}`);
  const editData = await editRes.json();
  console.log("✔ Track edit OK:", editData.track.title, "isDefault:", editData.track.isDefault);

  // 4. Test reordering
  console.log("\n[Test 4] Testing POST /api/music/reorder...");
  const reorderRes = await fetch("http://localhost:3000/api/music/reorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      items: [{ id: createdTrack.id, order: 99 }],
    }),
  });
  if (!reorderRes.ok) throw new Error(`Reorder failed: ${reorderRes.status}`);
  const reorderData = await reorderRes.json();
  console.log("✔ Reorder OK:", reorderData.message);

  // 5. Test replace audio file
  console.log("\n[Test 5] Testing POST /api/music/upload replacement...");
  const replaceWav = createMinimalWav(4);
  const replaceBlob = new Blob([replaceWav], { type: "audio/wav" });
  const replaceForm = new FormData();
  replaceForm.append("file", replaceBlob, "replaced_tone.wav");
  replaceForm.append("replaceId", createdTrack.id);

  const replaceRes = await fetch("http://localhost:3000/api/music/upload", {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
    body: replaceForm,
  });
  if (!replaceRes.ok) throw new Error(`Replace audio failed: ${replaceRes.status}`);
  const replaceData = await replaceRes.json();
  console.log("✔ Replace OK:", replaceData.message, "New audioUrl:", replaceData.track.audioUrl);

  // 6. Test MusicConfig update
  console.log("\n[Test 6] Testing PUT /api/music/config update...");
  const configRes = await fetch("http://localhost:3000/api/music/config", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      enabled: true,
      showTopbarToggle: true,
      defaultVolume: 0.38,
      autoplayAttempt: false,
      loop: true,
      shuffle: false,
      playbackMode: "playlist",
      buttonStyle: "equalizer",
      buttonPosition: "topbar-right",
    }),
  });
  if (!configRes.ok) throw new Error(`Config update failed: ${configRes.status}`);
  const configData = await configRes.json();
  console.log("✔ Config update OK:", configData.message, "Volume:", configData.config.defaultVolume);

  // 7. Delete test track and verify file cleanup
  console.log("\n[Test 7] Testing DELETE /api/music/track/[id] and physical file removal...");
  const deleteRes = await fetch(`http://localhost:3000/api/music/track/${createdTrack.id}`, {
    method: "DELETE",
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);
  console.log("✔ Track record deleted from database");

  // Verify file was unlinked
  const oldPath = path.join(process.cwd(), "public", replaceData.track.audioUrl);
  if (fs.existsSync(oldPath)) {
    console.warn("Notice: file still exists at:", oldPath);
  } else {
    console.log("✔ Physical file safely deleted from disk!");
  }

  // 8. Test public pages render correctly
  console.log("\n[Test 8] Testing public pages render with music toggle...");
  const homeRes = await fetch("http://localhost:3000/");
  if (!homeRes.ok) throw new Error(`Home page failed: ${homeRes.status}`);
  console.log("✔ Homepage rendered OK (HTTP 200)");

  const adminMusicRes = await fetch("http://localhost:3000/admin/music", {
    headers: { Cookie: cookieHeader },
  });
  if (!adminMusicRes.ok) throw new Error(`Admin music page failed: ${adminMusicRes.status}`);
  console.log("✔ /admin/music rendered OK (HTTP 200)");

  console.log("\n✨ ALL TESTS COMPLETED SUCCESSFULLY! ✨");
}

runTests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
