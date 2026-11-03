import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import {
  CreatedHelpRequestDto,
  CreateHelpRequestDto,
  HelpRequestDetailDto,
  HelpRequestSummaryDto,
} from './dto/help-request.dto.js';
import { HelpRequestsService } from './help-requests.service.js';

@ApiTags('help-requests')
@ApiBearerAuth()
@Controller('help-requests')
export class HelpRequestsController {
  constructor(private readonly helpRequests: HelpRequestsService) {}

  @Post()
  @ApiOperation({
    summary:
      'Publica una solicitud de ayuda; la IA busca candidatos en segundo plano',
  })
  @ApiCreatedResponse({ type: CreatedHelpRequestDto })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateHelpRequestDto) {
    return this.helpRequests.create(user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Mis solicitudes, de la más reciente a la más antigua',
  })
  @ApiOkResponse({ type: [HelpRequestSummaryDto] })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.helpRequests.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalle con los candidatos y su explicación (solo el autor)',
  })
  @ApiOkResponse({ type: HelpRequestDetailDto })
  @ApiForbiddenResponse({ description: 'La solicitud es de otro usuario' })
  @ApiNotFoundResponse()
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.helpRequests.findOne(user.sub, id);
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cierra la solicitud' })
  @ApiOkResponse({ type: HelpRequestSummaryDto })
  close(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.helpRequests.close(user.sub, id);
  }
}
