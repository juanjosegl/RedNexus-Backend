import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module.js';
import { AiProcessor } from './ai.processor.js';

@Module({
  imports: [QueueModule],
  providers: [AiProcessor],
})
export class AiModule {}
