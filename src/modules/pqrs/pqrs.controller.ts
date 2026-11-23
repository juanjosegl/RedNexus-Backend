import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import { CreatePqrsDto, PqrsDto } from './dto/pqrs.dto.js';
import { PqrsService } from './pqrs.service.js';

@ApiTags('pqrs')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta el token o es inválido' })
@Controller('pqrs')
export class PqrsController {
  constructor(private readonly pqrs: PqrsService) {}

  @Post()
  @ApiOperation({
    summary: 'Radica una petición, queja, reclamo o sugerencia',
  })
  @ApiCreatedResponse({ type: PqrsDto })
  @ApiBadRequestResponse({
    description: 'Tipo inválido, asunto o descripción muy cortos o muy largos',
  })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePqrsDto) {
    return this.pqrs.create(user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Mis PQRS, de la más reciente a la más antigua' })
  @ApiOkResponse({ type: [PqrsDto] })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.pqrs.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle y respuesta de una PQRS (solo el autor)' })
  @ApiOkResponse({ type: PqrsDto })
  @ApiForbiddenResponse({ description: 'La PQRS es de otro usuario' })
  @ApiNotFoundResponse()
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pqrs.findOne(user.sub, id);
  }
}
