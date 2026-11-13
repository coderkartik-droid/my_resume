const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function createWavBuffer(sampleRate, durationSeconds, generateSampleFn) {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataByteLength = totalSamples * numChannels * bytesPerSample;
  const headerByteLength = 44;
  const buffer = Buffer.alloc(headerByteLength + dataByteLength);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataByteLength, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // blockAlign
  buffer.writeUInt16LE(16, 34); // bitsPerSample

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataByteLength, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = generateSampleFn(t, durationSeconds);
    // Clamp to -1..1
    const clampedL = Math.max(-1, Math.min(1, left));
    const clampedR = Math.max(-1, Math.min(1, right));

    const intSampleL = Math.floor(clampedL * 32767);
    const intSampleR = Math.floor(clampedR * 32767);

    buffer.writeInt16LE(intSampleL, offset);
    buffer.writeInt16LE(intSampleR, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Track 1: Volcanic Aurora (Warm analog synth pad & chill chord swell)
function genTrack1(t, dur) {
  // Fade in and out
  const fadeIn = Math.min(1, t / 3.0);
  const fadeOut = Math.min(1, (dur - t) / 3.0);
  const env = fadeIn * fadeOut;

  // Chord progression: Fmaj7 -> Am7 -> Cmaj7 -> G
  const chordTime = 6;
  const chordIdx = Math.floor(t / chordTime) % 4;
  const chords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
    [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
    [196.00, 246.94, 293.66, 392.00], // G (G3, B3, D4, G4)
  ];
  const chord = chords[chordIdx];

  let left = 0;
  let right = 0;

  // Sub bass drone
  const subFreq = chord[0] * 0.5;
  const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.25;
  left += sub;
  right += sub;

  // Lush pad notes with gentle detuning and slow chorus
  chord.forEach((freq, idx) => {
    const lfo = Math.sin(2 * Math.PI * 0.2 * t + idx);
    const detune = 1 + 0.002 * Math.sin(2 * Math.PI * 0.35 * t + idx * 1.5);
    const s1 = Math.sin(2 * Math.PI * freq * t);
    const s2 = Math.sin(2 * Math.PI * (freq * detune) * t + 0.5);
    const s3 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.4;
    const padVoice = (s1 * 0.5 + s2 * 0.4 + s3 * 0.2) * 0.12;

    const pan = (idx - 1.5) / 2; // -0.75 to +0.75
    left += padVoice * (1 - pan * 0.4);
    right += padVoice * (1 + pan * 0.4);
  });

  // Ambient gentle high sparkle
  const sparkleFreq = chord[2] * 4;
  const sparkleEnv = Math.pow(Math.sin(2 * Math.PI * 0.5 * t), 4) * 0.05;
  const sparkle = Math.sin(2 * Math.PI * sparkleFreq * t) * sparkleEnv;
  left += sparkle * 0.7;
  right += sparkle * 1.2;

  return [left * env * 0.7, right * env * 0.7];
}

// Track 2: Cyber Dreams (Deep neo-cyberpunk ambient arpeggio)
function genTrack2(t, dur) {
  const env = Math.min(1, t / 2.5) * Math.min(1, (dur - t) / 2.5);
  const arpNotes = [261.63, 311.13, 392.00, 466.16, 523.25, 622.25, 783.99]; // Cm pentatonic/minor
  const step = Math.floor(t * 3.5) % arpNotes.length;
  const arpFreq = arpNotes[step];
  const stepFrac = (t * 3.5) % 1;
  const noteEnv = Math.exp(-stepFrac * 4.0);

  const arpSound = Math.sin(2 * Math.PI * arpFreq * t) * noteEnv * 0.15;
  const pad = Math.sin(2 * Math.PI * 130.81 * t) * 0.2 + Math.sin(2 * Math.PI * 196.00 * t) * 0.15;

  const left = (pad + arpSound * 1.1) * env * 0.65;
  const right = (pad + arpSound * 0.7) * env * 0.65;
  return [left, right];
}

// Track 3: Midnight Tokyo (Lofi vinyl chillhop atmosphere)
function genTrack3(t, dur) {
  const env = Math.min(1, t / 2) * Math.min(1, (dur - t) / 2);
  const chords = [
    [146.83, 220.0, 261.63, 329.63], // Dm9
    [196.00, 246.94, 293.66, 349.23], // G7
    [130.81, 196.00, 246.94, 329.63], // Cmaj9
  ];
  const chordIdx = Math.floor(t / 4) % chords.length;
  const chord = chords[chordIdx];

  let left = 0;
  let right = 0;
  chord.forEach((f, i) => {
    const s = Math.sin(2 * Math.PI * f * t) * 0.14;
    left += s * (i % 2 === 0 ? 1 : 0.8);
    right += s * (i % 2 === 1 ? 1 : 0.8);
  });

  // Soft vinyl crackle simulation
  const crackle = (Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.03 : 0);
  left += crackle;
  right += crackle;

  return [left * env * 0.6, right * env * 0.6];
}

async function main() {
  const audioDir = path.join(process.cwd(), "public", "uploads", "audio");
  fs.mkdirSync(audioDir, { recursive: true });

  const tracksToGen = [
    {
      title: "Volcanic Aurora (Ambient Swell)",
      artist: "Kartik Khajuria",
      album: "Atmospheric Soundscapes",
      filename: "volcanic_aurora_ambient.wav",
      fn: genTrack1,
      duration: 24, // 24-second seamless ambient loop
      playlist: "Chill Ambient",
      isDefault: true,
    },
    {
      title: "Cyber Horizon (Neo-Tokyo Drift)",
      artist: "Kartik Khajuria",
      album: "Atmospheric Soundscapes",
      filename: "cyber_horizon_drift.wav",
      fn: genTrack2,
      duration: 24,
      playlist: "Cyberpunk Lo-Fi",
      isDefault: false,
    },
    {
      title: "Midnight Echoes (Lo-Fi Dreams)",
      artist: "Kartik Khajuria",
      album: "Atmospheric Soundscapes",
      filename: "midnight_echoes_lofi.wav",
      fn: genTrack3,
      duration: 24,
      playlist: "Chill Ambient",
      isDefault: false,
    },
  ];

  console.log("Generating audio files...");
  const sampleRate = 44100;

  for (let i = 0; i < tracksToGen.length; i++) {
    const t = tracksToGen[i];
    const filePath = path.join(audioDir, t.filename);
    console.log(`Synthesizing track ${i + 1}/${tracksToGen.length}: ${t.title}`);
    const buf = createWavBuffer(sampleRate, t.duration, t.fn);
    fs.writeFileSync(filePath, buf);
    const stats = fs.statSync(filePath);

    // Save to database
    const existing = await prisma.musicTrack.findFirst({
      where: { fileName: t.filename },
    });

    if (existing) {
      await prisma.musicTrack.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          artist: t.artist,
          album: t.album,
          audioUrl: `/uploads/audio/${t.filename}`,
          storagePath: filePath,
          mimeType: "audio/wav",
          fileSize: stats.size,
          duration: t.duration,
          order: i,
          enabled: true,
          isDefault: t.isDefault,
          playlist: t.playlist,
        },
      });
      t.dbId = existing.id;
    } else {
      const created = await prisma.musicTrack.create({
        data: {
          title: t.title,
          artist: t.artist,
          album: t.album,
          audioUrl: `/uploads/audio/${t.filename}`,
          storagePath: filePath,
          fileName: t.filename,
          mimeType: "audio/wav",
          fileSize: stats.size,
          duration: t.duration,
          order: i,
          enabled: true,
          isDefault: t.isDefault,
          playlist: t.playlist,
        },
      });
      t.dbId = created.id;
    }
  }

  // Ensure default MusicConfig exists
  const defaultTrack = tracksToGen.find((t) => t.isDefault);
  const existingConfig = await prisma.musicConfig.findFirst();
  if (!existingConfig) {
    await prisma.musicConfig.create({
      data: {
        id: "active_music_config",
        enabled: true,
        showTopbarToggle: true,
        defaultTrackId: defaultTrack ? defaultTrack.dbId : null,
        defaultVolume: 0.35,
        autoplayAttempt: false,
        loop: true,
        shuffle: false,
        playbackMode: "playlist",
        activePlaylist: "all",
        buttonStyle: "equalizer",
        buttonPosition: "topbar-right",
        maxUploadSizeMb: 50,
      },
    });
    console.log("Created initial MusicConfig");
  } else {
    await prisma.musicConfig.update({
      where: { id: existingConfig.id },
      data: {
        defaultTrackId: defaultTrack ? defaultTrack.dbId : existingConfig.defaultTrackId,
      },
    });
    console.log("Updated existing MusicConfig with default track");
  }

  console.log("Music seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
