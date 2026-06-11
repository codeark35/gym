import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedExercises } from './seed-data';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedExercises(prisma);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
