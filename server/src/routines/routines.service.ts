import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateRoutineDto, UpdateRoutineDto } from './dto/routine.dto';

@Injectable()
export class RoutinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(googleId: string, dto: CreateRoutineDto) {
    const user = await this.usersService.findByGoogleId(googleId);

    return this.prisma.routine.create({
      data: {
        userId: user.id,
        name: dto.name,
        description: dto.description,
        exercises: {
          create: dto.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            sortOrder: index,
            targetSets: ex.targetSets ?? 3,
            targetReps: ex.targetReps ?? 10,
            targetWeightKg: ex.targetWeightKg,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findAll(googleId: string, page = 1, limit = 20) {
    const user = await this.usersService.findByGoogleId(googleId);

    const where = { userId: user.id };

    const [data, total] = await Promise.all([
      this.prisma.routine.findMany({
        where,
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.routine.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(googleId: string, id: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId: user.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!routine) throw new NotFoundException('Rutina no encontrada');
    return routine;
  }

  async update(googleId: string, id: string, dto: UpdateRoutineDto) {
    const user = await this.usersService.findByGoogleId(googleId);
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId: user.id },
    });
    if (!routine) throw new NotFoundException('Rutina no encontrada');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;

    if (dto.exercises) {
      await this.prisma.routineExercise.deleteMany({
        where: { routineId: id },
      });

      await this.prisma.routineExercise.createMany({
        data: dto.exercises.map((ex, index) => ({
          routineId: id,
          exerciseId: ex.exerciseId,
          sortOrder: index,
          targetSets: ex.targetSets ?? 3,
          targetReps: ex.targetReps ?? 10,
          targetWeightKg: ex.targetWeightKg,
          notes: ex.notes,
        })),
      });
    }

    return this.prisma.routine.update({
      where: { id },
      data,
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async remove(googleId: string, id: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId: user.id },
    });
    if (!routine) throw new NotFoundException('Rutina no encontrada');

    await this.prisma.routine.delete({ where: { id } });
    return { message: 'Rutina eliminada' };
  }

  async toggleActive(googleId: string, id: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const routine = await this.prisma.routine.findFirst({
      where: { id, userId: user.id },
    });
    if (!routine) throw new NotFoundException('Rutina no encontrada');

    return this.prisma.routine.update({
      where: { id },
      data: { isActive: !routine.isActive },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }
}
