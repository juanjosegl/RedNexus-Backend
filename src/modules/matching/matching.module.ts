import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';
import { MatchingService } from './matching.service.js';

@Module({
  imports: [AiModule],
  controllers: [MatchesController],
  providers: [MatchingService, MatchesService],
  exports: [MatchingService],
})
export class MatchingModule {}
