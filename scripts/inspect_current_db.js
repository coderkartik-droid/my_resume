const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  console.log("=== SQLITE DATABASE AUDIT ===");

  // 1. Integrity check
  const integrity = await prisma.$queryRawUnsafe('PRAGMA integrity_check;');
  console.log("Integrity Check Result:", integrity);

  // 2. Tables in SQLite master
  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
  console.log(`\nFound ${tables.length} tables in SQLite:`);

  for (const t of tables) {
    const tableName = t.name;
    const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}";`);
    const count = Number(countRes[0].count);
    console.log(`- Table [${tableName}]: ${count} rows`);
  }

  // 3. Check Admin User
  const admins = await prisma.adminUser.findMany({
    select: { id: true, username: true, mustChangePassword: true, createdAt: true }
  });
  console.log("\nAdmin Users in DB:", admins);

  // 4. Check Projects
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, slug: true, _count: { select: { files: true } } }
  });
  console.log("\nProjects in DB:", projects);

  // 5. Check Project Files
  const files = await prisma.projectFile.findMany({
    select: { id: true, projectId: true, fileName: true, fileType: true, buttonText: true, visible: true, downloadCount: true }
  });
  console.log("\nProject Files in DB:", files);

  // 6. Check Download Logs
  const logCount = await prisma.downloadLog.count();
  console.log("\nDownload Logs count:", logCount);
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
