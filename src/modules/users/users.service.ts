import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type EmbedProfileJobData,
} from '../queue/queue.constants.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { userSelect } from './dto/user.dto.js';
import { withTraceContext } from '../../telemetry/instruments.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

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
    if (dto.bio !== undefined || dto.tags !== undefined) {
      await this.queue.add(
        AiJob.EmbedProfile,
        withTraceContext({ userId } satisfies EmbedProfileJobData),
        defaultJobOptions,
      );
    }
    return this.me(userId);
  }

  // Ley 1581, art. 8 a (acceso): todo lo que RedNexus guarda del titular, sin secretos ni vectores
  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelect,
        consentAt: true,
        createdAt: true,
        requests: {
          select: {
            id: true,
            text: true,
            audioPath: true,
            area: true,
            topics: true,
            level: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        matches: {
          select: {
            id: true,
            requestId: true,
            score: true,
            explanation: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        ratingsGiven: {
          select: {
            requestId: true,
            helperId: true,
            stars: true,
            createdAt: true,
          },
        },
        ratingsGot: {
          select: { requestId: true, stars: true, createdAt: true },
        },
        pqrs: {
          select: {
            number: true,
            type: true,
            subject: true,
            description: true,
            status: true,
            response: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!user) throw new NotFoundException('El usuario no existe');
    const { requests, matches, ratingsGiven, ratingsGot, pqrs, ...profile } =
      user;
    return {
      exportedAt: new Date().toISOString(),
      notice:
        'Datos personales que RedNexus guarda de ti (Ley 1581 de 2012). Las notas de voz no se almacenan y la contraseña se guarda cifrada.',
      profile,
      helpRequests: requests,
      candidacies: matches,
      ratingsGiven,
      ratingsReceived: ratingsGot,
      pqrs,
    };
  }

  // Ley 1581, art. 8 e (supresión): borra la cuenta y en cascada todo lo asociado
  async deleteAccount(userId: string) {
    const { count } = await this.prisma.user.deleteMany({
      where: { id: userId },
    });
    if (count === 0) throw new NotFoundException('El usuario no existe');
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
