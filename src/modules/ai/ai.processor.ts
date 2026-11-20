import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MatchingService } from '../matching/matching.service.js';
import { TranscriptionService } from './transcription.service.js';
import { VOICE_PLACEHOLDER } from './transcription.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type EmbedProfileJobData,
  type MatchJobData,
  type TranscribeJobData,
} from '../queue/queue.constants.js';

// Corre solo dentro del worker
@Processor(AI_QUEUE, { concurrency: 2 })
export class AiProcessor extends WorkerHost implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly matching: MatchingService,
    private readonly transcription: TranscriptionService,
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
      case AiJob.Transcribe:
        return this.transcription.transcribeRequest(
          job.data as TranscribeJobData,
        );
      default:
        this.logger.warn(`Trabajo desconocido ${job.name} (${job.id})`);
    }
  }

  // al arrancar: perfiles sin embedding y solicitudes que quedaron en PENDING
  // (las de voz sin transcribir siguen en su propio trabajo de la cola)
  async onApplicationBootstrap() {
    const profiles = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User"
      WHERE embedding IS NULL AND (bio IS NOT NULL OR cardinality(tags) > 0)`;
    const pending = await this.prisma.helpRequest.findMany({
      where: { status: 'PENDING', NOT: { text: VOICE_PLACEHOLDER } },
      select: { id: true },
    });
    await this.queue.addBulk([
      ...profiles.map((p) => ({
        name: AiJob.EmbedProfile,
        data: { userId: p.id },
        opts: defaultJobOptions,
      })),
      // sin prioridad van primero, asi los perfiles quedan antes que las solicitudes
      ...pending.map((r) => ({
        name: AiJob.Match,
        data: { requestId: r.id },
        opts: { ...defaultJobOptions, priority: 2 },
      })),
    ]);
    if (profiles.length || pending.length) {
      this.logger.log(
        `Encolados ${profiles.length} perfiles y ${pending.length} solicitudes pendientes`,
      );
    }
  }
}
