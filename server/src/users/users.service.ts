import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(googleId: string, email: string, name: string, avatarUrl?: string | null) {
    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { googleId, email, name, avatarUrl: avatarUrl ?? null },
      });
    }

    return user;
  }

  async findByGoogleId(googleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async getProfile(googleId: string) {
    const user = await this.findByGoogleId(googleId);
    return user.profile;
  }

  async updateProfile(googleId: string, dto: UpdateProfileDto) {
    const user = await this.findByGoogleId(googleId);

    return this.prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { ...dto },
      create: { userId: user.id, ...dto },
    });
  }
}
