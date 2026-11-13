const { PrismaClient } = require('@prisma/client');

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'file:E:/kartik/my_resume/prisma/dev.db' } }
});
const deployPrisma = new PrismaClient({
  datasources: { db: { url: 'file:E:/kartik/my_resume/deploy/production/prisma/dev.db' } }
});

async function checkMigrations() {
  const localMig = await localPrisma.$queryRaw`SELECT id, migration_name, finished_at FROM _prisma_migrations`;
  console.log('Local applied migrations:');
  console.table(localMig);

  const deployMig = await deployPrisma.$queryRaw`SELECT id, migration_name, finished_at FROM _prisma_migrations`;
  console.log('Deploy staged dev.db migrations:');
  console.table(deployMig);

  await localPrisma.$disconnect();
  await deployPrisma.$disconnect();
}
checkMigrations().catch(console.error);
