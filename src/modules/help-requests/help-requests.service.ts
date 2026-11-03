import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AI_QUEUE, AiJob, defaultJobOptions, type MatchJobData } from '../queue/queue.constants.js';
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
}
