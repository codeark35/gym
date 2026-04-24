import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(externalId: string, email: string, name: string) {
    let user = await this.prisma.user.findUnique({ where: { externalId } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { externalId, email, name },
      });
    }

    return user;
  }

  async findByExternalId(externalId: string) {
    const user = await this.prisma.user.findUnique({
      where: { externalId },
      include: { profile: true, subscription: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async getProfile(externalId: string) {
    const user = await this.findByExternalId(externalId);
    return user.profile;
  }

  async updateProfile(externalId: string, dto: UpdateProfileDto) {
    const user = await this.findByExternalId(externalId);

    return this.prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { ...dto },
      create: { userId: user.id, ...dto },
    });
  }
}
