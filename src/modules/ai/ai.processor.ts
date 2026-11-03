import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MatchingService } from '../matching/matching.service.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type EmbedProfileJobData,
  type MatchJobData,
} from '../queue/queue.constants.js';

// Corre solo dentro del worker
@Processor(AI_QUEUE, { concurrency: 2 })
export class AiProcessor extends WorkerHost implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly matching: MatchingService,
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case AiJob.EmbedProfile:
        return this.matching.indexProfile(
          (job.data as EmbedProfileJobData).userId,
        );
      case AiJob.Match:
        return this.matching.matchRequest((job.data as MatchJobData).requestId);
      default:
        this.logger.warn(`Trabajo desconocido ${job.name} (${job.id})`);
    }
  }

  // al arrancar: perfiles sin embedding (ej. los del seed)
  async onApplicationBootstrap() {
    const profiles = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User"
      WHERE embedding IS NULL AND (bio IS NOT NULL OR cardinality(tags) > 0)`;
    await this.queue.addBulk(
      profiles.map((p) => ({
        name: AiJob.EmbedProfile,
        data: { userId: p.id },
        opts: defaultJobOptions,
      })),
    );
    if (profiles.length) {
      this.logger.log(`Encolados ${profiles.length} perfiles sin embedding`);
    }
  }
}
