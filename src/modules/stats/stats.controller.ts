import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.decorators.js';
import { StatsDto } from './dto/stats.dto.js';
import { StatsService } from './stats.service.js';

@ApiTags('stats')
@Public()
@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Muestra cómo va la red' })
  @ApiOkResponse({ type: StatsDto })
  summary() {
    return this.stats.summary();
  }
}
