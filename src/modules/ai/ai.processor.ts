import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MatchingService } from '../matching/matching.service.js';
import {
  AI_QUEUE,
  AiJob,
  type EmbedProfileJobData,
  type MatchJobData,
} from '../queue/queue.constants.js';

// Corre solo dentro del worker
@Processor(AI_QUEUE, { concurrency: 2 })
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(private readonly matching: MatchingService) {
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
}
