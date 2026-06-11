import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedExercises } from '../../prisma/seed-data';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.exercise.count({ where: { isGlobal: true } });
      if (count === 0) {
        this.logger.log('No global exercises found — running seed...');
        await seedExercises(this.prisma);
        this.logger.log('Seed completed successfully');
      } else {
        this.logger.log(`Found ${count} global exercises — skipping seed`);
      }
    } catch (error) {
      this.logger.error('Seed failed:', error);
    }
  }
}
