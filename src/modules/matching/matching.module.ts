import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { MatchingService } from './matching.service.js';

@Module({
  imports: [AiModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
