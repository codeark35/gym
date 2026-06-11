import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RoutinesService } from '../routines/routines.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';
import { parseLocalDate, getTodayInTimezone } from '../common/utils/date.utils';

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly routinesService: RoutinesService,
  ) {}

  async create(googleId: string, dto: CreateWorkoutDto) {
    const user = await this.usersService.findByGoogleId(googleId);

    const date = dto.date ? parseLocalDate(dto.date) : getTodayInTimezone();

    return this.prisma.workout.create({
      data: {
        userId: user.id,
        date,
        name: dto.name,
        notes: dto.notes,
        bodyWeight: dto.bodyWeight,
      },
      include: { sets: { include: { exercise: true } } },
    });
  }

  async findAll(googleId: string, page = 1, limit = 20) {
    const user = await this.usersService.findByGoogleId(googleId);

    const where: any = { userId: user.id };

    const [data, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        include: { sets: { include: { exercise: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workout.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(googleId: string, id: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });

    if (!workout) throw new NotFoundException('Workout no encontrado');
    return workout;
  }

  async findToday(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.workout.findFirst({
      where: {
        userId: user.id,
        date: { gte: today, lt: tomorrow },
        status: 'IN_PROGRESS',
      },
      orderBy: { createdAt: 'desc' },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
  }

  async findAllForDate(googleId: string, dateStr: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const date = parseLocalDate(dateStr);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.workout.findMany({
      where: {
        userId: user.id,
        date: { gte: date, lt: nextDay },
      },
      orderBy: { createdAt: 'desc' },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
  }

  async update(googleId: string, id: string, dto: UpdateWorkoutDto) {
    const user = await this.usersService.findByGoogleId(googleId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!workout) throw new NotFoundException('Workout no encontrado');

    return this.prisma.workout.update({
      where: { id },
      data: dto as any,
      include: { sets: { include: { exercise: true } } },
    });
  }

  async remove(googleId: string, id: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!workout) throw new NotFoundException('Workout no encontrado');
    await this.prisma.workout.delete({ where: { id } });
    return { message: 'Workout eliminado' };
  }

  async createFromRoutine(googleId: string, routineId: string, date?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const routine = await this.routinesService.findOne(googleId, routineId);

    const workoutDate = date ? parseLocalDate(date) : getTodayInTimezone();

    const workout = await this.prisma.workout.create({
      data: {
        userId: user.id,
        date: workoutDate,
        name: routine.name,
        sets: {
          create: routine.exercises.flatMap((re) => {
            const sets: any[] = [];
            for (let i = 1; i <= re.targetSets; i++) {
              sets.push({
                exerciseId: re.exerciseId,
                setNumber: i,
                reps: re.targetReps,
                weightKg: re.targetWeightKg ?? 0,
                oneRepMax: re.targetWeightKg
                  ? Math.round(re.targetWeightKg * (1 + re.targetReps / 30) * 10) / 10
                  : 0,
                volume: re.targetReps * (re.targetWeightKg ?? 0),
              });
            }
            return sets;
          }),
        },
      },
      include: { sets: { include: { exercise: true } } },
    });

    return workout;
  }
}
