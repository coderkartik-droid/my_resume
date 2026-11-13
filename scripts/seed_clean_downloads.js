const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const targetProject = await prisma.project.findFirst({
    where: { slug: 'aura-os-spatial-web' },
  });

  if (!targetProject) {
    console.error("Target project not found!");
    return;
  }

  console.log(`Setting up clean download files for project: ${targetProject.title} (${targetProject.id})`);

  const storageDir = path.join(process.cwd(), 'storage', 'project-files');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Delete existing files for this project to ensure clean order & names
  const existingFiles = await prisma.projectFile.findMany({
    where: { projectId: targetProject.id }
  });
  for (const f of existingFiles) {
    if (f.storagePath && fs.existsSync(f.storagePath)) {
      try { fs.unlinkSync(f.storagePath); } catch (e) {}
    }
  }
  await prisma.projectFile.deleteMany({
    where: { projectId: targetProject.id }
  });

  const filesToSeed = [
    {
      fileType: 'apk',
      originalName: 'AuraOS-Client-v2.4.apk',
      fileName: 'AuraOS-Mobile-Release.apk',
      mimeType: 'application/vnd.android.package-archive',
      fileSize: 36800000,
      fileSizeFormatted: '36.8 MB',
      buttonText: 'Download Android Application (.APK)',
      version: 'v2.4.0',
      description: 'Native Android companion application with spatial sensors support.',
      content: 'PK_ANDROID_APK_BINARY_SAMPLE_DATA'
    },
    {
      fileType: 'exe',
      originalName: 'AuraOS-Desktop-Setup-x64.exe',
      fileName: 'AuraOS-Desktop-Setup.exe',
      mimeType: 'application/x-msdownload',
      fileSize: 52400000,
      fileSizeFormatted: '52.4 MB',
      buttonText: 'Download Windows Application (.EXE)',
      version: 'v2.4.0',
      description: 'Windows 64-bit desktop package with GPU accelerated shaders.',
      content: 'MZ_WINDOWS_EXE_BINARY_SAMPLE_DATA'
    },
    {
      fileType: 'zip',
      originalName: 'AuraOS-Full-Source-v2.4.zip',
      fileName: 'AuraOS-Source-Code.zip',
      mimeType: 'application/zip',
      fileSize: 14200000,
      fileSizeFormatted: '14.2 MB',
      buttonText: 'Download Source Code (.ZIP)',
      version: 'v2.4.0',
      description: 'Complete TypeScript source code and WebGL shader pipeline.',
      content: 'PK_ZIP_ARCHIVE_BINARY_SAMPLE_DATA'
    },
    {
      fileType: 'pdf',
      originalName: 'AuraOS-Architecture-Specification.pdf',
      fileName: 'AuraOS-Architecture-Guide.pdf',
      mimeType: 'application/pdf',
      fileSize: 4800000,
      fileSizeFormatted: '4.8 MB',
      buttonText: 'Download Documentation (.PDF)',
      version: 'v2.4.0',
      description: 'Comprehensive technical whitepaper & GLSL scenegraph spec.',
      content: '%PDF-1.7 SAMPLE ARCHITECTURE DOCUMENTATION'
    }
  ];

  let order = 1;
  for (const item of filesToSeed) {
    const diskFileName = `${Date.now()}-${item.fileName}`;
    const diskFilePath = path.join(storageDir, diskFileName);
    fs.writeFileSync(diskFilePath, item.content);

    const record = await prisma.projectFile.create({
      data: {
        projectId: targetProject.id,
        fileName: item.fileName,
        originalName: item.originalName,
        fileType: item.fileType,
        mimeType: item.mimeType,
        fileSize: item.fileSize,
        fileSizeFormatted: item.fileSizeFormatted,
        fileDescription: item.description,
        storagePath: diskFilePath,
        downloadUrl: '',
        buttonText: item.buttonText,
        version: item.version,
        visible: true,
        order: order++,
        downloadCount: Math.floor(Math.random() * 80) + 20,
      }
    });

    await prisma.projectFile.update({
      where: { id: record.id },
      data: { downloadUrl: `/api/downloads/${record.id}` }
    });

    console.log(`- Created [${item.fileType.toUpperCase()}]: "${item.buttonText}" (ID: ${record.id})`);
  }

  console.log("Seeding complete! 4 clean download files created.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
