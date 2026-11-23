import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AI_QUEUE } from '../queue/queue.constants.js';
import { ReadinessController } from './readiness.controller.js';

// Módulo aparte para que test/health.e2e-spec.ts siga sin necesitar base de datos
@Module({
  imports: [TerminusModule, BullModule.registerQueue({ name: AI_QUEUE })],
  controllers: [ReadinessController],
})
export class ReadinessModule {}
