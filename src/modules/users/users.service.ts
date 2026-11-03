import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { userSelect } from './dto/user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) throw new NotFoundException('El usuario no existe');
    return { ...user, rating: await this.rating(userId) };
  }

  async update(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({ where: { id: userId }, data: dto });
    return this.me(userId);
  }

  async publicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, bio: true, tags: true },
    });
    if (!user) throw new NotFoundException('El usuario no existe');
    return { ...user, rating: await this.rating(id) };
  }

  private async rating(helperId: string) {
    const { _avg } = await this.prisma.rating.aggregate({
      where: { helperId },
      _avg: { stars: true },
    });
    return _avg.stars === null ? null : Number(_avg.stars.toFixed(2));
  }
}
