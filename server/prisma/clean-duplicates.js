const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Find duplicate exercises by name (keeping the first one created)
    const duplicates = await prisma.$queryRaw`
      SELECT name, MIN(id) as keep_id
      FROM exercises
      WHERE "isGlobal" = true
      GROUP BY name
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length === 0) {
      console.log('✅ No duplicate exercises found');
      return;
    }

    console.log(`⚠️ Found ${duplicates.length} duplicate exercises. Cleaning up...`);
    
    for (const dup of duplicates) {
      // Delete all duplicates except the first one
      const deleted = await prisma.exercise.deleteMany({
        where: {
          isGlobal: true,
          name: dup.name,
          id: { not: dup.keep_id },
        },
      });
      console.log(`  - Removed ${deleted.count} duplicates of "${dup.name}"`);
    }
    
    console.log('✅ Duplicates cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
