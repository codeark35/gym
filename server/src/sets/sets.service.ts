import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { CreateSetDto, UpdateSetDto } from './dto/set.dto';

function calcEpley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

@Injectable()
export class SetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getUserId(externalId: string): Promise<string> {
    const user = await this.usersService.findByExternalId(externalId);
    return user.id;
  }

  private async ensureWorkoutOwner(workoutId: string, userId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });
    if (!workout) throw new NotFoundException('Workout no encontrado');
    return workout;
  }

  async create(externalId: string, workoutId: string, dto: CreateSetDto) {
    const userId = await this.getUserId(externalId);
    await this.ensureWorkoutOwner(workoutId, userId);

    const oneRepMax = calcEpley(dto.weightKg, dto.reps);
    const volume = dto.reps * dto.weightKg;

    const set = await this.prisma.set.create({
      data: {
        workoutId,
        exerciseId: dto.exerciseId,
        setNumber: dto.setNumber,
        reps: dto.reps,
        weightKg: dto.weightKg,
        rpe: dto.rpe,
        rir: dto.rir,
        isWarmup: dto.isWarmup ?? false,
        notes: dto.notes,
        oneRepMax,
        volume,
      },
      include: { exercise: true },
    });

    if (!set.isWarmup) {
      await this.checkAndMarkPR(set, userId);
    }

    return this.prisma.set.findUnique({
      where: { id: set.id },
      include: { exercise: true },
    });
  }

  async bulkCreate(externalId: string, workoutId: string, dtos: CreateSetDto[]) {
    const results: Awaited<ReturnType<typeof this.create>>[] = [];
    for (const dto of dtos) {
      results.push(await this.create(externalId, workoutId, dto));
    }
    return results;
  }

  async findAll(externalId: string, workoutId: string) {
    const userId = await this.getUserId(externalId);
    await this.ensureWorkoutOwner(workoutId, userId);
    return this.prisma.set.findMany({
      where: { workoutId },
      include: { exercise: true },
      orderBy: { setNumber: 'asc' },
    });
  }

  async update(externalId: string, workoutId: string, setId: string, dto: UpdateSetDto) {
    const userId = await this.getUserId(externalId);
    await this.ensureWorkoutOwner(workoutId, userId);

    const existing = await this.prisma.set.findFirst({
      where: { id: setId, workoutId },
    });
    if (!existing) throw new NotFoundException('Serie no encontrada');

    const reps = dto.reps ?? existing.reps;
    const weightKg = dto.weightKg ?? existing.weightKg;
    const oneRepMax = calcEpley(weightKg, reps);
    const volume = reps * weightKg;

    const updated = await this.prisma.set.update({
      where: { id: setId },
      data: { ...dto, oneRepMax, volume, isPR: false },
      include: { exercise: true },
    });

    if (!updated.isWarmup) {
      await this.checkAndMarkPR(updated, userId);
    }

    const result = await this.prisma.set.findUnique({
      where: { id: setId },
      include: { exercise: true },
    });
    if (!result) throw new NotFoundException('Serie no encontrada');
    return result;
  }

  async remove(externalId: string, workoutId: string, setId: string) {
    const userId = await this.getUserId(externalId);
    await this.ensureWorkoutOwner(workoutId, userId);

    const set = await this.prisma.set.findFirst({ where: { id: setId, workoutId } });
    if (!set) throw new NotFoundException('Serie no encontrada');

    await this.prisma.set.delete({ where: { id: setId } });
    return { message: 'Serie eliminada' };
  }

  async checkAndMarkPR(set: any, userId: string): Promise<boolean> {
    const previousBest = await this.prisma.set.findFirst({
      where: {
        exerciseId: set.exerciseId,
        workout: { userId },
        isWarmup: false,
        id: { not: set.id },
      },
      orderBy: { oneRepMax: 'desc' },
    });

    const isPR = !previousBest || (set.oneRepMax ?? 0) > (previousBest.oneRepMax ?? 0);

    if (isPR) {
      await this.prisma.set.update({
        where: { id: set.id },
        data: { isPR: true },
      });
      this.eventEmitter.emit('set.pr', { setId: set.id, userId });
    }

    return isPR;
  }
}
