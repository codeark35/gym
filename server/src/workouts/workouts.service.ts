import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(googleId: string, dto: CreateWorkoutDto) {
    const user = await this.usersService.findByGoogleId(googleId);

    const date = dto.date ? new Date(dto.date) : new Date();

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

  async findToday(googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the most recent IN_PROGRESS workout for today
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
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
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
}
