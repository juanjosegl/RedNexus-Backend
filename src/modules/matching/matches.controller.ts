import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import { IncomingMatchDto } from './dto/matches.dto.js';
import { MatchesService } from './matches.service.js';

@ApiTags('matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get('incoming')
  @ApiOperation({ summary: 'Solicitudes donde me propusieron como ayudante' })
  @ApiOkResponse({ type: [IncomingMatchDto] })
  incoming(@CurrentUser() user: JwtPayload) {
    return this.matches.incoming(user.sub);
  }
}
