import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchesController } from './matches.controller.js';
import { MATCHING_CONFIG, type MatchingConfig } from './matching-config.js';
import { MatchesService } from './matches.service.js';
import { MatchingService } from './matching.service.js';

@Module({
  imports: [AiModule],
  controllers: [MatchesController],
  providers: [
    MatchingService,
    MatchesService,
    {
      provide: MATCHING_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const matching = config.getOrThrow<MatchingConfig>('matching');
        new Logger('MatchingModule').log(
          `Emparejamiento rednexus-matching v${matching.version}: peso ${matching.similarityWeight}, umbral ${matching.minSimilarity}, híbrido ${matching.hybridAlpha}, consulta enriquecida ${matching.enrichQuery}`,
        );
        return matching;
      },
    },
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
