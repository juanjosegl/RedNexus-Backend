import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type MatchJobData,
} from '../queue/queue.constants.js';
import { CreateHelpRequestDto } from './dto/help-request.dto.js';

const summarySelect = {
  id: true,
  text: true,
  area: true,
  topics: true,
  level: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class HelpRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

  async create(authorId: string, dto: CreateHelpRequestDto) {
    const request = await this.prisma.helpRequest.create({
      data: { authorId, text: dto.text },
      select: { id: true, status: true },
    });
    await this.queue.add(
      AiJob.Match,
      { requestId: request.id } satisfies MatchJobData,
      defaultJobOptions,
    );
    return request;
  }

  findMine(authorId: string) {
    return this.prisma.helpRequest.findMany({
      where: { authorId },
      select: summarySelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id },
      select: {
        ...summarySelect,
        authorId: true,
        rating: { select: { stars: true } },
        matches: {
          orderBy: { score: 'desc' },
          select: {
            id: true,
            score: true,
            explanation: true,
            status: true,
            helper: {
              select: {
                id: true,
                name: true,
                bio: true,
                tags: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!request) throw new NotFoundException('La solicitud no existe');
    if (request.authorId !== userId)
      throw new ForbiddenException('Solo el autor ve esta solicitud');

    const { authorId: _authorId, matches, ...rest } = request;
    return {
      ...rest,
      // el email solo se muestra si acepto
      matches: matches.map(({ helper: { email, ...helper }, ...m }) => ({
        ...m,
        helper: m.status === 'ACCEPTED' ? { ...helper, email } : helper,
      })),
    };
  }

  async close(userId: string, id: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!request) throw new NotFoundException('La solicitud no existe');
    if (request.authorId !== userId)
      throw new ForbiddenException('Solo el autor cierra esta solicitud');
    return this.prisma.helpRequest.update({
      where: { id },
      data: { status: 'CLOSED' },
      select: summarySelect,
    });
  }
}
