const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
  });

  console.log(`Found ${projects.length} projects:`);
  projects.forEach(p => console.log(`- ${p.title} (slug: ${p.slug}, id: ${p.id})`));

  if (projects.length === 0) {
    console.log("No projects found.");
    return;
  }

  // Let's attach two files to the first project (e.g. AuraOS or PulseFlow)
  const targetProject = projects[0];
  console.log(`Attaching sample files to: ${targetProject.title}`);

  // Ensure storage/project-files exists
  const storageDir = path.join(process.cwd(), 'storage', 'project-files');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // File 1: Windows Executable Installer (.exe)
  const exeFileName = `${Date.now()}-AuraOS-x64-Setup.exe`;
  const exePath = path.join(storageDir, exeFileName);
  fs.writeFileSync(exePath, 'MZ_SAMPLE_AURA_OS_DESKTOP_EXECUTABLE_BINARY_DATA_TEST_PURPOSES');

  // File 2: Source Code Distribution (.zip)
  const zipFileName = `${Date.now() + 1}-AuraOS-Source-v2.4.zip`;
  const zipPath = path.join(storageDir, zipFileName);
  fs.writeFileSync(zipPath, 'PK_SAMPLE_AURA_OS_SOURCE_ARCHIVE_DATA_TEST_PURPOSES');

  // Check if targetProject already has files
  const existingFiles = await prisma.projectFile.findMany({
    where: { projectId: targetProject.id }
  });

  if (existingFiles.length === 0) {
    await prisma.projectFile.create({
      data: {
        projectId: targetProject.id,
        fileName: 'AuraOS-x64-v2.4-Setup.exe',
        originalName: 'AuraOS-x64-Setup.exe',
        fileType: 'exe',
        mimeType: 'application/x-msdownload',
        fileSize: 48500000, // ~48.5 MB
        fileSizeFormatted: '48.5 MB',
        fileDescription: 'Production desktop installer for Windows 10/11 x64 systems with GPU acceleration.',
        storagePath: path.join('storage', 'project-files', exeFileName),
        downloadUrl: '',
        buttonText: 'Download Windows Installer (.exe)',
        version: 'v2.4.0',
        visible: true,
        order: 1,
        downloadCount: 142
      }
    });

    await prisma.projectFile.create({
      data: {
        projectId: targetProject.id,
        fileName: 'AuraOS-Full-Source-v2.4.zip',
        originalName: 'AuraOS-Source-v2.4.zip',
        fileType: 'zip',
        mimeType: 'application/zip',
        fileSize: 12400000, // ~12.4 MB
        fileSizeFormatted: '12.4 MB',
        fileDescription: 'Complete TypeScript source code repository including shaders and build configurations.',
        storagePath: path.join('storage', 'project-files', zipFileName),
        downloadUrl: '',
        buttonText: 'Download Source Code Archive (.zip)',
        version: 'v2.4.0',
        visible: true,
        order: 2,
        downloadCount: 89
      }
    });
    console.log("Successfully seeded 2 downloadable files for", targetProject.title);
  } else {
    console.log(`Project already has ${existingFiles.length} files.`);
  }

  // Update targetProject documentationUrl and videoDemoUrl if empty
  await prisma.project.update({
    where: { id: targetProject.id },
    data: {
      documentationUrl: 'https://github.com/auraos/documentation',
      videoDemoUrl: 'https://youtube.com/watch?v=demo-auraos'
    }
  });
  console.log("Updated documentationUrl & videoDemoUrl for", targetProject.title);

  const filesCount = await prisma.projectFile.count();
  console.log(`Total projectFiles in database: ${filesCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
