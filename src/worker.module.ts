import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { AiModule } from './modules/ai/ai.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

// Modulo del proceso worker: sin HTTP, solo consume la cola de IA.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AiModule,
  ],
})
export class WorkerModule {}
