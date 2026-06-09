const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('🔍 [clean-duplicates] Starting duplicate cleanup...');
  const prisma = new PrismaClient();
  try {
    // Get all global exercises
    const allExercises = await prisma.exercise.findMany({
      where: { isGlobal: true },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    
    console.log(`📊 [clean-duplicates] Total global exercises: ${allExercises.length}`);
    
    // Find duplicates
    const nameMap = new Map();
    const duplicates = [];
    
    for (const ex of allExercises) {
      if (nameMap.has(ex.name)) {
        duplicates.push({
          name: ex.name,
          keepId: nameMap.get(ex.name),
          duplicateId: ex.id,
        });
      } else {
        nameMap.set(ex.name, ex.id);
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ [clean-duplicates] No duplicate exercises found');
      return;
    }
    
    console.log(`⚠️ [clean-duplicates] Found ${duplicates.length} duplicate exercises. Cleaning up...`);
    
    // Group by name to delete all duplicates
    const namesToClean = [...new Set(duplicates.map(d => d.name))];
    let totalDeleted = 0;
    
    for (const name of namesToClean) {
      const allWithName = allExercises.filter(e => e.name === name);
      const keepId = allWithName[0].id;
      const idsToDelete = allWithName.slice(1).map(e => e.id);
      
      console.log(`  - "${name}": ${allWithName.length} total, keeping ${keepId}, deleting ${idsToDelete.length}`);
      
      // Reassign any sets from duplicate exercises to the original exercise
      const updatedSets = await prisma.set.updateMany({
        where: {
          exerciseId: { in: idsToDelete },
        },
        data: {
          exerciseId: keepId,
        },
      });
      
      if (updatedSets.count > 0) {
        console.log(`    🔄 Reassigned ${updatedSets.count} sets to original exercise`);
      }
      
      // Now delete the duplicates (no foreign key constraints since sets were reassigned)
      const deleted = await prisma.exercise.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
      
      totalDeleted += deleted.count;
      console.log(`    ✅ Removed ${deleted.count} duplicates`);
    }
    
    console.log(`✅ [clean-duplicates] Cleanup complete. Total removed: ${totalDeleted}`);
  } catch (error) {
    console.error('❌ [clean-duplicates] Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
