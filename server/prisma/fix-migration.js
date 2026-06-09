const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(
      "DELETE FROM _prisma_migrations WHERE migration_name = '20250609000002_clean_duplicates'"
    );
    console.log('✅ Failed migration removed successfully');
  } catch (error) {
    console.log('ℹ️ Migration already resolved or not found');
  } finally {
    await prisma.$disconnect();
  }
}

main();
