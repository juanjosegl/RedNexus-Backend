import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AiProcessor } from './modules/ai/ai.processor.js';
import { TranscriptionService } from './modules/ai/transcription.service.js';
import { MatchingModule } from './modules/matching/matching.module.js';
import { QueueModule } from './modules/queue/queue.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

// Modulo del proceso worker: sin HTTP, solo consume la cola de IA.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    QueueModule,
    AiModule,
    MatchingModule,
  ],
  providers: [AiProcessor, TranscriptionService],
})
export class WorkerModule {}
