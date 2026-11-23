import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import {
  AcceptMatchDto,
  IncomingMatchDto,
  RejectMatchDto,
} from './dto/matches.dto.js';
import { MatchesService } from './matches.service.js';

@ApiTags('matches')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta el token o es inválido' })
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get('incoming')
  @ApiOperation({ summary: 'Solicitudes donde me propusieron como ayudante' })
  @ApiOkResponse({ type: [IncomingMatchDto] })
  incoming(@CurrentUser() user: JwtPayload) {
    return this.matches.incoming(user.sub);
  }

  @Post(':id/accept')
  @HttpCode(200)
  @ApiOperation({ summary: 'Acepto ayudar; devuelve el email del autor' })
  @ApiOkResponse({ type: AcceptMatchDto })
  @ApiNotFoundResponse({ description: 'El candidato no existe' })
  @ApiForbiddenResponse({ description: 'El candidato es otra persona' })
  @ApiConflictResponse({ description: 'Ya fue aceptada por otro o respondida' })
  accept(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.matches.accept(user.sub, id);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @ApiOperation({ summary: 'No puedo ayudar con esta solicitud' })
  @ApiOkResponse({ type: RejectMatchDto })
  @ApiNotFoundResponse({ description: 'El candidato no existe' })
  @ApiForbiddenResponse({ description: 'El candidato es otra persona' })
  @ApiConflictResponse({ description: 'Ya respondiste' })
  reject(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.matches.reject(user.sub, id);
  }
}
