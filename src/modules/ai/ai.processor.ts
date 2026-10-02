import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AI_QUEUE } from '../queue/queue.constants.js';

// Corre solo dentro del worker. Aqui se conectara con Ollama y whisper.cpp (semana 3).
@Processor(AI_QUEUE)
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  async process(job: Job) {
    this.logger.log(`Trabajo ${job.name} recibido (${job.id})`);
  }
}
